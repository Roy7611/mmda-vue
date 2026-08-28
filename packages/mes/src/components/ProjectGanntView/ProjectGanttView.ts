/* eslint-disable vue/no-mutating-props */
import {
	defineComponent,
	defineProps,
	defineAsyncComponent,
	ref,
	Ref,
	nextTick,
	reactive,
	h,
	onMounted,
	getCurrentInstance,
	watch,
	onUnmounted,
	onActivated,
	onBeforeMount,
	inject,
	PropType,
	toRefs,
	onUpdated,
	computed,
	Suspense,
	defineExpose,
	type AppContext,
} from 'vue';
import { isRefNone, isString, Pagination, type ApiClient, debounce, throttle, isNullOrUndefined, triggerEscKey, MetaModel } from '@mmda/core';
import '../GanntView/GanntView.less';
import { useRoute, useRouter } from 'vue-router';
import { label, UI_BUILDER_KEY, UiBuildContext, resolveViewManyProps, resolveSearchParam, resolveViewOneProps, UI_CREATE } from '@mmda/vui';
import { get } from 'http';
import { build } from 'vite';
import '@mmda/vui-primevue/src/assets/animate.min.css';
import { uiBuilder } from '@/mes';
import { gantt, Link, Task } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { ProjectTaskEditor } from '@/modules/project_tasks/ProjectTaskEditor';
import { ProductionOrderStatus, ProductionOrderStatusEnum } from '@/enums/ProductionOrderStatus';
import type { UiViewManyProps, UiBuilder, UiLayout, UiListTileRenderer, UiListTileSlots } from '@mmda/vui';
import { MES_KEY } from '@/keys';
import { millisecondsGetterName } from 'echarts/types/src/util/time.js';

import ProjectGanttAdd from '@/components/ProjectGanttAdd/ProjectGanttAdd';
import { AmendType } from '@/enums/AmendType';
import ComputeKitting from '../GanntView/ComputeKitting';
import { appendGanttTooltipFieldHtml, wrapGanttTooltipHtml } from '../GanntView/ganttTooltipHelpers';
import {
	applyScheduleGanttTaskDates,
	normalizeScheduleDateTime,
	normalizeScheduleDateTimeString,
	persistScheduleGanttTaskExpectedDates,
	syncScheduleGanttTaskDates,
} from '../GanntView/ganttScheduleDateHelpers';
// 甘特图左侧表格宽度、列宽、分隔线拖拽（见 ganttResizeHelpers.ts）
import {
	applyGanttResponsiveLayout, // 按容器宽度写列宽、表头高度与紧凑样式类
	buildGanttScrollableLayout, // 构建左侧表格+分隔线+时间轴的 layout 配置
	fitGanttProjectNameColumnWidth, // 按数据收紧第二列宽并设置 min_width
	getDefaultGanttGridPanelWidth, // 按分辨率计算左侧表格默认宽度
	getGanttGridColumnLayout, // 各列默认宽与表头高度
	getGanttGridPanelMaxWidth, // 左侧表格拖拽放大上限
	getGanttGridPanelMinWidth, // 左侧表格拖拽收缩下限（含第二列内容 min）
	setupGanttViewportControls, // 响应式 + 分隔线/列宽拖拽 + ResizeObserver
	syncGanttDefaultGridPanelWidth, // 数据加载后同步第二列与左侧面板宽度
	type GanttResizeController, // 拖拽控制器，onUnmounted 时 destroy
} from '../GanntView/ganttResizeHelpers';
import {
	applyGanttProjectTaskRowHeight, // 按内容设置项目排程行高
	GANTT_PROJECT_SCHEDULE_DEFAULT_ROW_HEIGHT, // 项目排程默认行高（px）
	isGanttProjectSingleLineRow,
	runGanttProjectRowHeightSync, // 批量同步行高并 DOM 复测
} from '../GanntView/ganttProjectRowHeightHelpers';
import {
	isProjectScheduleTaskLocked,
	prepareProjectScheduleLoadedTask,
	snapshotProjectScheduleOriData,
	applyProjectScheduleTaskStatusFromSnapshot,
	healProjectScheduleGanttLockState,
	clearProjectScheduleTaskReadonly,
	removeLockedProjectScheduleTasksFromDragMultiple,
	restoreLockedProjectScheduleTaskDragCopy,
	restoreLockedProjectScheduleChildrenFromSnapshot,
	shouldSkipProjectScheduleChildCascade,
	PROJECT_SCHEDULE_TASK_LOCKED_CLASS,
} from '../GanntView/ganttProjectScheduleLockHelpers';
import {
	preserveGanttTaskColorIfLightboxEmpty,
	resolveGanttTaskOriginalColor,
} from '../GanntView/ganttTaskColorHelpers';
import { TaskLevel, TaskLevelEnum } from '@mmda/base/src/enums/TaskLevel';
import { filter, now, reject } from 'lodash';
// import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

export default defineComponent({
	name: 'ProjectGanttView',
	props: {
		ctx: Object as PropType<UiBuildContext<any>>,
		tasks: Object as any,
		skin: String, //甘特图模版
	},
	emits: [],
	setup(props: any, ctx: any) {
		let oriData: any = ''; //记录拖动之前的数据
		//选择的负责人
		const selectPersons = ref(<any>[]);
		// 人员选择类型
		const userSelectType = ref(0); // 0-负责人员 1-抄送人员
		const constraintTypeListOptions = ref(<any>[]); //甘特图 constraintType 枚举列表
		const statusListOptions = ref(<any>[]); //状态枚举列表
		const taskStatusListOptions = ref(<any>[]); // Task状态枚举列表
		const selectTruePersons = ref([]); //真正选中的负责人
		const selectTrueStatus = ref([]); //真正选中的状态
		const showExport = ref(false); //是否显示导出
		const currentUser = ref<any>(null);
		const getLoginUser = () => {
			if (currentUser.value) {
				return currentUser.value;
			}
			try {
				const rawUser = localStorage.getItem('user');
				if (rawUser) {
					return JSON.parse(rawUser);
				}
			} catch {
				// ignore parse error
			}
			return (
				props.ctx?.app?.context?.user ??
				null
			);
		};
		const getLoginUserId = () => {
			const user = getLoginUser();
			if (!user) {
				return null;
			}
			return user.userId ?? user.userID ?? user.id ?? null;
		};
		const personInCharge = ref(true);
		const constraintTypeEditor = {
			type: 'select',
			map_to: 'constraintType',
			options: constraintTypeListOptions.value,
		};

		const selectPersonsEditor = {
			type: 'select',
			map_to: 'ownerName',
			options: selectTruePersons.value,
		};

		const statusTypeEditor = {
			type: 'select',
			map_to: 'statusType',
			options: taskStatusListOptions.value,
		};

		// const router = useRouter();
		// const route = useRoute();
		// const { attrs,emit,slots } = ctx;
		// const { id, view } = resolveViewOneProps(route.params, attrs, props);

		const showAddBox = ref(false); //显示添加的弹窗
		const transferTask = reactive({
			task: null,
		});
		const roleaction = props.ctx.globalProps.$app.context.modules;
		const isLoading = ref(false); //任务安排loading
		let pID: any; //地址栏带过来的 projectID
		const ganttBox = ref();
		let ganttResizeController: GanttResizeController | null = null; // 分隔线/列宽拖拽与窗口 resize 监听
		const syncProjectGanttRowHeights = () => runGanttProjectRowHeightSync(gantt, nextTick);
		const escapeProjectScheduleCellAttr = (value: string) =>
			String(value ?? '')
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;');
		const formatProjectScheduleNameCell = (task: any, statusSuffix = '') => {
			const nameLine = `${task?.projectName ?? ''}${statusSuffix}`;
			return `<div class="schedule-project-single-name-cell"><div class="schedule-project-name-line" title="${escapeProjectScheduleCellAttr(nameLine)}">${nameLine}</div></div>`;
		};
		const isProjectScheduleMultiLineRow = (task: any) =>
			!!task
			&& task.refName !== 'loadMore'
			&& task.taskLevel !== 'loadMore'
			&& !isGanttProjectSingleLineRow(task);
		/** parse/刷新数据后：先 fit 第二列，再 sync 左侧表格默认宽度 */
		const syncGanttGridWidthAfterData = () => {
			nextTick(() => {
				if (ganttBox.value && gantt.getTaskCount?.() > 0) {
					fitGanttProjectNameColumnWidth(gantt, ganttBox.value);
				}
				syncGanttDefaultGridPanelWidth(gantt, ganttBox.value);
			});
		};
		const skinType = ref(''); //皮肤
		/** 外层项目下拉 options（与弹窗列表隔离） */
		const lineData = ref<any[]>([]);
		/** 弹窗内项目搜索列表 */
		const projectDialogData = ref<any[]>([]);
		const projectDialogPager = ref<any>({
			pageSize: 10,
			pageNo: 1,
		});
		const display = ref(true);
		// 获取生产任务的logic(用来调用方发)
		let logicData = null as any;
		const showLoading = ref(true);
		const ganttDataLoading = ref(false);
		const statusSelectData = ref<any>(null);
		const linecolumns = ref([]);
		const projecDataKEY = ref('projectID');
		const selectgProjectSearchword = ref();
		const selectgProjectIsComposing = ref(false);
		const selectgProject = ref();
		const temporarilySelect = ref(); //临时的选中的项目
		const selectStatus = ref(); //选中的status
		const reloadParam = reactive({
			searchWord: '',
			projectID: '',
			status: '',
			expectedStart: '',
			expectedFinish: '',
			//scheduleType:'ProjectSchedule'
		});
		/** 归一化当前已选项目 */
		const resolveSelectedProject = () => {
			const raw =
				selectgProjectSearchword.value ?? selectgProject.value ?? temporarilySelect.value ?? null;
			if (Array.isArray(raw)) {
				return raw[0] ?? null;
			}
			return raw && typeof raw === 'object' ? raw : null;
		};
		/** 保证外层项目 Select 的 options 含当前选中项 */
		const ensureSelectedProjectInOuterOptions = () => {
			const selected = resolveSelectedProject();
			if (!selected?.projectID || !reloadParam.projectID) {
				return;
			}
			if (String(selected.projectID) !== String(reloadParam.projectID)) {
				return;
			}
			selectgProjectSearchword.value = selected;
			selectgProject.value = selected;
			temporarilySelect.value = selected;
			const i = lineData.value.findIndex((item: any) => item.projectID == selected.projectID);
			if (i < 0) {
				lineData.value = [{ ...selected }, ...lineData.value];
			} else {
				lineData.value.splice(i, 1, { ...selected });
				lineData.value = [...lineData.value];
			}
		};
		/** 持久化项目筛选；清空时 delete */
		const persistProjectFilterCache = (value: any) => {
			const key = `search/${props.ctx.logic.repository}/projectID`;
			if (value?.projectID) {
				props.ctx.app.localDb.put(key, JSON.parse(JSON.stringify(value)));
			} else {
				props.ctx.app.localDb.delete(key);
			}
		};
		/** 清空项目筛选 */
		const clearProjectFilter = () => {
			selectgProjectSearchword.value = null;
			selectgProject.value = null;
			temporarilySelect.value = null;
			reloadParam.projectID = '';
			pID = '';
			multiSelectList.data = [];
			selectStatus.value = [];
			reloadParam.status = '';
			persistProjectFilterCache(null);
		};
		/** 应用项目筛选选中值 */
		const applyProjectFilter = (value: any) => {
			if (!value?.projectID) {
				clearProjectFilter();
				return;
			}
			selectgProjectSearchword.value = value;
			selectgProject.value = value;
			temporarilySelect.value = value;
			reloadParam.projectID = value.projectID;
			pID = '';
			multiSelectList.data = [];
			persistProjectFilterCache(value);
			ensureSelectedProjectInOuterOptions();
		};
		const formatScheduleFilterDate = (date: Date) => {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		};
		/** 时间段筛选：范围选择器，映射为 expectedStart / expectedFinish（yyyy-MM-dd） */
		const scheduleDateRange = ref<Date[] | null>(null);
		const clearScheduleDateRangeFilter = () => {
			scheduleDateRange.value = null;
			reloadParam.expectedStart = '';
			reloadParam.expectedFinish = '';
		};
		const persistScheduleDateRangeFilter = () => {
			props.ctx.app.localDb.put(
				`search/${props.ctx.logic.repository}/scheduleDateRange`,
				JSON.parse(
					JSON.stringify({
						expectedStart: reloadParam.expectedStart,
						expectedFinish: reloadParam.expectedFinish,
					})
				)
			);
		};
		const projectTaskCreate = ref();
		//重置按钮
		const resetReloadParam = () => {
			reloadParam.searchWord = '';
			reloadParam.projectID = '';
			reloadParam.status = '';
			clearScheduleDateRangeFilter();
			selectgProject.value = null;
			temporarilySelect.value = null;
			selectgProjectSearchword.value = null;
			pID = '';
			selectStatus.value = [];
			durationUnit.select = {
				name: '按月',
				value: 'month',
			};

			selectTimeChange();

			props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/searchWord`, JSON.parse(JSON.stringify(reloadParam.searchWord)));
			props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/status`, JSON.parse(JSON.stringify(reloadParam.status)));
			persistProjectFilterCache(null);
			persistScheduleDateRangeFilter();
		};

		//负责人
		const chargePerson = reactive({
			data: {
				uid: null,
				userName: null,
				userID: null,
				deptName: null,
				detpID: null,
			},
		});
		//判断级别
		const getSubstringBeforeNthDot = (str: any, n: number) => {
			n = n + 1;
			const parts = str.split('.');
			if (parts.length < n) {
				// 如果点的数量少于指定的n，直接返回原字符串
				return str;
			}
			// 截取前n-1个部分，并使用点将它们重新连接起来
			return parts.slice(0, n - 1).join('.');
		};
		//linkTypes
		const linkTypes = [
			{ key: 'FINISH_TO_START', value: 0 },
			{ key: 'START_TO_START', value: 1 },
			{ key: 'FINISH_TO_FINISH', value: 2 },
			{ key: 'START_TO_FINISH', value: 3 },
		];
		const searchParam = reactive(<any>{
			pager: {
				pageSize: '',
				pageNo: '',
			},
			searchWord: '',
			projectID: '',
		});
		const toSQL = (v: any[] | string) => `IN ${isString(v) ? v : v.join(',')}`;
		// //linkTypes
		// const linkTypes = [
		// 	{ key: 'FINISH_TO_START', value: 0,name:"结束-开始" },
		// 	{ key: 'START_TO_START', value: 1 ,name:"开始-开始"},
		// 	{ key: 'FINISH_TO_FINISH', value: 2,name:"结束-开始" },
		// 	{ key: 'START_TO_FINISH', value: 3,name:"开始-结束" },
		// ];

		//是否显示导入交付物按钮
		const showDeliverables = ref(false);
		//是否显示下达按钮
		const showIssue = ref(false);
		//是否显示负责人
		const showAssign = ref(false);
		//多选的选中数组
		const multiSelectList = reactive({
			data: <any>[],
		});

		//导出类型
		const exportVal = ref('excel');

		const exoirtTypeData = [
			{
				id: 0,
				inputId: 0,
				text: 'Excel',
				value: 'excel',
				name: 'exportData',
			},
			// {
			// 	id: 1,
			// 	inputId: 1,
			// 	text: 'PDF',
			// 	value: 'PDF',
			// 	name: 'exportData',
			// },
			// {
			// 	id: 3,
			// 	inputId: 3,
			// 	text: 'PNG',
			// 	value: 'PNG',
			// 	name: 'exportData',
			// },
		];

		const { $t, $toast: toast } = getCurrentInstance().appContext.app.config.globalProperties;
		const getScheduleFilterDayTime = (date: Date) => {
			const d = new Date(date);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		};
		const showScheduleFilterEndBeforeStartToast = () => {
			toast.add({
				severity: 'warn',
				summary: $t('ganttLabel.endBeforeStart'),
				group: 'br',
				life: 5000,
			});
		};
		/** 范围选择：仅选开始时不写查询参数；两端都选齐后再同步并校验 */
		const syncScheduleDateRangeToReloadParam = (value: Date | Date[] | null | undefined) => {
			const previousRange = scheduleDateRange.value ? [...scheduleDateRange.value] : null;
			if (!value) {
				clearScheduleDateRangeFilter();
				persistScheduleDateRangeFilter();
				return;
			}
			const dates = (Array.isArray(value) ? value : [value]).filter(Boolean) as Date[];
			if (dates.length === 0) {
				clearScheduleDateRangeFilter();
				persistScheduleDateRangeFilter();
				return;
			}
			const start = dates[0];
			const end = dates[1];
			if (!end) {
				scheduleDateRange.value = [start];
				reloadParam.expectedStart = '';
				reloadParam.expectedFinish = '';
				return;
			}
			if (getScheduleFilterDayTime(end) < getScheduleFilterDayTime(start)) {
				showScheduleFilterEndBeforeStartToast();
				scheduleDateRange.value = previousRange;
				return;
			}
			scheduleDateRange.value = [start, end];
			reloadParam.expectedStart = formatScheduleFilterDate(start);
			reloadParam.expectedFinish = formatScheduleFilterDate(end);
			persistScheduleDateRangeFilter();
		};
		const { appContext } = getCurrentInstance();

		const mes = inject(MES_KEY);
		if (mes.context?.isDark == true) {
			// eslint-disable-next-line vue/no-mutating-props
			skinType.value = 'dark';
		} else {
			skinType.value = props.skin;
		}

		const { meta: metaUiService, di, i18n, ui } = mes;

		const showTool = ref(true);
		const isHaveUser = ref(false);

		//创建数据库
		const createPersonDb = () => {
			const request = indexedDB.open('chargePerson', 1);
			// 如果数据库版本变化或首次创建时触发
			request.onupgradeneeded = (event: any) => {
				const db = event.target.result;
				// 创建对象存储（表）
				const objectStore = db.createObjectStore('persons', { keyPath: 'id' });
				// // 创建索引
				// objectStore.createIndex('id', 'id', { unique: false });
			};
			request.onsuccess = (event: any) => {
				const db = event.target.result;
				const transaction = db.transaction('persons', 'readwrite');
				const objectStore = transaction.objectStore('persons');
				const objectToStore = {
					id: 1, // 可以使用任何唯一的标识符，比如时间戳或UUID
					data: '',
				};
				objectStore.add(objectToStore);
			};
		};
		//更新负责人
		const updateChargePerson = (persons: any) => {
			const request = indexedDB.open('chargePerson', 1);
			request.onsuccess = (event: any) => {
				const db = event.target.result;
				const updateTransaction = db.transaction('persons', 'readwrite');
				const newPersons = persons.filter((item: any) => item != null && item !== '');
				if (newPersons) {
					const updateStore = updateTransaction.objectStore('persons');
					const updatedCustomer = { id: 1, data: JSON.stringify(newPersons) };
					updateStore.put(updatedCustomer);
					updateTransaction.oncomplete = function () {
						console.log('Transaction completed: data updated.');
					};
					filterChargePerson();
				}
			};
		};
		const choosePersonInCharge = ref([]);
		//更新负责人
		const queryPersonInCharge = () => {
			const request = indexedDB.open('chargePerson', 1);
			request.onsuccess = (event: any) => {
				// 查询数据
				const db = event.target.result;
				const queryTransaction = db.transaction('persons', 'readwrite');
				const queryObjectStore = queryTransaction.objectStore('persons');
				const query = queryObjectStore.get(1);
				query.onsuccess = (event: any) => {
					const res = event?.target?.result?.data ?? [];
					if (!res) {
						choosePersonInCharge.value = [];
					} else {
						choosePersonInCharge.value = JSON.parse(res);
					}
					if (choosePersonInCharge.value) {
						selectPersons.value = choosePersonInCharge.value;
					}
				};

				personInCharge.value = false;
			};
		};
		// //预设负责人
		// const choosePersonInCharge = JSON.parse(localStorage.getItem('ChoosePersonInCharge'));
		// if (choosePersonInCharge) {
		// 	selectPersons.value = choosePersonInCharge;
		// }

		// //预设获得人员

		// //监控更新的数据
		watch(
			[mes.context, isHaveUser],
			([newIsDark, newHaveUser], [oldIsDark, oldHaveUser]) => {
				// if (newTask.data && newTask.data.length > 0) {
				// 	//更新Task
				// 	goUpdateTask(newTask.data);
				// 	//clearTaskData({});
				// }
				// // if (newLink.data) {
				// // 	goUpdateLink(newLink.data);
				// // }
				// // if (newBreak.data) {
				// // 	gantt.hideLightbox();
				// // 	goUpdateBreak(newBreak.data);
				// // }
				// // //更新数据
				// if (newProSub) {
				// 	if (newProSub.data.deleteID) {
				// 		goUpdateSub(newProSub.data);
				// 	}
				// }
				// //皮肤
				if (newIsDark.isDark == true) {
					// eslint-disable-next-line vue/no-mutating-props
					skinType.value = 'dark';
					gantt.setSkin(skinType.value); //设置甘特图皮肤 提前设置
				} else {
					skinType.value = props.skin;
					gantt.setSkin(skinType.value); //设置甘特图皮肤 提前设置
				}
				if (newHaveUser) {
					filterChargePerson(); //筛选选中的person
				}
				// if (newRreflashData) {
				// 	gantt.refreshData();
				// 	getReflash([]);
				// }
				// //刷新页面
				// if (newReloadData) {

				// 	if (newReloadData.data.tasks.length > 0) {
				// 		newTasks.datas.data = [];
				// 		newTasks.datas.links = [];
				// 		newTasks.datas.data = newReloadData.data.tasks;
				// 		newTasks.datas.links = newReloadData.data.links;
				// 		clearTime = setTimeout(() => {
				// 			gantt.clearAll();
				// 			gantt.parse(newTasks.datas);
				// 			showLoading.value=false;
				// 		}, 400);
				// 	}
				// 	newReloadData.data.tasks = [];
				// 	newReloadData.data.links = [];
				// 	showLoading.value=false;
				// 	getReload(newReloadData.data);
				// 	//getNewReLoad(newReloadData);
				// }
			},
			{ immediate: true, deep: true }
		);
		let scheduleroleaction: any = {}; //权限
		let editProjectRoleaction: any = {}; //项目权限

		//获得权限
		const getRoleaction = async () => {
			roleaction.forEach((item: any) => {
				//item.moduleLabel === '生产计划' &&
				if (item.moduleCode == 'M.02' && item.subModules) {
					item.subModules.forEach((i: any) => {
						//i.moduleLabel === '生产排程' &&
						if (i.moduleCode == 'M.02.003' && i.actions) {
							scheduleroleaction = i; //排程按钮权限
						} else if (i.moduleCode == 'M.02.001' && i.actions) {
							editProjectRoleaction = i; //项目权限
						}
					});
				}
			});

			//设置负责的人权限
			if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
				const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'assign');
				if (res != -1) {
					showAssign.value = true;
				} else {
					showAssign.value = false;
				}
			}

			//获取缓存

			//项目
			const params = new URLSearchParams(window.location.search);
			if (params) {
				pID = params.get('projectID');
				reloadParam.projectID = pID ?? '';
			}

			if (!pID) {
				const projectRes = await props.ctx.app.localDb.get(`search/${props.ctx.logic.repository}/projectID`);


				if (projectRes?.projectID) {
					selectgProjectSearchword.value = projectRes;
					selectgProject.value = projectRes;
					temporarilySelect.value = projectRes;
					reloadParam.projectID = projectRes.projectID ?? '';
				} else {
					selectgProjectSearchword.value = null;
					selectgProject.value = null;
					temporarilySelect.value = null;
					reloadParam.projectID = '';
					if (projectRes) {
						persistProjectFilterCache(null);
					}
				}


				//状态
				const statusRes = await props.ctx.app.localDb.get(`search/${props.ctx.logic.repository}/status`);
				if (statusRes && statusRes.length > 0) {
					selectStatus.value = statusRes;
					reloadParam.status = toSQL(selectStatus.value);
				} else {
					reloadParam.status = '';
				}
				// 计划时间段
				const scheduleDateRangeRes = await props.ctx.app.localDb.get(
					`search/${props.ctx.logic.repository}/scheduleDateRange`
				);
				if (scheduleDateRangeRes?.expectedStart && scheduleDateRangeRes?.expectedFinish) {
					reloadParam.expectedStart = scheduleDateRangeRes.expectedStart;
					reloadParam.expectedFinish = scheduleDateRangeRes.expectedFinish;
					scheduleDateRange.value = [
						new Date(reloadParam.expectedStart),
						new Date(reloadParam.expectedFinish),
					];
				} else {
					clearScheduleDateRangeFilter();
				}
				//模糊搜索
				const searchWordRes = await props.ctx.app.localDb.get(`search/${props.ctx.logic.repository}/searchWord`);
				if (searchWordRes) {
					reloadParam.searchWord = searchWordRes;
				} else {
					reloadParam.searchWord = '';
				}
			}

			//获取甘特图数据
			if (scheduleroleaction?.authority?.allowRead == true) {
				getProjectData(props.ctx, '');
				getProSchedule(props.ctx, reloadParam);
			}
		};

		/**
		 * 备料计划
		 */

		const getPrepare = (context: UiBuildContext<any>) => {
			const { $api, $router, $toast: toast, $t: t } = context.globalProps;
			// 获取当前选中的id
			//selectItem.selectData
			const projectID = selectgProjectSearchword.value?.projectID ?? multiSelectList?.data[0]?.projectID ?? '';

			// 构建路由对象
			const route = {
				path: '/MES/ComputeKitting',
				query: {
					projectID: projectID,
					type: 'PreparationPlan',
					moduleCode: "M.03.002"
				},
			};

			// 在新标签页打开
			const routeUrl = $router.resolve(route);
			window.open(routeUrl.href, '_blank');
		};

		//甘特图 数据字典
		const threeMep = reactive({
			data: <any>[],
		});
		//甘特图数据
		const newTasks = reactive({
			datas: {
				data: <any>[],
				links: <any>[],
			},
		});
		const isGanttEmpty = computed(
			() =>
				!showLoading.value &&
				!isLoading.value &&
				!ganttDataLoading.value &&
				(newTasks.datas.data?.length ?? 0) === 0
		);
		const renderGanttLoadingState = () =>
			h('div', { class: 'ganttLoadingState' }, [ui.factory.loading({})]);
		const renderGanttEmptyState = (label: string) =>
			h('div', { class: 'ganttEmptyState' }, [
				h('i', { class: 'pi pi-inbox ganttEmptyState__icon', 'aria-hidden': 'true' }),
				h('p', { class: 'ganttEmptyState__text' }, label),
			]);

		const updateObj = reactive({
			deleteID: null,
			subList: <any>[],
			subLinkList: <any>[],
		});
		//获取甘特图任务数据
		const getProSchedule = async (context: UiBuildContext<any>, query: any) => {
			showLoading.value = false;
			ganttDataLoading.value = true;
			personInCharge.value = true;
			const { $api, $router, $toast: toast, $t: t } = context.globalProps;
			newTasks.datas.data = [];
			newTasks.datas.links = [];
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.getAll({
					action: 'getAllProjectSchedule',
					repository: 'ProjectSchedule',
					service: 'mes',
					queryParams: query,
				});
				if (res.list) {
					//this.taskDatas.tasks= res.list;
					const originalArray = JSON.parse(JSON.stringify(res.list));
					const newArrayList = res.list.map((item: any) => {
						item.id = item.projectID;
						item.ownerName = item.customProperties.$ownerID ?? '';
						item.ownerDept = item.customProperties.$ownerDeptID ?? '';
						item.text = item.projectName + '_' + item.projectNo;
						item.projectName = item.projectName + '_' + item.projectNo;
						applyScheduleGanttTaskDates(item, gantt);
						item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
						item.taskNo = item.projectNo;
						item.type = item.milestone ? gantt.config.types.milestone : null;
						//item.parent = item.parentTaskID;
						item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
						item.color = '#' + item.taskColor;
						item.constraint_type = item.customProperties.$constraintType;
						item.isLoadingChildren = true; //是否已经加载过子集
						item.refName = 'Project';
						item.taskLevel = 'Project';
						item.taskID = item.projectID;
						item.isRead = false;
						const obj = <any>{};
						obj.key = item.projectID;
						obj.value = item.projectID;
						obj.projectID = item.projectID;
						threeMep.data.push(obj);
						if (item.ownerID && item.ownerName) {
							const hasUser = userAll.value.findIndex((item2: any) => {
								return item2.userID === item.ownerID;
							});
							if (hasUser >= 0) {
								selectPersons.value.push(item.ownerID);
							}
						}
						prepareProjectScheduleLoadedTask(item);
						applyGanttProjectTaskRowHeight(item);
						return item;
					});
					const addSubMap = originalArray.map((item2: any) => {
						item2.parent = item2.projectID;
						item2.ownerName = item2.customProperties.$ownerID ?? '';
						item2.ownerDept = item2.customProperties.$ownerDeptID ?? '';
						item2.id = item2.projectID + '_1';
						item2.projectName = t('ganttLabel.loading');
						item2.text = '';
						item2.start_date = new Date();
						item2.end_date = new Date();
						item2.constraint_date = null;
						item2.duration = 1;
						item2.statusType = null;
						item2.taskColor = !item2.taskColor ? '537CFA' : item2.taskColor;
						item2.color = '#' + item2.taskColor;
						item2.constraint_type = null;
						item2.isLoadingChildren = false; //是否已经加载过子集
						item2.status = null;
						item2.expectedStart = null;
						item2.expectedFinish = null;
						item2.expectedDuration = null;
						item2.refName = 'loadMore';
						item2.taskLevel = 'loadMore';
						item2.taskID = item2.projectID;
						item2.taskNo = item2.projectNo;
						item2.actions = [];
						item2.type = item2.milestone ? gantt.config.types.milestone : null;
						return item2;
					});

					//获取去重数组

					selectPersons.value = [...new Map(selectPersons.value.map((item: any) => [item, item])).values()];
					updateChargePerson(selectPersons.value);

					const newData = [...newArrayList, ...addSubMap];
					newTasks.datas.data = newData;
					newTasks.datas.links = [];

					if (newTasks.datas.data.length > 0) {
						getGannt();
						ganttDataLoading.value = false;
					} else {
						newTasks.datas.data = [];
						newTasks.datas.links = [];
						getGannt();
						ganttDataLoading.value = false;


					}
					personInCharge.value = false;
					ganttDataLoading.value = false;
				} else {
					newTasks.datas.data = [];
					newTasks.datas.links = [];
					getGannt();
					personInCharge.value = false;
					ganttDataLoading.value = false;
				}
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.validationErrors[0].error,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				}
				newTasks.datas.data = [];
				newTasks.datas.links = [];
				personInCharge.value = false;
				ganttDataLoading.value = false;
			}
		};

		//获取甘特图刷新数据
		const getSubSchedule = async (context: UiBuildContext<any>, task: any, isOpen?: any) => {
			//showLoading.value = true;
			personInCharge.value = true;
			task.isRead = true;
			const ctx = context.globalProps;
			const { $api, $router, $toast: toast, $t: t } = ctx;
			const updateObj = reactive({
				deleteID: task.id,
				subList: <any>[],
				subLinkList: <any>[],
			});

			updateObj.deleteID = task.id;
			updateObj.subList = [];
			updateObj.subLinkList = [];

			//getProSub(updateObj);
			//删除,并更新
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.getAll({
					action: 'getAllTaskSchedule',
					repository: 'ProjectSchedule',
					service: 'mes',
					queryParams: {
						projectID: task.projectID,
					},
				});
				//子项
				if (res.list && res.list.length > 0) {
					if (res.list[0].tasks && res.list[0].tasks.length > 0) {
						updateObj.subList = res.list[0].tasks.map((item: any) => {
							item.id = item.taskID;
							item.text = item.taskName;
							item.ownerName = item.customProperties.$ownerID ?? '';
							item.ownerDept = item.customProperties.$ownerDeptID ?? '';
							item.projectName = item.taskName;
							applyScheduleGanttTaskDates(item, gantt);
							item.type = item.milestone == true ? gantt.config.types.milestone : null;
							item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
							item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
							item.color = '#' + item.taskColor;
							item.constraint_type = item.customProperties.$constraintType;
							//item.isLoadingChildren= true;//是否已经加载过子集
							item.refName = 'ProjectTask';
							if (item.ownerID && item.ownerName) {
								const hasUser = userAll.value.findIndex((item2: any) => {
									return item2.userID === item.ownerID;
								});
								if (hasUser >= 0) {
									selectPersons.value.push(item.ownerID);
								}
							}

							//判断taskNo是否有点
							//1个点 item.projectID
							//两个点以上 取点数 -1点之前的值   item.projectID+ "_" +
							const resNo = item.taskNo.split('.').length - 1;
							if (resNo <= 0) {
								item.parent = item.projectID;
								item.level = 1;
								const obj = <any>{};
								obj.key = item.taskNo;
								obj.value = item.taskID;
								obj.projectID = item.projectID;
								threeMep.data.push(obj);
							} else {
								//截取点长度后的值
								// console.log('getSubstringBeforeNthDot(item.taskNo, resNo)', getSubstringBeforeNthDot(item.taskNo, resNo));
								//根据NO找父亲
								const taskID = getSubstringBeforeNthDot(item.taskNo, resNo);
								const fartherObj = threeMep.data.filter((mapItem: any) => {
									return mapItem.key == taskID && mapItem.projectID == item.projectID;
								});
								item.level = resNo + 1;
								item.parent = fartherObj[0]?.value ?? '';
								const obj = <any>{};
								obj.key = item.taskNo;
								obj.value = item.taskID;
								obj.projectID = item.projectID;
								threeMep.data.push(obj);
							}
							prepareProjectScheduleLoadedTask(item);
							applyGanttProjectTaskRowHeight(item);
							return item;
						});
					}

					if (res.list[0].links && res.list[0].links.length > 0) {
						updateObj.subLinkList = res.list[0].links.map((linkItem: any) => {
							linkItem.refName = 'ProjectTask';
							//linkItem.relationID = linkItem.fromTaskID + '_' + linkItem.toTaskID;
							linkItem.source = linkItem.fromTaskID;
							linkItem.target = linkItem.toTaskID;
							linkItem.getLoad = true;
							//link转换 甘特图type
							const res = linkTypes.find((item: any) => {
								return item.key == linkItem.relationType;
							});
							if (res.value) {
								linkItem.type = res.value;
							} else {
								linkItem.type = 0;
							}
							return linkItem;
						});
					}

					//获取去重数组
					selectPersons.value = [...new Map(selectPersons.value.map((item: any) => [item, item])).values()];

					updateChargePerson(selectPersons.value);

					goUpdateSub(updateObj, task.id, isOpen, task);
					healProjectScheduleGanttLockState(gantt);
					isLoading.value = false;
					personInCharge.value = false;
					showLoading.value = false;
				} else {
					// toast.add({
					// 	severity: 'info',
					// 	summary: t('state.noData'),
					// 	life: 5000,
					// });
					if (updateObj.deleteID) {
						const deleteTaskId = updateObj.deleteID + '_1';
						const deleteTask = gantt.getTask(deleteTaskId);
						if (deleteTask && deleteTask.refName == 'loadMore') {
							deleteTask.projectName = t('state.noData');
							applyGanttProjectTaskRowHeight(deleteTask);
							gantt.updateTask(deleteTaskId, deleteTask);
						}
					}
					gantt.refreshData();
					nextTick(() => syncProjectGanttRowHeights());
					isLoading.value = false;
					personInCharge.value = false;
					showLoading.value = false;
				}
				//console.log('threeMep', threeMep);
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.validationErrors[0].error,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				}
				isLoading.value = false;
				personInCharge.value = false;
				showLoading.value = false;
			}
		};

		const updateRes = reactive({
			data: [],
		});
		//甘特图 更新数据
		const changeTasks = async (tasksItem: any, context: AppContext) => {
			const { $api, $router, $toast: toast } = context.app.config.globalProperties;

			// if (tasksItem.action) {
			// 	tasksItem.action = null;
			// }

			const item = JSON.parse(JSON.stringify(tasksItem));
			item.action = null;
			item.actions = null;
			//如果是项目
			if (!tasksItem.parent || tasksItem.parent == 0) {
				if (item.constraintDate) {
					item.constraintDate = item.constraintDate + ' 00:00:00';
				}
			}

			const updateList = <any>[];
			let linkList = <any>[];
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;

				res = await apiClient.doAction(
					{
						action: 'saveSchedule',
						repository: 'ProjectSchedule',
						service: 'mes',
					},
					item
				);

				if (res.projectID) {
					//父级
					if (res.project) {
						const newTask = res.project;
						newTask.id = newTask.projectID;
						newTask.text = newTask.projectName;
						applyScheduleGanttTaskDates(newTask, gantt);
						newTask.constraint_date = newTask.constraintDate ? new Date(newTask.constraintDate) : null;
						newTask.statusType = newTask.customProperties.$status;
						//item.parent = item.parentTaskID;

						newTask.color = !newTask.taskColor ? '537CFA' : newTask.taskColor;
						newTask.taskColor = newTask.color;

						newTask.constraint_type = newTask.customProperties.$constraintType;
						newTask.isLoadingChildren = true; //是否已经加载过子集
						newTask.refName = 'Project';
						newTask.taskID = newTask.projectID;
						//console.log('newTask', newTask);
						updateList.push(newTask);
					}

					//子项
					if (res.tasks && res.tasks.length > 0) {
						let newSbuLinkList: any;
						linkList = res.tasks.map((item: any) => {
							item.id = item.taskID;
							item.text = item.taskName;
							item.projectName = item.taskName;
							applyScheduleGanttTaskDates(item, gantt);
							item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
							item.color = !item.taskColor ? '537CFA' : item.taskColor;
							item.taskColor = item.color;
							item.constraint_type = item.customProperties.$constraintType;
							//item.isLoadingChildren= true;//是否已经加载过子集
							item.refName = 'ProjectTask';
							//判断taskNo是否有点
							//1个点 item.projectID
							//两个点以上 取点数 -1点之前的值   item.projectID+ "_" +
							const resNo = item.taskNo.split('.').length - 1;
							if (resNo <= 0) {
								item.parent = item.projectID;
								const obj = <any>{};
								obj.key = item.taskNo;
								obj.value = item.taskID;
								obj.projectID = item.projectID;
								threeMep.data.push(obj);
							} else {
								//截取点长度后的值
								// console.log('getSubstringBeforeNthDot(item.taskNo, resNo)', getSubstringBeforeNthDot(item.taskNo, resNo));
								//根据NO找父亲
								const taskID = getSubstringBeforeNthDot(item.taskNo, resNo);
								const fartherObj = threeMep.data.filter((mapItem: any) => {
									return mapItem.key == taskID && mapItem.projectID == item.projectID;
								});
								item.parent = fartherObj[0]?.value ?? '';
							}
							prepareProjectScheduleLoadedTask(item);
							return item;
						});
					}

					updateRes.data = [...updateList, ...linkList];
					//console.log('updateRes.data', updateRes.data);
					goUpdateTask(updateRes.data);
				}
				// 	//提交给组件更新数据
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.validationErrors[0].error,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				}
				showLoading.value = false;
				undoAction(); //报错返回
				return false;
			}
		};
		const isNeedDeleteLink = ref(false); //删除后还原，接口是否需要调用。
		//甘特图 link
		const changeLinks = async (linkItem: any, context: AppContext) => {
			// if (linkItem.action) {
			// 	linkItem.action = null;
			// }

			// linkItem.refName = 'ProductionOrderRelation';
			linkItem.fromTaskID = linkItem.source;
			linkItem.toTaskID = linkItem.target;
			linkItem.relationID = linkItem.relationID ? linkItem.relationID : linkItem.id;
			linkItem.relationType = linkItem.type;
			const { $api, $router, $toast: toast } = appContext.app.config.globalProperties;

			const item = JSON.parse(JSON.stringify(linkItem));
			item.action = null;
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.doAction(
					{
						action: 'saveLink',
						repository: 'ProjectSchedule',
						service: 'mes',
					},
					item
				);

				isNeedDeleteLink.value = false;
				showLoading.value = false;
				goUpdateLink();
				return;
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.detail ?? '',
						summary: error.validationErrors[0].error,
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.detail ?? '',
						summary: error.message ?? `${t('invalid.error')}`,
						group: 'br',
						life: 5000,
					});
				}
				//恢复原状
				isNeedDeleteLink.value = true;
				gantt.deleteLink(linkItem.id);
				showLoading.value = false;
				// undoAction();
				return false;
			}
		};

		//甘特图下达
		const changeRelease = async (taskItem: any, context: UiBuildContext<any>) => {
			// if (taskItem.action) {
			// 	taskItem.action = null;
			// }

			const ownerData = {
				ownerID: taskItem?.ownerID ?? null,
				ownerName: taskItem?.ownerName ?? null,
				ownerDeptID: taskItem?.ownerDeptID ?? null,
				ownerDeptName: taskItem?.ownerDept ?? null,
			};
			if (!ownerData.ownerDeptName) {
				ownerData.ownerDeptName = '-';
			}
			//appContext.uiBuilder.
			// 获取消息弹窗对应的数据-
			const action = taskItem.actions.filter((item: any) => item.param.prompt === 'FLOW_TO').find((value: any) => value);
			(context.uiBuilder as any).buildNotice(context, {
				id: taskItem.taskID,
				action,
				ownerData: ownerData,
				onSubmit: async (data: any) => {
					isLoading.value = true;
					const { $t: t, $api: apiBox, $toast: toast } = context.globalProps;
					//调用接口
					try {
						const res: boolean = await apiBox.doAction(
							{
								path: taskItem.taskID ?? '',
								action: 'release',
								repository: 'ProjectSchedule',
								service: 'mes',
							},
							data
						);
						//关闭窗口
						if (res) {
							//有负责人不更新
							taskItem.ownerID = data.ownerID;
							taskItem.ownerName = data.ownerName;
							taskItem.ownerDept = data.ownerDept;
							taskItem.ownerDeptName = data.ownerDeptName;

							if (taskItem.refName != 'Project') {
								//寻找该单的子数据
								const childTasks = gantt.getChildren(taskItem.taskID);
								const userInfo = {
									deptID: data.ownerDept,
									userID: data.ownerID,
									username: data.ownerName,
									customProperties: {
										$deptID: data.ownerDeptName,
									},
								};
								setOwners(childTasks, userInfo);
							}

							//关闭按钮
							showIssue.value = false;
							//调用接口
							await getSubSchedule(context, taskItem);

							toast.add({
								severity: 'success',
								summary: t('dialog.success'),
								life: 5000,
							});

							return true;
						}
					} catch (error: any) {
						if (error.validationErrors && error.validationErrors.length > 0) {
							toast.add({
								severity: 'error',
								detail: error.validationErrors[0].error,
								summary: error.detail ?? '',
								group: 'br',
								life: 5000,
							});
						} else {
							toast.add({
								severity: 'error',
								detail: error.message ?? `${t('invalid.error')}`,
								summary: error.detail ?? '',
								group: 'br',
								life: 5000,
							});
						}
						isLoading.value = false;
						showLoading.value = false;
						return false;
					}
				},
			});
		};

		const tableData = ref([]);
		const isTableDate = ref(false);
		const tablecolumns = ref([]);
		const tablecolumns2 = ref([]);
		const tableDataKEY = ref('id');
		const selectionRows = ref([]);

		//获取项目工作包
		const getPdItem = async (ctx: UiBuildContext<any>, taskItem?: any, value?: any, importDev?: string) => {
			//showLoading.value = true;
			const { $ui: ui, $api, $router, $toast: toast, $t: t } = ctx.globalProps;
			const apiClient = $api as ApiClient;
			const { model } = ctx;
			const { metaUiService } = ctx.logic;

			// if (taskItem.action) {
			// 	taskItem.action = null;
			// }

			const qParams = <any>{
				projectID: taskItem.projectID,
				pageSize: searchParam.pager.pageSize,
				pageNo: searchParam.pager.pageNo,
				// 变更类型不能为减项
				amendType: `NOT IN ${AmendType.REMOVED}`,
				sort: '',
				searchWord: value,
				taskNo: taskItem.taskNo,
			};
			const sourcingMode = importDev;
			if (importDev) {
				qParams.sourcingMode = importDev;
			}
			const res = await apiClient.getAll({
				repository: 'ProjectDeliveryItems',
				queryParams: qParams,
				service: 'mes',
			});
			searchParam.pager = res.pagination;
			//console.log('searchParam.pager', searchParam.pager);
			if (res.list && res.list.length > 0) {
				tableData.value = res.list.map((it: any) => {
					return {
						...it,
						amendType: MetaModel.getRefProp(it, 'amendType'),
						sourcingMode: MetaModel.getRefProp(it, 'sourcingMode'),
						taskPhase: MetaModel.getRefProp(it, 'taskPhase')
					};
				});
			} else {
				tableData.value = [];
			}

			isTableDate.value = true;
			//showLoading.value = false;
		};

		//弹窗添加工作包
		const addWorkPackage = async (taskItem: any, appContext: UiBuildContext<any>) => {
			const { $ui: ui, $api, $router, $t: t, $toast: toast } = appContext.globalProps;
			const apiClient = $api as ApiClient;
			const { model } = appContext;
			const { metaUiService } = appContext.logic;

			//获取元数据
			const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
			tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
				return Number(prev.fieldIdx) - Number(curr.fieldIdx);
			});

			tableDataKEY.value = 'itemID';

			// if (taskItem.action) {
			// 	taskItem.action = null;
			// }
			// const { $ui: ui, $api, $router, $toast, $t: t, $toast: toast } = appContext.appContext.app.config.globalProperties;
			// const apiClient = $api as ApiClient;
			// const { model, metaUiService } = appContext;

			// //获取元数据
			// const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
			// tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
			// 	return Number(prev.fieldIdx) - Number(curr.fieldIdx);
			// });

			// // const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
			// // tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
			// // 	return Number(prev.fieldIdx) - Number(curr.fieldIdx);
			// // });
			tableDataKEY.value = 'itemID';

			appContext.uiBuilder.confirmDialog(
				(appContext.uiBuilder as any).buildSearchForRelativeContent(
					[
						ui.factory.column({
							header: '行号',
							field: 'rowNum',
							style: { width: '70px' },
						}),
						//tablecolumns,
						...tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName, style: 'width:200px' })),
					],

					{
						dataKey: tableDataKEY.value,
						selectionMode: 'multiple',
						onSearch: async (params: any) => {
							const { searchParams, reload, pager } = params;
							await getPdItem(appContext, taskItem, searchParams.searchWord, 'MAKE');
							// if (!tableData.value || tableData.value.length === 0) {
							// 	toast.add({
							// 		severity: 'info',
							// 		detail: `${t('invalid.noDeliverables')}`,
							// 		group: 'br',
							// 		life: 5000,
							// 	});
							// }
							return { list: tableData.value, pager: searchParam.pager };
						},
						onPage: ({ pageNo, pageSize }: any) => {
							searchParam.pager.pageNo = pageNo;
							searchParam.pager.pageSize = pageSize;
						},
						onSelect: (selection: any, row: any) => {
							selectionRows.value = selection;
						},
						onSelectAll: (selection: any) => {
							selectionRows.value = selection;
						},
					}
				),
				appContext,
				{
					name: 'projectDeliveryItemSearch',
					title: '请选择项目交付物',
					width: '90vw',
					accept: async () => {
						if (selectionRows.value.length > 0) {
							//提交模型
							const payLoad = {
								payload: {
									taskID: taskItem.taskID,
									items: <any>[],
								},
							};
							const rItemKeys = selectionRows.value.map((item: any) => {
								const itemKeys = <any>{
									projectID: item.projectID,
									itemID: item.itemID,
									ownerID: null,
									ownerDeptID: null,
								};
								return itemKeys;
							});
							payLoad.payload.items = rItemKeys;
							try {
								//调用接口提交交付物，生成工作包
								const resPackages = await apiClient.doAction(
									{
										path: taskItem.taskID,
										action: 'addWorkPackage',
										repository: 'ProjectSchedule',
										service: 'mes',
									},
									payLoad
								);
								if (resPackages == true) {
									appContext.uiBuilder.toast(appContext, {
										severity: 'success',
										summary: t('success.operationSuccessful'),
										life: 5000,
									});
									//调用接口更新数据
									await getSubSchedule(appContext, taskItem);
									//弹窗确认是否要跳转查看
									// appContext.uiBuilder.confirmMessage(appContext, {
									// 	header: t('action.confirm'),
									// 	message: t('dialog.needCheck'),
									// 	// type: action.param.hint,
									// 	rejectLabel: t('action.cancel'),
									// 	acceptLabel: t('action.confirm'),
									// 	// 部分到货
									// 	accept: async () => {
									// 		window.open(`/MES/ProjectWorkPackages?taskLevel=WORK_PACKAGE&taskPhase=${taskItem.taskPhase}&projectID=${taskItem.projectID}`, '_blank');

									// 		return true;
									// 	},
									// 	// 全部到货
									// 	reject: async () => {
									// 		return true;
									// 	},
									// });
									return true;
								}
							} catch (error: any) {
								if (error.validationErrors && error.validationErrors.length > 0) {
									appContext.uiBuilder.toast(appContext, {
										severity: 'error',
										title: $t('dialog.title.error'),
										detail: error.validationErrors[0].error,
										summary: error.detail ?? '',
										group: 'br',
										life: 5000,
									});
								} else {
									appContext.uiBuilder.toast(appContext, {
										severity: 'error',
										title: $t('dialog.title.error'),
										detail: error.message ?? `${t('invalid.error')}`,
										summary: error.detail ?? '',
										group: 'br',
										life: 5000,
									});
								}

								showLoading.value = false;
								return false;
							}

							return false;
						} else {
							appContext.uiBuilder.toast(appContext, {
								severity: 'error',
								summary: t('invalid.requiredSelectAny'),
								group: 'br',
								life: 5000,
							});
							return false;
						}
					},
				}
			);
		};

		//导入交付物
		const imporitDeliverables = async (taskItem: any, appContext: UiBuildContext<any>) => {
			selectionRows.value = [];
			const { $ui: ui, $api, $router, $t: t, $toast: toast } = appContext.globalProps;
			const apiClient = $api as ApiClient;
			const { model } = appContext;
			const { metaUiService } = appContext.logic;

			//获取元数据
			const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
			tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
				return Number(prev.fieldIdx) - Number(curr.fieldIdx);
			});

			tableDataKEY.value = 'itemID';
			appContext.uiBuilder.confirmDialog(
				(appContext.uiBuilder as any).buildSearchForRelativeContent(
					[
						ui.factory.column({
							header: '#',
							field: 'rowNum',
							style: { width: '70px' },
						}),

						...tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName, style: 'width:200px;text-align:"center"' })),
					],
					// tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
					{
						dataKey: tableDataKEY.value,
						selectionMode: 'multiple',
						onSearch: async (params: any) => {
							const { searchParams, reload, pager } = params;
							await getPdItem(appContext, taskItem, searchParams.searchWord, 'MAKE');
							// if (!tableData.value || tableData.value.length === 0) {
							// 	toast.add({
							// 		severity: 'info',
							// 		detail: `${t('invalid.noDeliverables')}`,
							// 		group: 'br',
							// 		life: 5000,
							// 	});
							// }
							return { list: tableData.value, pager: searchParam.pager };
						},
						onPage: ({ pageNo, pageSize }: any) => {
							searchParam.pager.pageNo = pageNo;
							searchParam.pager.pageSize = pageSize;
						},
						onSelect: (selection: any, row: any) => {
							selectionRows.value = selection;
						},
						onSelectAll: (selection: any, row: any) => {
							selectionRows.value = selection;
						},
					}
				),
				appContext,
				{
					name: 'projectDeliverableImport',
					title: '请选择项目交付物',
					width: '90vw',
					height: '90vw',
					accept: async () => {
						if (selectionRows.value.length > 0) {
							//提交模型
							const payLoad = {
								payload: {
									taskID: taskItem.projectID,
									items: <any>[],
								},
							};
							const rItemKeys = selectionRows.value.map((item: any) => {
								const itemKeys = <any>{
									projectID: item.projectID,
									itemID: item.itemID,
									ownerID: null,
									ownerDeptID: null,
								};
								return itemKeys;
							});
							payLoad.payload.items = rItemKeys;
							try {
								//调用接口提交交付物，生成工作包
								const resPackages = await apiClient.doAction(
									{
										path: taskItem.taskID,
										action: 'addWorkPackage',
										repository: 'ProjectSchedule',
										service: 'mes',
									},
									payLoad
								);
								if (resPackages == true) {
									appContext.uiBuilder.toast(appContext, {
										severity: 'success',
										summary: t('success.operationSuccessful'),

										life: 5000,
									});
									//调用接口更新数据
									await getSubSchedule(appContext, taskItem);
									//弹窗确认是否要跳转查看
									// appContext.uiBuilder.confirmMessage(appContext, {
									// 	header: t('action.confirm'),
									// 	message: t('dialog.needCheck'),
									// 	// type: action.param.hint,
									// 	rejectLabel: t('action.cancel'),
									// 	acceptLabel: t('action.confirm'),
									// 	// 部分到货
									// 	accept: async () => {
									// 		window.open(`/MES/ProjectWorkPackages?taskLevel=WORK_PACKAGE&taskPhase=${taskItem.taskPhase}&projectID=${taskItem.projectID}`, '_blank');

									// 		return true;
									// 	},
									// 	// 全部到货
									// 	reject: async () => {
									// 		return true;
									// 	},
									// });

									return true;
								}
							} catch (error: any) {
								appContext.uiBuilder.toast(appContext, {
									severity: 'error',
									title: $t('dialog.title.error'),
									detail: error.message ?? `${t('invalid.error')}`,
									summary: error.detail ?? '',
									group: 'br',
									life: 5000,
								});
								showLoading.value = false;
								return false;
							}

							return;
						} else {
							appContext.uiBuilder.toast(appContext, {
								severity: 'error',
								summary: t('invalid.requiredSelectAny'),
								group: 'br',
								life: 5000,
							});
							return false;
						}
					},
					reject: async () => {
						searchParam.pager.pageNo = 1;
						searchParam.pager.pageSize = 10;
						return true;
					},
				}
			);
		};
		const refLashDatas = reactive({
			data: {
				tasks: [],
				links: [],
			},
		});

		//添加工作包
		const addWorkPackageBox = async (taskItem: any, context: UiBuildContext<any>) => {
			const { $ui: ui, $api, $router, $t: t, $toast: toast } = context.globalProps;
			const apiClient = $api as ApiClient;
			const { model } = context;
			const { metaUiService } = context.logic;
			//获取元数据
			const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
			tablecolumns2.value = mUI.getListedFields().sort((prev: any, curr: any) => {
				return Number(prev.fieldIdx) - Number(curr.fieldIdx);
			});
			tableDataKEY.value = 'itemID';
			// await getPdItem(context, taskItem, '', 'MAKE');
		};

		//查询甘特图任务数据
		const getProScheduleR = async (appContext: UiBuildContext<any>, useGanttAreaLoading = true) => {
			const { $api, $router, $toast: toast, $t: t } = appContext.globalProps;
			if (useGanttAreaLoading) {
				ganttDataLoading.value = true;
			}
			const task = reactive({
				taskData: {
					data: <any>[],
					link: <any>[],
				},
			});

			refLashDatas.data.tasks = [];
			refLashDatas.data.links = [];
			threeMep.data = [];

			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.getAll({
					action: 'getAllProjectSchedule',
					repository: 'ProjectSchedule',
					service: 'mes',
					queryParams: reloadParam,
				});


				if (res.list && res.list.length > 0) {
					//this.taskDatas.tasks= res.list;
					const originalArray = JSON.parse(JSON.stringify(res.list));
					const newArrayList = res.list.map((item: any) => {
						item.id = item.projectID;
						item.ownerName = item.customProperties.$ownerID ?? '';
						item.ownerDept = item.customProperties.$ownerDeptID ?? '';
						item.text = item.projectName + '_' + item.projectNo;
						item.projectName = item.projectName + '_' + item.projectNo;
						applyScheduleGanttTaskDates(item, gantt);
						item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
						item.taskNo = item.projectNo;
						//item.parent = item.parentTaskID;
						item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
						item.color = '#' + item.taskColor;
						item.constraint_type = item.customProperties.$constraintType;
						item.isLoadingChildren = true; //是否已经加载过子集
						item.refName = 'Project';
						item.taskLevel = 'Project';
						item.taskID = item.projectID;
						item.isRead = false;
						const obj = <any>{};
						obj.key = item.projectID;
						obj.value = item.projectID;
						obj.projectID = item.projectID;
						threeMep.data.push(obj);
						prepareProjectScheduleLoadedTask(item);
						applyGanttProjectTaskRowHeight(item);
						return item;
					});
					const addSubMap = originalArray.map((item2: any) => {
						item2.parent = item2.projectID;
						item2.ownerName = item2.customProperties.$ownerID ?? '';
						item2.ownerDept = item2.customProperties.$ownerDeptID ?? '';
						item2.id = item2.projectID + '_1';
						item2.projectName = t('ganttLabel.loading');
						item2.text = '';
						item2.start_date = new Date();
						item2.end_date = new Date();
						item2.constraint_date = null;
						item2.duration = 0;
						item2.statusType = null;
						item2.taskColor = !item2.taskColor ? '537CFA' : item2.taskColor;
						item2.color = '#' + item2.taskColor;
						item2.constraint_type = null;
						item2.isLoadingChildren = false; //是否已经加载过子集
						item2.status = null;
						item2.expectedStart = null;
						item2.expectedFinish = null;
						item2.expectedDuration = null;
						item2.refName = 'loadMore';
						item2.taskLevel = 'loadMore';
						item2.taskID = item2.projectID;
						item2.taskNo = item2.projectNo;
						return item2;
					});
					const newData = [...newArrayList, ...addSubMap];
					refLashDatas.data.tasks = newData;
					refLashDatas.data.links = [];

					if (refLashDatas.data.tasks.length > 0) {
						newTasks.datas.data = [];
						newTasks.datas.links = [];
						newTasks.datas.data = refLashDatas.data.tasks;
						newTasks.datas.links = refLashDatas.data.links;
						clearTime = setTimeout(() => {
							gantt.clearAll();
							gantt.parse(newTasks.datas);
							syncScheduleGanttTaskDates(gantt);
							healProjectScheduleGanttLockState(gantt);
							syncProjectGanttRowHeights();
							syncGanttGridWidthAfterData();
							if (useGanttAreaLoading) {
								ganttDataLoading.value = false;
							}
						}, 200);
					} else {
						newTasks.datas.data = [];
						newTasks.datas.links = [];
						clearTime = setTimeout(() => {
							gantt.clearAll();
							gantt.parse(newTasks.datas);
							syncScheduleGanttTaskDates(gantt);
							healProjectScheduleGanttLockState(gantt);
							syncProjectGanttRowHeights();
							syncGanttGridWidthAfterData();
							if (useGanttAreaLoading) {
								ganttDataLoading.value = false;
							}
						}, 200);
					}
				} else {
					newTasks.datas.data = [];
					newTasks.datas.links = [];

					clearTime = setTimeout(() => {
						gantt.clearAll();
						gantt.parse(newTasks.datas);
						syncScheduleGanttTaskDates(gantt);
						healProjectScheduleGanttLockState(gantt);
						syncProjectGanttRowHeights();
						syncGanttGridWidthAfterData();
						if (useGanttAreaLoading) {
							ganttDataLoading.value = false;
						}
					}, 200);
				}
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.validationErrors[0].error,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				}
				if (useGanttAreaLoading) {
					ganttDataLoading.value = false;
				}
			}
		};
		const selectedUser = ref();
		let userPagination: Pagination = reactive({
			pageSize: 10,
			pageNo: 1,
		});

		//所有人员
		const userAll = ref([]);
		//人员下拉选择
		const userOptionsAll = ref([]);

		const userGroupOptions = computed(() => {
			const allDept = userOptionsAll.value.map((item: any) => ({
				deptID: item.deptID,
				deptName: item.customProperties.$deptID ?? '-',
			}));
			const deptList: any[] = [];
			const map = new Map();

			allDept.forEach((item: { deptID: string; deptName: string }) => {
				if (!map.has(item.deptID)) {
					map.set(item.deptID, true);
					deptList.push({ ...item, items: [] });
				}
			});

			userOptionsAll.value.forEach((item: any) => {
				const deptIndex = deptList.findIndex((item2: any) => item2.deptID === item.deptID);
				if (deptIndex != -1) {
					deptList[deptIndex].items.push(item);
				}
			});
			return deptList;
		});

		//选中
		const userChange = async (value: any, taskItems?: any) => {
			const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
			const apiClient = $api as ApiClient;

			if (taskItems && taskItems.length > 0) {
				//提交模型
				const payLoad = <any>[];
				taskItems.forEach((item: any) => {
					const itemKeys = <any>{
						taskID: item.taskID,
						taskNo: item.taskNo,
						projectID: item.projectID,
						ownerID: value.userID,
						ownerDeptID: value.detpID,
						refName: item.refName,
					};
					payLoad.push(itemKeys);
				});

				try {
					const res = await apiClient.doAction(
						{
							action: 'assign',
							repository: 'ProjectSchedule',
							service: 'mes',
						},
						payLoad
					);
					if (res) {
						toast.add({
							severity: 'success',
							detail: '操作成功',
							summary: '成功',
							life: 5000,
						});

						//成功后更新数据 放回去
						taskItems.forEach((item: any) => {
							item.ownerName = value.username ?? '';
							item.ownerID = value.userID ?? '';
							item.ownerDept = value.customProperties?.$deptID ?? '';
							item.ownerDeptID = value.deptID ?? '';
							if (item.refName != 'Project') {
								//寻找该单的子数据
								const childTasks = gantt.getChildren(item.taskID);
								setOwners(childTasks, value);
							}

							//设置常用负责人
							if (item.ownerID && item.ownerName) {
								const hasUser = userAll.value.findIndex((item2: any) => {
									return item2.userID === item.ownerID;
								});
								if (hasUser >= 0) {
									selectPersons.value.push(item.ownerID);
								}
							}
						});
						selectPersons.value = [...new Map(selectPersons.value.map((item: any) => [item, item])).values()];
						updateChargePerson(selectPersons.value);
						gantt.refreshData();
					}
					return true;
				} catch (error: any) {
					if (error.validationErrors && error.validationErrors.length > 0) {
						toast.add({
							severity: 'error',
							detail: error.validationErrors[0].error,
							summary: error.detail ?? '',
							group: 'br',
							life: 5000,
						});
					} else {
						toast.add({
							severity: 'error',
							detail: error.message ?? `${t('invalid.error')}`,
							summary: error.detail ?? '',
							group: 'br',
							life: 5000,
						});
					}
					showLoading.value = false;
					return false;
				}
			}
		};
		//循环 children 赋值负责人
		const setOwners = (childTasks: any, value: any) => {
			if (childTasks && childTasks.length > 0) {
				childTasks.forEach((subItem: any) => {
					const task = gantt.getTask(subItem);
					if (!task.ownerName) task.ownerName = value.username ?? '';
					if (!task.ownerID) task.ownerID = value.userID ?? '';
					if (!task.ownerDept) task.ownerDept = value.customProperties?.$deptID ?? '';
					if (!task.ownerDeptID) task.ownerDeptID = value.deptID ?? '';
					gantt.refreshData();
					const childTasks2 = gantt.getChildren(task.taskID);
					if (childTasks2 && childTasks2.length > 0) {
						setOwners(childTasks2, value);
					}
				});
			}
		};

		//获得全部人员
		const getUser2 = async (params?: Object) => {
			const { $api, $router, $toast: toast } = props.ctx.globalProps;
			const apiClient = $api as ApiClient;
			try {
				let res = null;
				res = await apiClient.getAll({
					repository: 'Users',
					queryParams: Object.assign(
						{},
						{ pageNo: userPagination.pageNo, pageSize: userPagination.pageSize },
						{
							sort: '',
							status: 'ACTIVATED',
						},
						params
					),
					service: 'base',
				});
				userAll.value = res.list ?? [];
				isHaveUser.value = true;
				// if (userOptionsAll.value && userOptionsAll.value.length>0){
				// 	userOptionsAll.value = userOptionsAll.value.map((item:any)=>{
				// 		 item.key=item.userID;
				// 	     item.label = item.username;
				// 		 return item;
				// 	})
				// 	// item.key=item.userID;
				// 	// item.label = item.username;
				// }
				userPagination = Object.assign(userPagination, res.pagination);
			} catch (error: any) {
				return false;
			}
		};

		//获得人员
		const getUser = async (params?: Object) => {
			const { $api, $router, $toast: toast } = props.ctx.globalProps;
			const apiClient = $api as ApiClient;
			try {
				let res = null;
				res = await apiClient.getAll({
					repository: 'Users',
					queryParams: Object.assign(
						{},
						{ pageNo: userPagination.pageNo, pageSize: userPagination.pageSize },
						{
							sort: '',
							status: 'ACTIVATED',
						},
						params
					),
					service: 'base',
				});
				userOptionsAll.value = res.list ?? [];
				isHaveUser.value = true;
				// if (userOptionsAll.value && userOptionsAll.value.length>0){
				// 	userOptionsAll.value = userOptionsAll.value.map((item:any)=>{
				// 		 item.key=item.userID;
				// 	     item.label = item.username;
				// 		 return item;
				// 	})
				// 	// item.key=item.userID;
				// 	// item.label = item.username;
				// }
				userPagination = Object.assign(userPagination, res.pagination);
			} catch (error: any) {
				return false;
			}
		};

		//设置负责人
		const setResponsible = async (ctx: UiBuildContext<any>, taskItems?: any) => {
			const { $ui: ui, $api, $router, $toast: toast, $t: t } = ctx.globalProps;
			const { metaui } = await ctx.logic.loadMetadata('Users', 'base', true);
			// userMeta.value = metaui
			props.ctx.searchParam.pager = userPagination = {
				pageSize: 10,
				pageNo: 1
			}
			const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
				isSearch: true,
				cacheKey: `ownerName/SearchRelative/${metaui.primaryKey}`,
			});

			ctx.uiBuilder.confirmDialog(
				(ctx.uiBuilder as any).buildSearchForRelativeContent(columns, {
					dataKey: `${metaui?.primaryKey ?? ''}`,
					tableId: `${metaui?.objName ?? ''}`,
					onSearch: async ({ searchParams }: any) =>
						await getUser(searchParams).then(() => ({
							list: userOptionsAll.value,
							pager: userPagination,
						})),
					onSelect: (selection: any[], row: any) => {
						selectedUser.value = row;
					},
					onPage: (pager: any) => {
						userPagination.pageNo = pager.pageNo;
						userPagination.pageSize = pager.pageSize;
						props.ctx.searchParam.pager = userPagination
					},
				}),
				ctx,
				{
					cancelId: `dlg-${metaui.objName}-cancel-button`,
					confirmId: `dlg-${metaui.objName}-confirm-button`,
					name: 'searchForRelative',
					title: metaui.displayLabel,
					style: { width: '80vw', maxHeight: '95%' },
					breakpoints: {
						'960px': '75vw',
						'640px': '90vw',
					},
					modal: true,
					accept: async () => {
						//	console.log('selectedUser.value', selectedUser.value);
						if (!selectedUser.value?.userID) {
							toast.add({
								severity: 'error',
								detail: `${t('invalid.error')}`,
								summary: `${t('invalid.selectASuperintendent')}`,
								group: 'br',
								life: 5000,
							});
							return false;
						} else {
							userChange(selectedUser.value, taskItems);
							return true;
						}
					},
					// reject: props.reject
				}
			);

			return false;
		};

		//line的搜索分页条件
		const searchLineParam = reactive({
			pager: {
				pageSize: 10,
				pageNo: 1,
			},
		});

		const getProjectData = async (ctx: UiBuildContext<any>, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;

			if (!reloadParam.projectID) {
				reloadParam.projectID = '';
			}
			const res = await apiBox.getAll({
				repository: 'Projects',
				queryParams: {
					pageSize: searchParam.pager.pageSize,
					pageNo: searchParam.pager.pageNo,
					sort: '',
					searchWord: value,
					projectID: reloadParam.projectID,
					filter: 't.status >= 0',
				},
				service: 'mes',
			});
			searchParam.pager = res.pagination;

			if (selectgProjectSearchword.value) {
				lineData.value = [];
				lineData.value.push(selectgProjectSearchword.value);
			} else {
				lineData.value = (res.list ?? []).map((it: any) => ({ ...it }));
			}

			if (pID) {
				if (lineData.value && lineData.value.length > 0) {
					selectgProject.value = lineData.value[0];
					temporarilySelect.value = lineData.value[0];
				}
			} else {
				// 只缓存单个已选项目，勿赋整个 lineData 数组
				temporarilySelect.value = selectgProject.value ?? lineData.value[0] ?? null;
			}
			await getProjectData2(props.ctx, '');
			ensureSelectedProjectInOuterOptions();
		};

		/** 外层项目下拉远程搜索：写 lineData，并始终保留当前已选项目 */
		const getProjectData2 = async (ctx: UiBuildContext<any>, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;
			const res = await apiBox.getAll({
				repository: 'Projects',
				queryParams: {
					pageSize: searchParam.pager.pageSize || 10,
					pageNo: searchParam.pager.pageNo || 1,
					sort: '',
					searchWord: value,
					filter: 't.status >= 0',
				},
				service: 'mes',
			});
			searchParam.pager = res.pagination;

			lineData.value = (res.list ?? []).map((it: any) => ({ ...it }));
			ensureSelectedProjectInOuterOptions();

			if (pID) {
				if (lineData.value && lineData.value.length > 0) {
					selectgProjectSearchword.value = lineData.value[0];
					temporarilySelect.value = lineData.value[0];
				}
			}
		};

		/** 弹窗内项目搜索：只写 projectDialogData，不碰外层 lineData */
		const getProjectDialogData = async (ctx: UiBuildContext<any>, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;
			const res = await apiBox.getAll({
				repository: 'Projects',
				queryParams: {
					pageSize: projectDialogPager.value.pageSize || 10,
					pageNo: projectDialogPager.value.pageNo || 1,
					sort: '',
					searchWord: value,
					filter: 't.status >= 0',
				},
				service: 'mes',
			});
			projectDialogPager.value = res.pagination;
			projectDialogData.value = (res.list ?? []).map((it: any) => ({ ...it }));
		};

		let metauiGbl: any = null;
		let metauiGbl2: any = null;
		let projectRelod: any;
		const showChargePerson = ref(false);
		const filterChargePerson = () => {
			selectTruePersons.value = [];
			if (selectPersons.value && selectPersons.value.length > 0) {
				selectPersons.value.forEach((item: any) => {
					const res = userAll.value.find((personItem: any) => {
						if (personItem.userID === item) {
							return personItem;
						}
					});
					if (res) {
						//console.log('res', res);
						const ownerData = {
							key: res?.userID ?? null,
							label: res?.username ?? null,
							ownerID: res?.userID ?? null,
							ownerName: res?.username ?? null,
							ownerDeptID: res?.deptID ?? null,
							ownerDeptName: res?.customProperties.$deptID ?? null,
						};
						selectTruePersons.value.push(ownerData);
						//console.log('selectTruePersons.value', selectTruePersons.value);
					}
				});
				// const aaa= gantt.getColumns();
				// console.log("aaaaaa",aaa);
				//[columnIndex].options = data.options; // 更新选项
				// gantt.refreshColumns(); // 刷新列以应用新的选项
			}
			showChargePerson.value = true;
		};

		onBeforeMount(async () => {
			//获取当前用户（优先 localDb，与 signinAuto 一致）
			try {
				const dbUser = await props.ctx?.app?.localDb?.get('user');
				if (dbUser) {
					currentUser.value = dbUser;
				}
			} catch {
				// ignore
			}
			if (!currentUser.value) {
				try {
					const rawUser = localStorage.getItem('user');
					currentUser.value = rawUser ? JSON.parse(rawUser) : null;
				} catch {
					currentUser.value = null;
				}
			}
			if (!currentUser.value) {
				currentUser.value = getLoginUser();
			}

			//判断页面是否需要刷新
			// projectRelod = JSON.parse(localStorage.getItem('projectRelod'));
			// if (projectRelod === 0) {
			// 	projectRelod = 1;
			// 	localStorage.setItem('projectRelod', JSON.stringify(projectRelod));
			// 	window.location.reload();
			// }

			//获取 tasks默认数据
			//获取constraintType的枚举
			metaUiService.getPack({ repository: 'ProjectTasks', service: 'mes' }).then((res: any) => {
				//const {metaui}  = res;
				metauiGbl2 = res;
				//获得constraintType枚举
				const field = metauiGbl2.metaui.getField('constraintType');
				constraintTypeListOptions.value = JSON.parse(field.selectOptions).map((item: any) => {
					item.key = item.value;
					item.label = item.text;
					return item;
				});

				// const taskStatusfield = metauiGbl2.metaui.getField('status');
				// taskStatusListOptions.value = JSON.parse(taskStatusfield.selectOptions).map((item2: any) => {
				// 	item2.key = item2.value;
				// 	item2.label = item2.text;
				// 	return item2;
				// });

				// taskStatusListOptions.value = taskStatusListOptions.value.filter((item: any) => {
				// 	console.log("item",item);
				// 	if (item.key != 'NEW' && item.key != 'SUBMITTED' && item.key != 'RELEASED') {
				// 		return item;
				// 	}
				// });
			});
			metaUiService.getPack({ repository: 'Projects', service: 'mes' }).then((res: any) => {
				//const {metaui}  = res;
				metauiGbl = res;
				//获得状态
				const statusfield = metauiGbl.metaui.getField('status');
				statusListOptions.value = JSON.parse(statusfield.selectOptions).map((item2: any) => {
					item2.key = item2.value;
					item2.label = item2.text;
					return item2;
				});
			});

			createPersonDb(); //新建负责人数据库
			getRoleaction(); //获取权限

			//获取预设人员
			queryPersonInCharge();
			//预设获得人员
			userSelectType.value = 0;
			userPagination.pageSize = 1000;
			getUser2();
		});
		//是否显示备料计划
		const showPreparationPlan = ref(true);
		let clearTime: any = null;
		onMounted(() => {
			//根据地址栏 获取projectID
			// localStorage.setItem('projectRelod', JSON.stringify(projectRelod));

			//默认select
			const slTime = JSON.parse(localStorage.getItem('proJectGanntTime'));
			if (slTime) {
				durationUnit.select = slTime;
			} else {
				durationUnit.select = timeList[2];
			}

			// clearTime = setTimeout(() => {
			// 	// projectRelod = 0;

			// 	//获取甘特图数据
			// 	if (scheduleroleaction?.authority?.allowRead == true) {
			// 		getProjectData(props.ctx, '');
			// 		getProSchedule(props.ctx, reloadParam);
			// 	}

			// 	//设置负责的人权限
			// 	if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
			// 		const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'assign');
			// 		if (res != -1) {
			// 			showAssign.value = true;
			// 		} else {
			// 			showAssign.value = false;
			// 		}

			// 		const isRES = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'preparationPlan');
			// 		if (isRES != -1) {
			// 			showPreparationPlan.value = true;
			// 		} else {
			// 			showPreparationPlan.value = false;
			// 		}
			// 	}
			// }, 1500);
		});

		onUnmounted(() => {
			showTool.value = false;
			ganttResizeController?.destroy();
			ganttResizeController = null;
			gantt.destructor(); //销毁甘特图
			clearTimeout(clearTime);
		});

		// //选中的时间
		const durationUnit = reactive({
			select: {
				name: '按月',
				value: 'month',
			},
		});

		const timeList = [
			// {
			// 	name: '按小时',
			// 	value: 'hour',
			// },
			{
				name: '按日',
				value: 'day',
			},
			{
				name: '按周',
				value: 'week',
			},
			{
				name: '按月',
				value: 'month',
			},
			{
				name: '按季度',
				value: 'quarter',
			},
			{
				name: '按年',
				value: 'year',
			},
		];

		//选择时间切换
		const selectTimeChange = () => {
			const ganntTime = JSON.stringify(durationUnit.select);
			localStorage.setItem('proJectGanntTime', ganntTime);
			gantt.ext.zoom.setLevel(durationUnit.select.value);

			// gantt.changeScaleUnit(durationUnit.select.value);
			// gantt.render();
		};

		//导出EXcel
		const getGanntExcel = async () => {
			const { $api, $router, $toast: toast } = props.ctx.globalProps;
			isLoading.value = true;
			try {
				const apiClient = $api as ApiClient;
				await apiClient
					.exportAll({
						action: 'exportAll',
						repository: 'ProjectSchedule',
						service: 'mes',
						queryParams: reloadParam,
					})
					.then(res => {
						isLoading.value = false;
					});

				//提交给组件更新数据
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.validationErrors[0].error,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				}
				isLoading.value = false;
				return false;
			}
		};

		const zoomConfig = <any>{
			levels: [
				{
					name: 'day',
					scale_height: 27,
					min_column_width: 80,
					scales: [{ unit: 'day', step: 1, format: '%d %M' }],
				},
				{
					name: 'week',
					scale_height: 50,
					min_column_width: 50,
					scales: [
						{
							unit: 'week',
							step: 1,
							format: function (date: Date) {
								const dateToStr = gantt.date.date_to_str('%d %M');
								const endDate = gantt.date.add(date, 7 - date.getDay(), 'day');
								const weekNum = gantt.date.date_to_str('%W')(date);
								return '#' + weekNum + ', ' + dateToStr(date) + ' - ' + dateToStr(endDate);
							},
						},
						{ unit: 'day', step: 1, format: '%j %D' },
					],
				},
				{
					name: 'month',
					scale_height: 50,
					min_column_width: 120,
					scales: [
						{ unit: 'month', format: '%F, %Y' },
						{ unit: 'week', format: 'Week #%W' },
					],
				},
				{
					name: 'quarter',
					height: 50,
					min_column_width: 90,
					scales: [
						{ unit: 'month', step: 1, format: '%M' },
						{
							unit: 'quarter',
							step: 1,
							format: function (date: Date) {
								const dateToStr = gantt.date.date_to_str('%M');
								const endDate = gantt.date.add(date, 2 - (date.getMonth() % 3), 'month');
								return dateToStr(date) + ' - ' + dateToStr(endDate);
							},
						},
					],
				},
				{
					name: 'year',
					scale_height: 50,
					min_column_width: 30,
					scales: [{ unit: 'year', step: 1, format: '%Y' }],
				},
			],
		};

		//标识样式
		gantt.serverList('taskType', [
			{ key: 1, type: 'Project', label: '项目', backgroundColor: '#0099ff', textColor: '#FFF' },
			{ key: 2, type: 'PHASE', label: '阶段', backgroundColor: '#03A9F4', textColor: '#FFF' },
			{ key: 3, type: 'TASK', label: '任务', backgroundColor: '#22c55e', textColor: '#FFF' },
			{ key: 4, type: 'WORK_PACKAGE', label: '工作包', backgroundColor: '#00CC99', textColor: '#FFF' },
		]);
		const byType = (list: any, type: any) => {
			for (let i = 0; i < list.length; i++) {
				if (list[i].type == type) return list[i].label || '';
			}
			return '';
		};

		const isLessThanTwoDay = (date1: any, date2: any) => {
			const diff = Math.abs(date2.getTime() - date1.getTime());
			const diffDays = diff / (1000 * 3600 * 24);
			return diffDays < 2;
		}
		const getGanttDateDayTime = (date: Date) => {
			const d = new Date(date);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		};
		const isGanttEndBeforeStart = (startDate: Date, endDate: Date) =>
			getGanttDateDayTime(endDate) < getGanttDateDayTime(startDate);
		const showGanttEndBeforeStartToast = () => {
			toast.add({
				severity: 'warn',
				summary: $t('ganttLabel.endBeforeStart'),
				group: 'br',
				life: 5000,
			});
		};
		const revertGanttTaskDates = (task: any) => {
			if (task.orgStart) {
				task.start_date = new Date(task.orgStart);
			}
			if (task.orgEnd) {
				task.end_date = new Date(task.orgEnd);
			}
			if (task.orgDuration != null) {
				task.duration = task.orgDuration;
			} else {
				task.duration = gantt.calculateDuration(task.start_date, task.end_date);
			}
			gantt.refreshTask(task.id, true);
		};
		const ganttPeriodSectionConfig = (readonly: boolean) => ({
			name: 'period',
			type: 'time',
			map_to: 'auto',
			time_format: ['%Y', '%m', '%d'],
			autofix_end: false,
			readonly,
		});
		const updateLightboxSections = (sections: any[]) => {
			gantt.config.lightbox.sections = sections;
			if ((gantt as any)._lightbox) {
				gantt.resetLightbox();
			}
		};
		let projectScheduleLightboxCanEdit = true;
		/** dhtmlx select/textarea 不识别 section.readonly，打开后统一禁用表单控件 */
		const lockProjectScheduleLightboxForm = () => {
			const ganttAny = gantt as any;
			// 勿用 _lightbox_root：非 CSP 环境下为 document.body，会误禁用页面上方筛选等控件
			const root = ganttAny.getLightbox?.();
			if (!root?.classList?.contains('gantt_cal_light')) {
				return;
			}
			root.querySelectorAll('select, textarea, input').forEach((el: Element) => {
				const control = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
				control.disabled = true;
				if (control instanceof HTMLTextAreaElement || control instanceof HTMLInputElement) {
					control.readOnly = true;
				}
			});
			root.classList.add('gantt_project_schedule_lightbox_readonly');
		};
		const hideGanttLightboxIfOpen = () => {
			const ganttAny = gantt as any;
			if (!gantt.getState().lightbox && !ganttAny._lightbox_id) {
				return;
			}
			closeGanttLightboxSafely();
		};
		const closeGanttLightboxSafely = () => {
			const ganttAny = gantt as any;
			const taskId = ganttAny._lightbox_id;
			const task = taskId && gantt.isTaskExists(taskId) ? gantt.getTask(taskId) : null;
			ganttAny._lightbox_current_type = null;
			gantt.callEvent('onLightboxCancel', [taskId, !!(task as any)?.$new]);
			if (taskId && task && (task as any).$new) {
				gantt.silent(function () {
					ganttAny.$data.tasksStore.removeItem(taskId);
					ganttAny._update_flags(taskId, null);
				});
				gantt.refreshData();
			}
			gantt.hideLightbox();
		};
		const setupGanttLightboxCloseHandlers = () => {
			const ganttAny = gantt as any;
			ganttAny.lightbox_events.gantt_cancel_btn = closeGanttLightboxSafely;
			const box = gantt.getLightbox();
			const closeBtn = box?.querySelector('.gantt_cal_ltitle_close_btn');
			if (closeBtn) {
				closeBtn.addEventListener(
					'click',
					(e) => {
						e.preventDefault();
						e.stopImmediatePropagation();
						closeGanttLightboxSafely();
					},
					true
				);
			}
		};
		let lightboxPeriodValidateHandler: (() => void) | null = null;
		let isRefreshingGanttLightboxPeriod = false;
		const refreshGanttLightboxPeriod = (taskId: any) => {
			const task = gantt.getTask(taskId);
			const periodSection = gantt.getLightboxSection('period');
			if (!task || !periodSection) {
				return;
			}
			isRefreshingGanttLightboxPeriod = true;
			try {
				periodSection.setValue(null, task);
			} finally {
				isRefreshingGanttLightboxPeriod = false;
			}
		};
		const validateGanttLightboxPeriod = (taskId: any) => {
			if (isRefreshingGanttLightboxPeriod || !gantt.getState().lightbox) {
				return true;
			}
			const formTask = (() => {
				try {
					return gantt.getLightboxValues();
				} catch {
					return null;
				}
			})();
			if (!formTask?.start_date || !formTask?.end_date) {
				return true;
			}
			formTask.start_date.setHours(0, 0, 0);
			formTask.end_date.setHours(0, 0, 0);
			if (!isGanttEndBeforeStart(formTask.start_date, formTask.end_date)) {
				return true;
			}
			showGanttEndBeforeStartToast();
			revertGanttTaskDates(gantt.getTask(taskId));
			refreshGanttLightboxPeriod(taskId);
			return false;
		};
		const attachGanttLightboxPeriodValidation = (taskId: any) => {
			const box = gantt.getLightbox();
			if (!box) {
				return;
			}
			const section = box.querySelector('.gantt_section_period');
			if (!section) {
				return;
			}
			const selects = section.querySelectorAll('select');
			if (lightboxPeriodValidateHandler) {
				selects.forEach(sel => sel.removeEventListener('change', lightboxPeriodValidateHandler!));
			}
			lightboxPeriodValidateHandler = () => {
				validateGanttLightboxPeriod(taskId);
			};
			selects.forEach(sel => sel.addEventListener('change', lightboxPeriodValidateHandler!));
		};
		const detachGanttLightboxPeriodValidation = () => {
			const box = gantt.getLightbox();
			if (!box || !lightboxPeriodValidateHandler) {
				lightboxPeriodValidateHandler = null;
				return;
			}
			const section = box.querySelector('.gantt_section_period');
			if (section) {
				section.querySelectorAll('select').forEach(sel => sel.removeEventListener('change', lightboxPeriodValidateHandler!));
			}
			lightboxPeriodValidateHandler = null;
		};
		const isLessThanOneDay = (date1: any, date2: any) => {
			const diff = Math.abs(date2.getTime() - date1.getTime());
			const diffDays = diff / (1000 * 3600 * 24);
			const nowDate = new Date();
			//结束时间小于今天，并且2天内
			if (date1 < nowDate && diffDays < 2) {
				return true;
			}
			else {
				return false;
			}
		}

		const getProjectTooltipFieldLabel = (itemFields: any) => {
			if (itemFields.fieldName === 'taskSummary') {
				return '简述';
			}
			if (itemFields.fieldName === 'taskNo') {
				return '编号';
			}
			return itemFields.displayLabel;
		};
		const getProjectTooltipFieldValue = (task: any, itemFields: any) => {
			const customProperties = task?.customProperties ?? {};
			if (itemFields.renderer === 'RefText') {
				return customProperties[`$${itemFields.fieldName}`] ?? '';
			}
			if (itemFields.renderer === 'HasOneText') {
				const refAlias = itemFields?.reference?.alias ?? '';
				const refObj = refAlias ? task[refAlias] : null;
				if (!refObj) {
					return '';
				}
				if (refAlias === 'prodLine') {
					return refObj[itemFields.reference.refFlds?.[1]] ?? '';
				}
				return refObj[`${refAlias}Name`] ?? '';
			}
			if (itemFields.renderer === 'ProgressBar') {
				if ((task[itemFields.fieldName] ?? -1) >= 0) {
					return `${Number(task[itemFields.fieldName]) * 100}%`;
				}
				return null;
			}
			if (itemFields.editor === 'Switcher') {
				return task[itemFields.fieldName] === true ? '是' : '否';
			}
			return task[itemFields.fieldName] ?? '';
		};

		const getGannt = async () => {
			gantt.clearAll();
			gantt.i18n.setLocale('cn'); // 国际化
			gantt.setSkin(skinType.value); //设置甘特图皮肤 提前设置
			gantt.plugins({
				//export_api: true,
				tooltip: true, //鼠标划过任务是否显示明细
				grouping: true,
				multiselect: false, //为任务激活多任务选择
				undo: true,
				//quick_info: true, // 快速信息框
				//auto_scheduling: true,//根据任务之间的关系自动安排任务
				//auto_scheduling: true //为任务激活多任务选择
			});

			//lightBox 自定义按钮
			// gantt.locale.labels['breakDown_button'] = $t('ganttLabel.BreakDown');
			// gantt.locale.labels['release_button'] = $t('ganttLabel.Release');
			// gantt.locale.labels['addWorkPackage_button'] = $t('ganttLabel.AddWorkPackage');

			gantt.config.sort = true;
			gantt.config.task_color = '#4269E0';

			gantt.config.tooltip_offset_x = 30;
			gantt.config.tooltip_offset_y = -260;

			gantt.ext.zoom.init(zoomConfig);
			gantt.ext.zoom.setLevel(durationUnit.select.value);

			gantt.config.order_branch = 'marker'; //垂直拖动到不同位置



			// gantt.config.scale_unit = durationUnit.select.value;

			// gantt.config.scale_unit = 'day'; // 设置时间单位为天
			// gantt.config.step = 1; // 设置每天有几个刻度，例如每小时一个刻度
			// gantt.config.grid_elastic_columns = true;
			// gantt.config.autofit = true;
			// gantt.config.multiselect = true; //是否多选
			// gantt.config.multiselect_one_level = true; //只选相同级别的
			//gantt.config.auto_scheduling = true; //自动调度模式
			//gantt.config.auto_scheduling_compatibility = true;

			/** 选中1列获得日期 */
			// let selected_column: any = null;
			// gantt.attachEvent('onScaleClick', function (e: any, date: any) {
			// 	//clearDailyPlanning(); //每次打开清空数据
			// 	selected_column = date;
			// 	const pos = gantt.getScrollState();
			// 	gantt.render();
			// 	gantt.scrollTo(pos.x, pos.y);
			// 	dailyPlanDate = selected_column.toFormat('yyyy-MM-dd');
			// 	//判断是否有日订单权限
			// 	if (props.scheduleroleaction?.authority?.authorizedActions && props.scheduleroleaction?.authority?.authorizedActions.length > 0) {
			// 		const res = props.scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'dailyPlanning');
			// 		// console.log('res', res);
			// 		if (res != -1) {
			// 			//编制日计划
			// 			ctx.emit('subPlanning', dailyPlanDate, props.ctx);
			// 		}
			// 	}
			// });
			// /**
			//  * 甘特图选中一列
			//  */
			// const is_selected_column = (column_date: any) => {
			// 	if (selected_column && column_date.valueOf() == selected_column.valueOf()) {
			// 		return true;
			// 	}
			// 	return false;
			// };
			// gantt.templates.scale_cell_class = function (date) {
			// 	if (is_selected_column(date)) return 'highlighted-column';
			// };
			// gantt.templates.timeline_cell_class = function (item, date) {
			// 	if (is_selected_column(date)) return 'highlighted-column';
			// };
			gantt.config.show_errors = false;
			gantt.config.autosize = false;
			//允许拖放
			gantt.config.drag_project = true;
			//自动延长时间刻度
			gantt.config.fit_tasks = true;
			// 仅仅渲染在屏幕可见的那部分时间轴。在处理时间轴非常长的时候，可以提升性能
			gantt.config.smart_scales = true;
			// 按需渲染, 仅仅渲染在屏幕可见的那部分任务和依赖线。这个在显示大量的任务时，性能比较高。
			gantt.config.smart_rendering = true;
			gantt.config.date_format = '%Y-%m-%d %H:%i:%S'; //设置数据中的时间格式，对应start_date格式\
			//撤销
			gantt.config.undo = true;
			//自定义翻译
			gantt.i18n.setLocale({
				labels: {
					section_color: $t('ganttLabel.SectionColor') + ':',
					section_taskSummary: $t('ganttLabel.TaskSummary') + ':',
					section_remark: $t('ganttLabel.Remark') + ':',
					section_startTime: $t('ganttLabel.StartTime') + ':',
					section_period: $t('ganttLabel.Period') + ':',
					section_constraintDate: $t('ganttLabel.ConstraintDate') + ':',
					section_constraintType: $t('ganttLabel.ConstraintType') + ':',
					message_ok: $t('dialog.ok'),
				},
			});
			//语言配置
			// gantt.i18n.setLocale({
			// 	date: {
			// 		month_full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			// 		month_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			// 		day_full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			// 		day_short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			// 	},
			// 	labels: {
			// 		new_task: 'New task',
			// 		icon_save: 'Save',
			// 		icon_cancel: 'Cancel',
			// 		icon_details: 'Details',
			// 		icon_edit: 'Edit',
			// 		icon_delete: 'Delete',
			// 		gantt_save_btn: 'New Label',
			// 		gantt_cancel_btn: 'New Label',
			// 		gantt_delete_btn: 'New Label',
			// 		confirm_closing: '', // Your changes will be lost, are you sure?
			// 		confirm_deleting: 'Task will be deleted permanently, are you sure?',
			// 		section_description: 'Description',
			// 		section_time: 'Time period',
			// 		section_type: 'Type',
			// 		section_color: '颜色:',
			// 		section_taskSummary: '备注',
			// 		section_startTime: '开始时间',
			// 		section_period: '开始结束时间',
			// 		section_constraintDate: '限制时间',
			// 		section_constraintType: '限制类型',
			// 		/* grid columns */
			// 		column_wbs: 'WBS',
			// 		column_text: 'Task name',
			// 		column_start_date: 'Start time',
			// 		column_duration: 'Duration',
			// 		column_add: '',

			// 		/* link confirmation */
			// 		link: 'Link',
			// 		confirm_link_deleting: 'will be deleted',
			// 		link_start: ' (start)',
			// 		link_end: ' (end)',

			// 		type_task: 'Task',
			// 		type_project: 'Project',
			// 		type_milestone: 'Milestone',

			// 		minutes: 'Minutes',
			// 		hours: 'Hours',
			// 		days: 'Days',
			// 		weeks: 'Week',
			// 		months: 'Months',
			// 		years: 'Years',

			// 		/* message popup */
			// 		message_ok: 'OK',
			// 		message_cancel: 'Cancel',

			// 		/* constraints */
			// 		section_constraint: 'Constraint',
			// 		constraint_type: 'Constraint type',
			// 		constraint_date: 'Constraint date',
			// 		asap: 'As Soon As Possible',
			// 		alap: 'As Late As Possible',
			// 		snet: 'Start No Earlier Than',
			// 		snlt: 'Start No Later Than',
			// 		fnet: 'Finish No Earlier Than',
			// 		fnlt: 'Finish No Later Than',
			// 		mso: 'Must Start On',
			// 		mfo: 'Must Finish On',
			// 		/* resource control */
			// 		resources_filter_placeholder: 'type to filter',
			// 		resources_filter_label: 'hide empty',
			// 	},
			// });

			//布局在 columns 定义后设置（见 gantt.init 前）

			// //linghtBox 弹出层 %H:%i
			// gantt.config.lightbox.sections = [
			// 	// // { name: 'time', height: 30, map_to: 'auto', type: 'time', time_format: ['%Y', '%m', '%d', '%H:%i'] },
			// 	{ name: 'period', type: 'time', map_to: 'auto', time_format: ['%Y', '%m', '%d'] },
			// 	//{ name:"constraint", type:"constraint",map_to: 'auto'  },
			// 	{
			// 		name: 'constraintType',
			// 		map_to: 'constraintType',
			// 		type: 'select',
			// 		options: constraintTypeListOptions.value,
			// 		//onchange: changeConstraintType,
			// 	},
			// 	{ name: 'constraintDate', type: 'time', map_to: 'constraint_date', time_format: ['%Y', '%m', '%d'], single_date: true },

			// 	//{ name: 'constraintDate', type: 'duration', map_to: 'constraint_date'},
			// 	//,readonly:constraintDateReady.value
			// 	//item.constraint_date =item.constraintDate;
			// 	//item.constraint_type = item.customProperties.$constraintType;

			// 	{
			// 		name: 'color',
			// 		height: 30,
			// 		map_to: 'taskColor',
			// 		type: 'select',
			// 		options: [
			// 			{ key: '0099ff', label: '蓝色' },
			// 			{ key: '00CC33', label: '绿色' },
			// 			{ key: 'FF9933', label: '橙色' },
			// 			{ key: 'FF0066', label: '红色' },
			// 		],
			// 	},
			// 	{ name: 'remark', height: 80, map_to: 'remark', type: 'textarea', focus: true },
			// ];

			gantt.config.fit_tasks = true;
			gantt.config.scale_height = getGanttGridColumnLayout(ganttBox.value?.clientWidth ?? 0).scaleHeight;
			gantt.config.row_height = GANTT_PROJECT_SCHEDULE_DEFAULT_ROW_HEIGHT;

			//gantt.config.duration_unit = durationUnit.select.value;
			// gantt.coAanfig.show_tasks_outside_timescale = true;

			// //设置显示的时间方式
			// gantt.config.duration_unit = durationUnit.select.value;
			// if (durationUnit.select.value == 'hour') {
			// 	gantt.config.scales = [
			// 		{ unit: 'day', step: 1, format: '%Y %M %d' }, //时间刻度的显示单位
			// 		{ unit: 'hour', step: 1, format: '%H:%i' }, //时间刻度的显示单位
			// 	];
			// }

			// else if (durationUnit.select.value == 'week') {
			// 	gantt.config.scales = [{ unit: 'year', step: 1, format: '%Y' }];
			// } else if (durationUnit.select.value == 'month') {
			// 	gantt.config.scales = [{ unit: 'month', step: 1, format: '%Y.%F' }];
			// } else if (durationUnit.select.value == 'day') {
			// 	gantt.config.scales = [
			// 		{ unit: 'year', step: 1, format: '%Y' },
			// 		{ unit: 'day', step: 1, format: '%M %d' }, //时间刻度的显示单位
			// 	];
			// }

			gantt.templates.leftside_text = function (start, end, task) {
				const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
				if (task.type == gantt.config.types.milestone) {
					return t('ganttLabel.milestones'); //+"  "+ task.projectName
				}
				return '';
			};

			//禁止拖动进度
			gantt.config.drag_progress = false;
			gantt.config.date_format = '%Y-%m-%d %H:%i:%S';

			const startDateEditor = { type: 'date', map_to: 'start_date' };
			const endDateEditor = { type: 'date', map_to: 'end_date' };
			const durationEditor = { type: 'number', map_to: 'duration', min: 1 };

			//左侧显示列名
			gantt.config.columns = [
				{
					name: 'refName',
					label: '类型',
					width: 150,
					resize: true,
					align: 'center',
					template: function (item) {
						return byType(gantt.serverList('taskType'), item.taskLevel);
					},
				},
				{
					name: 'projectName',
					label: '项目/阶段/工作包',
					resize: true,
					tree: true,
					align: 'left',
					min_width: 220,
					template: function (task) {


						const startDate = new Date(task.start_date);
						const endDate = new Date(task.end_date);
						startDate.setHours(0, 0, 0, 0);
						endDate.setHours(0, 0, 0, 0);
						// // 获取 UTC 年月日
						// const year = endDate.getUTCFullYear();
						// const month = endDate.getUTCMonth();
						// const day = endDate.getUTCDate();
						// // 创建新的 UTC 日期，时间为 00:00:00
						// const newDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
						const nowDate = new Date();
						const diff = isLessThanTwoDay(nowDate, endDate);
						const diff2 = isLessThanOneDay(endDate, startDate); //判断项目时间是否只有1天

						//console.log('diff', diff);

						if (task.refName != 'loadMore' && task.status != "FINISHED" && task.status != "CANCELED" && task.status != "TERMINATED") {
							if ((endDate.getTime() < nowDate.getTime() && !diff) || diff2) { // && !diff
								return "<div class='errorImportant'>" + formatProjectScheduleNameCell(task, ' (延期) ') + "</div>";
							}
							else if (diff) {
								return "<div class='waringImportant'>" + formatProjectScheduleNameCell(task, ' (警告) ') + "</div>";
							}
							else {
								return formatProjectScheduleNameCell(task);
							}
						}
						else {
							return formatProjectScheduleNameCell(task);

						}
						// if (task.priority == 1)
						// 	return "<div class='important'>" + task.text + " (" + task.users + ") </div>";
						//return task.end_date;
					}
				},


				//map_to: 'taskName'
				{ name: 'start_date', label: '开始', width: 300, resize: true, align: 'center', editor: startDateEditor },
				{ name: 'end_date', label: '结束', width: 300, resize: true, align: 'center', editor: endDateEditor },
				{
					name: 'duration',
					resize: true,
					label: '时长(天)',
					align: 'center',
					//editor: durationEditor,
					// template: obj => {
					// 	if(obj.duration==0){
					// 		return 1;
					// 	}
					// 	else{
					// 		return obj.duration;
					// 	}
					// },
				},
				{ name: 'ownerName', resize: true, label: '负责人', align: 'center', editor: selectPersonsEditor },
				{ name: 'statusType', resize: true, label: '状态', align: 'center' }, //, editor: statusTypeEditor
				// { name: 'constraintType',resize: true,  label: '约束类型', width: 200,
				// 	align: 'center',editor:constraintTypeEditor,
				// 	template: function (task) {
				// 		const ct=task.constraintType;
				// 		const label= constraintTypeListOptions.value.find((item:any)=>{
				// 			if(item.key == ct){
				// 				return item.text;
				// 			}
				// 		});
				// 		return label.text;
				// 	},
				// },
				// { name: 'ownerName', resize: true, label: '负责人', align: 'center' },

				{
					name: 'add_above',
					label: '',
					width: 44,
					template: function (task) {
						if (task?.refName === 'loadMore' || task?.taskLevel === 'loadMore') {
							return '';
						}
						const hasRe = ref(false); //是否有权限
						if (task.refName == 'Project') {
							// console.log("editProjectRoleaction.authority.allowEdit",editProjectRoleaction.authority.allowEdit);
							// console.log("scheduleroleaction.authority.allowEdit", scheduleroleaction.authority.allowEdit);
							if (editProjectRoleaction.authority.allowEdit == true && scheduleroleaction.authority.allowEdit == true) {
								hasRe.value = isHaveRoleaction(task);
							} else {
								//console.log('我不是项目负责人');
								hasRe.value = false;
							}
						} else {
							if (scheduleroleaction.authority.allowEdit == true) {
								//console.log('我是有编辑权限');
								hasRe.value = isHaveRoleaction(task);
							} else {
								hasRe.value = false;
							}
						}

						if (!hasRe.value) {
							return ``;
						} else {
							if (task.taskLevel == 'WORK_PACKAGE' || isProjectScheduleTaskLocked(task) || task.status == 'RELEASED' || task.status == 'TERMINATED' || scheduleroleaction?.authority?.allowEdit != true) {
								return ``;
							} else {
								return `<button type="button" class="gantt-add-above-btn" aria-label="添加">+</button>`;
							}
						}
					},
				},
			];
			const columnLayout = applyGanttResponsiveLayout(gantt, ganttBox.value);

			// {
			// 	name: 'constraintType',
			// 	map_to: 'constraintType',
			// 	type: 'select',
			// 	options: constraintTypeListOptions.value,
			// 	//onchange: changeConstraintType,
			// },

			//弹窗标题 日期范围
			gantt.templates.task_time = function (start: any, end: any, task: any) {
				return start.toFormat('yyyy-MM-dd HH:mm:ss') + ' - ' + end.toFormat('yyyy-MM-dd HH:mm:ss');
			};
			//弹窗标题 计划名称
			gantt.templates.task_text = function (start: any, end: any, task: any) {
				return task.text;
			};
			//tooltip
			gantt.templates.tooltip_text = function (start, end, task) {
				if (!task) {
					return '';
				}
				let tooltipText = '';
				const groups = metauiGbl2?.metaui?.groups;
				if (groups && groups.length > 0) {
					groups.forEach((item: any) => {
						if (item.fields && item.fields.length > 0) {
							item.fields.forEach((itemFields: any) => {
								if (
									itemFields.fieldName == 'expectedStart' ||
									itemFields.fieldName == 'projectNo' ||
									itemFields.fieldName == 'contractID' ||
									itemFields.fieldName == 'expectedFinish' ||
									itemFields.fieldName == 'expectedDuration' ||
									itemFields.fieldName == 'importance' ||
									itemFields.fieldName == 'customerID' ||
									itemFields.fieldName == 'addressID' ||
									itemFields.fieldName == 'lastModified' ||
									itemFields.fieldName == 'lastModifierID'
								) {
									itemFields.listed = false;
								}

								if (itemFields.listed == true) {
									const fieldValue = getProjectTooltipFieldValue(task, itemFields);
									if (fieldValue === null) {
										return;
									}
									tooltipText = appendGanttTooltipFieldHtml(
										tooltipText,
										getProjectTooltipFieldLabel(itemFields),
										fieldValue
									);
								}
							});
						}
					});
				}

				return wrapGanttTooltipHtml(tooltipText);
			};
			//显示进度
			gantt.templates.progress_text = function (start, end, task) {
				return "<span style='text-align:left; opacity:1 !important'>" + Math.round((task.progress) * 100) + '% </span>';
			};

			//是否是只读模式
			if (scheduleroleaction?.authority?.allowEdit == false) {
				gantt.config.drag_move = false;
				gantt.config.drag_links = false;
				gantt.config.drag_progress = false;
				gantt.config.drag_resize = false;

				//gantt.config.lightbox.enabled = false;
			} else {
				gantt.config.drag_move = true;
				gantt.config.drag_links = true;
				gantt.config.drag_progress = false;
				gantt.config.drag_resize = true;

				//gantt.config.lightbox.enabled = false;
			}
			// 标准版 dhtmlx-gantt 无内置 Resizer，手动补充分隔线与列宽拖拽
			gantt.config.grid_elastic_columns = true;
			const gridPanelOptions = {
				withOwner: true,
				withAddAbove: true,
				columns: gantt.config.columns,
			};
			const gridPanelWidth = getDefaultGanttGridPanelWidth(
				ganttBox.value?.clientWidth ?? 0,
				columnLayout,
				gridPanelOptions
			);
			gantt.config.layout = buildGanttScrollableLayout(
				gridPanelWidth,
				getGanttGridPanelMaxWidth(ganttBox.value?.clientWidth ?? 0, gantt, gridPanelOptions),
				getGanttGridPanelMinWidth(ganttBox.value?.clientWidth ?? 0, gantt, {
					...gridPanelOptions,
					container: ganttBox.value,
				})
			);

			gantt.init(ganttBox.value); //设置甘特图显示的div
			syncGanttDefaultGridPanelWidth(gantt, ganttBox.value);
			ganttResizeController?.destroy();
			ganttResizeController = setupGanttViewportControls(gantt, ganttBox.value);

			//加载的时候加样式
			gantt.attachEvent('onParse', function () {
				const styleId = 'dynamicGanttStyles';
				let element = document.getElementById(styleId);
				if (!element) {
					element = document.createElement('style');
					element.id = styleId;
					document.querySelector('head').appendChild(element);
				}
				const html: string[] = [];
				const resources = gantt.serverList('taskType');

				resources.forEach(function (r) {
					html.push('.gantt_task_line.gantt_resource_' + r.type + '{' + '--dhx-gantt-task-background:' + r.backgroundColor + '; ' + '--dhx-gantt-task-color:' + r.textColor + ';' + '}');
					html.push('.gantt_row.gantt_resource_' + r.type + ' .gantt_cell:nth-child(1) .gantt_tree_content{' + 'background-color:' + r.backgroundColor + '; ' + 'color:' + r.textColor + ';' + '}');
				});
				element.innerHTML = html.join('');
			});

			gantt.parse(newTasks.datas); //设置甘特图的数据
			syncScheduleGanttTaskDates(gantt);
			healProjectScheduleGanttLockState(gantt);
			syncProjectGanttRowHeights();
			syncGanttGridWidthAfterData();



		};

		//父DOM 加class 标识
		gantt.templates.grid_row_class =
			gantt.templates.task_row_class =
			gantt.templates.task_class =
			function (start, end, task) {
				const css = [];
				if (task.$virtual || task.type == gantt.config.types.project) css.push('summary-bar');

				if (task.id) {
					css.push('gantt_resource_task gantt_resource_' + task.taskLevel);
				}

				if (isProjectScheduleTaskLocked(task)) {
					css.push(PROJECT_SCHEDULE_TASK_LOCKED_CLASS);
				}
				if (task.refName === 'loadMore' || task.taskLevel === 'loadMore') {
					css.push('schedule-project-loadmore-row');
					css.push('schedule-project-single-line-row');
				} else if (isGanttProjectSingleLineRow(task)) {
					css.push('schedule-project-single-line-row');
				} else if (isProjectScheduleMultiLineRow(task)) {
					css.push('schedule-project-multiline-row');
				}

				return css.join(' ');
			};

		//默认添加按钮
		gantt.attachEvent('onGanttReady', function () {
			gantt.config.buttons_right = ['gantt_cancel_btn', 'gantt_save_btn'];
			gantt.config.buttons_left = [];
			healProjectScheduleGanttLockState(gantt);
			//gantt.config.buttons_left = ["gantt_delete_btn"];
		});

		// 右侧时间轴（任务条、刻度区域）悬停不显示 tooltip；左侧 grid 仍可用原生 title
		(gantt as any).attachEvent('onBeforeTooltip', function (e: MouseEvent) {
			const target = e?.target as HTMLElement | null;
			if (target?.closest?.('.gantt_task')) {
				return false;
			}
			return true;
		});

		// const handleRejected = () => {
		// 	//console.log('Rejected in parent');
		// };
		const changeTab = ref(0); //Tab切换
		const addName = ref(''); //添加的名称
		const canAdd = ref(false); //防止连着点
		gantt.attachEvent('onTaskClick', function (id: any, e: any) {
			//如果有编辑权限才能做的事
			if (scheduleroleaction?.authority?.allowEdit == true) {
				const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
				const addBtn = (e.target as HTMLElement)?.closest?.('.gantt-add-above-btn');
				if (addBtn) {
					if (canAdd.value == true) {
						return false;
					}
					canAdd.value = true;
					const task = gantt.getTask(id);
					transferTask.task = task;
					addWorkPackageBox(transferTask.task, props.ctx);

					// 创建参数
					const params = {} as any;
					// showAddBox.value = true;
					if (task?.refName === 'Project') {
						params.refName = 'Project';
						params.refID = task.projectID;
					} else {
						params.refName = 'ProjectTask';
						params.refID = task.taskID;
					}

					if (!task.taskLevel || task.taskLevel == 'Project') {
						addName.value = 'ganttLabel.addPhase';
					}
					//阶段创建任务
					if (task.taskLevel == TaskLevel.PHASE) {
						addName.value = 'ganttLabel.addTask';
					}
					//任务创建工作包
					if (task.taskLevel == TaskLevel.TASK) {
						addName.value = 'ganttLabel.addWorkPacakge';
					}

					setTimeout(() => {
						h(
							Suspense,
							{},
							{
								defalut: props.ctx.uiBuilder.confirmDialog(
									h('div', { class: 'tabsBox' }, [
										ui.factory.tabs(
											{
												onChangeTab: async (val: number) => {
													changeTab.value = val;
												},
												dt: {},
											},
											{
												tabs: addName.value == 'ganttLabel.addWorkPacakge' ? [h('div', $t(addName.value)), h('div', $t('ganttLabel.importPackageDeliverables'))] : [h('div', $t(addName.value))],
												tabPanels: [
													h(
														Suspense,
														{},
														{
															default: h(
																'div',
																{
																	class: 'p-tabview-panels createPackage',
																},
																[
																	h(ProjectTaskEditor, {
																		id: '_',
																		view: UI_CREATE,
																		gantt: transferTask.task,
																		params,
																		onChange: (logic: any) => {
																			logicData = logic;
																		},
																	}),
																]
															),
														}
													),

													h(
														Suspense,
														{},
														{
															default: h(
																'div',
																{
																	class: 'p-tabview-panels selectBox h-full ',
																},
																[
																	(props.ctx.uiBuilder as any).buildSearchForRelativeContent(
																		tablecolumns2.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
																		{
																			dataKey: tableDataKEY.value,
																			virtualIf: false,
																			selectionMode: 'multiple',
																			selection: selectionRows.value,
																			onSearch: async (params: any) => {
																				const { searchParams, reload, pager } = params;
																				await getPdItem(props.ctx, task, searchParams.searchWord, 'MAKE');
																				return { list: tableData.value, pager: searchParam.pager };
																			},
																			onPage: ({ pageNo, pageSize }: any) => {
																				searchParam.pager.pageNo = pageNo;
																				searchParam.pager.pageSize = pageSize;
																			},
																			onSelect: (selection: any, row: any) => {
																				selectionRows.value = selection;
																			},
																			onSelectAll: (selection: any) => {
																				selectionRows.value = selection;
																			},
																		}
																	),
																]
															),
														}
													),

													// //弹窗显示数据
													// if (tableData.value && tableData.value.length > 0) {
													//appContext.uiBuilder.confirmDialog(

													// 	appContext,
													// 	{
													// 		title: '请选择项目交付物',
													// 		width: '90vw',
													// 		accept: async () => {
													// 			if (selectionRows.value.length > 0) {
													// 				//提交模型
													// 				const payLoad = {
													// 					payload: {
													// 						taskID: taskItem.taskID,
													// 						items: <any>[],
													// 					},
													// 				};
													// 				const rItemKeys = selectionRows.value.map((item: any) => {
													// 					const itemKeys = <any>{
													// 						projectID: item.projectID,
													// 						itemID: item.itemID,
													// 						ownerID: null,
													// 						ownerDeptID: null,
													// 					};
													// 					return itemKeys;
													// 				});
													// 				payLoad.payload.items = rItemKeys;
													// 				try {
													// 					//调用接口提交交付物，生成工作包
													// 					const resPackages = await apiClient.doAction(
													// 						{
													// 							path: taskItem.taskID,
													// 							action: 'addWorkPackage',
													// 							repository: 'ProjectSchedule',
													// 							service: 'mes',
													// 						},
													// 						payLoad
													// 					);
													// 					if (resPackages == true) {
													// 						appContext.uiBuilder.toast(appContext, {
													// 							severity: 'success',
													// 							summary: t('success.operationSuccessful'),
													// 							life: 5000,
													// 						});
													// 						//调用接口更新数据
													// 						await getSubSchedule(appContext, taskItem);
													// 						//弹窗确认是否要跳转查看
													// 						// appContext.uiBuilder.confirmMessage(appContext, {
													// 						// 	header: t('action.confirm'),
													// 						// 	message: t('dialog.needCheck'),
													// 						// 	// type: action.param.hint,
													// 						// 	rejectLabel: t('action.cancel'),
													// 						// 	acceptLabel: t('action.confirm'),
													// 						// 	// 部分到货
													// 						// 	accept: async () => {
													// 						// 		window.open(`/MES/ProjectWorkPackages?taskLevel=WORK_PACKAGE&taskPhase=${taskItem.taskPhase}&projectID=${taskItem.projectID}`, '_blank');

													// 						// 		return true;
													// 						// 	},
													// 						// 	// 全部到货
													// 						// 	reject: async () => {
													// 						// 		return true;
													// 						// 	},
													// 						// });
													// 						return true;
													// 					}
													// 				} catch (error: any) {
													// 					appContext.uiBuilder.toast(appContext, {
													// 						severity: 'error',
													// 						title: $t('dialog.title.error'),
													// 						detail: error.message ?? `${t('invalid.error')}`,
													// 						summary: error.detail ?? '',
													// 						group: 'br',
													// 						life: 5000,
													// 					});
													// 					showLoading.value = false;
													// 					return false;
													// 				}

													// 				return;
													// 			} else {
													// 				appContext.uiBuilder.toast(appContext, {
													// 					severity: 'error',
													// 					summary: t('invalid.requiredSelectAny'),
													// 					group: 'br',
													// 					life: 5000,
													// 				});
													// 				return false;
													// 			}
													// 		},
													// 	}
													// )
													// } else {
													// 	toast.add({
													// 		severity: 'info',
													// 		detail: `${t('invalid.noDeliverables')}`,
													// 		life: 5000,
													// 	});
													// }
												],
											}
										),
									]),

									props.ctx,
									{
										title: ' ',
										width: '80%',
										// showFooter: false,
										// visible: display.value,
										// 确认
										accept: async () => {
											if (changeTab.value == 0) {
												// 调用save方法（返回true）
												const isSave = await logicData.getSave();
												if (isSave) {
													// 调用gantt刷新方法
													await getSubSchedule(props.ctx, transferTask?.task);
													return true;
												} else {
													return false;
												}
											} else {
												const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
												const apiClient = $api as ApiClient;

												if (selectionRows.value.length > 0) {
													//提交模型
													const payLoad = {
														payload: {
															taskID: transferTask.task.taskID,
															items: <any>[],
														},
													};
													const rItemKeys = selectionRows.value.map((item: any) => {
														const itemKeys = <any>{
															projectID: item.projectID,
															itemID: item.itemID,
															ownerID: null,
															ownerDeptID: null,
														};
														return itemKeys;
													});
													payLoad.payload.items = rItemKeys;
													try {
														//调用接口提交交付物，生成工作包
														const resPackages = await apiClient.doAction(
															{
																path: transferTask.task.taskID,
																action: 'addWorkPackage',
																repository: 'ProjectSchedule',
																service: 'mes',
															},
															payLoad
														);
														if (resPackages == true) {
															props.ctx.uiBuilder.toast(props.ctx, {
																severity: 'success',
																position: 'bottom-right',

																summary: t('success.operationSuccessful'),
																life: 5000,
															});
															//调用接口更新数据
															await getSubSchedule(props.ctx, transferTask.task);
															//弹窗确认是否要跳转查看
															// appContext.uiBuilder.confirmMessage(appContext, {
															// 	header: t('action.confirm'),
															// 	message: t('dialog.needCheck'),
															// 	// type: action.param.hint,
															// 	rejectLabel: t('action.cancel'),
															// 	acceptLabel: t('action.confirm'),
															// 	// 部分到货
															// 	accept: async () => {
															// 		window.open(`/MES/ProjectWorkPackages?taskLevel=WORK_PACKAGE&taskPhase=${taskItem.taskPhase}&projectID=${taskItem.projectID}`, '_blank');

															// 		return true;
															// 	},
															// 	// 全部到货
															// 	reject: async () => {
															// 		return true;
															// 	},
															// });
															return true;
														}
													} catch (error: any) {
														props.ctx.uiBuilder.toast(props.ctx, {
															severity: 'error',
															title: $t('dialog.title.error'),
															detail: error.message ?? `${t('invalid.error')}`,
															summary: error.detail ?? '',
															group: 'br',
															life: 5000,
														});
														showLoading.value = false;
														return false;
													}

													return;
												} else {
													props.ctx.uiBuilder.toast(props.ctx, {
														severity: 'error',
														summary: t('invalid.requiredSelectAny'),
														group: 'br',
														life: 5000,
													});
													return false;
												}
											}
										},
										// 取消
										reject: () => {
											// 关闭弹窗
											return true;
										},
									}
								),
							}
						);

						canAdd.value = false;
					}, 1000);

					return false;
				} else {
					showAddBox.value = false;
					canAdd.value = false;
					return true;
				}
			}
			//否则 就只能看
			else {
				showAddBox.value = false;
				return true;
			}
		});

		//lightBox之前事件
		// gantt.attachEvent('onBeforeLightbox', function (id: any) {
		// 	oriData = ''; //记录拖动之前的数据
		// 	const task = gantt.getTask(id);
		// 	//记录拖动之前的数据
		// 	const orgList = [];
		// 	orgList.push(task);
		// 	gantt.eachTask(function (child) {
		// 		orgList.push(child);
		// 	}, id);
		// 	oriData = JSON.stringify(orgList);

		// 	const leftButtons: string[] = [];
		// 	const rightButtons = ['gantt_save_btn'];
		// 	// console.log('task.acitons', task.actions);
		// 	if (task.actions && task.actions.length > 0) {
		// 		task.actions.forEach((item: any) => {
		// 			//权限判断
		// 			if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
		// 				const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'release');
		// 				if (res != -1) {
		// 					if (item.name == 'release') {
		// 						gantt.locale.labels['release_button'] = item.label;
		// 						leftButtons.push('release_button');
		// 						leftButtons.reverse();
		// 						//gantt.config.buttons_right = rightButtons;
		// 						gantt.config.buttons_left = leftButtons;
		// 					}
		// 				}

		// 				const res2 = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'addWorkPackage');
		// 				if (res2 != -1) {
		// 					if (item.name == 'addWorkPackage') {
		// 						gantt.locale.labels['addWorkPackage_button'] = item.label;
		// 						leftButtons.push('addWorkPackage_button');
		// 						leftButtons.reverse();
		// 						//gantt.config.buttons_right = rightButtons;
		// 						gantt.config.buttons_left = leftButtons;
		// 					}
		// 				}
		// 			}
		// 		});
		// 		gantt.config.buttons_left = leftButtons;
		// 		rightButtons.push('gantt_cancel_btn');
		// 		gantt.config.buttons_right = rightButtons;
		// 	} else {
		// 		gantt.config.buttons_left = leftButtons;
		// 		gantt.config.buttons_right = ['gantt_cancel_btn', 'gantt_save_btn'];
		// 	}

		// 	// //判断lightbox是否可以编辑
		// 	// if (scheduleroleaction?.authority?.allowEdit == false) {
		// 	// 	return false;
		// 	// } else {
		// 	// 	//获取Task的修改之前的时间
		// 	// 	moveTaskList.value = [];
		// 	// 	task.orgStart = task.start_date;
		// 	// 	task.orgEnd = task.end_date;
		// 	// 	gantt.updateTask(task.id);
		// 	// 	return true;
		// 	// }

		// 	const hasRe = ref(false); //是否有权限
		// 	if (task.refName == 'Project') {
		// 		// console.log("editProjectRoleaction.authority.allowEdit",editProjectRoleaction.authority.allowEdit);
		// 		// console.log("scheduleroleaction.authority.allowEdit", scheduleroleaction.authority.allowEdit);
		// 		if (editProjectRoleaction.authority.allowEdit == true && scheduleroleaction.authority.allowEdit == true) {
		// 			hasRe.value = isHaveRoleaction(task);
		// 		} else {
		// 			//console.log('我不是项目负责人');
		// 			hasRe.value = false;
		// 		}
		// 	} else {
		// 		if (scheduleroleaction.authority.allowEdit == true) {
		// 			//console.log('我是有编辑权限');
		// 			hasRe.value = isHaveRoleaction(task);
		// 		} else {
		// 			hasRe.value = false;
		// 		}
		// 	}

		// 	//linghtBox 弹出层 %H:%i
		// 	gantt.config.lightbox.sections = [
		// 		// // { name: 'time', height: 30, map_to: 'auto', type: 'time', time_format: ['%Y', '%m', '%d', '%H:%i'] },
		// 		{ name: 'period', type: 'time', map_to: 'auto', time_format: ['%Y', '%m', '%d'], readonly: !hasRe.value },
		// 		{
		// 			name: 'constraintType',
		// 			map_to: 'constraintType',
		// 			type: 'select',
		// 			options: constraintTypeListOptions.value,
		// 			//onchange: changeConstraintType,
		// 		},
		// 		{ name: 'constraintDate', type: 'time', map_to: 'constraint_date', time_format: ['%Y', '%m', '%d'], single_date: true, readonly: !hasRe.value },
		// 		//{ name: 'constraintDate', type: 'duration', map_to: 'constraint_date'},
		// 		//,readonly:constraintDateReady.value
		// 		//item.constraint_date =item.constraintDate;
		// 		//item.constraint_type = item.customProperties.$constraintType;
		// 		{
		// 			name: 'color',
		// 			height: 30,
		// 			map_to: 'taskColor',
		// 			type: 'select',
		// 			options: [
		// 				{ key: '0099ff', label: '蓝色' },
		// 				{ key: '4682b4', label: '钢蓝色' },
		// 				{ key: '6495ed', label: '矢车菊蓝' },
		// 				{ key: '483d8b', label: '深板岩蓝色' },
		// 				{ key: '6a5acd', label: '板岩蓝' },
		// 				{ key: '191970', label: '午夜蓝' },
		// 				{ key: '008080', label: '青色' },
		// 				{ key: '00CC33', label: '绿色' },
		// 				{ key: '228b22', label: '森林绿' },
		// 				{ key: '2e8b57', label: '海绿色' },
		// 				{ key: '00ced1', label: '深绿松石色' },
		// 				{ key: '6b8e23', label: '橄榄褐色' },
		// 				{ key: '808000', label: '心形金色' },
		// 				{ key: 'FF9933', label: '橙色' },
		// 				{ key: 'cd5c5c', label: '栗色' },
		// 				{ key: 'b22222', label: '耐火砖' },
		// 				{ key: 'f08080', label: '浅珊瑚色' },
		// 				{ key: 'ff1493', label: '荧光粉色' },
		// 				{ key: 'FF0066', label: '红色' },
		// 				{ key: 'dc143c', label: '赤红' },
		// 				{ key: 'a52a2a', label: '红棕色' },
		// 				{ key: '8a2be2', label: '紫色' },
		// 				{ key: '7b68ee', label: '岩蓝色' },
		// 				{ key: '000080', label: '海军蓝' },
		// 				{ key: 'c71585', label: '红紫色' },
		// 				{ key: 'ba55d3', label: '兰花' },
		// 				{ key: '708090', label: '板岩灰色' },
		// 				{ key: 'FF0066', label: '黑色' },

		// 			],
		// 		},
		// 		{ name: 'remark', height: 80, map_to: 'remark', type: 'textarea', focus: true },
		// 	];

		// 	//没有权限不能修改限制时间 和 颜色
		// 	if (!hasRe.value) {
		// 		gantt.config.lightbox.sections = gantt.config.lightbox.sections.filter(
		// 			section => section.name !== 'constraintType' && section.name !== 'color' && section.name !== 'color' && section.name !== 'remark'
		// 		);
		// 		gantt.config.buttons_left = [];
		// 		gantt.config.buttons_right = ['gantt_cancel_btn'];
		// 	}

		// 	// //判断lightbox是否可以编辑
		// 	if (scheduleroleaction?.authority?.allowEdit == false) {
		// 		return false;
		// 	} else {
		// 		//获取Task的修改之前的时间
		// 		moveTaskList.value = [];
		// 		task.orgStart = task.start_date;
		// 		task.orgEnd = task.end_date;
		// 		gantt.updateTask(task.id);
		// 		return true;
		// 	}

		// 	//}
		// });

		//lightBox之前事件
		gantt.attachEvent('onBeforeLightbox', function (id: any) {
			moveTaskList.value = [];
			oriData = '';
			const task = gantt.getTask(id);
			if (task.refName == 'Project') {
				return false;
			}
			const canEdit = canProjectScheduleTaskEdit(task);
			projectScheduleLightboxCanEdit = canEdit;
			oriData = snapshotProjectScheduleOriData(gantt, id);

			const leftButtons: string[] = [];
			if (canEdit && task.actions && task.actions.length > 0) {
				task.actions.forEach((item: any) => {
					if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
						const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'release');
						if (res != -1) {
							if (item.name == 'release') {
								gantt.locale.labels['release_button'] = item.label;
								leftButtons.push('release_button');
								leftButtons.reverse();
							}
						}

						const res2 = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'addWorkPackage');
						if (res2 != -1) {
							if (item.name == 'addWorkPackage') {
								gantt.locale.labels['addWorkPackage_button'] = item.label;
								leftButtons.push('addWorkPackage_button');
								leftButtons.reverse();
							}
						}
					}
				});
			}
			gantt.config.buttons_left = leftButtons;
			gantt.config.buttons_right = canEdit
				? ['gantt_cancel_btn', 'gantt_save_btn']
				: ['gantt_cancel_btn'];

			const lightboxReadonly = !canEdit;
			updateLightboxSections([
				{ ...ganttPeriodSectionConfig(lightboxReadonly) },
				{
					name: 'constraintType',
					map_to: 'constraintType',
					type: 'select',
					options: constraintTypeListOptions.value,
					readonly: lightboxReadonly,
				},
				{
					name: 'constraintDate',
					type: 'time',
					map_to: 'constraint_date',
					time_format: ['%Y', '%m', '%d'],
					single_date: true,
					readonly: lightboxReadonly,
				},
				{
					name: 'color',
					height: 30,
					map_to: 'taskColor',
					type: 'select',
					readonly: lightboxReadonly,
					options: [
						{ key: '0099ff', label: '蓝色' },
						{ key: '4682b4', label: '钢蓝色' },
						{ key: '6495ed', label: '矢车菊蓝' },
						{ key: '483d8b', label: '深板岩蓝色' },
						{ key: '6a5acd', label: '板岩蓝' },
						{ key: '191970', label: '午夜蓝' },
						{ key: '008080', label: '青色' },
						{ key: '00CC33', label: '绿色' },
						{ key: '228b22', label: '森林绿' },
						{ key: '2e8b57', label: '海绿色' },
						{ key: '00ced1', label: '深绿松石色' },
						{ key: '6b8e23', label: '橄榄褐色' },
						{ key: '808000', label: '心形金色' },
						{ key: 'FF9933', label: '橙色' },
						{ key: 'cd5c5c', label: '栗色' },
						{ key: 'b22222', label: '耐火砖' },
						{ key: 'f08080', label: '浅珊瑚色' },
						{ key: 'ff1493', label: '荧光粉色' },
						{ key: 'FF0066', label: '红色' },
						{ key: 'dc143c', label: '赤红' },
						{ key: 'a52a2a', label: '红棕色' },
						{ key: '8a2be2', label: '紫色' },
						{ key: '7b68ee', label: '岩蓝色' },
						{ key: '000080', label: '海军蓝' },
						{ key: 'c71585', label: '红紫色' },
						{ key: 'ba55d3', label: '兰花' },
						{ key: '708090', label: '板岩灰色' },
						{ key: '000000', label: '黑色' },
					],
				},
				{
					name: 'remark',
					height: 80,
					map_to: 'remark',
					type: 'textarea',
					focus: canEdit,
					readonly: lightboxReadonly,
				},
			]);

			if (scheduleroleaction?.authority?.allowEdit == false) {
				return false;
			}
			moveTaskList.value = [];
			task.orgStart = task.start_date;
			task.orgEnd = task.end_date;
			task.orgDuration = task.duration;
			gantt.updateTask(task.id);
			return true;
		});

		gantt.attachEvent('onLightbox', function (id: any) {
			nextTick(() => {
				setupGanttLightboxCloseHandlers();
				attachGanttLightboxPeriodValidation(id);
				if (!projectScheduleLightboxCanEdit) {
					lockProjectScheduleLightboxForm();
				}
			});
		});
		gantt.attachEvent('onAfterLightbox', function () {
			detachGanttLightboxPeriodValidation();
		});

		//设置负责人
		const setResponsiblePerson = () => {
			setResponsible(props.ctx, multiSelectList.data);
		};

		//下达
		const cRelease = (id: any, item: any, type: string) => {
			changeRelease(item, props.ctx);
		};

		//添加工作包
		const cAddWorkPackage = (id: any, item: any, type: string) => {
			addWorkPackage(item, props.ctx);
		};

		//导入交付物
		const cImportDeliverables = (id: any, item: any, type: string) => {
			imporitDeliverables(item, props.ctx);
		};

		//撤销
		const undoAction = () => {
			gantt.undo();
			gantt.refreshData();
		};

		const undoTaskDrag = () => {
			if (oriData) {
				const orgList = JSON.parse(oriData);
				goUpdateTask(orgList);
				healProjectScheduleGanttLockState(gantt);
			}
		};

		//判断添加link之前
		gantt.attachEvent('onBeforeLinkAdd', function (id: any, item: any) {
			const fromTask = gantt.getTask(item.source);
			const toTask = gantt.getTask(item.target);
			const links = gantt.getLinks();
			//判断刷新,不需要判断是否存在
			if (canReflashLink.value == false) {
				//判断关系是否存在
				const res = links.findIndex((item2: any) => {
					return item2.source == item.source && item2.target == item.target;
				});
				if (res >= 0) {
					toast.add({
						severity: 'error',
						summary: $t('invalid.differentDelationship'),
						//关联关系不能重复differentDelationship
						group: 'br',
						life: 5000,
					});
					return false;
				}
			}
			canReflashLink.value = true;
			//加载 或者  项目不能连接
			if (fromTask?.refName == 'loadMore' || toTask?.refName == 'loadMore' || fromTask?.refName == 'Project' || toTask?.refName == 'Project') {
				return false;
			}
			if (isProjectScheduleTaskLocked(fromTask) || isProjectScheduleTaskLocked(toTask)) {
				return false;
			} else {
				//判断 projectID 是否相同  //parent 是否相同
				if (fromTask?.projectID != toTask?.projectID || fromTask?.parent != toTask?.parent) {
					toast.add({
						severity: 'error',
						summary: $t('invalid.differentProject'),
						group: 'br',
						life: 5000,
					});
					return false;
				} else {
					return true;
				}
			}
		});

		//添加链接后触发
		gantt.attachEvent('onAfterLinkAdd', function (id: any, item: any) {
			//判断是否是懒加载加载的link
			if (!item.getLoad) {
				const fromTask = gantt.getTask(item.source);
				item.projectID = fromTask.projectID;
				cLink(id, item, 'add');
			}
		});

		//更新链接后触发
		gantt.attachEvent('onAfterLinkUpdate', function (id: any, item: any) {
			//判断是否是懒加载加载的link
			if (!item.getLoad) {
				cLink(id, item, 'update');
			}
		});

		gantt.attachEvent('onBeforeLinkDelete', function (id: any, link: any) {
			if (scheduleroleaction?.authority?.allowEdit == false) {
				const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
				toast.add({
					severity: 'warn',
					summary: `${t('invalid.error')}`, //标题
					detail: `${t('invalid.noAuthority')}`, //内容
					group: 'br',
					life: 5000,
				});
				return false;
			}
			const fromTask = gantt.getTask(link.source);
			const toTask = gantt.getTask(link.target);
			if (isProjectScheduleTaskLocked(fromTask) || isProjectScheduleTaskLocked(toTask)) {
				return false;
			}
			return true;
		});
		//删除链接后触发
		gantt.attachEvent('onAfterLinkDelete', function (id: any, item: any) {
			if (isNeedDeleteLink.value == true) {
				isNeedDeleteLink.value = false;
				return;
			} else {
				cLink(id, item, 'delete');
			}
		});

		//展开 点击事件
		gantt.attachEvent('onTaskOpened', function (id) {
			const task = gantt.getTask(id);

			if (task.isLoadingChildren == true && task.isRead == false) {
				task.isRead = true;
				getSubSchedule(props.ctx, task, 'isOpen');
			}
		});

		//灯箱保存按钮
		gantt.attachEvent('onLightboxSave', function (id: any, task: any, is_new: any) {
			if (!is_new && !canProjectScheduleTaskEdit(task)) {
				return false;
			}
			if (!is_new) {
				task.start_date.setHours(0, 0, 0);
				task.end_date.setHours(0, 0, 0);
				if (!validateGanttLightboxPeriod(id)) {
					return false;
				}

				const originalTaskColor = resolveGanttTaskOriginalColor(
					oriData,
					id,
					gantt.isTaskExists(id) ? gantt.getTask(id) : null,
				);
				preserveGanttTaskColorIfLightboxEmpty(task, originalTaskColor);

				//afterTaskUpdate(id, task);
				const col = id.columnName;
				const diff = task.start_date - task.orgStart;

				//判断自己是否有父类，如果超过父类，结束时间等于父类
				const parent = task.parent ? gantt.getTask(task.parent) : null;

				if (parent) {
					if (task.end_date >= parent.end_date) {
						task.end_date = parent.end_date;
						task.duration = gantt.calculateDuration(task.start_date, task.end_date);
						gantt.refreshTask(task.id, true);
					}
					if (task.start_date < parent.start_date) {
						task.start_date = parent.start_date;
						task.duration = task.orgDuration;
						task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
						gantt.refreshTask(task.id, true);
					}
				}

				//判断end_date是否小于子项
				gantt.eachTask(function (child) {
					if (isProjectScheduleTaskLocked(child)) {
						return;
					}
					if (task.end_date <= child.end_date) {
						task.end_date = child.end_date;
						task.duration = gantt.calculateDuration(task.start_date, task.end_date);
						gantt.refreshTask(task.id, true);
					}
				}, id);

				task.duration = gantt.calculateDuration(task.start_date, task.end_date);
				gantt.refreshTask(task.id, true);

				task.entityState = 1;
				// task.start_date.setHours(0, 0, 0);
				// task.end_date.setHours(0, 0, 0);

				if (task.constraintDate) {
					task.constraintDate = new Date(task.constraintDate);
					task.constraintDate = task.constraintDate.toFormat('yyyy-MM-dd HH:mm:ss');
				}

				// gantt.eachTask(function (child) {
				// 	if (child.start_date < task.start_date) {
				// 		task.start_date = child.start_date;
				// 	}
				// 	if (child.end_date > task.end_date) {
				// 		task.end_date = child.end_date;
				// 	}
				// 	child.color = '#' + task.taskColor;
				// 	child.taskColor = task.taskColor;
				// 	child.entityState = 1;
				// 	moveTaskList.value.push(child);
				// 	gantt.refreshTask(child.id, true);

				// }, id);

				persistScheduleGanttTaskExpectedDates(task, gantt);
				moveTaskList.value.push(task);
				// gantt.eachTask(function (child) {
				// 	child.start_date = new Date(+child.start_date + diff);
				// 	child.end_date = new Date(+child.end_date + diff);
				// 	// child.start_date.setHours(0, 0, 0);
				// 	// child.end_date.setHours(0, 0, 0);

				// 	if (child.start_date < task.start_date) {
				// 		child.start_date = task.start_date;
				// 		child.start_date = gantt.roundDate(child.start_date);
				// 		child.end_date = gantt.calculateEndDate(child.start_date, child.duration);
				// 	} else if (child.end_date >= task.end_date) {
				// 		child.end_date = new Date(task.end_date);
				// 	}

				// 	child.entityState = 1;
				// 	child.expectedStart = child.start_date.toFormat('yyyy-MM-dd');
				// 	child.expectedFinish = child.end_date.toFormat('yyyy-MM-dd');
				// 	if (child.constraint_date) {
				// 		child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
				// 	}
				// 	if (child.refName != 'loadMore') {
				// 		moveTaskList.value.push(child);
				// 	}
				// 	gantt.refreshTask(child.id, true);
				// 	// gantt.refreshTask(taskItem.id);
				// }, id);


				afterTaskOpened(moveTaskList.value, task);
			}
			return true;
		});
		//lightBox事件
		gantt.attachEvent('onLightboxButton', function (button_id: any, node: any, e: any) {
			const itemId = gantt.getState().lightbox;
			const taskItem = gantt.getTask(itemId);
			if (!canProjectScheduleTaskEdit(taskItem)) {
				return;
			}
			//下达，任务安排
			if (button_id == 'release_button') {
				cRelease(itemId, taskItem, '');
			}
			//添加工作包
			if (button_id == 'addWorkPackage_button') {
				cAddWorkPackage(itemId, taskItem, '');
			}
		});
		//选中的任务
		const selectItem = reactive({
			selectData: <any>{},
		});

		// if (item.name == 'addWorkPackage') {
		// 	showDeliverables.value = true;
		// }
		// if (item.name == 'release') {
		// 	showIssue.value = true;
		// }
		// gantt.attachEvent('onBeforeTaskSelected', function (id) {
		// 	const taskSelectedItem = gantt.getTask(id);
		// 	if (taskSelectedItem?.level != 1) {
		// 		showDeliverables.value = true;
		// 		showIssue.value = true;
		// 		return false;
		// 	} else {
		// 		return true;
		// 	}
		// });

		gantt.attachEvent('onBeforeTaskSelected', function (id) {
			const beforeTask = gantt.getTask(id);
			if (beforeTask.refName == 'loadMore') {
				showIssue.value = false;
				showDeliverables.value = false;
				return false;
			}

			return true;
		});
		gantt.attachEvent('onTaskSelected', function (id) {
			moveTaskList.value = [];
			const taskSelectedItem = gantt.getTask(id);
			//console.log("taskSelectedItem", taskSelectedItem.actions);
			if (taskSelectedItem.refName != 'loadMore') {
				//any custom logic here
				if (taskSelectedItem?.level == 2) {
					selectItem.selectData = taskSelectedItem;
					if (selectItem.selectData.actions && selectItem.selectData.actions.length > 0) {
						showDeliverables.value = false;
						showIssue.value = false;
						//循环action 有添加工作包 或者 下达 按钮
						selectItem.selectData.actions.forEach((item: any) => {
							if (item.name == 'addWorkPackage') {
								showDeliverables.value = true;
							}
							if (item.name == 'release') {
								showIssue.value = true;
							}
						});
					} else {
						selectItem.selectData = {};
						showDeliverables.value = false;
						showIssue.value = false;
					}
				} else {
					//console.log('selectItem.selectData', selectItem.selectData);
					selectItem.selectData = taskSelectedItem;
					if (selectItem.selectData.actions && selectItem.selectData.actions.length > 0) {
						showDeliverables.value = false;
						showIssue.value = false;
						//循环action 有添加工作包 或者 下达 按钮
						selectItem.selectData.actions.forEach((item: any) => {
							console.log('item.name', item.name);
							if (item.name == 'addWorkPackage') {
								showDeliverables.value = true;
							}
							if (item.name == 'release') {
								showIssue.value = true;
							}
						});
					} else {
						selectItem.selectData = {};
						showDeliverables.value = false;
						showIssue.value = false;
					}
				}
			} else {
				selectItem.selectData = {};
				showDeliverables.value = false;
				showIssue.value = false;
			}

			// console.log("scheduleroleaction?.authority?.authorizedActions",scheduleroleaction?.authority?.authorizedActions);
			//备料计划权限
			const isRES = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'preparationPlan');
			// if (isRES != -1) {
			// 	showPreparationPlan.value = true;
			// } else {
			// 	showPreparationPlan.value = false;
			// }

			const hasRe = ref(false); //是否有权限
			// if (taskSelectedItem.refName == 'Project') {
			// 	// console.log("editProjectRoleaction.authority.allowEdit",editProjectRoleaction.authority.allowEdit);
			// 	// console.log("scheduleroleaction.authority.allowEdit", scheduleroleaction.authority.allowEdit);
			// 	if (editProjectRoleaction.authority.allowEdit == true && scheduleroleaction.authority.allowEdit == true) {
			// 		hasRe.value = isHaveEditRoleaction(taskSelectedItem);
			// 	} else {
			// 		//console.log('我不是项目负责人');
			// 		hasRe.value = false;
			// 	}
			// } else {
			if (scheduleroleaction.authority.allowEdit == true) {
				//console.log('我是有编辑权限');
				hasRe.value = isHaveEditRoleaction(taskSelectedItem);
			} else {
				hasRe.value = false;
				selectItem.selectData = {};
				showDeliverables.value = false;
				showIssue.value = false;
				//showPreparationPlan.value = false;
				showExport.value = false;
			}
			//}

			showExport.value = true;

			//没有权限不能修改限制时间 和 颜色
		});

		// gantt.attachEvent('onBeforeTaskMultiSelect', function (id, e) {
		// 	const beforeTask = gantt.getTask(id);
		// 	//判断加载更多不能拖拽
		// 	if (beforeTask.refName == 'loadMore') {
		// 		showDeliverables.value = false;
		// 		showIssue.value = false;
		// 		return false;
		// 	} else {
		// 		return true;
		// 	}
		// });

		//多选事件，放进选中列表
		gantt.attachEvent('onTaskMultiSelect', function (id, state, e) {
			const selectTask = gantt.getTask(id);
			//true 选中 加入数组 false取消选中
			if (state == true) {
				multiSelectList.data.push(selectTask);
			} else {
				const index = multiSelectList.data.findIndex((item: any) => item.id === id);
				if (index !== -1) {
					multiSelectList.data.splice(index, 1);
				}
			}

			if (multiSelectList.data.length != 1) {
				showIssue.value = false;
				showDeliverables.value = false;
			}
		});

		//获取父亲的ID门
		const getAllParents = (taskId: any) => {
			const parents = [];
			let currentId = taskId;

			while (currentId) {
				const task = gantt.getTask(currentId);
				if (task && task.parent) {
					parents.push(gantt.getTask(task.parent));
					currentId = task.parent;
				} else {
					currentId = null;
				}
			}

			return parents;
		};

		//判断是否有权限
		const isHaveRoleaction = (task: any) => {
			const userId = getLoginUserId();
			if (!task || !userId) {
				return false;
			}
			const parentTaskId = task.id ?? task.taskID;
			// 自己是负责人即可操作
			if (task.ownerID == userId) {
				return true;
			}
			// 父级链路上有自己是负责人
			const allSubParentTasks = getAllParents(parentTaskId);
			const resSub = allSubParentTasks.findIndex((item2: any) => {
				return item2.ownerID == userId;
			});
			return resSub >= 0;
		};

		/** 与内联编辑（开始/结束/时长/负责人）权限一致 */
		const canProjectScheduleTaskEdit = (task: any): boolean => {
			if (!task || task.refName == 'loadMore' || task.refName == 'Project') {
				return false;
			}
			if (scheduleroleaction?.authority?.allowEdit != true) {
				return false;
			}
			if (isProjectScheduleTaskLocked(task)) {
				return false;
			}
			return isHaveRoleaction(task);
		};

		//判断是否有权限
		const isHaveEditRoleaction = (task: any) => {
			const userId = getLoginUserId();
			if (!task || !userId) {
				return false;
			}
			const parentTaskId = task.id ?? task.taskID;
			//判断 task 和 task以上的 owerID是否包含 userID     //admin除外
			//如果当前taskownerID与当前登录用户ID相同

			if (task.ownerID == userId) {
					if (task.taskLevel == 'Project') {
						return true;
					}

					// else {
					// 	const allParentTasks = getAllParents(task.taskID);
					// 	const res = allParentTasks.findIndex((item: any) => {
					// 		return item.ownerID == userId;
					// 	});
					// 	if (res >= 0) {
					// 		return true;
					// 	} else {
					// 		return false;
					// 	}
					//}
				}
				else if (task.taskLevel == 'WORK_PACKAGE') {
					const allParentTasks = getAllParents(parentTaskId);
					const res = allParentTasks.findIndex((item: any) => {
						return item.ownerID == userId;
					});
					if (res >= 0) {
						return true;
					} else {
						return false;
					}


				}


				else {
					//判断当前登录人 是否是弗类操作权限操作。
					const allSubParentTasks = getAllParents(parentTaskId);
					const resSub = allSubParentTasks.findIndex((item2: any) => {
						return item2.ownerID == userId;
					});

					// console.log('res', res);
					if (resSub >= 0) {
						return true;
					} else {
						return false;
					}
				}
		};

		// //判断是否有修改用户人权限
		// const isHaveOwnerRoleaction = (task: any) => {
		// 	//判断 task 和 task以上的 owerID是否包含 userID     //admin除外
		// 	if (task) {
		// 		//如果当前taskownerID与当前登录用户ID相同
		// 		if (task.ownerID == currentUser.value.userId) {
		// 			if (task.level == 'Project') {
		// 				return true;
		// 			} else {
		// 				return false;
		// 			}
		// 		} else {
		// 			//判断当前登录人 是否是弗类操作权限操作。
		// 			const allParentTasks = getAllParents(task.taskID);
		// 			// console.log('allParentTasks', allParentTasks);
		// 			const res = allParentTasks.findIndex((item: any) => {
		// 				// console.log('item.ownerID', item.ownerID);
		// 				// console.log('currentUser.value.id', currentUser.value.userId);
		// 				return item.ownerID == currentUser.value.userId;
		// 			});

		// 			// console.log('res', res);
		// 			if (res >= 0) {
		// 				return true;
		// 			} else {
		// 				return false;
		// 			}
		// 		}
		// 	} else {
		// 		return false;
		// 	}
		// };

		//垂直拖动
		gantt.attachEvent('onBeforeRowDragMove', function (id: string | number, parent: string | number, tindex: number) {
			oriData = '';
			const beforeTask = gantt.getTask(id);

			if (!canProjectScheduleTaskEdit(beforeTask)) {
				return false;
			}

			//非相同父类
			if (beforeTask.parent != parent) {
				return false;
			}

			oriData = snapshotProjectScheduleOriData(gantt, beforeTask.id, false);

			const mList: any[] = [];
			gantt.eachTask(function (child) {
				if (child.taskLevel == beforeTask.taskLevel) {
					mList.push(child);
				}
			}, parent);

			console.log('mList', mList);

			const beforeIndex = mList.findIndex((item: any) => {
				console.log('item', item.id);
				console.log('beforeTask', beforeTask.id);
				return item.id == beforeTask.id;
			});

			console.log('beforeIndex', beforeIndex);
			console.log('tindex', tindex);

			if (beforeIndex == tindex) {
				return false;
			}

			return true;
		});
		//换完后调用接口
		gantt.attachEvent('onAfterTaskMove', function (id: string | number, parent: string | number, tindex: number) {
			console.log('垂直移动');
			const task = gantt.getTask(id); //自己
			console.log('task', task);

			if (isProjectScheduleTaskLocked(task)) {
				return false;
			}

			const parntTask = gantt.getTask(parent); //父亲
			if (task.parent != parent) {
				return false;
			} else {
				const moveList: any[] = [];
				gantt.eachTask(function (child) {
					if (child.taskLevel == task.taskLevel) {
						moveList.push(child);
					}
				}, parent);

				console.log('moveList', moveList);

				//获得他之前那个下标task的No
				//const previousTask = gantt.getTask(moveList[tindex - 1].id);

				let previousTask;
				if (tindex == 0) {
					previousTask = gantt.getTask(moveList[tindex + 1].id);
				} else if (tindex > 0) {
					previousTask = gantt.getTask(moveList[tindex - 1].id);
				}

				console.log('previousTask', previousTask);

				console.log('previousTask.taskNo', previousTask.taskNo);
				const previousTaskNo = previousTask.taskNo;
				console.log('previousTaskNo', previousTaskNo);

				let parts = [];
				parts = previousTaskNo.split('.'); //
				console.log('parts', parts);

				if (parts && parts.length > 0) {
					if (tindex > 0) {
						const partLength = parts.length - 1 > 0 ? parts.length - 1 : 0;
						parts[partLength] = Number(parts[partLength]) + 1;
						// //阶段
						// if (task.taskLevel == TaskLevel.PHASE) {
						// 	if (parts[0]) {
						// 		parts[0] = Number(parts[0]) + 1;
						// 	}
						// }
						// //任务
						// else if (task.taskLevel == TaskLevel.TASK) {
						// 	if (parts[1]) {
						// 		parts[1] = Number(parts[1]) + 1;
						// 	}
						// }
						// //工作包
						// else if (task.taskLevel == TaskLevel.WORK_PACKAGE) {
						// 	if (parts[2]) {
						// 		parts[2] = Number(parts[2]) + 1;
						// 	}
						// }
					}
					if (tindex == 0) {
						const partLength = parts.length - 1 > 0 ? parts.length - 1 : 0;
						console.log('partLength', partLength);
						console.log('parts[partLength]', parts[partLength]);

						parts[partLength] = Number(parts[partLength]) - 1 > 0 ? Number(parts[partLength]) - 1 : 1;
					}
				}

				console.log('parts2', parts);
				const aaaa = parts.join('.');
				console.log('aaaa', aaaa);

				task.taskNo = parts.join('.');
				task.refNo = task.taskNo;
				task.entityState = 1;
				// console.log('previousTaskNo', previousTaskNo);
				// console.log('task.taskNo', task.taskNo);
				// console.log('task', task);
				const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
				const apiClient = $api as ApiClient;
				const postAction = JSON.parse(JSON.stringify(task));
				postAction.actions = null;

				console.log('postAction', postAction);

				//调用接口
				try {
					const res: any = apiClient.doAction(
						{
							action: 'save',
							repository: 'ProjectTasks',
							service: 'mes',
						},
						postAction
					);

					if (res) {
						//成功后调用接口 刷新数据
						getSubSchedule(props.ctx, parntTask, true);
						return true;
					}
				} catch (error: any) {
					if (error.validationErrors && error.validationErrors.length > 0) {
						toast.add({
							severity: 'error',
							detail: error.validationErrors[0].error,
							summary: error.detail ?? '',
							group: 'br',
							life: 5000,
						});
					} else {
						toast.add({
							severity: 'error',
							detail: error.message ?? `${t('invalid.error')}`,
							summary: error.detail ?? '',
							group: 'br',
							life: 5000,
						});
					}
					undoTaskDrag(); //报错返回
					return false;
				}

				return true;
			}
		});
		//拖拽事件之前
		gantt.attachEvent('onBeforeTaskDrag', function (id: any, mode: any, e: any) {
			clearProjectScheduleTaskReadonly(gantt);
			moveTaskList.value = [];
			oriData = '';
			const beforeTask = gantt.getTask(id);

			if (mode == 'move' || mode == 'resize') {
				if (!canProjectScheduleTaskEdit(beforeTask)) {
					return false;
				}
				oriData = snapshotProjectScheduleOriData(gantt, id);
				return true;
			}

			if (mode == 'progress') {
				if (beforeTask.refName == 'loadMore' || beforeTask.refName == 'Project') {
					return false;
				}
				if (beforeTask.subtaskNum > 0) {
					return false;
				}
				return canProjectScheduleTaskEdit(beforeTask);
			}
		});

		//向右移动
		const limitMoveLeft = (task: any, limit: any) => {
			const dur = task.end_date - task.start_date;
			task.end_date = new Date(limit.end_date);
			task.start_date = new Date(+task.end_date - dur);
		};

		const limitMoveRight = (task: any, limit: any) => {
			const dur = task.end_date - task.start_date;
			task.start_date = new Date(limit.start_date);
			task.end_date = new Date(+task.start_date + dur);
		};

		const limitResizeRight = (task: any, limit: any) => {
			task.start_date = new Date(limit.start_date);
		};
		//向右拖动
		const limitResizeLeft = (task: any, limit: any) => {
			task.end_date = new Date(limit.end_date);
			// if (task.constraint_date) {
			// 	if (+task.end_date >= +task.constraint_date) {
			// 		task.end_date = new Date(task.constraint_date);
			// 	}
			// } else {
			// }
		};

		(gantt as any).attachEvent('onTaskDragStart', function () {
			removeLockedProjectScheduleTasksFromDragMultiple(gantt);
		});

		gantt.attachEvent('onTaskDrag', function (id: any, mode: any, task: any, original: any) {
			const modes = gantt.config.drag_mode;
			const liveTask = gantt.getTask(id);

			if (mode == modes.move && isProjectScheduleTaskLocked(liveTask)) {
				restoreLockedProjectScheduleTaskDragCopy(task, id, original, gantt);
				return false;
			}

			const parent = task.parent ? gantt.getTask(task.parent) : null,
				children = gantt.getChildren(id),
				skipChildCascade = shouldSkipProjectScheduleChildCascade(gantt, id);

			let limitLeft = null,
				limitRight = null;

			//限制移动，拖动
			if (mode == modes.move) {
				if (task.constraint_date && task.refName == 'Project') {
					limitLeft = limitMoveLeft;
					limitRight = limitMoveRight;
				} else {
					limitLeft = limitMoveLeft;
					limitRight = limitMoveRight;
				}
			} else if (mode == modes.resize) {
				if (task.constraint_date && task.refName == 'Project') {
					limitLeft = limitResizeLeft;
					limitRight = limitResizeRight;
				} else {
					limitLeft = limitResizeLeft;
					limitRight = limitResizeRight;
				}
			}

			//父子拖动
			if (mode == modes.move) {
				if (parent && +parent.end_date < +task.end_date) {
					limitLeft(task, parent);
				}
				if (parent && +parent.start_date > +task.start_date) {
					limitRight(task, parent);
				}
				if (!skipChildCascade) {
					const diff3 = task.start_date - original.start_date;
					gantt.eachTask(function (child) {
						if (isProjectScheduleTaskLocked(child)) {
							return;
						}
						child.start_date = new Date(+child.start_date + diff3);
						child.end_date = new Date(+child.end_date + diff3);
						gantt.refreshTask(child.id, true);
					}, id);
				} else if (oriData) {
					restoreLockedProjectScheduleChildrenFromSnapshot(gantt, id, oriData);
				}
			}

			if (mode == modes.resize) {
				if (parent && +parent.end_date < +task.end_date) {
					limitLeft(task, parent);
				}
				if (parent && +parent.start_date > +task.start_date) {
					limitRight(task, parent);
				}

				gantt.eachTask(function (child) {
					if (isProjectScheduleTaskLocked(child)) {
						return;
					}
					if (child.start_date < task.start_date) {
						task.start_date = child.start_date;
						gantt.refreshTask(child.id, true);
					}
					if (child.end_date > task.end_date) {
						task.end_date = child.end_date;
						gantt.refreshTask(child.id, true);
					}
				}, id);
			}
			return false;
		});

		const moveTaskList = ref([]);
		//rounds the positions of child items to the scale

		gantt.attachEvent('onAfterTaskDrag', function (id: any, mode: any, e: any) {
			const modes = gantt.config.drag_mode;
			const task = gantt.getTask(id);

			//判断自己是否有父类，如果超过父类，结束时间等于父类
			const parent = task.parent ? gantt.getTask(task.parent) : null;
			task.start_date.setHours(0, 0, 0);
			task.end_date.setHours(0, 0, 0);
			task.entityState = 1;

			if (parent) {
				if (task.end_date >= parent.end_date) {
					task.end_date = parent.end_date;
					task.duration = gantt.calculateDuration(task.start_date, task.end_date);
					persistScheduleGanttTaskExpectedDates(task, gantt);
					gantt.refreshTask(task.id, true);
				}
			}

			// task.start_date = gantt.roundDate(task.start_date);
			// task.end_date = gantt.calculateEndDate(task.start_date, task.duration);

			if (task.constraintDate) {
				task.constraintDate = new Date(task.constraintDate);
				task.constraintDate = task.constraintDate.toFormat('yyyy-MM-dd HH:mm:ss');
			}

			if (mode == modes.move) {
				if (oriData) {
					restoreLockedProjectScheduleChildrenFromSnapshot(gantt, id, oriData);
				}
				persistScheduleGanttTaskExpectedDates(task, gantt);
				moveTaskList.value.push(task);

				gantt.eachTask(function (child) {
					if (isProjectScheduleTaskLocked(child)) {
						return;
					}
					if (child.start_date < task.start_date) {
						child.start_date = task.start_date;
					} else if (child.end_date > task.end_date) {
						child.end_date = new Date(task.end_date);
					}

					child.start_date = gantt.roundDate(child.start_date);
					child.end_date = gantt.calculateEndDate(child.start_date, child.duration);

					child.entityState = 1;
					persistScheduleGanttTaskExpectedDates(child, gantt);

					if (child.constraint_date) {
						child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
					}
					if (child.refName != 'loadMore') {
						moveTaskList.value.push(child);
					}
					gantt.refreshTask(child.id, true);
				}, id);

				afterTaskOpened(moveTaskList.value);
			} else if (mode == modes.resize) {
				gantt.eachTask(function (child) {
					if (isProjectScheduleTaskLocked(child)) {
						return;
					}
					if (child.start_date < task.start_date) {
						task.start_date = child.start_date;
						gantt.refreshTask(child.id, true);
					}
					if (child.end_date > task.end_date) {
						task.end_date = child.end_date;
						gantt.refreshTask(child.id, true);
					}
				}, id);

				persistScheduleGanttTaskExpectedDates(task, gantt);
				moveTaskList.value.push(task);

				afterTaskOpened(moveTaskList.value);
			} else if (mode == modes.progress) {
				afterTaskUpdate(id, task);
				moveTaskList.value.push(task);
				afterTaskOpened(moveTaskList.value);
			}
		});

		gantt.attachEvent('onAfterTaskUpdate', function (id, task) {
			// if (task.$level === 0) {
			// 	// 假设$level为0表示父任务
			// 	var children = gantt.getChildren(id); // 获取所有子任务ID
			// 	children.forEach(function (childId) {
			// 		var childTask = gantt.getTask(childId);
			// 		// 根据父任务的新时间调整子任务（例如，重新计算开始时间或持续时间）
			// 		gantt.updateTask(childId, { start_date: new Date(task.start_date) }); // 示例：仅更改开始时间
			// 	});
			// }
		});

		//点击拖动后事件
		const afterTaskOpened = async (moveTaskList: any, task?: any) => {

			let moveTaskList2 = JSON.parse(JSON.stringify(moveTaskList));
			moveTaskList2 = moveTaskList2.map((item: any) => {
				item.actions = null;
				return item;
			});
			//isError.value = false;
			const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
			const apiClient = $api as ApiClient;
			//调用接口
			try {
				const res: any = await apiClient.doAction(
					{
						action: 'batchSave',
						repository: 'ProjectSchedule',
						service: 'mes',
					},
					moveTaskList2
				);

				if (res) {
					//更新项目
					if (res[0]?.project?.projectID) {
						const list = [];
						list.push(res[0].project);
						goUpdateTask(list);
					}

					//更新父级
					if (res && res[0]?.tasks?.length > 0) {
						goUpdateTask(res[0].tasks);
					}

					//更新自己
					if (task) {
						const list2 = [];
						list2.push(task);
						goUpdateTask(list2);

						toast.add({
							severity: 'success',
							summary: t('success.beforeSave'),
							life: 5000,
						});
					}

					//根据ID找到父类，刷新
					//调用接口
					//await getSubSchedule(context, taskItem);
					// const p = ref([]);
					// moveTaskList.forEach((item: any) => {
					// 	const task2 = gantt.getTask(item.parent);
					// 	p.value.push(task2.id);
					// 	console.log('task2', task2);
					// 	console.log('p.value', p.value);
					// 	//await getSubSchedule(props.ctx, task2);
					// 	//gantt.eachTask(function (parent: any) {
					// 	//p.value.push(parent);
					// 	//console.log('parent', parent);
					// 	//console.log('p.value', p.value);
					// 	//}, item.id);
					// });

					//console.log('aaaaaaaaaaa', moveTaskList);

					return true;
				}
			} catch (error: any) {
				if (error.validationErrors && error.validationErrors.length > 0) {
					toast.add({
						severity: 'error',
						detail: error.validationErrors[0].error,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				} else {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: error.detail ?? '',
						group: 'br',
						life: 5000,
					});
				}
				undoTaskDrag(); //报错返回
				return false;
			}
		};
		// gantt.attachEvent("onTaskDrag", function (id:any, mode:any, task:any, original:any) {
		// 	const modes = gantt.config.drag_mode;
		// 	const beforeTask = gantt.getTask(id);
		// 	if (mode == modes.move && beforeTask.refName != 'loadMore') {
		// 		const diff = task.start_date - original.start_date;
		// 		gantt.eachTask(function (child) {
		// 			if (child.$source.length != 0 || child.$target.length != 0) {
		// 				child.start_date = new Date(+child.start_date + diff);
		// 				child.end_date = new Date(+child.end_date + diff);
		// 				gantt.refreshTask(child.id, true);
		// 			}
		// 		}, id);
		// 	}
		// 	return true;
		// });

		// //rounds the positions of child items to the scale
		// gantt.attachEvent("onAfterTaskDrag", function(id:any, mode:any, e:any){
		// 	const modes = gantt.config.drag_mode;

		// 	console.log("aaaaaaaaaaaaaaaaa");
		// 	if(mode == modes.move ){
		// 		// gantt.eachTask(function(child){
		// 		// 	child.start_date = gantt.roundDate(child.start_date);
		// 		// 	child.end_date = gantt.calculateEndDate(child.start_date, child.duration);
		// 		// 	gantt.updateTask(child.id);
		// 		// },id );
		// 	}
		// });

		//更新数据
		const afterTaskUpdate = (id: any, item: any) => {
			if (!item) {
				const task = gantt.getTask(id);
				if (task) {
					task.entityState = 1;
					persistScheduleGanttTaskExpectedDates(task, gantt);
					changeTasks(task, appContext);
				}
			} else {
				item.entityState = 1;
				persistScheduleGanttTaskExpectedDates(item, gantt);
				//constraintType类型为NONE，时间改成空
				if (item.constraintType == 'NONE') {
					item.constraintDate = null;
				} else {
					item.constraintDate = item.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss'); //限制时间
				}
				changeTasks(item, appContext);
			}
		};

		//控制编辑权限
		gantt.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {
			moveTaskList.value = [];
			if (scheduleroleaction?.authority?.allowEdit == false) {
				return false;
			}

			const task = gantt.getTask(state.id);
			if (task.refName == 'loadMore') {
				return false;
			}
			if (isProjectScheduleTaskLocked(task)) {
				return false;
			}
			//开始时间
			if (state.columnName == 'start_date' || state.columnName == 'end_date') {
				oriData = snapshotProjectScheduleOriData(gantt, state.id);

				//先判断拖拽的是不是 project？  是project 判断有没有project 权限。
				//项目
				//console.log('beforeTask.refName', task.refName);
				const hasRe = ref(false); //是否有权限
				if (task.refName == 'Project') {
					return false;
				} else {
					if (scheduleroleaction.authority.allowEdit == true) {
						//console.log('我是有编辑权限');
						hasRe.value = isHaveRoleaction(task);
					} else {
						hasRe.value = false;
					}
				}
				console.log('hasRe.value', hasRe.value);
				if (hasRe.value == true) {
					task.orgStart = task.start_date;
					task.orgEnd = task.end_date;
					task.orgDuration = task.duration;
					gantt.updateTask(task.id);
				} else {
					return false;
				}
			}
			if (state.columnName == 'duration') {
				const task = gantt.getTask(state.id);
				const hasRe = ref(false); //是否有权限
				if (task.refName == 'Project') {
					return false;
				} else {
					if (scheduleroleaction.authority.allowEdit == true) {
						//console.log('我是有编辑权限');
						hasRe.value = isHaveRoleaction(task);
					} else {
						hasRe.value = false;
					}
				}

				if (hasRe.value == true) {
					return true;
				} else {
					return false;
				}
			}
			//更换Editor
			if (state.columnName == 'ownerName') {
				const hasRe = ref(false); //是否有权限
				if (task.refName == 'Project') {
					return false;
				} else {
					if (scheduleroleaction.authority.allowEdit == true) {
						//console.log('我是有编辑权限');
						hasRe.value = isHaveRoleaction(task);
					} else {
						hasRe.value = false;
					}
				}

				if (hasRe.value == true && showAssign.value == true) {
					const list = gantt.serverList('options', selectTruePersons.value);
					selectPersonsEditor.options = list;
				} else {
					return false;
				}
			}
			//更换statusEditor
			if (state.columnName == 'statusType') {
				if (task.taskLevel == 'Project') {
					return false;
				}
				const children = gantt.getChildren(task.id);
				if (children.length > 0) {
					return false;
				}
				statusTypeEditor.options = taskStatusListOptions.value;
			}
		});

		// gantt.ext.inlineEditors.attachEvent('onEditEnd', function (state) {
		// 	gantt.ext.inlineEditors.hide();
		// 	// -> {id: itemId, columnName: columnName};
		// });

		//甘特图内连编辑
		gantt.ext.inlineEditors.attachEvent('onSave', function (state: any) {
			if (state.id && scheduleroleaction?.authority?.allowEdit == true) {
				const col = state.columnName;
				const task: any = gantt.getTask(state.id);
				if (isProjectScheduleTaskLocked(task)) {
					return;
				}
				const diff = task.start_date - task.orgStart;
				task.duration = gantt.calculateDuration(task.start_date, task.end_date);
				if (col == 'start_date' || col == 'end_date' || col == 'duration') {
					//判断自己是否有父类，如果超过父类，结束时间等于父类
					const parent = task.parent ? gantt.getTask(task.parent) : null;
					if (parent) {
						if (task.end_date >= parent.end_date) {
							task.end_date = parent.end_date;
							task.duration = gantt.calculateDuration(task.start_date, task.end_date);
							gantt.refreshTask(task.id, true);
						}
						if (task.start_date < parent.start_date) {
							task.start_date = parent.start_date;
							task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
							task.duration = gantt.calculateDuration(task.start_date, task.end_date);
							gantt.refreshTask(task.id, true);
						}
					}

					task.start_date.setHours(0, 0, 0);
					task.end_date.setHours(0, 0, 0);
					if (isGanttEndBeforeStart(task.start_date, task.end_date)) {
						showGanttEndBeforeStartToast();
						moveTaskList.value = [];
						if (oriData) {
							undoTaskDrag();
						} else {
							revertGanttTaskDates(task);
						}
						return;
					}

					//判断end_date是否小于子项
					gantt.eachTask(function (child) {
						if (isProjectScheduleTaskLocked(child)) {
							return;
						}
						if (task.end_date <= child.end_date) {
							task.end_date = child.end_date;
							task.duration = gantt.calculateDuration(task.start_date, task.end_date);
							gantt.refreshTask(task.id, true);
						}
					}, state.id);

					task.duration = gantt.calculateDuration(task.start_date, task.end_date);
					gantt.refreshTask(task.id, true);

					//afterTaskUpdate(state.id, task);

					// task.start_date.setHours(0, 0, 0);
					// task.end_date.setHours(0, 0, 0);
					task.entityState = 1;
					persistScheduleGanttTaskExpectedDates(task, gantt);

					if (task.constraintDate) {
						task.constraintDate = new Date(task.constraintDate);
						task.constraintDate = task.constraintDate.toFormat('yyyy-MM-dd HH:mm:ss');
					}

					moveTaskList.value.push(task);
					gantt.eachTask(function (child) {
						if (isProjectScheduleTaskLocked(child)) {
							return;
						}
						child.start_date = new Date(+child.start_date + diff);
						child.end_date = new Date(+child.end_date + diff);

						if (child.start_date < task.start_date) {
							child.start_date = task.start_date;
							child.start_date = gantt.roundDate(child.start_date);
							child.end_date = gantt.calculateEndDate(child.start_date, child.duration);
						} else if (child.end_date >= task.end_date) {
							child.end_date = new Date(task.end_date);
						}
						child.entityState = 1;
						persistScheduleGanttTaskExpectedDates(child, gantt);

						if (child.constraint_date) {
							child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
						}
						if (child.refName != 'loadMore') {
							moveTaskList.value.push(child);
						}

						gantt.refreshTask(child.id, true);
					}, state.id);

					afterTaskOpened(moveTaskList.value);

					//afterTaskUpdate(state.id, task);
				}

				// else if (col == 'duration') {
				// 		//判断自己是否有父类，如果超过父类，结束时间等于父类
				// 	const parent = task.parent ? gantt.getTask(task.parent) : null;
				// 	if (parent) {
				// 		if (task.end_date >= parent.end_date) {
				// 			task.end_date = parent.end_date;
				// 			task.duration = gantt.calculateDuration(task.start_date, task.end_date);
				// 			gantt.refreshTask(task.id, true);
				// 		}
				// 		if (task.start_date < parent.start_date) {
				// 			task.start_date = parent.start_date;
				// 			task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
				// 			task.duration = gantt.calculateDuration(task.start_date, task.end_date);
				// 			gantt.refreshTask(task.id, true);
				// 		}
				// 	}
				// 	//修改duration
				// 	moveTaskList.value.push(task);
				// 	afterTaskOpened(moveTaskList.value);

				// 	// afterTaskUpdate(state.id, task);
				// }
				else if (col == 'ownerName') {

					const userID = task.ownerName;
					//获取对应的负责人
					const res = selectTruePersons.value.find((personItem: any) => {
						if (personItem.ownerID === userID) {
							return personItem;
						}
					});
					if (res) {
						const changeUser = {
							username: res.ownerName,
							userID: res.ownerID,
							customProperties: {
								$deptID: res.ownerDept,
							},
							deptID: res.ownerDeptID,
						};
						const taskItems = [];
						taskItems.push(task);
						userChange(changeUser, taskItems);
					}
				} else if (col == 'statusType') {
					task.entityState = 1;
					const res = taskStatusListOptions.value.find((item: any) => {
						if (task.statusType === item.value) {
							return item;
						}
					});
					task.status = task.statusType;
					task.customProperties.$status = res.label;
					task.statusType = res.label;
					moveTaskList.value.push(task);
					afterTaskOpened(moveTaskList.value);
				}
			}
		});

		//内连编辑变更后，如果没变更就保持原样
		gantt.ext.inlineEditors.attachEvent('onEditEnd', function (state: any) {
			// 更新数据源中的值，例如使用 AJAX 或直接操作数据源数组
			const item = gantt.getTask(state.id);
			if (item) {
				if (state.columnName == 'ownerName' && item.ownerID) {
					//查询 ownerID 所对应的ownerName
					console.log('selectTruePersons', selectTruePersons.value);
					const res = selectTruePersons.value.find((item2: any) => {
						return item2.ownerID == item.ownerID;
					});
					if (res) {
						item.ownerName = res.ownerName;
						gantt.updateTask(state.id); // 更新 Gantt 控件显示的任务信息
					}
				}
			}
		});

		//link变动
		const cLink = (id: any, item: any, type: string) => {
			//前端判断，是否已经删除，已经删除不调用接口
			if (item.remove == true) {
				return;
			}
			if (type == 'add') {
				item.entityState = 2;
			} else if (type == 'update') {
				item.entityState = 1;
			} else if (type == 'delete') {
				item.entityState = 4;
			}
			changeLinks(item, appContext);
		};

		//task更新
		const goUpdateTask = (newData: any) => {
			newData.forEach((item: any) => {
				let task: Task;
				if (item.id) {
					task = gantt.getTask(item.id);
				} else if (item.taskID) {
					task = gantt.getTask(item.taskID);
				} else {
					task = gantt.getTask(item.projectID);
				}

				if (task) {
					if (item.start_date) {
						task.start_date = normalizeScheduleDateTime(item.start_date) ?? new Date(item.start_date);
					} else {
						task.start_date = normalizeScheduleDateTime(item.expectedStart) ?? new Date(item.expectedStart);
					}
					if (item.end_date) {
						task.end_date = normalizeScheduleDateTime(item.end_date) ?? new Date(item.end_date);
					} else {
						task.end_date = normalizeScheduleDateTime(item.expectedFinish) ?? new Date(item.expectedFinish);
					}

					task.expectedStart = normalizeScheduleDateTimeString(item.expectedStart) ?? item.expectedStart;
					task.expectedFinish = normalizeScheduleDateTimeString(item.expectedFinish) ?? item.expectedFinish;
					// 回滚日期后按起止日重算时长（内联编辑校验失败时 duration 可能仍为负值）
					task.duration = gantt.calculateDuration(task.start_date, task.end_date);
					applyProjectScheduleTaskStatusFromSnapshot(task, item);

					if (item.taskColor) {
						task.color = !task.taskColor ? '537CFA' : item.taskColor;
						task.color = '#' + item.taskColor;
					} else {
						task.color = '#537CFA';
					}
					gantt.refreshTask(task.id, true);
				}
			});

			gantt.refreshData();
		};
		//link更新
		const goUpdateLink = () => {
			gantt.refreshData();
		};

		//break 分解更新
		const goUpdateBreak = (newData: any) => {
			gantt.refreshData();
			goUpdateBreak(false);
		};
		const canReflashLink = ref(false);
		//获取更新子数据
		const goUpdateSub = (newData: any, deleteID?: any, isOpen?: any, task?: any) => {
			console.log('newData', newData);
			//如果是获取子集，删除双击
			if (deleteID) {
				//console.log('deleteID', deleteID);
				const deleteTaskId = deleteID + '_1';
				const deleteTask = gantt.getTask(deleteTaskId);
				if (deleteTask && deleteTask.refName == 'loadMore') {
					gantt.deleteTask(deleteTaskId);
				}
			}

			//如果有字数据
			if (newData.subList.length > 0) {
				newData.subList.forEach((task: Task) => {
					//判断有没有 没有添加
					//有更新
					const taskItem = gantt.getTask(task.id);
					if (taskItem) {
						taskItem.actions = task.actions;
						taskItem.start_date = normalizeScheduleDateTime(task.start_date) ?? new Date(task.start_date);
						taskItem.end_date = normalizeScheduleDateTime(task.end_date) ?? new Date(task.end_date);
						taskItem.color = '#' + task.taskColor;
						applyProjectScheduleTaskStatusFromSnapshot(taskItem, task);
						gantt.updateTask(taskItem.id, taskItem);
						gantt.refreshTask(taskItem.id);
					}
					//没有添加
					else {
						prepareProjectScheduleLoadedTask(task);
						gantt.addTask(task);
					}
				});
			}
			//判断有link
			if (newData.subLinkList && newData.subLinkList.length > 0) {
				newData.subLinkList.forEach((link: Link) => {
					const linkItem = gantt.getLink(link.id);
					if (!linkItem) {
						gantt.addLink(link);
					} else {
						canReflashLink.value = true;
						gantt.refreshLink(link.id);
					}
				});
			}
			hideGanttLightboxIfOpen();
			syncProjectGanttRowHeights();
			syncGanttGridWidthAfterData();
			healProjectScheduleGanttLockState(gantt);
			gantt.refreshData();

			//是否是点击展开按钮
			if (isOpen) {
				expandTaskAndChildren(task.taskID);
			}

			showLoading.value = false;
		};

		//默认打开子集
		const expandTaskAndChildren = (taskId: any) => {
			// 首先展开当前任务
			gantt.open(taskId);
			// 获取当前任务的子任务
			const children = gantt.getChildren(taskId);
			if (children && children.length > 0) {
				// 递归展开每个子任务
				children.forEach((childId: any) => {
					expandTaskAndChildren(childId);
				});
			}
		};

		const copyToUser = ref<any[]>();
		// 格式化人员列表
		const formatUserList = (userOptions: any[]) => {
			const allDept = userOptions.map((item: any) => ({
				deptID: item.deptID,
				deptName: item.customProperties?.$deptID ?? '-',
			}));
			const deptList: any[] = [];
			const map = new Map();

			allDept.forEach((item: { deptID: string; deptName: string }) => {
				if (!map.has(item.deptID)) {
					map.set(item.deptID, true);
					deptList.push({ ...item, items: [] });
				}
			});
			userOptions.forEach((item: any) => {
				const deptIndex = deptList.findIndex((item2: any) => item2.deptID === item.deptID);
				if (deptIndex != -1) {
					deptList[deptIndex].items.push(item);
				}
			});

			return deptList;
		};
		const isProjectSearchDialogOpen = ref(false);
		const openProjectSearchDialog = async () => {
			if (isProjectSearchDialogOpen.value) {
				return;
			}
			isProjectSearchDialogOpen.value = true;
			let data = [] as any;
			// 打开弹窗前缓存当前选中，取消/关闭时还原外层展示
			const snapshotSelected = resolveSelectedProject();
			if (snapshotSelected?.projectID) {
				temporarilySelect.value = { ...snapshotSelected };
			}
			try {
				const { metaui } = await props.ctx.logic.loadMetadata('Projects', 'mes', true);
				projecDataKEY.value = metaui.primaryKey;
				projectDialogPager.value = {
					pageSize: 10,
					pageNo: 1,
				};
				const columns = await props.ctx.uiBuilder.buildColumns(metaui, props.ctx, {
					isSearch: true,
					cacheKey: `payerID/SearchRelative/${metaui.primaryKey}`,
				});
				props.ctx.uiBuilder.confirmDialog(
					(props.ctx.uiBuilder as any).buildSearchForRelativeContent(columns, {
						dataKey: projecDataKEY.value,
						onSearch: async (params: any) => {
							const { searchParams } = params;
							await getProjectDialogData(props.ctx, searchParams.searchWord);
							return { list: projectDialogData.value, pager: projectDialogPager.value };
						},
						onPage: ({ pageNo, pageSize }: any) => {
							projectDialogPager.value = {
								...projectDialogPager.value,
								pageNo,
								pageSize,
							};
						},
						onSelect: (selection: any, row: any) => {
							data = row;
						},
						onRowDblclick(data: any) {
							applyProjectFilter(data);
							triggerEscKey();
						},
					}),
					props.ctx,
					{
						title: '选中一个项目',
						width: '80%',
						accept: async () => {
							if (!data || data.length === 0) {
								props.ctx.uiBuilder.toast(props.ctx, {
									severity: 'error',
									summary: $t('dialog.title.error'),
									detail: $t('invalid.requiredSelectAny'),
									group: 'br',
									life: 3000,
								});
								return false;
							}
							applyProjectFilter(data);
							return true;
						},
						reject: async () => {
							const restored = Array.isArray(temporarilySelect.value)
								? temporarilySelect.value[0]
								: temporarilySelect.value;
							selectgProject.value = restored ?? null;
							selectgProjectSearchword.value = restored ?? null;
							reloadParam.projectID = restored?.projectID ?? null;
							ensureSelectedProjectInOuterOptions();
							return true;
						},
						onHide: () => {
							isProjectSearchDialogOpen.value = false;
							// 关窗后把已选项目补回外层 options，避免 [object Object]
							ensureSelectedProjectInOuterOptions();
							return true;
						},
					}
				);
			} catch {
				isProjectSearchDialogOpen.value = false;
				ensureSelectedProjectInOuterOptions();
			}
		};
		const throttledOpenProjectSearchDialog = throttle(openProjectSearchDialog, 500);
		const maxSelectedLabel = ref(18); //设置联系人的最大数量
		return () =>
			h('div', {}, [
				scheduleroleaction?.authority?.allowRead == true
					? h('div', {}, [
						showLoading.value == true ? h('div', { class: 'loadingBox' }, [ui.factory.loading({})]) : '',
						h('div', { class: 'opearBox' }, [
							h('div', { class: 'selfFulldivBox' }, [
								ui.factory.formItem(
									{
										label: $t('ganttLabel.selectTimeMode'),
									},
									{
										default: () =>
											ui.factory.select({
												labelStyle: { textAlign: 'left' },
												id: 'selectTimeMode',
												class: 'w-full',
												modelValue: durationUnit.select,
												options: timeList,
												placeholder: $t('ganttLabel.selectTimeMode'),
												onUpdate: (value: any) => {
													durationUnit.select = value;
													selectTimeChange();
													// submitModel.data.importance = value;
													// emit('changeData', submitModel.data)
												},
												optionLabel: 'name',
											}),
									}
								),
								ui.factory.formItem(
									{
										label: $t('ganttLabel.sProject'),
									},
									{
										default: () =>
											h('div', { class: 'selfdivBox project' }, [
												ui.factory.searchForRelative({
													role: `defectDesc-search-for-sProject`,
													name: 'defectDesc-search-for-sProject',
													id: 'defectDesc-search-for-sProject',
													modelValue: selectgProjectSearchword.value,
													placeholder: $t('ganttLabel.sProject'),
													options: lineData.value,
													dataKey: 'projectID',
													optionLabel: (v: any) => v.projectName,
													onInput: (value: string) => {
														if (selectgProjectIsComposing.value) return;
														debounce(async () => {
															await getProjectData2(props.ctx, value);
														}, 500)();
													},
													onCompositionstart: () => {
														selectgProjectIsComposing.value = true;
													},
													onCompositionend: (e: any) => {
														debounce(async () => {
															await getProjectData2(props.ctx, e.target.value);
														}, 500)();
														selectgProjectIsComposing.value = false;
													},
													toSearch: () => {
														throttledOpenProjectSearchDialog();
													},
													onUpdate: (value: any) => {
														applyProjectFilter(value);
													},
													onChange: (value: any) => {
														applyProjectFilter(value);
													},
													// editable Select 点 X 有时不触发 onUpdate，业务侧拦截清除图标
													pt: {
														clearIcon: {
															onClick: (event: Event) => {
																event.preventDefault();
																event.stopPropagation();
																clearProjectFilter();
															},
														},
													},
												})
											]),
									}
								),
								ui.factory.formItem(
									{
										label: $t('ganttLabel.schedulePeriod'),
									},
									{
										default: () =>
											ui.factory.datePicker({
												selectionMode: 'range',
												numberOfMonths: 2,
												modelValue: scheduleDateRange.value,
												placeholder: $t('ganttLabel.selectSchedulePeriod'),
												showButtonBar: true,
												appendTo: 'body',
												onUpdatePicker: (value: Date | Date[] | null) => {
													syncScheduleDateRangeToReloadParam(value);
												},
											}),
									}
								),
								ui.factory.formItem(
									{
										label: $t('ganttLabel.status'),
									},
									{
										default: () =>
											ui.factory.multiSelect({
												labelStyle: { textAlign: 'left' },
												id: 'statusModel',
												showClear: true,
												class: 'w-full',
												modelValue: selectStatus.value,
												options: statusListOptions.value,
												placeholder: $t('ganttLabel.status'),
												onUpdate: (value: string) => {
													selectStatus.value = value;
													if (value && value.length > 0) {
														reloadParam.status = toSQL(value);
													} else {
														reloadParam.status = '';
														// reloadParam.projectID = '';
														// selectgProjectSearchword.value = null;
													}

													props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/status`, JSON.parse(JSON.stringify(value)));
												},

												optionValue: 'value',
												optionLabel: 'label',
											}),
									}
								),
								ui.factory.formItem(
									{
										label: $t('action.searchFuzzy'),
									},
									{
										default: () =>
											ui.factory.input(reloadParam.searchWord, {
												onUpdate: (value: string) => {
													reloadParam.searchWord = value ?? '';
													props.ctx.app.localDb.put(
														`search/${props.ctx.logic.repository}/searchWord`,
														JSON.parse(JSON.stringify(reloadParam.searchWord))
													);
												},
											}),
									}
								),
							]),
							h('div', { class: 'selfFulldivBox' }, [
								ui.factory.formItem(
									{
										label: $t('ganttLabel.PersonInCharge'),
										name: 'PersonInCharge',
										required: false,
										class: 'selfPerson',
										//invalid: invalidProps.copyToInvalid,
										invalidMessage: $t('invalid.requiredSelectAny'),
									},
									{
										default: () => [
											showChargePerson.value == true
												? ui.factory.multiSelect(
													{
														labelStyle: { textAlign: 'left' },
														id: 'PersonInCharge',
														// invalid: invalidProps.copyToInvalid,
														showClear: true,
														editable: true,
														filter: true,
														display: 'chip',
														placeholder: $t('ganttLabel.ChoosePersonInCharge'),
														optionGroupLabel: 'deptName',
														optionGroupChildren: 'items',
														optionLabel: 'username',
														optionValue: 'userID',
														class: 'persons',
														maxSelectedLabels: maxSelectedLabel.value,
														loading: personInCharge.value,
														options: formatUserList(userAll.value),
														modelValue: selectPersons.value,
														onUpdate: (value: any) => {
															if (value && value.length > 0) {

																const mergedArray = value.concat(selectPersons.value.filter((item: any) => !selectPersons.value.includes(item)));
																// console.log("mergedArray.length",mergedArray.length);
																// if (mergedArray.length >= (maxSelectedLabel.value)) {
																// 	toast.add({
																// 		severity: 'error',
																// 		detail: `常用联系人最多添加${ (maxSelectedLabel.value)  }人,请检查`,
																// 		summary: '错误',
																// 		group: 'br',
																// 		life: 3000,
																// 	});
																//} else {
																selectPersons.value = mergedArray;
																updateChargePerson(selectPersons.value);
																//}
															} else {
																selectPersons.value = value;
																updateChargePerson(selectPersons.value);
															}
														},
														onBeforeShow: async () => {
															userSelectType.value = 0;
															userPagination.pageSize = 1000;
															await getUser();
														},
													},
													{
														option: (scope: { option: any; selected: boolean; index: number }) => ui.factory.textSpan(`${scope.option.username ?? ''}`),
													}
												)
												: null,
											copyToUser.value?.length > 0
												? ui.factory.textSpan(copyToUser.value.map((item: any) => `${item.username ?? ''}(${item.customProperties?.$deptID ?? '-'})`).join(','), {
													tooltip: copyToUser.value.map((item: any) => `${item.username ?? ''}(${item.customProperties?.$deptID ?? '-'})`).join(','),
													tooltipPosition: 'bottom',
													class: 'max-w-48 white-nowrap word-ellipsis',
												})
												: null,
										],
									}
								),
							]),
							h('div', { class: 'selfFulldivBox' }, [
								ui.factory.buttonGroup(() => [
									ui.factory.button({
										id: 'searchButton',
										icon: 'pi pi-search',
										label: $t('view.search'),
										onAction: () => {
											getProScheduleR(props.ctx);
										},
									}),
									//重置按钮
									ui.factory.button({
										id: 'resetButton',
										icon: 'pi pi-refresh',
										severity: 'info',
										label: $t('action.reset'),
										onAction: () => {
											resetReloadParam();
										},
									}),

									showIssue.value == true
										? ui.factory.button({
											id: 'issue',
											icon: 'pi-list-check',
											severity: 'success',
											label: $t('ganttLabel.Release'),
											onAction: () => {
												cRelease(selectItem.selectData.id, selectItem.selectData, '');
											},
										})
										: null,
									// 老板说先不要这个按钮
									// multiSelectList.data.length > 0 && showAssign.value == true
									// 	? ui.factory.button({
									// 			id: 'setResponsiblePerson',
									// 			severity: 'info',
									// 			label: $t('ganttLabel.setResponsiblePerson'),
									// 			onAction: () => {
									// 				setResponsiblePerson();
									// 				// cRelease(selectItem.selectData.id, selectItem.selectData, '');
									// 			},
									// 	  })
									// 	: null,

									showPreparationPlan.value == true
										? ui.factory.button({
											id: 'prepare',
											icon: 'pi pi-pen-to-square',
											severity: 'success',
											label: $t('ganttLabel.materialPreparationPlan'),
											onAction: () => {
												getPrepare(props.ctx);
											},
										})
										: null,
									showDeliverables.value == true
										? ui.factory.button({
											id: 'importDeliverables',
											icon: 'pi pi-file-import',
											severity: 'info',
											label: $t('ganttLabel.importDeliverables'),
											onAction: () => {
												cImportDeliverables(selectItem.selectData.id, selectItem.selectData, '');
											},
										})
										: null,
									showExport.value == true
										? //导出
										ui.factory.button({
											id: 'exportGantt',
											icon: 'pi pi-file-export',
											severity: 'info',
											label: $t('ganttLabel.export'),
											onAction: () => {
												getGanntExcel();
											},
										})
										: null,
								]),
							]),
						]),
					])
					: '',
				h('div', { class: 'ganttBoxWrapper ganttBoxWrapper--project' }, [
					h('div', { ref: ganttBox, class: 'ganttBoxStyle ganttBoxInner project-schedule-view' }),
					ganttDataLoading.value
						? renderGanttLoadingState()
						: isGanttEmpty.value
							? renderGanttEmptyState($t('state.noData'))
							: null,
				]),
				isLoading.value == true
					? h(
						'div',
						{
							class: 'loadBg',
						},
						[
							h(
								'div',
								{
									class: 'loadEffectBox',
								},
								[
									h(
										'div',
										{
											class: 'loadEffect',
										},
										[h('span'), h('span'), h('span'), h('span'), h('span'), h('span'), h('span'), h('span')]
									),
								]
							),
						]
					)
					: '',
				// showAddBox.value == true
				// 	? h('div', { class: 'showBoxStyle' }, [

				// 			// h(ProjectGanttAdd, {
				// 			// 	gantt: transferTask?.task ?? null,
				// 			// 	ctx: props.ctx,
				// 			// 	onSaveUpData: (r: any) => {
				// 			// 		console.log('res', r);
				// 			// 		if (r === '1') {
				// 			// 			//await getSubSchedule(props.ctx, transferTask.task);
				// 			// 			//showAddBox.value = false;
				// 			// 		}
				// 			// 	},
				// 			// 	onCannelUpData:(r: any) => {
				// 			// 		showAddBox.value = false;
				// 			// 		console.log('showAddBox.value', showAddBox.value);
				// 			// 	},
				// 			// }),
				// 	  ])
				// 	: '',
			]);
		//: ''
	},
});
function t(arg0: string): import('@mmda/core').TranslateFn {
	throw new Error('Function not implemented.');
}
