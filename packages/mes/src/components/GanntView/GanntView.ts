/* eslint-disable vue/no-mutating-props */
import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, inject, PropType, toRefs, onUpdated, computed, type AppContext } from 'vue';
import { isRefNone, isString, MetaModel, type ApiClient, debounce, throttle, isNullOrUndefined, triggerEscKey } from '@mmda/core';
import './GanntView.less';

import '@mmda/vui-primevue/src/assets/animate.min.css';
import type { UiBuildContext } from '@mmda/vui';
import { uiBuilder } from '@/mes';
import { gantt, Link, Task } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { MES_KEY } from '@/keys';
import { getTaskData, getLinkRes, getProSub, taskData, linkRes, getBreaks, breakRes, proSub } from './ganntUpdate';
import {
	applyOrderScheduleGanttDefaultSort,
	sortOrderScheduleGanttFlatData,
} from './ganttOrderScheduleSortHelpers';
import { appendGanttTooltipFieldHtml, isAggregatedGanttTaskSummary, wrapGanttTooltipHtml } from './ganttTooltipHelpers';
import {
	applyScheduleGanttTaskDates,
	normalizeScheduleDateTime,
	normalizeScheduleDateTimeString,
	syncScheduleGanttTaskDates,
} from './ganttScheduleDateHelpers';
// 甘特图左侧表格宽度、列宽、分隔线拖拽（见 ganttResizeHelpers.ts）
import {
	applyGanttResponsiveLayout, // 按容器宽度写列宽、表头高度与紧凑样式类
	buildGanttScrollableLayout, // 构建左侧表格+分隔线+时间轴的 layout 配置
	getDefaultGanttGridPanelWidth, // 按分辨率计算左侧表格默认宽度
	getGanttGridColumnLayout, // 各列默认宽与表头高度
	getGanttGridPanelMaxWidth, // 左侧表格拖拽放大上限
	getGanttGridPanelMinWidth, // 左侧表格拖拽收缩下限（含第二列内容 min）
	getGanttOrderScheduleNameMinWidth, // 按生产订单第二列最小宽
	setupGanttViewportControls, // 响应式 + 分隔线/列宽拖拽 + ResizeObserver
	syncGanttDefaultGridPanelWidth, // 数据加载后同步第二列与左侧面板宽度
	type GanttResizeController, // 拖拽控制器，onUnmounted 时 destroy
} from './ganttResizeHelpers';
import {
	applyGanttProjectTaskRowHeight, // 按内容设置项目排程行高
	GANTT_PROJECT_SCHEDULE_DEFAULT_ROW_HEIGHT, // 项目排程默认行高（px）
	runGanttProjectRowHeightSync, // 批量同步行高并 DOM 复测
} from './ganttProjectRowHeightHelpers';
import {
	applyProjectScheduleTaskStatusFromSnapshot, // 从拖动前快照写回任务 status / statusType
	clearProjectScheduleTaskReadonly, // 清除任务 readonly，避免误锁整树拖动
	healProjectScheduleGanttLockState, // 校正锁定态：清 readonly + 同步 statusType
	isProjectScheduleTaskLocked, // 是否已完成/已取消（锁定不可拖）
	lockProjectScheduleLightboxForm, // 锁定 lightbox 表单控件为只读
	prepareProjectScheduleLoadedTask, // 加载子任务时克隆 customProperties 并同步状态
	removeLockedProjectScheduleTasksFromDragMultiple, // 多选拖动时剔除已锁定子任务
	restoreLockedProjectScheduleChildrenFromSnapshot, // 父级拖动后按快照还原锁定子任务日期
	restoreLockedProjectScheduleTaskDragCopy, // 拖动中把锁定任务 copy 还原为拖前日期
	shouldSkipProjectScheduleChildCascade, // drag_project 已联动时跳过子任务二次位移
	snapshotProjectScheduleOriData, // 拖动前快照根节点及子树日期/状态
	PROJECT_SCHEDULE_TASK_LOCKED_CLASS, // 锁定任务 CSS class 名
} from './ganttProjectScheduleLockHelpers';
import {
	preserveGanttTaskColorIfLightboxEmpty,
	resolveGanttTaskOriginalColor,
} from './ganttTaskColorHelpers';
import { TaskConstraintTypeEnum } from '@mmda/base/src/enums/TaskConstraintType';
import { TaskLevel, TaskLevelEnum } from '@mmda/base/src/enums/TaskLevel';
import { TaskRelationshipEnum } from '@mmda/base/src/enums/TaskRelationship';
import GanttPlanning, {
	resetGanttPlanningShell,
	type GanttPlanningShell,
} from '@/components/GanntView/GanttPlanning';
// 齐料检查
import ComputeKitting from './ComputeKitting';
// import { pid } from 'process';
export default defineComponent({
	name: 'GanntView',
	props: {
		ctx: Object as PropType<UiBuildContext<any>>,
		tasks: Object as any,
		skin: String, //甘特图模版
		// scheduleroleaction: Object as any, //权限
	},
	emits: [], //'changeTask', 'changeLink', 'subPlanning', 'changeBreak'
	setup(props, ctx) {
		let oriData: any = ''; //记录拖动之前的数据
		let pID: any; //地址栏带过来的 projectID
		const roleaction = props.ctx.globalProps.$app.context.modules;
		const selectLine = ref();
		const ganttBox = ref();
		let ganttResizeController: GanttResizeController | null = null; // 分隔线/列宽拖拽与窗口 resize 监听
		const skinType = ref(''); //皮肤
		const showLoading = ref(true);
		const ganttDataLoading = ref(false);
		const lineDataKEY = ref('lineID');
		const projecDataKEY = ref('projectID');
		const linecolumns = ref([]);
		/** 外层项目下拉 options（与弹窗列表隔离） */
		const lineData = ref<any[]>([]);
		/** 弹窗内项目搜索列表 */
		const projectDialogData = ref<any[]>([]);
		const projectDialogPager = ref<any>({
			pageSize: 10,
			pageNo: 1,
		});

		const selectgProjectSearchword = ref();
		const selectgProjectIsComposing = ref(false);
		const selectgProject = ref();
		const temporarilySelect = ref(); //临时的选中的项目
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
			const idx = lineData.value.findIndex((item: any) => item.projectID == selected.projectID);
			if (idx < 0) {
				lineData.value = [{ ...selected }, ...lineData.value];
			} else {
				lineData.value.splice(idx, 1, { ...selected });
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
		const statusListOptions = ref(<any>[]); //项目状态枚举
		const orderStatusListOptions = ref(<any>[]); //订单状态枚举
		const selectStatus = ref(); //选中的status
		/** 排程视图：project=按项目，order=按生产订单（接口 projectID 传 IS NULL） */
		const scheduleViewMode = ref<'project' | 'order'>('project');
		const canReadProject = ref(false); // 项目模块读取权限
		const canReadProductionOrder = ref(false); // 生产订单模块读取权限
		const showScheduleViewModeToggle = ref(false); // 两种权限都有时才显示切换
		const showProjectFilter = ref(false);
		// 按生产订单筛选（交互与项目筛选一致）
		const orderDataKEY = ref('orderID');
		/** 外层下拉 options（与弹窗列表隔离，避免弹窗搜索冲掉已选导致 [object Object]） */
		const orderData = ref<any[]>([]);
		/** 弹窗内搜索列表，仅供选订单弹窗使用 */
		const orderDialogData = ref<any[]>([]);
		const orderDialogPager = ref<any>({
			pageSize: 10,
			pageNo: 1,
		});
		const selectgOrderSearchword = ref();
		const selectgOrderIsComposing = ref(false);
		const selectgOrder = ref();
		const temporarilySelectOrder = ref();
		/** 归一化当前已选订单（兼容历史误存为数组） */
		const resolveSelectedOrder = () => {
			const raw =
				selectgOrderSearchword.value ?? selectgOrder.value ?? temporarilySelectOrder.value ?? null;
			if (Array.isArray(raw)) {
				return raw[0] ?? null;
			}
			return raw && typeof raw === 'object' ? raw : null;
		};
		/** 保证外层 Select 的 options 含当前选中项（按 orderID 对齐 modelValue） */
		const ensureSelectedOrderInOuterOptions = () => {
			const selected = resolveSelectedOrder();
			// 已清空筛选时不要把旧对象写回（避免 onInput 防抖把清除结果冲掉）
			if (!selected?.orderID || !reloadParam.orderID) {
				return;
			}
			if (String(selected.orderID) !== String(reloadParam.orderID)) {
				return;
			}
			selectgOrderSearchword.value = selected;
			selectgOrder.value = selected;
			temporarilySelectOrder.value = selected;
			const idx = orderData.value.findIndex((item: any) => item.orderID == selected.orderID);
			if (idx < 0) {
				orderData.value = [{ ...selected }, ...orderData.value];
			} else {
				orderData.value.splice(idx, 1, { ...selected });
				orderData.value = [...orderData.value];
			}
		};
		/** 持久化生产订单筛选；清空时 delete，避免 put(null) 在部分存储下残留 */
		const persistOrderFilterCache = (value: any) => {
			const key = `search/${props.ctx.logic.repository}/orderID`;
			if (value?.orderID) {
				props.ctx.app.localDb.put(key, JSON.parse(JSON.stringify(value)));
			} else {
				props.ctx.app.localDb.delete(key);
			}
		};
		/** 清空生产订单筛选（内存 + 本地缓存） */
		const clearProductionOrderFilter = () => {
			selectgOrderSearchword.value = null;
			selectgOrder.value = null;
			temporarilySelectOrder.value = null;
			reloadParam.orderID = '';
			pID = '';
			multiSelectList.data = [];
			selectStatus.value = [];
			reloadParam.status = '';
			persistOrderFilterCache(null);
		};
		/** 应用生产订单筛选选中值 */
		const applyProductionOrderFilter = (value: any) => {
			if (!value?.orderID) {
				clearProductionOrderFilter();
				return;
			}
			selectgOrderSearchword.value = value;
			selectgOrder.value = value;
			temporarilySelectOrder.value = value;
			reloadParam.orderID = value.orderID;
			pID = '';
			multiSelectList.data = [];
			persistOrderFilterCache(value);
			ensureSelectedOrderInOuterOptions();
		};

		const isLoading = ref(false);
		/** 按项目/按生产订单切换中，用于 loading 与禁用切换按钮 */
		const scheduleViewModeSwitching = ref(false);

		//甘特图 数据字典
		const threeMep = reactive({
			data: <any>[],
		});
		// ========== 甘特图任务 id 规范化（避免与根节点 0 冲突） ==========
		/**
		 * 将业务 id 转为甘特图安全 id。
		 * dhtmlx-gantt 根节点 id 固定为 0；若任务 id 也为 0 且 parent 为 0，会报 Cyclic reference on task 0。
		 */
		const toGanttTaskId = (id: any) => (id === 0 || id === '0' ? 'project_0' : id);
		/** getAllSchedule 查询参数：projectID 为 0 时传 IS NULL（后端表示未关联项目），勿传字面量 0 */
		const toScheduleProjectIDQuery = (projectID: any) => (projectID === 0 || projectID === '0' ? 'IS NULL' : projectID);
		const isOrderScheduleView = () => scheduleViewMode.value === 'order';
		/**
		 * 是否为「订单」行（子订单/父订单）。
		 * 按生产订单、按项目均适用；任务等其它类型返回 false。
		 */
		const isScheduleOrderEntity = (task: any) => {
			if (!task || task.refName === 'loadMore' || task.refName === 'ProductionTask') {
				return false;
			}
			if (task.refName === 'ProductionOrder') {
				return true;
			}
			// 按生产订单：列表汇总行 refName 常为 Project，但带 orderID
			if (isOrderScheduleView() && task.refName === 'Project' && task.orderID) {
				return true;
			}
			return false;
		};
		/**
		 * 是否仍强制「子开始 >= 父开始」。
		 * 按生产订单 / 按项目：子订单允许早于父订单开始（含拖拽）；其余原逻辑不变。
		 */
		const shouldClampStartToParentStart = (task: any, parent: any) => {
			if (!parent || !task) {
				return false;
			}
			if (isScheduleOrderEntity(task)) {
				return false;
			}
			return true;
		};
		const getScheduleRowKey = (item: any) => (isOrderScheduleView() ? item.orderID : item.projectID);
		/** 组装 getAllProjectSchedule（按项目）/ 导出 查询参数 */
		const buildScheduleQueryParams = () => {
			const dateFilter = {
				expectedStart: reloadParam.expectedStart || '',
				expectedFinish: reloadParam.expectedFinish || '',
			};
			if (isOrderScheduleView()) {
				return {
					searchWord: reloadParam.searchWord,
					status: reloadParam.status,
					//scheduleType: reloadParam.scheduleType,
					projectID: 'IS NULL',
					orderID: reloadParam.orderID ?? '',
					...dateFilter,
				};
			}
			return {
				searchWord: reloadParam.searchWord,
				status: reloadParam.status,
				//scheduleType: reloadParam.scheduleType,
				projectID: reloadParam.projectID ?? '',
				orderID: '',
				...dateFilter,
			};
		};
		/** 按生产订单：getAllSchedule 查询参数（与上方筛选一致） */
		const buildOrderScheduleApiParams = () => ({
			searchWord: reloadParam.searchWord,
			status: reloadParam.status,
			projectID: 'IS NULL',
			orderID: reloadParam.orderID ?? '',
			expectedStart: reloadParam.expectedStart || '',
			expectedFinish: reloadParam.expectedFinish || '',
		});
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
		const resolveScheduleTaskLevel = (task: any) => {
			if (!task || task.refName === 'Project' || task.refName === 'loadMore') {
				return null;
			}
			const taskLevel = Number(task.taskLevel);
			if (taskLevel === TaskLevelEnum.TASK_VALUE || task.taskLevel === TaskLevel.TASK) {
				return TaskLevel.TASK;
			}
			if (taskLevel === TaskLevelEnum.PHASE_VALUE || task.taskLevel === TaskLevel.PHASE) {
				return TaskLevel.PHASE;
			}
			if (taskLevel === TaskLevelEnum.WORK_PACKAGE_VALUE || task.taskLevel === TaskLevel.WORK_PACKAGE) {
				return TaskLevel.WORK_PACKAGE;
			}
			const levelText = task.customProperties?.$taskLevel;
			if (levelText === TaskLevelEnum.TASK_TEXT || levelText === TaskLevel.TASK) {
				return TaskLevel.TASK;
			}
			if (task.refName === 'ProductionTask') {
				return TaskLevel.TASK;
			}
			return null;
		};
		/** 连线类型：项目 / 订单 / 任务（及阶段、工作包） */
		const getScheduleLinkKind = (
			task: any
		): 'project' | 'order' | 'task' | 'phase' | 'workPackage' | null => {
			if (!task || task.refName === 'loadMore') {
				return null;
			}
			if (isOrderScheduleView()) {
				// 按生产订单：列表汇总行 refName 常为 Project，按订单处理
				if (task.refName === 'ProductionTask' || resolveScheduleTaskLevel(task) === TaskLevel.TASK) {
					return 'task';
				}
				if (
					task.refName === 'ProductionOrder' ||
					task.refName === 'Project' ||
					task.orderID
				) {
					return 'order';
				}
				return null;
			}
			// 按项目
			if (task.refName === 'Project') {
				return 'project';
			}
			if (task.refName === 'ProductionOrder') {
				return 'order';
			}
			if (task.refName === 'ProductionTask' || resolveScheduleTaskLevel(task) === TaskLevel.TASK) {
				return 'task';
			}
			const level = resolveScheduleTaskLevel(task);
			if (level === TaskLevel.PHASE) {
				return 'phase';
			}
			if (level === TaskLevel.WORK_PACKAGE) {
				return 'workPackage';
			}
			return null;
		};
		const canManualLinkScheduleTask = (task: any) => getScheduleLinkKind(task) != null;
		const isSameScheduleLinkScope = (fromTask: any, toTask: any) => {
			if (isOrderScheduleView()) {
				return String(fromTask?.parent ?? '') === String(toTask?.parent ?? '');
			}
			return !!fromTask?.projectID && fromTask.projectID === toTask?.projectID;
		};
		const showScheduleLinkError = (toast: any, summary: string) => {
			toast.add({
				severity: 'error',
				summary,
				group: 'br',
				life: 5000,
			});
		};
		const validateManualScheduleLink = (fromTask: any, toTask: any, toast: any, $t: any) => {
			if (fromTask?.refName === 'loadMore' || toTask?.refName === 'loadMore') {
				return false;
			}
			const fromKind = getScheduleLinkKind(fromTask);
			const toKind = getScheduleLinkKind(toTask);
			if (!fromKind || !toKind) {
				showScheduleLinkError(toast, '级别不同不能进行链接操作。');
				return false;
			}
			// 项目与项目
			if (fromKind === 'project' && toKind === 'project') {
				showScheduleLinkError(toast, '项目之间不能进行链接操作。');
				return false;
			}
			// 订单与订单
			if (fromKind === 'order' && toKind === 'order') {
				showScheduleLinkError(toast, '订单与订单之间不能进行链接操作。');
				return false;
			}
			// 不同级别（含 项目↔订单/任务、订单↔任务、阶段↔任务 等）
			if (fromKind !== toKind) {
				showScheduleLinkError(toast, '级别不同不能进行链接操作。');
				return false;
			}
			// 仅任务级允许成功连线（阶段/工作包等同级也不开放）
			if (fromKind !== 'task') {
				showScheduleLinkError(toast, '级别不同不能进行链接操作。');
				return false;
			}
			// 相同级别任务：校验作用域与父级
			if (isOrderScheduleView()) {
				if (String(fromTask?.parent ?? '') !== String(toTask?.parent ?? '')) {
					showScheduleLinkError(toast, $t('invalid.differentSuperior'));
					return false;
				}
				return true;
			}
			// 按项目：须同一项目
			if (!isSameScheduleLinkScope(fromTask, toTask)) {
				showScheduleLinkError(toast, $t('invalid.differentProject'));
				return false;
			}
			if (String(fromTask?.parent ?? '') !== String(toTask?.parent ?? '')) {
				showScheduleLinkError(toast, $t('invalid.differentSuperior'));
				return false;
			}
			return true;
		};
		/** tooltip 是否按「订单」类型展示数量字段 */
		const isScheduleTooltipOrderRow = (task: any) => {
			if (!task || task.refName === 'loadMore') {
				return false;
			}
			if (task.refName === 'ProductionOrder') {
				return true;
			}
			// 按生产订单视图下汇总行 refName 常为 Project
			if (isOrderScheduleView() && task.refName === 'Project' && task.orderID) {
				return true;
			}
			return false;
		};
		const getScheduleTooltipFieldLabel = (itemFields: any, task?: any) => {
			if (itemFields.fieldName === 'productCategoryID') {
				return '制品类别';
			}
			if (itemFields.fieldName === 'taskSummary') {
				return '简述';
			}
			// 订单行：任务数量 → 订单数量
			if (
				isScheduleTooltipOrderRow(task) &&
				(itemFields.fieldName === 'taskQuantity' || itemFields.displayLabel === '任务数量')
			) {
				return '订单数量';
			}
			return itemFields.displayLabel;
		};
		const getScheduleTaskNo = (task: any) => String(task?.taskNo ?? '').trim();
		const getSchedulePriorityLabel = (task: any) => task?.customProperties?.$priority ?? '';
		/** 按类型（refName）解析编号：项目→projectNo，订单→orderNo，任务→taskNo */
		const getScheduleTypeNoInfo = (task: any): { label: string; value: string } | null => {
			if (!task || task.refName === 'loadMore') {
				return null;
			}
			if (task.refName === 'Project') {
				const value = String(task.projectNo ?? task.project?.projectNo ?? '').trim();
				return value ? { label: '项目编号', value } : null;
			}
			if (task.refName === 'ProductionOrder') {
				const value = String(
					task.orderNo ?? task.order?.orderNo ?? task.customProperties?.$orderNo ?? task.taskNo ?? ''
				).trim();
				return value ? { label: '订单编号', value } : null;
			}
			if (task.refName === 'ProductionTask') {
				const value = getScheduleTaskNo(task);
				return value ? { label: '任务编号', value } : null;
			}
			return null;
		};
		/** 生产订单筛选框选中后的展示：订单编号/制品名称 */
		const formatProductionOrderSelectLabel = (order: any) => {
			if (!order) {
				return '';
			}
			const orderNo = String(order.orderNo ?? '').trim();
			const productName = String(
				order.productName ?? order.customProperties?.$productName ?? ''
			).trim();
			return [orderNo, productName].filter(Boolean).join('/');
		};
		const shouldSkipScheduleTooltipTypeField = (task: any, fieldName: string) => {
			if (!task || task.refName === 'loadMore') {
				return false;
			}
			if (fieldName === 'projectNo' && task.refName === 'Project') {
				return true;
			}
			if (fieldName === 'taskNo') {
				return true;
			}
			if (fieldName === 'orderNo' && task.refName === 'ProductionOrder') {
				return true;
			}
			return false;
		};
		const shouldSkipScheduleTooltipSummaryField = (task: any) => {
			if (isOrderScheduleView()) {
				return true;
			}
			if (isAggregatedGanttTaskSummary(task?.taskSummary)) {
				return true;
			}
			return false;
		};
		const isScheduleOrderSummaryRow = (task: any) => {
			if (!task || task.refName === 'loadMore') {
				return false;
			}
			if (task.refName === 'ProductionOrder' || task.refName === 'Project') {
				return true;
			}
			return false;
		};
		const isScheduleOrderTaskRow = (task: any) =>
			isOrderScheduleView() && task?.refName === 'ProductionTask';
		const SCHEDULE_DEFAULT_ROW_HEIGHT = 35;
		/** 与 GanntView.less 中 padding-top/bottom 保持一致 */
		const SCHEDULE_ROW_PAD_Y = 6;
		const SCHEDULE_ROW_PADDING = SCHEDULE_ROW_PAD_Y * 2;
		const SCHEDULE_TASK_ROW_PAD_Y = 6;
		const SCHEDULE_TASK_ROW_PADDING = SCHEDULE_TASK_ROW_PAD_Y * 2;
		const SCHEDULE_ORDER_ROW_MIN = 48;
		const SCHEDULE_TASK_ROW_MIN = 36;
		const SCHEDULE_NAME_LINE_HEIGHT = 18;
		const SCHEDULE_TASK_LINE_HEIGHT = 18;
		const SCHEDULE_ORDER_NO_LINE_HEIGHT = 16;
		const estimateScheduleTaskRowHeight = (item: any) => {
			if (getScheduleTypeNoInfo(item)) {
				return Math.max(
					SCHEDULE_TASK_ROW_MIN,
					SCHEDULE_TASK_LINE_HEIGHT + 2 + SCHEDULE_ORDER_NO_LINE_HEIGHT + SCHEDULE_TASK_ROW_PADDING
				);
			}
			return SCHEDULE_TASK_ROW_MIN;
		};
		const estimateScheduleOrderSummaryRowHeight = () =>
			Math.max(
				SCHEDULE_ORDER_ROW_MIN,
				SCHEDULE_NAME_LINE_HEIGHT + 2 + SCHEDULE_ORDER_NO_LINE_HEIGHT + SCHEDULE_ROW_PADDING
			);
		const isScheduleOrderSingleLineRow = (task: any) => {
			if (!isOrderScheduleView() || !task) {
				return false;
			}
			if (task.refName === 'loadMore') {
				return true;
			}
			return !getScheduleTypeNoInfo(task);
		};
		/** 首屏渲染前的估算行高，渲染后按 DOM 实测修正 */
		const applyScheduleOrderRowHeight = (item: any) => {
			if (!isOrderScheduleView()) {
				delete item.row_height;
				return;
			}
			if (item.refName === 'loadMore' || isScheduleOrderSingleLineRow(item)) {
				item.row_height = SCHEDULE_TASK_ROW_MIN;
				return;
			}
			if (isScheduleOrderSummaryRow(item)) {
				item.row_height = estimateScheduleOrderSummaryRowHeight();
				return;
			}
			item.row_height = estimateScheduleTaskRowHeight(item);
		};
		const readScheduleDomContentHeight = (element: HTMLElement | null) => {
			if (!element) {
				return 0;
			}
			const style = window.getComputedStyle(element);
			const prevOverflow = element.style.overflow;
			const prevWhiteSpace = element.style.whiteSpace;
			if (style.overflow === 'hidden' || style.whiteSpace === 'nowrap') {
				element.style.overflow = 'visible';
				element.style.whiteSpace = 'normal';
			}
			const height = Math.ceil(Math.max(element.scrollHeight, element.offsetHeight, element.getBoundingClientRect().height));
			element.style.overflow = prevOverflow;
			element.style.whiteSpace = prevWhiteSpace;
			return height;
		};
		const refreshScheduleGridRowLayout = () => {
			const gridView = gantt.$ui?.getView?.('grid');
			if (gridView && typeof gridView.refresh === 'function') {
				gridView.refresh();
			}
			gantt.render();
		};
		const commitScheduleTaskRowHeight = (task: any, height: number) => {
			if (!task || Math.abs((task.row_height ?? gantt.config.row_height) - height) <= 1) {
				return false;
			}
			task.row_height = height;
			if (typeof gantt.updateTask === 'function' && gantt.isTaskExists(task.id)) {
				gantt.updateTask(task.id, task);
			}
			return true;
		};
		/** 按 DOM 实测任务行高度 */
		const measureScheduleRowHeightFromDom = (row: HTMLElement, task?: any) => {
			const isSummary = task ? isScheduleOrderSummaryRow(task) : false;
			const isSingleLine = task ? isScheduleOrderSingleLineRow(task) : false;
			const rowPadding = isSummary && !isSingleLine ? SCHEDULE_ROW_PADDING : SCHEDULE_TASK_ROW_PADDING;
			if (isSummary && !isSingleLine) {
				return estimateScheduleOrderSummaryRowHeight();
			}
			let contentHeight = 0;

			const nameCell =
				(row.querySelector('.gantt_cell[data-column-name="projectName"]') as HTMLElement | null) ??
				(row.querySelector('.gantt_cell:nth-child(2)') as HTMLElement | null);
			if (nameCell) {
				const treeContent = nameCell.querySelector('.gantt_tree_content') as HTMLElement | null;
				if (treeContent) {
					const statusWrap = treeContent.querySelector('.errorImportant, .waringImportant') as HTMLElement | null;
					const measureTarget = statusWrap ?? treeContent;
					contentHeight = Math.max(contentHeight, readScheduleDomContentHeight(measureTarget));
				}
			}

			const typeBadge = row
				.querySelector('.gantt_cell:nth-child(1) .gantt_tree_content') as HTMLElement | null;
			if (typeBadge) {
				contentHeight = Math.max(contentHeight, Math.ceil(typeBadge.offsetHeight));
			}

			return contentHeight + rowPadding;
		};
		const measureAndSyncScheduleRowHeightsFromDom = () => {
			if (!isOrderScheduleView()) {
				return false;
			}
			let changed = false;
			gantt.eachTask((task: any) => {
				const row = gantt.getTaskRowNode(task.id) as HTMLElement | null;
				if (!row) {
					return;
				}
				const isSummary = isScheduleOrderSummaryRow(task);
				const measured = measureScheduleRowHeightFromDom(row, task);
				const minHeight = isScheduleOrderSingleLineRow(task)
					? SCHEDULE_TASK_ROW_MIN
					: isSummary
						? SCHEDULE_ORDER_ROW_MIN
						: SCHEDULE_TASK_ROW_MIN;
				const newHeight = Math.max(minHeight, measured);
				if (commitScheduleTaskRowHeight(task, newHeight)) {
					changed = true;
				}
			});
			return changed;
		};
		const escapeScheduleCellAttr = (value: string) =>
			String(value ?? '')
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;');
		const formatScheduleNameCell = (task: any, statusSuffix = '') => {
			const name = task.projectName ?? task.productName ?? '';
			const nameLine = `${name}${statusSuffix}`;
			const typeNo = getScheduleTypeNoInfo(task);
			if (!typeNo) {
				return `<div class="schedule-order-single-name-cell"><div class="schedule-order-name-line schedule-order-name" title="${escapeScheduleCellAttr(nameLine)}">${nameLine}</div></div>`;
			}
			const isTaskRow = task.refName === 'ProductionTask';
			const subLineClass = isTaskRow ? 'schedule-task-no-line schedule-task-no' : 'schedule-order-no-line schedule-order-no';
			const cellClass = isTaskRow ? 'schedule-order-name-cell schedule-order-task-name-cell' : 'schedule-order-name-cell';
			return `<div class="${cellClass}"><div class="schedule-order-name-line schedule-order-name" title="${escapeScheduleCellAttr(nameLine)}">${nameLine}</div><div class="${subLineClass}" title="${escapeScheduleCellAttr(typeNo.value)}">${typeNo.value}</div></div>`;
		};
		const applyScheduleTaskRowHeight = (item: any) => {
			if (isOrderScheduleView()) {
				applyScheduleOrderRowHeight(item);
			} else {
				applyGanttProjectTaskRowHeight(item);
			}
		};
		const syncOrderScheduleGanttSort = () => {
			if (isOrderScheduleView()) {
				applyOrderScheduleGanttDefaultSort(gantt);
			}
		};
		const syncScheduleRowHeights = () => {
			if (isOrderScheduleView()) {
				syncScheduleOrderRowHeights();
			} else {
				runGanttProjectRowHeightSync(gantt, nextTick);
			}
		};
		/** 生产排程：allowEdit + 非锁定；不含 ProjectGanttView 的负责人链 isHaveRoleaction */
		const canGanttScheduleTaskEdit = (task: any): boolean => {
			if (!task || task.refName == 'loadMore' || task.refName == 'Project') {
				return false;
			}
			if (scheduleroleaction?.authority?.allowEdit != true) {
				return false;
			}
			if (isProjectScheduleTaskLocked(task)) {
				return false;
			}
			return true;
		};
		let ganttScheduleLightboxCanEdit = true;
		/** parse/刷新数据后：nextTick 内收紧第二列并重算左侧表格宽度 */
		const syncGanttGridWidthAfterData = () => {
			nextTick(() => {
				syncGanttDefaultGridPanelWidth(gantt, ganttBox.value);
			});
		};
		const applyScheduleViewGridLayout = () => {
			gantt.config.row_height = isOrderScheduleView()
				? SCHEDULE_DEFAULT_ROW_HEIGHT
				: GANTT_PROJECT_SCHEDULE_DEFAULT_ROW_HEIGHT;
			ganttBox.value?.classList.toggle('order-schedule-view', isOrderScheduleView());
			ganttBox.value?.classList.toggle('project-schedule-view', !isOrderScheduleView());
			// 暗黑：供 GanntView.less 中 .schedule-gantt-dark 命中订单/任务列强制浅色字
			ganttBox.value?.classList.toggle('schedule-gantt-dark', mes.context?.isDark === true);
			const nameCol = gantt.config.columns?.find((c: any) => c.name === 'projectName');
			if (nameCol && isOrderScheduleView() && ganttBox.value) {
				nameCol.min_width = getGanttOrderScheduleNameMinWidth(ganttBox.value.clientWidth);
			}
		};
		const syncScheduleOrderRowHeights = () => {
			if (!isOrderScheduleView()) {
				return;
			}
			const applyAll = () => {
				gantt.eachTask((task: any) => {
					applyScheduleOrderRowHeight(task);
				});
			};
			if (typeof gantt.batchUpdate === 'function') {
				gantt.batchUpdate(applyAll);
			} else {
				applyAll();
			}
			refreshScheduleGridRowLayout();
			nextTick(() => {
				let pass = 0;
				const remeasure = () => {
					if (pass >= 6) {
						return;
					}
					const changed = measureAndSyncScheduleRowHeightsFromDom();
					if (changed) {
						pass += 1;
						refreshScheduleGridRowLayout();
						nextTick(remeasure);
					}
				};
				requestAnimationFrame(() => {
					remeasure();
				});
			});
		};
		const getScheduleNameColumnLabel = () =>
			isOrderScheduleView() ? $t('ganttLabel.orderTask') : $t('ganttLabel.projectTask');
		const updateScheduleNameColumnLabel = () => {
			const col = gantt.config.columns?.find((c: any) => c.name === 'projectName');
			if (col) {
				col.label = getScheduleNameColumnLabel();
			}
			applyScheduleViewGridLayout();
			gantt.render();
		};
		const getScheduleTooltipFieldValue = (task: any, itemFields: any) => {
			const customProperties = task?.customProperties ?? {};
			if (itemFields.fieldName === 'productCategoryID') {
				return task?.productCategory?.categoryName ?? '';
			}
			if (itemFields.fieldName === 'productName') {
				return task.productName ?? '';
			}
			if (itemFields.fieldName === 'taskNo') {
				return getScheduleTaskNo(task);
			}
			// 订单行数量优先取 orderQuantity
			if (
				isScheduleTooltipOrderRow(task) &&
				(itemFields.fieldName === 'taskQuantity' || itemFields.displayLabel === '任务数量')
			) {
				const qty = task.orderQuantity ?? task.taskQuantity;
				return qty == null ? '' : qty;
			}
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
		/** 将 getAllSchedule 返回的 tasks/links 转为甘特图数据（展开子任务时使用） */
		const resolveScheduleGanttParent = (parentTaskID: any, idSet: Set<string>, tasksByTaskId: Map<string, any>) => {
			if (parentTaskID === 0 || parentTaskID === '0' || !parentTaskID) {
				return 0;
			}
			let current = parentTaskID;
			const visited = new Set<string>();
			while (current && current !== 0 && current !== '0') {
				const key = String(current);
				if (visited.has(key)) {
					return 0;
				}
				visited.add(key);
				const ganttParentId = toGanttTaskId(current);
				if (idSet.has(ganttParentId)) {
					return ganttParentId;
				}
				const parentTask = tasksByTaskId.get(key);
				current = parentTask?.parentTaskID;
			}
			return 0;
		};
		const getScheduleSuperOrderID = (item: any) => {
			if (!item) {
				return null;
			}
			return (
				item.superOrderID ??
				item.superOrder?.orderID ??
				item.order?.superOrderID ??
				item.order?.superOrder?.orderID ??
				item.customProperties?.$superOrderID ??
				null
			);
		};
		const buildOrderScheduleIdMaps = (tasks: any[]) => {
			const orderIdToGanttId = new Map<string, string>();
			const orderNoToGanttId = new Map<string, string>();
			tasks.forEach((item) => {
				if (item.orderID) {
					orderIdToGanttId.set(String(item.orderID), String(item.id));
				}
				const orderNo = item.orderNo ?? item.refNo ?? item.order?.orderNo;
				if (orderNo) {
					orderNoToGanttId.set(String(orderNo), String(item.id));
				}
			});
			return { orderIdToGanttId, orderNoToGanttId };
		};
		/** 按生产订单：解析子订单父节点（支持 superOrderID / parentTaskID 为 orderID） */
		const resolveOrderScheduleTaskParent = (
			item: any,
			raw: any,
			idSet: Set<string>,
			tasksByTaskId: Map<string, any>,
			orderIdToGanttId: Map<string, string>
		) => {
			const parent = resolveScheduleGanttParent(item.parentTaskID, idSet, tasksByTaskId);
			if (parent && parent !== 0) {
				return parent;
			}
			const superOrderID = getScheduleSuperOrderID(raw) ?? getScheduleSuperOrderID(raw?.order);
			if (superOrderID) {
				const parentBySuperOrder = orderIdToGanttId.get(String(superOrderID));
				if (parentBySuperOrder && parentBySuperOrder !== String(item.id)) {
					return parentBySuperOrder;
				}
			}
			if (item.parentTaskID) {
				const parentByOrderId = orderIdToGanttId.get(String(item.parentTaskID));
				if (parentByOrderId && parentByOrderId !== String(item.id)) {
					return parentByOrderId;
				}
			}
			return 0;
		};
		const applyOrderScheduleTaskFields = (item: any, raw: any) => {
			item.orderNo = item.orderNo ?? raw?.orderNo ?? raw?.order?.orderNo ?? null;
			item.orderID = item.orderID ?? raw?.orderID ?? raw?.order?.orderID ?? null;
			if (item.refName === 'ProductionOrder' || isOrderScheduleView()) {
				applyScheduleOrderRowHeight(item);
			} else {
				applyScheduleTaskRowHeight(item);
			}
		};
		/** 按生产订单：子订单挂到主订单（superOrderID）下 */
		const resolveOrderScheduleParent = (
			superOrderID: any,
			orderIdSet: Set<string>,
			ordersByOrderId: Map<string, any>
		) => {
			if (superOrderID === 0 || superOrderID === '0' || !superOrderID) {
				return 0;
			}
			let current = superOrderID;
			const visited = new Set<string>();
			while (current && current !== 0 && current !== '0') {
				const key = String(current);
				if (visited.has(key)) {
					return 0;
				}
				visited.add(key);
				const ganttParentId = toGanttTaskId(current);
				if (orderIdSet.has(ganttParentId)) {
					return ganttParentId;
				}
				const parentOrder = ordersByOrderId.get(key);
				current = getScheduleSuperOrderID(parentOrder);
			}
			return 0;
		};
		const mapAllScheduleFromResponse = (list: any) => {
			const rawTasks = list?.tasks ?? [];
			const tasksByTaskId = new Map<string, any>(rawTasks.map((item: any) => [String(item.taskID), item]));
			const data = rawTasks.map((item: any) => {
				const raw = item;
				item.id = toGanttTaskId(item.taskID);
				item.text = item.productName;
				item.ownerName = item.customProperties?.$ownerID ?? '';
				item.ownerDept = item.customProperties?.$ownerDeptID ?? '';
				item.projectName = item.productName;
				item.type = item.milestone ? gantt.config.types.milestone : null;
				item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
				applyScheduleGanttTaskDates(item, gantt);
				item.statusType = item.customProperties?.$status;
				item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
				item.color = '#' + item.taskColor;
				item.constraint_type = item.customProperties?.$constraintType;
				if (isOrderScheduleView()) {
					applyOrderScheduleTaskFields(item, raw);
				} else {
					applyScheduleTaskRowHeight(item);
				}
				if (item.refName === 'ProductionTask') {
					prepareProjectScheduleLoadedTask(item);
				}
				return item;
			});
			const idSet = new Set<string>(data.map((item: any) => String(item.id)));
			const { orderIdToGanttId } = isOrderScheduleView() ? buildOrderScheduleIdMaps(data) : { orderIdToGanttId: new Map() };
			data.forEach((item: any) => {
				const raw = tasksByTaskId.get(String(item.taskID));
				if (isOrderScheduleView()) {
					item.parent = resolveOrderScheduleTaskParent(item, raw, idSet, tasksByTaskId, orderIdToGanttId);
				} else {
					item.parent = resolveScheduleGanttParent(item.parentTaskID, idSet, tasksByTaskId);
				}
			});
			const links = (list?.links ?? []).map((linkItem: any) => {
				linkItem.id = linkItem.relationID;
				linkItem.source = toGanttTaskId(linkItem.fromTaskID);
				linkItem.target = toGanttTaskId(linkItem.toTaskID);
				linkItem.type = TaskRelationshipEnum.valueOf(linkItem.relationType);
				linkItem.getLoad = true;
				return linkItem;
			});
			const sortedData = isOrderScheduleView() ? sortOrderScheduleGanttFlatData(data) : data;
			return { data: sortedData, links };
		};
		const getStatusCacheKey = () => (isOrderScheduleView() ? 'orderStatus' : 'status');
		const mapScheduleListFromResponse = (list: any[], t: (key: string) => string) => {
			threeMep.data = [];
			const originalArray = JSON.parse(JSON.stringify(list));
			const newArrayList = list.map((item: any) => {
				const rowKey = getScheduleRowKey(item);
				item.id = toGanttTaskId(rowKey);
				delete item.parent;
				item.ownerName = item.customProperties?.$ownerID ?? '';
				item.ownerDept = item.customProperties?.$ownerDeptID ?? '';
				if (isOrderScheduleView()) {
					const label = item.orderSummary ?? `${item.orderNo ?? ''}_${item.productName ?? ''}`.replace(/^_|_$/g, '');
					item.text = label;
					item.projectName = label;
					item.taskID = item.orderID;
				} else {
					item.text = item.projectName + '_' + item.projectNo;
					item.projectName = item.projectName + '_' + item.projectNo;
					item.taskNo = item.projectNo;
					item.taskID = item.projectID;
				}
				item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
				item.type = item.milestone ? gantt.config.types.milestone : null;
				applyScheduleGanttTaskDates(item, gantt);
				item.statusType = item.customProperties?.$status;
				item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
				item.color = '#' + item.taskColor;
				item.constraint_type = item.customProperties?.$constraintType;
				item.isLoadingChildren = true;
				item.refName = 'Project';
				item.isRead = false;
				applyScheduleTaskRowHeight(item);
				threeMep.data.push({
					key: rowKey,
					value: rowKey,
					projectID: item.projectID,
					orderID: item.orderID,
				});
				return item;
			});
			if (isOrderScheduleView()) {
				const orderIdSet = new Set<string>(newArrayList.map((item: any) => String(item.id)));
				const ordersByOrderId = new Map<string, any>(
					originalArray.map((item: any) => [String(item.orderID), item])
				);
				newArrayList.forEach((item: any) => {
					const superOrderID = getScheduleSuperOrderID(ordersByOrderId.get(String(item.orderID)));
					if (superOrderID) {
						item.parent = resolveOrderScheduleParent(superOrderID, orderIdSet, ordersByOrderId);
					} else {
						delete item.parent;
					}
				});
			}
			const addSubMap = originalArray.map((item2: any) => {
				const rowGanttId = toGanttTaskId(getScheduleRowKey(item2));
				item2.parent = rowGanttId;
				item2.ownerName = item2.customProperties?.$ownerID ?? '';
				item2.ownerDept = item2.customProperties?.$ownerDeptID ?? '';
				item2.id = rowGanttId + '_1';
				item2.projectName = t('ganttLabel.loading');
				item2.type = item2.milestone ? gantt.config.types.milestone : null;
				item2.text = '';
				item2.start_date = new Date();
				item2.end_date = new Date();
				item2.constraint_date = null;
				item2.duration = 1;
				item2.statusType = null;
				item2.taskColor = !item2.taskColor ? '537CFA' : item2.taskColor;
				item2.color = '#' + item2.taskColor;
				item2.constraint_type = null;
				item2.isLoadingChildren = false;
				item2.status = null;
				item2.expectedStart = null;
				item2.expectedFinish = null;
				item2.expectedDuration = null;
				item2.refName = 'loadMore';
				item2.taskID = isOrderScheduleView() ? item2.orderID : item2.projectID;
				item2.taskNo = isOrderScheduleView() ? item2.orderNo : item2.projectNo;
				item2.actions = [];
				return item2;
			});
			return [...newArrayList, ...addSubMap];
		};
		// ========== 甘特图任务 id 规范化 end ==========
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
		const hasGanttData = computed(() => (newTasks.datas.data?.length ?? 0) > 0);
		const renderGanttLoadingState = () =>
			h('div', { class: 'ganttLoadingState' }, [ui.factory.loading({})]);
		const renderGanttEmptyState = (label: string) =>
			h('div', { class: 'ganttEmptyState' }, [
				h('i', { class: 'pi pi-inbox ganttEmptyState__icon', 'aria-hidden': 'true' }),
				h('p', { class: 'ganttEmptyState__text' }, label),
			]);
		//多选的选中数组
		const multiSelectList = reactive({
			data: <any>[],
		});

		// const reloadParam = reactive({
		// 	searchWord: '',
		// 	lineID: '',
		// 	status: '',
		// 	refNo: '',
		// });

		const reloadParam = reactive({
			searchWord: '',
			projectID: '',
			orderID: '',
			status: '',
			expectedStart: '',
			expectedFinish: '',
			//scheduleType: 'ProductionSchedule',
		});

		const resetReloadParam = () => {
			reloadParam.searchWord = '';
			reloadParam.status = '';
			reloadParam.projectID = '';
			reloadParam.orderID = '';
			clearScheduleDateRangeFilter();
			selectgProject.value = null;
			temporarilySelect.value = null;
			selectgProjectSearchword.value = null;
			selectgOrder.value = null;
			temporarilySelectOrder.value = null;
			selectgOrderSearchword.value = null;

			selectStatus.value = '';
			pID = '';
			durationUnit.select = {
				name: '按周',
				value: 'week',
			};
			selectTimeChange();

			props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/searchWord`, JSON.parse(JSON.stringify(reloadParam.searchWord)));
			props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/${getStatusCacheKey()}`, JSON.parse(JSON.stringify(selectStatus.value)));
			persistProjectFilterCache(null);
			persistOrderFilterCache(null);
		};

		/** 切换视图时清空上方筛选（不重置时间模式） */
		const clearScheduleFilters = () => {
			reloadParam.searchWord = '';
			reloadParam.status = '';
			reloadParam.projectID = '';
			reloadParam.orderID = '';
			clearScheduleDateRangeFilter();
			selectgProject.value = null;
			temporarilySelect.value = null;
			selectgProjectSearchword.value = null;
			selectgOrder.value = null;
			temporarilySelectOrder.value = null;
			selectgOrderSearchword.value = null;
			selectStatus.value = '';
			pID = '';
			multiSelectList.data = [];

			const cachePrefix = `search/${props.ctx.logic.repository}`;
			props.ctx.app.localDb.put(`${cachePrefix}/searchWord`, '');
			props.ctx.app.localDb.put(`${cachePrefix}/status`, '');
			props.ctx.app.localDb.put(`${cachePrefix}/orderStatus`, '');
			props.ctx.app.localDb.delete(`${cachePrefix}/projectID`);
			props.ctx.app.localDb.delete(`${cachePrefix}/orderID`);
		};

		const switchScheduleViewMode = async (mode: 'project' | 'order') => {
			if (scheduleViewModeSwitching.value || mode === scheduleViewMode.value) {
				return;
			}
			if (mode === 'project' && !canReadProject.value) {
				return;
			}
			if (mode === 'order' && !canReadProductionOrder.value) {
				return;
			}

			scheduleViewModeSwitching.value = true;
			showLoading.value = true;

			try {
				scheduleViewMode.value = mode;
				//reloadParam.scheduleType = mode === 'order' ? 'ProductionOrder' : 'ProductionSchedule';
				clearScheduleFilters();

				if (mode === 'order') {
					await getOrderData(props.ctx, '');
				} else {
					await getProjectData(props.ctx, '');
				}
				props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/scheduleViewMode`, mode);
				await getProScheduleR(props.ctx, false);
			} finally {
				scheduleViewModeSwitching.value = false;
				showLoading.value = false;
			}
		};

		const searchParam = reactive(<any>{
			pager: {
				pageSize: '',
				pageNo: '',
			},
		});
		//const apiBox = getCurrentInstance().appContext;
		// const apiClient = getCurrentInstance().appContext.app.config.globalProperties.$api as ApiClient;

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
				return;
			}
			const dates = (Array.isArray(value) ? value : [value]).filter(Boolean) as Date[];
			if (dates.length === 0) {
				clearScheduleDateRangeFilter();
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
		};
		const { appContext } = getCurrentInstance();
		const mes = inject(MES_KEY);
		// 初始皮肤：与 HeaderView 的 p-dark / localStorage.isDark 保持一致
		if (mes.context?.isDark == true) {
			// eslint-disable-next-line vue/no-mutating-props
			skinType.value = 'dark';
		} else {
			skinType.value = props.skin;
		}

		const { meta: metaUiService, di, i18n, ui } = mes;
		const constraintTypeListOptions = ref(<any>[]); //甘特图显示用的options
		const showTool = ref(true);
		// 模糊搜索仅在接受用户聚焦输入时更新，避免打开修改密码弹窗时浏览器自动填充手机号/用户名
		const scheduleFuzzySearchFocused = ref(false);
		const isFuzzySearchAutofillLeak = (value: string) => {
			if (!value) {
				return false;
			}
			const u = mes?.user;
			if (!u) {
				return false;
			}
			let username = u.username ?? '';
			try {
				username = decodeURIComponent(username);
			} catch {
				/* 已是明文 */
			}
			return value === u.mobile || value === u.username || (!!username && value === username);
		};
		// 监控暗黑切换：同步 dhtmlx 皮肤 + ganttBox.schedule-gantt-dark（订单/任务列字色见 GanntView.less）
		watch([mes.context], ([newIsDark], [oldIsDark]) => {
			//皮肤
			if (newIsDark.isDark == true) {
				// eslint-disable-next-line vue/no-mutating-props
				skinType.value = 'dark';
				gantt.setSkin(skinType.value); //设置甘特图皮肤 提前设置
			} else {
				skinType.value = props.skin;
				gantt.setSkin(skinType.value); //设置甘特图皮肤 提前设置
			}
			ganttBox.value?.classList.toggle('schedule-gantt-dark', newIsDark.isDark === true);
		});

		let scheduleroleaction: any = {}; //权限
		/** 从模块树解析读取权限（与 ProjectGanttView 一致：项目 M.02.001） */
		const resolveScheduleViewPermissions = () => {
			canReadProject.value = false;
			canReadProductionOrder.value = false;

			roleaction.forEach((item: any) => {
				if (item.moduleCode == 'M.02' && item.subModules) {
					item.subModules.forEach((i: any) => {
						if (i.moduleCode == 'M.02.001' && i.authority?.allowRead) {
							canReadProject.value = true;
						}
					});
				}
				if (item.moduleCode == 'M.03' && item.subModules) {
					item.subModules.forEach((i: any) => {
						if (i.moduleCode == 'M.03.002' && i.actions) {
							scheduleroleaction = i; //排程按钮权限
						}
						// 生产订单模块：按实体名或路由匹配
						if (
							(i.objName === 'ProductionOrder' || i.moduleUrl?.includes('ProductionOrders')) &&
							i.authority?.allowRead
						) {
							canReadProductionOrder.value = true;
						}
					});
				}
			});

			showProjectFilter.value = canReadProject.value;
			showScheduleViewModeToggle.value = canReadProject.value && canReadProductionOrder.value;
		};
		/** 无切换按钮时按权限决定默认视图 */
		const applyDefaultScheduleViewMode = async () => {
			if (showScheduleViewModeToggle.value) {
				const scheduleViewModeRes = await props.ctx.app.localDb.get(`search/${props.ctx.logic.repository}/scheduleViewMode`);
				scheduleViewMode.value = scheduleViewModeRes === 'order' ? 'order' : 'project';
				return;
			}
			if (!canReadProject.value && canReadProductionOrder.value) {
				scheduleViewMode.value = 'order';
				return;
			}
			scheduleViewMode.value = 'project';
		};
		//获得权限
		const getRoleaction = async () => {
			scheduleroleaction = {};
			resolveScheduleViewPermissions();

			//设置负责的人权限
			if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
				const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'computeKitting');
				if (res != -1) {
					showComputeKitting.value = true;
				} else {
					showComputeKitting.value = false;
				}
			}

			await applyDefaultScheduleViewMode();

			//项目（须有 projectID 才恢复）
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
			//生产订单（须有 orderID 才恢复；空对象/脏缓存不当作有效筛选）
			const orderRes = await props.ctx.app.localDb.get(`search/${props.ctx.logic.repository}/orderID`);
			if (orderRes?.orderID) {
				selectgOrderSearchword.value = orderRes;
				reloadParam.orderID = orderRes.orderID ?? '';
			} else {
				selectgOrderSearchword.value = null;
				selectgOrder.value = null;
				temporarilySelectOrder.value = null;
				reloadParam.orderID = '';
				if (orderRes) {
					persistOrderFilterCache(null);
				}
			}
			//状态（按项目/按生产订单分别缓存）
			const statusRes = await props.ctx.app.localDb.get(`search/${props.ctx.logic.repository}/${getStatusCacheKey()}`);
			if (statusRes && statusRes.length > 0) {
				selectStatus.value = statusRes;
				reloadParam.status = toSQL(selectStatus.value);
			} else {
				selectStatus.value = '';
				reloadParam.status = '';
			}

			// 模糊搜索词不自动从 localDb 恢复，避免异步回填后输入框未同步、打开其他弹窗重渲染时突然显示旧关键词
			reloadParam.searchWord = '';

			if (scheduleroleaction?.authority?.allowRead == true) {
				if (isOrderScheduleView()) {
					await getOrderData(props.ctx, '');
				} else {
					getProjectData(props.ctx, '');
				}
				//获取甘特图数据
				getProSchedule(props.ctx, buildScheduleQueryParams());
			}
		};

		const toSQL = (v: any[] | string) => `IN ${isString(v) ? v : v.join(',')}`;

		// //获取甘特图数据
		// const getProSchedule = async (context: any) => {
		// 	showLoading.value = true;
		// 	const { $api, $router, $toast, $t: t } = context.appContext.app.config.globalProperties;
		// 	newTasks.datas.data = [];
		// 	newTasks.datas.links = [];
		// 	// const task = reactive({
		// 	// 	taskData: {
		// 	// 		data: <any>[],
		// 	// 		link: <any>[],
		// 	// 	},
		// 	// });

		// 	try {
		// 		let res: any = null;
		// 		const apiClient = $api as ApiClient;

		// 		res = await apiClient.getAll({
		// 			action: 'getAllSchedule',
		// 			repository: 'ProductionScheduleTasks',
		// 			service: 'mes',
		// 			queryParams: reloadParam,
		// 		});

		// 		if (res.list) {
		// 			res.list.data = res.list.tasks.map((item: any) => {
		// 				item.id = item.taskID;
		// 				item.text = item.productName;
		// 				item.start_date = item.expectedStart;
		// 				item.end_date = item.expectedFinish;
		// 				item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
		// 				item.duration = item.expectedDuration;
		// 				item.statusType = item.customProperties.$status;
		// 				item.parent = item.parentTaskID;
		// 				item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
		// 				item.color = '#' + item.taskColor;
		// 				item.constraint_type = item.customProperties.$constraintType;
		// 				item.ownerName = item.customProperties.$ownerID ?? '';
		// 				item.ownerDept = item.customProperties.$ownerDeptID ?? '';
		// 				return item;
		// 			});
		// 			res.list.link = res.list.links.map((item: any) => {
		// 				item.id = item.relationID;
		// 				item.source = item.fromTaskID;
		// 				item.target = item.toTaskID;
		// 				item.type = TaskRelationshipEnum.valueOf(item.relationType);
		// 				return item;
		// 			});

		// 			newTasks.datas.data = res.list.data;
		// 			newTasks.datas.links = res.list.link;
		// 			if (newTasks.datas.data.length > 0) {
		// 				getGannt();
		// 				showLoading.value = false;
		// 			} else {
		// 				newTasks.datas.data = [];
		// 				newTasks.datas.links = [];
		// 				getGannt();
		// 				showLoading.value = false;
		// 			}
		// 			showLoading.value = false;
		// 			// return (this.taskDatas = res.list);
		// 		}
		// 	} catch (error: any) {
		// 		$toast.add({
		// 			severity: 'error',
		// 			detail: error.message ?? `${t('invalid.error')}`,
		// 			summary: error.detail ?? '',
		// 			life: 5000,
		// 		});
		// 		showLoading.value = false;
		// 		return;
		// 	}
		// };

		//获取甘特图任务数据
		const getProSchedule = async (context: UiBuildContext<any>, query: any) => {
			showLoading.value = false;
			ganttDataLoading.value = true;
			const { $api, $router, $toast: toast, $t: t } = context.globalProps;
			newTasks.datas.data = [];
			newTasks.datas.links = [];
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				if (isOrderScheduleView()) {
					res = await apiClient.getAll({
						action: 'getAllSchedule',
						repository: 'ProductionScheduleTasks',
						service: 'mes',
						queryParams: buildOrderScheduleApiParams(),
					});
					if (res.list) {
						const mapped = mapAllScheduleFromResponse(res.list);
						newTasks.datas.data = mapped.data;
						newTasks.datas.links = mapped.links;
						getGannt();
					} else {
						newTasks.datas.data = [];
						newTasks.datas.links = [];
						getGannt();
					}
				} else {
					res = await apiClient.getAll({
						action: 'getAllProjectSchedule',
						repository: 'ProjectSchedule',
						service: 'mes',
						queryParams: query ?? buildScheduleQueryParams(),
					});
					if (res.list) {
						const newData = mapScheduleListFromResponse(res.list, t);
						newTasks.datas.data = newData;
						newTasks.datas.links = [];

						if (newTasks.datas.data.length > 0) {
							getGannt();
						} else {
							newTasks.datas.data = [];
							newTasks.datas.links = [];
							getGannt();
						}
					}
				}
				ganttDataLoading.value = false;
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
				ganttDataLoading.value = false;
			}
		};
		//linkTypes
		const linkTypes = [
			{ key: 'FINISH_TO_START', value: 0 },
			{ key: 'START_TO_START', value: 1 },
			{ key: 'FINISH_TO_FINISH', value: 2 },
			{ key: 'START_TO_FINISH', value: 3 },
		];
		//是否显示齐料检查
		const showComputeKitting = ref(false);
		//获取甘特图刷新数据
		const getSubSchedule = async (context: UiBuildContext<any>, task: any, isOpen?: any) => {
			//showLoading.value = true;
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
					action: 'getAllSchedule',
					repository: 'ProductionScheduleTasks',
					service: 'mes',
					queryParams: isOrderScheduleView()
						? {
								projectID: 'IS NULL',
								orderID: task.orderID ?? '',
							}
						: {
								projectID: toScheduleProjectIDQuery(task.projectID),
							},
				});

				//子项
				if (res.list.tasks && res.list.tasks.length > 0) {
					if (res.list.tasks && res.list.tasks.length > 0) {
						updateObj.subList = res.list.tasks.map((item: any) => {
							item.id = toGanttTaskId(item.taskID);
							item.text = item.productName;
							item.ownerName = item.customProperties?.$ownerID ?? '';
							item.ownerDept = item.customProperties?.$ownerDeptID ?? '';
							item.projectName = item.productName;
							item.type = item.milestone ? gantt.config.types.milestone : null;
							item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
							applyScheduleGanttTaskDates(item, gantt);
							item.statusType = item.customProperties?.$status;
							item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
							item.color = '#' + item.taskColor;
							item.constraint_type = item.customProperties?.$constraintType;
							if (isOrderScheduleView()) {
								item.orderID = item.orderID ?? task.orderID;
								applyOrderScheduleTaskFields(item, item);
								item.orderNo = item.orderNo ?? task.orderNo ?? task.order?.orderNo ?? null;
							} else {
								item.projectID = item.projectID ?? task.projectID;
								applyScheduleTaskRowHeight(item);
							}
							prepareProjectScheduleLoadedTask(item);
							return item;
						});
						const subTasksByTaskId = new Map<string, any>(res.list.tasks.map((item: any) => [String(item.taskID), item]));
						const subIdSet = new Set<string>(updateObj.subList.map((item: any) => String(item.id)));
						subIdSet.add(task.id);
						const { orderIdToGanttId } = isOrderScheduleView()
							? buildOrderScheduleIdMaps(updateObj.subList)
							: { orderIdToGanttId: new Map<string, string>() };
						if (isOrderScheduleView() && task.orderID) {
							orderIdToGanttId.set(String(task.orderID), String(task.id));
						}
						updateObj.subList.forEach((item: any) => {
							if (isOrderScheduleView()) {
								const raw = subTasksByTaskId.get(String(item.taskID));
								let parent = resolveOrderScheduleTaskParent(item, raw, subIdSet, subTasksByTaskId, orderIdToGanttId);
								if (!parent || parent === 0) {
									parent = task.id;
								}
								item.parent = parent;
								return;
							}
							if (item.parentTaskID === 0 || item.parentTaskID === '0' || !item.parentTaskID) {
								item.parent = task.id;
								return;
							}
							const resolvedParent = resolveScheduleGanttParent(item.parentTaskID, subIdSet, subTasksByTaskId);
							item.parent = resolvedParent === 0 ? task.id : resolvedParent;
						});
					}

					if (res.list.links && res.list.links.length > 0) {
						updateObj.subLinkList = res.list.links.map((linkItem: any) => {
							linkItem.id = linkItem.relationID;
							linkItem.source = toGanttTaskId(linkItem.fromTaskID);
							linkItem.target = toGanttTaskId(linkItem.toTaskID);
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
					if (isOrderScheduleView() && updateObj.subList.length > 0) {
						updateObj.subList = sortOrderScheduleGanttFlatData(updateObj.subList);
					}
					goUpdateSub(updateObj, task.id, isOpen, task);
				} else {
					if (updateObj.deleteID) {
						const deleteTaskId = updateObj.deleteID + '_1';
						const deleteTask = gantt.getTask(deleteTaskId);
						if (deleteTask && deleteTask.refName == 'loadMore') {
							deleteTask.projectName = t('state.noData');
							applyScheduleOrderRowHeight(deleteTask);
							gantt.updateTask(deleteTaskId, deleteTask);
						}
					}
					gantt.refreshData();
					if (isOrderScheduleView()) {
						nextTick(() => syncScheduleOrderRowHeights());
					}

					// toast.add({
					// 	severity: 'info',
					// 	summary: t('state.noData'),
					// 	life: 5000,
					// });
				}
				isLoading.value = false;
				showLoading.value = false;
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
			}
		};

		//获取甘特图数据
		const getProScheduleR = async (context: UiBuildContext<any>, useGanttAreaLoading = true) => {
			if (useGanttAreaLoading) {
				ganttDataLoading.value = true;
			}
			// 仅在用户点击「搜索」时缓存模糊搜索词，避免输入过程中或打开其他弹窗时误写入/误恢复
			props.ctx.app.localDb.put(
				`search/${props.ctx.logic.repository}/searchWord`,
				JSON.parse(JSON.stringify(reloadParam.searchWord ?? '')),
			);
			const { $api, $router, $toast: toast, $t: t } = context.globalProps;
			newTasks.datas.data = [];
			newTasks.datas.links = [];
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				if (isOrderScheduleView()) {
					res = await apiClient.getAll({
						action: 'getAllSchedule',
						repository: 'ProductionScheduleTasks',
						service: 'mes',
						queryParams: buildOrderScheduleApiParams(),
					});
					if (res.list) {
						const mapped = mapAllScheduleFromResponse(res.list);
						newTasks.datas.data = mapped.data;
						newTasks.datas.links = mapped.links;
					} else {
						newTasks.datas.data = [];
						newTasks.datas.links = [];
					}

					gantt.clearAll();
					gantt.parse(newTasks.datas);
					if (isOrderScheduleView()) {
						syncScheduleGanttTaskDates(gantt);
					}
					syncOrderScheduleGanttSort();
					healProjectScheduleGanttLockState(gantt);
					syncScheduleRowHeights();
					syncGanttGridWidthAfterData();
					updateScheduleNameColumnLabel();
				} else {
					res = await apiClient.getAll({
						action: 'getAllProjectSchedule',
						repository: 'ProjectSchedule',
						service: 'mes',
						queryParams: buildScheduleQueryParams(),
					});
					if (res.list) {
						const newData = mapScheduleListFromResponse(res.list, t);
						newTasks.datas.data = newData;
						newTasks.datas.links = [];

						gantt.clearAll();
						gantt.parse(newTasks.datas);
						healProjectScheduleGanttLockState(gantt);
						syncScheduleRowHeights();
						syncGanttGridWidthAfterData();
						updateScheduleNameColumnLabel();

					}
				}
				if (useGanttAreaLoading) {
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
				if (useGanttAreaLoading) {
					ganttDataLoading.value = false;
				}
			}
		};

		//导出EXcel
		const getGanntExcel = async () => {
			const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
			isLoading.value = true;
			try {
				const apiClient = $api as ApiClient;
				await apiClient
					.exportAll({
						action: 'exportAll',
						repository: 'ProductionScheduleTasks',
						service: 'mes',
						queryParams: buildScheduleQueryParams(),
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

		//甘特图更新
		const changeTasks = async (tasksItem: any, context: AppContext) => {
			const { $api, $router, $toast: toast, $t: t } = context.app.config.globalProperties;
			// if (tasksItem.actions) {
			// 	tasksItem.actions = null;
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

			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.doAction(
					{
						action: 'saveAndGetAll',
						repository: 'ProductionScheduleTasks',
						service: 'mes',
					},
					item
				);
				if (res && res.length > 0) {
					res = res.map((item: any) => {
						item.id = toGanttTaskId(item.taskID);
						item.text = item.productName;
						item.projectName = item.productName;
						applyScheduleGanttTaskDates(item, gantt);
						item.statusType = item.customProperties.$status;
						item.parent = toGanttTaskId(item.parentTaskID);
						item.taskColor = !item.taskColor ? '537CFA' : item.taskColor;
						item.color = '#' + item.taskColor;
						item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
						//item.constraint_type = item.constraintType;
						item.constraint_typeName = item.customProperties.$constraintType;
						item.isLoadingChildren = true; //是否已经加载过子集
						goUpdateTask(res);
					});
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
				undoAction();
				return false;
			}
		};
		const isNeedDeleteLink = ref(false); //删除后还原，接口是否需要调用。
		//甘特图 link
		const changeLink = async (linkItem: any, appContext: AppContext) => {
			// if (linkItem.action) {
			// 	linkItem.action = null;
			// }

			linkItem.refName = 'ProductionTaskRelation';
			linkItem.fromTaskID = linkItem.source;
			linkItem.toTaskID = linkItem.target;
			linkItem.relationID = linkItem.relationID ? linkItem.relationID : linkItem.id;
			linkItem.relationType = linkItem.type;
			linkItem.lag = linkItem?.lag ?? 0;
			const { $api, $router, $toast: toast, $t: t } = appContext.app.config.globalProperties;
			const item = JSON.parse(JSON.stringify(linkItem));
			item.action = null;
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.doAction(
					{
						action: 'saveLinkAndGet',
						repository: 'ProductionScheduleTasks',
						service: 'mes',
					},
					item
				);

				if (res && res.relationID != 0) {
					linkItem.fromTaskID = res.source;
					linkItem.toTaskID = res.target;
					linkItem.relationID = res.relationID;
					linkItem.relationType = linkItem.type;
					linkItem.lag = res?.lag ?? 0;
					gantt.refreshLink(linkItem.id);
				}

				isNeedDeleteLink.value = false;
				showLoading.value = false;
				gantt.refreshData();
				return;
				//linkRes.data = res;
				// getLinkRes(linkRes.data);
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
						detail: error.detail,
						summary: error.message ?? `${t('invalid.error')}`,
						group: 'br',
						life: 5000,
					});
				}
				// //恢复原状
				isNeedDeleteLink.value = true;
				gantt.deleteLink(linkItem.id);
				showLoading.value = false;
				//undoAction();
				return false;
			}
		};

		//甘特图分解
		const changeBreak = async (taskItem: any, context: UiBuildContext<any>) => {
			isLoading.value = true;
			// if (taskItem.action) {
			// 	taskItem.action = null;
			// }
			const ownerData = {
				ownerID: taskItem?.ownerID ?? null,
				ownerName: taskItem?.ownerName ?? null,
				ownerDeptID: taskItem?.ownerDeptID ?? null,
				ownerDeptName: taskItem?.ownerDept ?? null,
			};

			const actionObj = taskItem.actions.filter((item: any) => {
				return item.name == 'breakDown';
			});

			if (actionObj[0]?.param.prompt == 'FLOW_TO') {
				(context.uiBuilder as any).buildNotice(context, {
					ownerData: ownerData,
					onSubmit: async (data: any) => {
						//调用接口
						const { $t: t, $api: apiBox, $toast: toast } = context.globalProps;
						//调用接口
						try {
							const res: boolean = await apiBox.doAction(
								{
									path: taskItem.taskID ?? '',
									action: 'breakDown',
									repository: 'ProductionOrders',
									service: 'mes',
								},
								data
							);
							//关闭窗口
							if (res) {
								toast.add({
									severity: 'success',
									detail: `${t('dialog.success')}`,
									summary: t('dialog.success'),
									baseZIndex: 1000,
									life: 5000,
								});
								getSubSchedule(props.ctx, taskItem, 'isOpen');
							}

							return true;
						} catch (error: any) {
							if (error.validationErrors && error.validationErrors.length > 0) {
								toast.add({
									severity: 'error',
									detail: error.validationErrors[0].error,
									summary: error.detail ?? '',
									group: 'br',
									baseZIndex: 1000,
									life: 5000,
								});
							} else {
								toast.add({
									severity: 'error',
									detail: error.message ?? `${t('invalid.error')}`,
									summary: error.detail ?? '',
									group: 'br',
									baseZIndex: 1000,
									life: 5000,
								});
							}
							isLoading.value = false;
							return false;
						}
					},
				});
			} else if (actionObj[0]?.param.prompt == 'NONE') {
				//调用接口
				const { $t: t, $api: apiBox, $toast: toast } = context.globalProps;
				//调用接口
				try {
					const res: boolean = await apiBox.doAction(
						{
							path: taskItem.taskID ?? '',
							action: 'breakDown',
							repository: 'ProductionOrders',
							service: 'mes',
						},
						{}
					);
					//关闭窗口
					if (res) {
						toast.add({
							severity: 'success',
							detail: `${t('dialog.success')}`,
							summary: t('dialog.success'),
							baseZIndex: 1000,
							life: 5000,
						});
						getSubSchedule(props.ctx, taskItem, 'isOpen');
					}
					return true;
				} catch (error: any) {
					if (error.validationErrors && error.validationErrors.length > 0) {
						toast.add({
							severity: 'error',
							detail: error.validationErrors[0].error,
							summary: error.detail ?? '',
							group: 'br',
							baseZIndex: 1000,
							life: 5000,
						});
					} else {
						toast.add({
							severity: 'error',
							detail: error.message ?? `${t('invalid.error')}`,
							summary: error.detail ?? '',
							group: 'br',
							baseZIndex: 1000,
							life: 5000,
						});
					}
					isLoading.value = false;
					return false;
				}
			}

			//beforeNotice(appContext, taskItem, null, 'breakDown', 'ProductionOrders');
			//提交给组件更新数据
			//getBreaks(await res);
		};

		// //获取甘特图数据
		// const goUpdateSub = async (context: any, taskItem?: any) => {
		// 	showLoading.value = true;
		// 	const { $api, $router, $toast, $t: t } = context.appContext.app.config.globalProperties;
		// 	const task = reactive({
		// 		taskData: {
		// 			data: <any>[],
		// 			link: <any>[],
		// 		},
		// 	});

		// 	try {
		// 		let res: any = null;
		// 		const apiClient = $api as ApiClient;
		// 		res = await apiClient.getAll({
		// 			action: 'getAllSchedule',
		// 			repository: 'ProductionScheduleTasks',
		// 			service: 'mes',
		// 			queryParams: {
		// 				taskID: taskItem.id,
		// 			},
		// 		});
		// 		if (res.tasks && (res.tasks.length > 0 || res.links.length > 0)) {
		// 			if (res.tasks.length > 0) {
		// 				res.tasks.forEach((task: any) => {
		// 					const taskItem = gantt.getTask(task.id);
		// 					if (taskItem) {
		// 						taskItem.id = task.taskID;
		// 						taskItem.text = task.productName;
		// 						taskItem.start_date = task.expectedStart;
		// 						taskItem.end_date = task.expectedFinish;
		// 						taskItem.constraint_date = task.constraintDate ? new Date(task.constraintDate) : null;
		// 						taskItem.duration = task.expectedDuration;
		// 						taskItem.status = task.status;
		// 						taskItem.statusType = task.customProperties.$status;
		// 						taskItem.parent = task.parentTaskID;
		// 						taskItem.taskColor = !task.taskColor ? '537CFA' : task.taskColor;
		// 						taskItem.color = '#' + task.taskColor;
		// 						taskItem.constraint_type = task.customProperties.$constraintType;
		// 						gantt.refreshTask(taskItem.id);
		// 					}
		// 					//没有添加
		// 					else {
		// 						let newTask: any;
		// 						newTask.id = task.taskID;
		// 						newTask.text = task.productName;
		// 						newTask.start_date = task.expectedStart;
		// 						newTask.end_date = task.expectedFinish;
		// 						newTask.constraint_date = task.constraintDate ? new Date(task.constraintDate) : null;
		// 						newTask.duration = task.expectedDuration;
		// 						newTask.status = task.status;
		// 						newTask.statusType = task.customProperties.$status;
		// 						newTask.parent = task.parentTaskID;
		// 						newTask.taskColor = !task.taskColor ? '537CFA' : task.taskColor;
		// 						newTask.color = '#' + task.taskColor;
		// 						newTask.constraint_type = task.customProperties.$constraintType;
		// 						gantt.addTask(newTask);
		// 					}
		// 				});
		// 			}

		// 			if (res.links.length > 0) {
		// 				res.links.forEach((link: Link) => {
		// 					const linkItem = gantt.getLink(link.id);
		// 					if (!linkItem) {
		// 						let newLink: any;
		// 						newLink.fromTaskID = link.source;
		// 						newLink.toTaskID = link.target;
		// 						newLink.relationID = link.id;
		// 						newLink.relationType = link.type;
		// 						gantt.addLink(newLink);
		// 					} else {
		// 						gantt.refreshLink(link.id);
		// 					}
		// 				});
		// 			}
		// 		}
		// 		showLoading.value = false;
		// 		gantt.hideLightbox();
		// 		gantt.refreshData();
		// 	} catch (error: any) {
		// 		$toast.add({
		// 			severity: 'error',
		// 			detail: error.message ?? '',
		// 			summary: error.detail ?? '',
		// 			life: 5000,
		// 		});
		// 		showLoading.value = false;
		// 		return task.taskData;
		// 	}
		// };

		const canReflashLink = ref(false);
		//获取更新子数据
		const goUpdateSub = (newData: any, deleteID?: any, isOpen?: any, task?: any) => {
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
						taskItem.status = task.status;
						if (taskItem.customProperties && task.customProperties) {
							taskItem.customProperties.$status = task.customProperties.$status;
						}
						taskItem.statusType = task.customProperties?.$status ?? task.statusType;
						gantt.updateTask(taskItem.id, taskItem);
						gantt.refreshTask(taskItem.id);
					}
					//没有添加
					else {
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
			gantt.refreshData();
			syncOrderScheduleGanttSort();
			//是否是点击展开按钮
			if (isOpen) {
				expandTaskAndChildren(task.id);
			}
			syncScheduleRowHeights();
			healProjectScheduleGanttLockState(gantt);
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
					selectgProject.value = lineData.value[0];
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

		const getOrderData = async (ctx: UiBuildContext<any>, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;

			if (!reloadParam.orderID) {
				reloadParam.orderID = '';
			}
			const res = await apiBox.getAll({
				repository: 'ProductionOrders',
				queryParams: {
					pageSize: searchParam.pager.pageSize,
					pageNo: searchParam.pager.pageNo,
					sort: '',
					searchWord: value,
					orderID: reloadParam.orderID,
					filter: 't.status >= 0',
				},
				service: 'mes',
			});
			searchParam.pager = res.pagination;

			if (selectgOrderSearchword.value) {
				orderData.value = [];
				orderData.value.push(selectgOrderSearchword.value);
			} else {
				orderData.value = res.list.map((it: any) => ({ ...it }));
			}

			if (pID) {
				if (orderData.value && orderData.value.length > 0) {
					selectgOrder.value = orderData.value[0];
					temporarilySelectOrder.value = orderData.value[0];
				}
			} else {
				// 只缓存单个已选订单，勿赋整个 orderData 数组，否则弹窗搜索时会误把 ld[0] 合并进结果
				temporarilySelectOrder.value = selectgOrder.value ?? orderData.value[0] ?? null;
			}
			await getOrderData2(props.ctx, '');
			ensureSelectedOrderInOuterOptions();
		};

		/** 外层下拉远程搜索：写 orderData，并始终保留当前已选订单 */
		const getOrderData2 = async (ctx: UiBuildContext<any>, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;
			const res = await apiBox.getAll({
				repository: 'ProductionOrders',
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

			orderData.value = res.list.map((it: any) => ({ ...it }));
			// 外层 options 必须含当前选中项，否则 Select 无法按 dataKey 匹配，会显示 [object Object]
			ensureSelectedOrderInOuterOptions();

			if (pID) {
				if (orderData.value && orderData.value.length > 0) {
					selectgOrder.value = orderData.value[0];
					temporarilySelectOrder.value = orderData.value[0];
				}
			}
		};

		/** 弹窗内搜索：只写 orderDialogData，不碰外层 orderData */
		const getOrderDialogData = async (ctx: UiBuildContext<any>, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;
			const res = await apiBox.getAll({
				repository: 'ProductionOrders',
				queryParams: {
					pageSize: orderDialogPager.value.pageSize || 10,
					pageNo: orderDialogPager.value.pageNo || 1,
					sort: '',
					searchWord: value,
					filter: 't.status >= 0',
				},
				service: 'mes',
			});
			orderDialogPager.value = res.pagination;
			orderDialogData.value = (res.list ?? []).map((it: any) => ({ ...it }));
		};

		// //搜索条件
		// const queryDate = reactive({
		// 	qDate: {
		// 		refNo: null, //订单
		// 		lineID: null, //产
		// 		status: null, //状态
		// 	},
		// });

		// const linePageInfo = reactive({
		// 	searchWord: '',
		// });
		// //产线下拉选择
		// const lineOptionsAll = ref([]);
		// //获取产线列表
		// const getLineList = async (query: any) => {
		// 	try {
		// 		let res = null;
		// 		if (query) {
		// 			linePageInfo.searchWord = query;
		// 		} else {
		// 			linePageInfo.searchWord = '';
		// 		}
		// 		res = await apiClient.getAll({
		// 			repository: 'ProductionLines',
		// 			queryParams: linePageInfo,
		// 			service: 'mes',
		// 		});

		// 		if (res.list && res.list.length > 0) {
		// 			lineOptionsAll.value = [];

		// 			lineOptionsAll.value = res.list.map((item: any) => {
		// 				return {
		// 					lineID: `${item.lineID}`,
		// 					label: `${item.lineName ?? ''}`,
		// 				};
		// 			});
		// 		} else {
		// 			lineOptionsAll.value = [];
		// 		}
		// 	} catch (error: any) {
		// 		appGlobal.uiBuilder.toast({
		// 			severity: 'error',
		// 			title: $t('dialog.title.error'),
		// 			summary: error.detail ?? '',
		// 			life: 3000,
		// 		});
		// 		return false;
		// 	}
		// };

		// const productionOrderStatusEnum: any[]=[];

		// //过滤产线
		// const lineFilter = (event: any) => {
		// 	if (event.value) {
		// 		getLineList(event.value);
		// 	} else {
		// 		getLineList('');
		// 	}
		// };

		// // 计划排程的编辑权限
		// const scheduleauthorityEdit = ref(true);

		let metauiGbl: any = null;
		let metauiGbl2: any = null;
		//let needGanttRelod: any;
		onBeforeMount(async () => {
			//判断页面是否需要刷新
			// needGanttRelod = JSON.parse(localStorage.getItem('needGanttRelod'));
			// if (needGanttRelod == 0) {
			// 	needGanttRelod = 1;
			// 	localStorage.setItem('needGanttRelod', JSON.stringify(needGanttRelod));
			// 	window.location.reload();
			// }
			getRoleaction(); //获取权限

			//获取constraintType的枚举
			metaUiService.getPack({ repository: 'ProductionScheduleTasks', service: 'mes' }).then((res: any) => {
				//const {metaui}  = res;
				metauiGbl2 = res;
				//获得constraintType枚举
				const field = metauiGbl2.metaui.getField('constraintType');
				constraintTypeListOptions.value = JSON.parse(field.selectOptions).map((item: any) => {
					item.key = item.value;
					item.label = item.text;
					return item;
				});
			});

			metaUiService.getPack({ repository: 'Projects', service: 'mes' }).then((res: any) => {
				metauiGbl = res;
				const statusType = metauiGbl.metaui.getField('status');
				statusListOptions.value = JSON.parse(statusType.selectOptions).map((item: any) => {
					item.key = item.value;
					item.label = item.text;
					return item;
				});
			});
			metaUiService.getPack({ repository: 'ProductionOrders', service: 'mes' }).then((res: any) => {
				const statusType = res.metaui.getField('status');
				orderStatusListOptions.value = JSON.parse(statusType.selectOptions).map((item: any) => {
					item.key = item.value;
					item.label = item.text;
					return item;
				});
			});
		});

		onMounted(() => {
			//默认select
			const slTime = JSON.parse(localStorage.getItem('ganntTime'));
			if (slTime) {
				durationUnit.select = slTime;
			} else {
				durationUnit.select = timeList[1];
			}
		});
		onUnmounted(() => {
			showTool.value = false;
			ganttResizeController?.destroy();
			ganttResizeController = null;
			gantt.destructor(); //销毁甘特图
		});

		//选中的时间
		const durationUnit = reactive({
			select: {
				name: '按日',
				value: 'day',
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
		const presetsList = ref([
			{ label: '今天', value: 'toady' },
			{ label: '本周', value: 'week' },
		]);

		//选择时间切换
		const selectTimeChange = () => {
			const ganntTime = JSON.stringify(durationUnit.select);
			localStorage.setItem('ganntTime', ganntTime);
			gantt.ext.zoom.setLevel(durationUnit.select.value);
			//gantt.init(ganttBox.value); //设置甘特图显示的div
		};
		//日计划提交对象
		const dailyPlanning = reactive<GanttPlanningShell>({
			submitHandler: undefined,
			data: {
				planNo: null,
				remark: null,
				date: null,
				expectedStart: null,
				expectedFinish: null,
				rangeDate: null,
				projectID: null,
			},
		});
		// 甘特图日计划弹窗：打开前由 ProductionPlans/create 生成计划号
		const subPlanning = async (planDate: any, appContext: UiBuildContext<any>) => {
			const { $api, $router, $toast: toast, $t: t } = appContext.globalProps;
			resetGanttPlanningShell(dailyPlanning, planDate);
			isLoading.value = true;
			try {
				const created: any = await ($api as ApiClient).doAction(
					{
						action: 'create',
						repository: 'ProductionPlans',
						service: 'mes',
					},
					{
						orderID:
							reloadParam.orderID ||
							selectgOrderSearchword.value?.orderID ||
							selectgOrder.value?.orderID ||
							multiSelectList?.data?.[0]?.orderID ||
							null,
						projectID:
							reloadParam.projectID ||
							selectgProjectSearchword.value?.projectID ||
							selectgProject.value?.projectID ||
							multiSelectList?.data?.[0]?.projectID ||
							null,
					}
				);
				const planNo =
					created?.planNo ??
					created?.data?.planNo ??
					created?.list?.planNo ??
					created?.model?.planNo ??
					null;
				if (!planNo) {
					throw new Error('未获取到生产计划号');
				}
				dailyPlanning.data.planNo = String(planNo);
			} catch (error: any) {
				props.ctx.uiBuilder.toast(props.ctx, {
					severity: 'error',
					summary: t('dialog.title.error'),
					detail: error?.detail ?? error?.message ?? '获取生产计划号失败',
					group: 'br',
					life: 5000,
				});
				return;
			} finally {
				isLoading.value = false;
			}

			dailyPlanning.submitHandler = async () => {
				const data = dailyPlanning.data;
				if (!data.rangeDate?.[0]) {
					return false;
				}
				if (!data.rangeDate[1]) {
					data.expectedStart = data.rangeDate[0].toFormat('yyyy-MM-dd');
					data.expectedFinish = data.expectedStart;
				} else {
					data.expectedStart = data.rangeDate[0].toFormat('yyyy-MM-dd');
					data.expectedFinish = data.rangeDate[1].toFormat('yyyy-MM-dd');
				}
				const planNo = data.planNo ?? '';
				try {
					let res: any = null;
					const apiClient = $api as ApiClient;
					res = await apiClient.getAll({
						action: 'vaildatePlanNo',
						repository: 'ProductionPlans',
						service: 'mes',
						queryParams: {
							planNo,
						},
					});

					if (res.list == false) {
						if (reloadParam.projectID) {
							dailyPlanning.data.projectID = reloadParam.projectID;
						} else {
							dailyPlanning.data.projectID = null;
						}
						isLoading.value = false;
						return submitPlan(dailyPlanning.data, appContext);
					}

					props.ctx.uiBuilder.toast(props.ctx, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: t('ganttLabel.planNoAE'),
						group: 'br',
						life: 5000,
					});
					showLoading.value = false;
					isLoading.value = false;
					return false;
				} catch (error: any) {
					let errorMssage;
					if (error.validationErrors && error.validationErrors.length > 0) {
						errorMssage = error?.validationErrors[0]?.error ?? '';
					} else {
						errorMssage = error.message;
					}
					props.ctx.uiBuilder.toast(props.ctx, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: errorMssage ?? '',
						group: 'br',
						life: 5000,
					});
					showLoading.value = false;
					isLoading.value = false;
					return false;
				}
			};

			appContext.uiBuilder.confirmDialog(
				h(GanttPlanning, {
					key: `gantt-planning-${dailyPlanning.data.planNo}-${Date.now()}`,
					planningShell: dailyPlanning,
					dataModel: planDate,
					ctx: appContext,
				}),
				appContext,
				{
					name: 'dailyPlanning',
					title: t('ganttLabel.DevelopPlan'),
					showFooter: false,
					width: '50vw',
					height: 'auto',
					maxHeight: '85vh',
				}
			);
		};

		//甘特图日计划调用接口返回
		const submitPlan = async (planItem: any, content: UiBuildContext<any>) => {
			const { $api, $router, $toast: toast, $t: t } = content.globalProps;
			planItem.action = null;
			isLoading.value = true;
			try {
				let res: any = null;
				const apiClient = $api as ApiClient;
				res = await apiClient.doAction(
					{
						action: 'dailyPlanning',
						repository: 'ProductionScheduleTasks',
						service: 'mes',
					},
					planItem
				);

				if (res == true) {
					content.uiBuilder.toast(content, {
						severity: 'success',
						summary: t('success.operationSuccessful'),
						life: 5000,
					});
					isLoading.value = false;
					//跳转界面
					content.uiBuilder.confirmMessage(content, {
						header: t('action.confirm'),
						message: t('dialog.dailyPlanning'),
						// type: action.param.hint,
						rejectLabel: t('action.cancel'),
						acceptLabel: t('action.confirm'),
						accept: async () => {
							isLoading.value = true;
							const rest: any = await apiClient.getAll({
								action: 'getByNo',
								repository: 'ProductionPlans',
								service: 'mes',
								queryParams: {
									planNo: planItem.planNo,
								},
							});
							isLoading.value = false;
							window.open(`/MES/ProductionPlans/${rest.list.planID}`, '_blank');
							return true;
						},
						// 全部到货
						reject: async () => {
							isLoading.value = false;
							return true;
						},
					});
				}
				showLoading.value = false;
				return true;
			} catch (error: any) {
				let errorMssage;

				if (error.validationErrors && error.validationErrors.length > 0) {
					errorMssage = error?.validationErrors[0]?.error ?? '';
				} else {
					errorMssage = error.message;
				}
				props.ctx.uiBuilder.toast(props.ctx, {
					severity: 'error',
					summary: t('dialog.title.error'),
					detail: errorMssage ?? '',
					group: 'br',
					life: 5000,
				});
				isLoading.value = false;
				showLoading.value = false;
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
			{ key: 2, type: 'ProductionOrder', label: '订单', backgroundColor: '#03A9F4', textColor: '#FFF' },
			{ key: 3, type: 'ProductionTask', label: '任务', backgroundColor: '#22c55e', textColor: '#FFF' },
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

			// console.log('date2', date2);
			// console.log('date1', date1);
			// console.log('endDate', date2.getTime());
			// console.log('nowDate', date1.getTime());
			// console.log('diffDays', diffDays);
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

			// console.log('date2', date2);
			// console.log('date1', date1);
			// console.log('endDate', date2.getTime());
			// console.log('nowDate', date1.getTime());
			//console.log('diffDays', diffDays);
			const nowDate = new Date();
			//结束时间小于今天，并且2天内
			if (date1 < nowDate && diffDays < 2) {
				return true;
			}
			else {
				return false;
			}
		}




		//汉化

		// gantt.locale = {
		// 	date: {
		// 		month_full: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
		// 		month_short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		// 		day_full: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
		// 		day_short: ['日', '一', '二', '三', '四', '五', '六'],
		// 	},
		// 	labels: {
		// 		dhx_cal_today_button: '今天',
		// 		day_tab: '日',
		// 		week_tab: '周',
		// 		month_tab: '月',
		// 		new_event: '新建日程',
		// 		icon_save: '保存',
		// 		icon_cancel: '关闭',
		// 		icon_details: '详细',
		// 		icon_edit: '编辑',
		// 		icon_delete: '删除',
		// 		confirm_closing: '请确认是否撤销修改!',
		// 		confirm_deleting: '是否删除计划?',
		// 		//section_remark: "备注:",
		// 		section_time: '时间范围:',
		// 		section_type: '类型',
		// 		section_text: '计划名称:',
		// 		section_progress: '进度:',
		// 		section_color: '颜色:',
		// 		section_taskSummary: '备注:',
		// 		column_text: '计划名称',
		// 		column_start_date: '开始时间',
		// 		column_duration: '持续时间',
		// 		column_add: '',

		// 		/* link confirmation */
		// 		link: '关联',
		// 		confirm_link_deleting: '将被删除',
		// 		link_start: ' (开始)',
		// 		link_end: ' (结束)',
		// 		type_task: '任务',
		// 		type_project: '项目',
		// 		type_milestone: '里程碑',

		// 		minutes: '分钟',
		// 		hours: '小时',
		// 		days: '天',
		// 		weeks: '周',
		// 		months: '月',
		// 		years: '年',
		// 		new_task: '',
		// 		column_wbs: '',
		// 		message_ok: '',
		// 		message_cancel: '',
		// 		section_constraint: '',
		// 		constraint_type: '',
		// 		constraint_date: '',
		// 		asap: '',
		// 		alap: '',
		// 		snet: '',
		// 		snlt: '',
		// 		fnet: '',
		// 		fnlt: '',
		// 		mso: '',
		// 		mfo: '',
		// 		resources_filter_placeholder: '',
		// 		resources_filter_label: '',
		// 		section_description: '',
		// 	},
		// };

		// 配置父子关系
		// gantt.config.parent_task = "parentId";

		//根据类型判断，限制时间
		//const constraintDateReady=ref(true);
		// const changeConstraintType=(e:any)=>{
		// 	console.log(e.target.value);
		// 	if(e.target.value!='NONE'){
		// 		console.log('false');
		// 		constraintDateReady.value=false;
		// 	}
		// 	else{
		// 		console.log('true');
		// 		constraintDateReady.value=true;
		// 	}
		// }

		// //日计划提交对象
		// const dailyPlanning = reactive({
		// 	data: {
		// 		planNo: null,
		// 		planNoInvalid: false,
		// 		remark: null,
		// 		date: null, //@datetime("yyyy-MM-dd")
		// 	},
		// });
		// //清空日计划提交数据
		// const clearDailyPlanning = () => {
		// 	dailyPlanning.data.planNo = null;
		// 	dailyPlanning.data.planNoInvalid = false;
		// 	dailyPlanning.data.remark = null;
		// 	dailyPlanning.data.date = null;
		// };
		let dailyPlanDate: any = null;
		const getGannt = async () => {
			gantt.clearAll();
			gantt.i18n.setLocale('cn'); // 国际化
			gantt.setSkin(skinType.value); //设置甘特图皮肤 提前设置

			gantt.plugins({
				//export_api: true,
				tooltip: true, //鼠标划过任务是否显示明细
				grouping: true,
				multiselect: true, //为任务激活多任务选择
				undo: true,
				//quick_info: true, // 快速信息框
				//auto_scheduling: true,//根据任务之间的关系自动安排任务
				//auto_scheduling: true //为任务激活多任务选择
			});
			//lightBox 自定义按钮
			// gantt.locale.labels['breakDown_button'] = $t('ganttLabel.BreakDown');
			gantt.config.sort = true;
			gantt.config.task_color = '#4269E0';
			gantt.config.tooltip_offset_x = 30;
			gantt.config.tooltip_offset_y = -260;
			// gantt.config.grid_elastic_columns = true;
			// gantt.config.autofit = true;
			// gantt.config.multiselect = true; //是否多选
			// gantt.config.multiselect_one_level = true; //只选相同级别的
			//gantt.config.auto_scheduling = true; //自动调度模式
			//gantt.config.auto_scheduling_compatibility = true;

			/** 选中1列获得日期 */
			let selected_column: any = null;
			gantt.attachEvent('onScaleClick', function (e: any, date: any) {
				//clearDailyPlanning(); //每次打开清空数据
				selected_column = date;
				const pos = gantt.getScrollState();
				gantt.render();
				gantt.scrollTo(pos.x, pos.y);
				dailyPlanDate = selected_column.toFormat('yyyy-MM-dd');
				//判断是否有日订单权限
				//console.log('scheduleroleaction', scheduleroleaction);
				if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
					const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'dailyPlanning');
					if (res != -1) {
						//编制日计划
						resetGanttPlanningShell(dailyPlanning, dailyPlanDate);
						subPlanning(dailyPlanDate, props.ctx);
					}
				}
			});
			/**
			 * 甘特图选中一列
			 */
			const is_selected_column = (column_date: any) => {
				if (selected_column && column_date.valueOf() == selected_column.valueOf()) {
					return true;
				}
				return false;
			};
			gantt.templates.scale_cell_class = function (date) {
				if (is_selected_column(date)) return 'highlighted-column';
			};
			gantt.templates.timeline_cell_class = function (item, date) {
				if (is_selected_column(date)) return 'highlighted-column';
			};

			//允许拖放
			gantt.config.drag_project = true;
			//自动延长时间刻度
			gantt.config.fit_tasks = true;
			gantt.config.show_errors = false;
			gantt.config.autosize = false;
			// 仅仅渲染在屏幕可见的那部分时间轴。在处理时间轴非常长的时候，可以提升性能
			gantt.config.smart_scales = true;
			// 按需渲染, 仅仅渲染在屏幕可见的那部分任务和依赖线。这个在显示大量的任务时，性能比较高。
			gantt.config.smart_rendering = true;

			//禁止拖动进度
			gantt.config.drag_progress = false;
			gantt.config.date_format = '%Y-%m-%d %H:%i:%S'; //设置数据中的时间格式，对应start_date格式
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

			gantt.ext.zoom.init(zoomConfig);
			gantt.ext.zoom.setLevel(durationUnit.select.value);

			gantt.templates.leftside_text = function (start, end, task) {
				const { $api, $router, $toast: toast, $t: t } = props.ctx.globalProps;
				if (task.type == gantt.config.types.milestone) {
					return t('ganttLabel.milestones'); // + '  ' + task.projectName
				}
				return '';
			};

			// gantt.config.scale_unit = 'day'; // 设置时间单位为天
			// gantt.config.step = 1; // 设置每天有几个刻度，例如每小时一个刻度
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

			//弹出层 %H:%i
			gantt.config.lightbox.sections = [
				// // { name: 'time', height: 30, map_to: 'auto', type: 'time', time_format: ['%Y', '%m', '%d', '%H:%i'] },
				{ ...ganttPeriodSectionConfig(!scheduleroleaction.authority.allowEdit) },
				//{ name:"constraint", type:"constraint",map_to: 'auto'  },
				{
					name: 'constraintType',
					map_to: 'constraintType',
					type: 'select',
					options: constraintTypeListOptions.value,
					//onchange: changeConstraintType,
				},
				{ name: 'constraintDate', type: 'time', map_to: 'constraint_date', single_date: true, time_format: ['%Y', '%m', '%d'], readonly: !scheduleroleaction.authority.allowEdit },

				//{ name: 'constraintDate', type: 'duration', map_to: 'constraint_date'},
				//,readonly:constraintDateReady.value
				//item.constraint_date =item.constraintDate;
				//item.constraint_type = item.customProperties.$constraintType;

				{
					name: 'color',
					height: 30,
					map_to: 'taskColor',
					type: 'select',
					options: [
						{ key: '0099ff', label: '蓝色' },
						{ key: '00CC33', label: '绿色' },
						{ key: 'FF9933', label: '橙色' },
						{ key: 'FF0066', label: '红色' },
					],
				},
				{ name: 'remark', height: 80, map_to: 'remark', type: 'textarea', focus: true },
			];

			//没有权限不能修改限制时间 和 颜色
			if (!scheduleroleaction.authority.allowEdit) {
				updateLightboxSections(gantt.config.lightbox.sections.filter(
					section => section.name !== 'constraintType' && section.name !== 'color' && section.name !== 'color' && section.name !== 'remark'
				));
				gantt.config.buttons_left = [];
				gantt.config.buttons_right = ['gantt_cancel_btn'];
			}

			gantt.config.scale_height = getGanttGridColumnLayout(ganttBox.value?.clientWidth ?? 0).scaleHeight;
			//自动调整任务
			gantt.config.fit_tasks = true;

			gantt.config.date_format = '%Y-%m-%d %H:%i:%S';

			const startDateEditor = { type: 'date', map_to: 'start_date' };
			const endDateEditor = { type: 'date', map_to: 'end_date' };
			const durationEditor = { type: 'number', map_to: 'duration', min: 1 };

			const constraintTypeEditor = {
				type: 'select',
				map_to: 'constraintType',
				options: constraintTypeListOptions.value,
			};

			//左侧显示列名
			gantt.config.columns = [
				{
					name: 'refName',
					label: '类型',
					width: 150,
					resize: true,
					align: 'center',
					template: function (item) {
						return byType(gantt.serverList('taskType'), item.refName);
					},
				},
				{


					name: 'projectName',
					label: getScheduleNameColumnLabel(),
					resize: true,
					tree: true,
					align: 'left',
					width: 500,
					min_width: 240,
					template: function (task) {
						const startDate = new Date(task.start_date);
						const endDate = new Date(task.end_date);
						startDate.setHours(0, 0, 0, 0);
						endDate.setHours(0, 0, 0, 0);
						const nowDate = new Date();
						const diff = isLessThanTwoDay(nowDate, endDate);
						const diff2 = isLessThanOneDay(endDate, startDate); //判断项目时间是否只有1天

						if (task.refName != 'loadMore' && task.status != "FINISHED" && task.status != "CANCELED" && task.status != "TERMINATED") {
							if ((endDate.getTime() < nowDate.getTime() && !diff) || diff2) {
								return `<div class='errorImportant'>${formatScheduleNameCell(task, ' (延期) ')}</div>`;
							}
							else if (diff) {
								return `<div class='waringImportant'>${formatScheduleNameCell(task, ' (警告) ')}</div>`;
							}
							else {
								return formatScheduleNameCell(task);
							}
						}
						else {
							return formatScheduleNameCell(task);
						}
					}





				}, //map_to: 'taskName'
				{ name: 'start_date', label: '开始', width: 300, resize: true, align: 'center', editor: startDateEditor },
				{ name: 'end_date', label: '结束', width: 300, resize: true, align: 'center', editor: endDateEditor },
				{ name: 'duration', resize: true, label: '时长(天)', align: 'center' },// editor: durationEditor 
				{
					name: 'priority',
					resize: true,
					label: '优先级',
					align: 'center',
					template: (task: any) => getSchedulePriorityLabel(task),
				},
				{ name: 'statusType', resize: true, label: '状态', align: 'center' },
			];
			const columnLayout = applyGanttResponsiveLayout(gantt, ganttBox.value);

			//弹窗标题 日期范围
			gantt.templates.task_time = function (start: any, end: any, task: any) {
				return start.toFormat('yyyy-MM-dd HH:mm:ss') + ' - ' + end.toFormat('yyyy-MM-dd HH:mm:ss');
			};
			//弹窗标题 计划名称
			gantt.templates.task_text = function (start: any, end: any, task: any) {
				return task.text;
			};
			// tooltip：按 metaui listed 字段渲染；按生产订单时跳过 taskSummary（见下方注释）
			gantt.templates.tooltip_text = function (start, end, task) {
				if (!task) {
					return '';
				}
				const tooltipSeen = new Set<string>();
				let tooltipText = '';
				const typeNo = getScheduleTypeNoInfo(task);
				if (typeNo) {
					tooltipText = appendGanttTooltipFieldHtml(
						tooltipText,
						typeNo.label,
						typeNo.value,
						tooltipSeen
					);
				}
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
									itemFields.fieldName == 'lastModifierID' ||
									itemFields.fieldName == 'refNo'
								) {
									itemFields.listed = false;
								}

								if (itemFields.listed == true) {
									/**
									 * taskSummary 为后端聚合串时与 listed 字段重复；
									 * 按生产订单视图下一律跳过；其他视图仅跳过聚合格式，保留单行简述。
									 */
									if (itemFields.fieldName === 'taskSummary' && shouldSkipScheduleTooltipSummaryField(task)) {
										return;
									}
									if (shouldSkipScheduleTooltipTypeField(task, itemFields.fieldName)) {
										return;
									}
									// 订单行加产数量改由「订单数量」下方插入，避免重复
									if (
										isScheduleTooltipOrderRow(task) &&
										itemFields.fieldName === 'plusQuantity'
									) {
										return;
									}
									const fieldValue = getScheduleTooltipFieldValue(task, itemFields);
									if (fieldValue === null) {
										return;
									}
									tooltipText = appendGanttTooltipFieldHtml(
										tooltipText,
										getScheduleTooltipFieldLabel(itemFields, task),
										fieldValue,
										tooltipSeen
									);
									// 订单行：在「订单数量」下追加加产数量
									if (
										isScheduleTooltipOrderRow(task) &&
										(itemFields.fieldName === 'taskQuantity' ||
											itemFields.displayLabel === '任务数量')
									) {
										const plusQty = task.plusQuantity;
										tooltipText = appendGanttTooltipFieldHtml(
											tooltipText,
											'加产数量',
											plusQty == null ? '' : plusQty,
											tooltipSeen
										);
									}
								}
							});
						}
					});
				}

				return wrapGanttTooltipHtml(tooltipText);
			};

			//显示进度
			gantt.templates.progress_text = function (start, end, task) {
				return "<span style='text-align:left;'>" + Math.round(task.progress * 100) + '% </span>';
			};

			// if(!scheduleauthorityEdit.value){
			// 	gantt.config.quickinfo_buttons=[];
			// }else{
			//gantt.config.quickinfo_buttons=["icon_edit"];
			//}

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

			applyScheduleViewGridLayout();

			// 标准版 dhtmlx-gantt 无内置 Resizer，手动补充分隔线与列宽拖拽
			gantt.config.grid_elastic_columns = true;
			const gridPanelOptions = { columns: gantt.config.columns };
			const gridPanelWidth = getDefaultGanttGridPanelWidth(
				ganttBox.value?.clientWidth ?? 0,
				columnLayout,
				gridPanelOptions
			);
			gantt.config.layout = buildGanttScrollableLayout(
				gridPanelWidth,
				getGanttGridPanelMaxWidth(ganttBox.value?.clientWidth ?? 0, undefined, gridPanelOptions),
				getGanttGridPanelMinWidth(ganttBox.value?.clientWidth ?? 0, undefined, gridPanelOptions)
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
			if (isOrderScheduleView()) {
				syncScheduleGanttTaskDates(gantt);
			}
			syncOrderScheduleGanttSort();
			syncScheduleRowHeights();
			healProjectScheduleGanttLockState(gantt);
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
					css.push('gantt_resource_task gantt_resource_' + task.refName);
				}
				if (isOrderScheduleView() && isScheduleOrderSummaryRow(task)) {
					css.push('schedule-order-summary-row');
				}
				if (isOrderScheduleView() && (task.refName === 'ProductionTask' || resolveScheduleTaskLevel(task) === TaskLevel.TASK)) {
					css.push('schedule-order-task-row');
				}
				if (isOrderScheduleView() && task.refName === 'loadMore') {
					css.push('schedule-order-loadmore-row');
				}
				if (isOrderScheduleView() && isScheduleOrderSingleLineRow(task)) {
					css.push('schedule-order-single-line-row');
				}
				if (isProjectScheduleTaskLocked(task)) {
					css.push(PROJECT_SCHEDULE_TASK_LOCKED_CLASS);
				}

				return css.join(' ');
			};

		// gantt.templates.task_class = function (start, end, task) {

		// 		return 'highlighted_task';

		// 	//return '';
		// };

		//下拉 点击事件
		gantt.attachEvent('onTaskOpened', function (id) {
			const task = gantt.getTask(id);
			if (task.isLoadingChildren == true && task.isRead == false) {
				task.isRead = true;
				getSubSchedule(props.ctx, task, 'isOpen');
			} else if (isOrderScheduleView()) {
				nextTick(() => syncScheduleOrderRowHeights());
			}
			//any custom logic here
		});

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

		//lightBox之前事件
		gantt.attachEvent('onBeforeLightbox', function (id: any) {
			moveTaskList.value = [];
			oriData = '';
			const task = gantt.getTask(id);

			if (task.refName == 'loadMore' || task.refName == 'Project') {
				return false;
			}

			const canEdit = canGanttScheduleTaskEdit(task);
			ganttScheduleLightboxCanEdit = canEdit;
			oriData = snapshotProjectScheduleOriData(gantt, id);

			const leftButtons: string[] = [];
			const rightButtons = ['gantt_save_btn'];
			if (canEdit && task.actions && task.actions.length > 0) {
				task.actions.forEach((item: any) => {
					if (scheduleroleaction?.authority?.authorizedActions && scheduleroleaction?.authority?.authorizedActions.length > 0) {
						const res = scheduleroleaction?.authority?.authorizedActions.findIndex((item: any) => item.actionName == 'breakDown');
						if (res != -1) {
							if (item.name == 'breakDown') {
								gantt.locale.labels['breakDown_button'] = item.label;
								leftButtons.push('breakDown_button');
								leftButtons.reverse();
								gantt.config.buttons_left = leftButtons;
							}
						}
					}
				});
			}
			gantt.config.buttons_left = leftButtons;
			gantt.config.buttons_right = canEdit
				? [...rightButtons, 'gantt_cancel_btn']
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
				{ name: 'constraintDate', type: 'time', map_to: 'constraint_date', single_date: true, time_format: ['%Y', '%m', '%d'], readonly: lightboxReadonly },
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
						{ key: 'FF0066', label: '红色' },
						{ key: 'ff1493', label: '荧光粉色' },
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
				{ name: 'remark', height: 80, map_to: 'remark', type: 'textarea', focus: canEdit, readonly: lightboxReadonly },
			]);

			if (!scheduleroleaction.authority.allowEdit) {
				updateLightboxSections(gantt.config.lightbox.sections.filter(
					section => section.name !== 'constraintType' && section.name !== 'color' && section.name !== 'color' && section.name !== 'remark'
				));
				gantt.config.buttons_left = [];
				gantt.config.buttons_right = ['gantt_cancel_btn'];
				return false;
			}

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
				if (!ganttScheduleLightboxCanEdit) {
					lockProjectScheduleLightboxForm(gantt);
				}
			});
		});
		gantt.attachEvent('onAfterLightbox', function () {
			detachGanttLightboxPeriodValidation();
		});

		//分解变动
		const cBreak = (id: any, item: any, type: string) => {
			changeBreak(item, props.ctx);
		};
		// //移动进度后触发
		// gantt.attachEvent('onAfterTaskDrag', function (id: any, mode: any, e: any) {
		// 	cTask(id, mode, null);
		// });
		//添加链接后触发
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
		//删除链接后触发
		gantt.attachEvent('onAfterLinkDelete', function (id: any, item: any) {
			if (isNeedDeleteLink.value == true) {
				isNeedDeleteLink.value = false;
				return;
			} else {
				cLink(id, item, 'delete');
			}
		});
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

			// if (multiSelectList.data.length != 1) {
			// 	showPrepare.value = false;
			// }
		});
		// //灯箱保存按钮
		// gantt.attachEvent('onLightboxSave', function (id: any, task: any, is_new: any) {
		// 	//any custom logic here
		// 	if (!is_new) {
		// 		//cTask(id, 'update', task);
		// 	}
		// 	return true;
		// });

		//lightBox事件
		gantt.attachEvent('onLightboxButton', function (button_id: any, node: any, e: any) {
			const itemId = gantt.getState().lightbox;
			const taskItem = gantt.getTask(itemId);
			if (!canGanttScheduleTaskEdit(taskItem)) {
				return;
			}
			if (button_id == 'breakDown_button') {
				cBreak(itemId, taskItem, '');
			}
		});
		//灯箱保存按钮
		gantt.attachEvent('onLightboxSave', function (id: any, task: any, is_new: any) {
			if (!is_new && !canGanttScheduleTaskEdit(task)) {
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
					if (shouldClampStartToParentStart(task, parent) && task.start_date < parent.start_date) {
						task.start_date = parent.start_date;
						task.duration = task.orgDuration;
						task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
						gantt.refreshTask(task.id, true);
					}
				}

				task.entityState = 1;
				task.start_date.setHours(0, 0, 0);
				task.end_date.setHours(0, 0, 0);

				task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
				task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');

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

					child.start_date.setHours(0, 0, 0);
					child.end_date.setHours(0, 0, 0);
					child.color = '#' + task.taskColor;
					child.taskColor = task.taskColor;
					child.entityState = 1;
					child.expectedStart = child.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
					child.expectedStart = child.start_date.toFormat('yyyy-MM-dd HH:mm:ss');

					if (child.constraint_date) {
						child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
					}
					if (child.refName != 'loadMore') {
						moveTaskList.value.push(child);
					}
					gantt.refreshTask(child.id, true);
				}, id);

				// 结束时间统一为当天 00:00:00
				moveTaskList.value.forEach((item: any) => {
					const normalizedFinish = normalizeScheduleDateTimeString(item.expectedFinish);
					if (normalizedFinish) {
						item.expectedFinish = normalizedFinish;
					}
				});

				afterTaskOpened(moveTaskList.value, task);
			}
			return true;
		});

		//更新数据
		const afterTaskUpdate = (id: any, item: any) => {
			if (!item) {
				const task = gantt.getTask(id);
				if (task) {
					task.entityState = 1;
					task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
					task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
					//task.expectedDuration = task.duration;
					changeTasks(task, appContext);
				}
			} else {
				item.entityState = 1;
				item.expectedStart = item.start_date.toFormat('yyyy-MM-dd HH:mm:ss'); // 开始时间
				item.expectedFinish = item.end_date.toFormat('yyyy-MM-dd HH:mm:ss'); // 结束时间
				//item.expectedDuration = item.duration;
				//constraintType类型为NONE，时间改成空
				if (item.constraintType == 'NONE') {
					item.constraintDate = null;
				} else {
					item.constraintDate = item.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss'); //限制时间
				}
				changeTasks(item, appContext);
			}
		};

		// //甘特图 更新数据
		// const changeTasks = async (tasksItem: any, context: any) => {
		// 	console.log('拖拉拽');
		// 	const { $api, $router, $toast } = context.app.config.globalProperties;

		// 	if (tasksItem.action) {
		// 		tasksItem.action = null;
		// 	}

		// 	const tiem = JSON.parse(JSON.stringify(tasksItem));
		// 	//如果是项目
		// 	if (!tasksItem.parent || tasksItem.parent == 0) {
		// 		if (tiem.constraintDate) {
		// 			tiem.constraintDate = tiem.constraintDate + ' 00:00:00';
		// 		}
		// 	}

		// 	const updateList = <any>[];
		// 	let linkList = <any>[];
		// 	try {
		// 		let res: any = null;
		// 		const apiClient = $api as ApiClient;
		// 		res = await apiClient.doAction(
		// 			{
		// 				action: 'saveSchedule',
		// 				repository: 'ProjectSchedule',
		// 				service: 'mes',
		// 			},
		// 			tiem
		// 		);

		// 		if (res.projectID) {
		// 			//父级
		// 			if (res.project) {
		// 				const newTask = res.project;
		// 				newTask.id = newTask.projectID;
		// 				newTask.text = newTask.projectName;
		// 				newTask.start_date = newTask.expectedStart;
		// 				newTask.end_date = newTask.expectedFinish;
		// 				newTask.constraint_date = newTask.constraintDate ? new Date(newTask.constraintDate) : null;
		// 				newTask.duration = newTask.expectedDuration;
		// 				newTask.statusType = newTask.customProperties.$status;
		// 				//item.parent = item.parentTaskID;

		// 				newTask.color = !newTask.taskColor ? '537CFA' : newTask.taskColor;
		// 				newTask.taskColor = newTask.color;

		// 				newTask.constraint_type = newTask.customProperties.$constraintType;
		// 				newTask.isLoadingChildren = true; //是否已经加载过子集
		// 				newTask.refName = 'Project';
		// 				newTask.taskID = newTask.projectID;
		// 				console.log('newTask', newTask);
		// 				updateList.push(newTask);
		// 			}

		// 			//子项
		// 			if (res.tasks && res.tasks.length > 0) {
		// 				let newSbuLinkList: any;
		// 				linkList = res.tasks.map((item: any) => {
		// 					item.id = item.taskID;
		// 					item.text = item.taskName;
		// 					item.projectName = item.taskName;
		// 					item.start_date = item.expectedStart;
		// 					item.end_date = item.expectedFinish;
		// 					item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
		// 					item.duration = item.expectedDuration;
		// 					item.statusType = item.customProperties.$status;
		// 					item.color = !item.taskColor ? '537CFA' : item.taskColor;
		// 					item.taskColor = item.color;
		// 					item.constraint_type = item.customProperties.$constraintType;
		// 					//item.isLoadingChildren= true;//是否已经加载过子集
		// 					item.refName = 'ProjectTask';
		// 					//判断taskNo是否有点
		// 					//1个点 item.projectID
		// 					//两个点以上 取点数 -1点之前的值   item.projectID+ "_" +
		// 					const resNo = item.taskNo.split('.').length - 1;
		// 					if (resNo <= 0) {
		// 						item.parent = item.projectID;
		// 						const obj = <any>{};
		// 						obj.key = item.taskNo;
		// 						obj.value = item.taskID;
		// 						obj.projectID = item.projectID;
		// 						threeMep.data.push(obj);
		// 					} else {
		// 						//截取点长度后的值
		// 						// console.log('getSubstringBeforeNthDot(item.taskNo, resNo)', getSubstringBeforeNthDot(item.taskNo, resNo));
		// 						//根据NO找父亲
		// 						const taskID = getSubstringBeforeNthDot(item.taskNo, resNo);
		// 						const fartherObj = threeMep.data.filter((mapItem: any) => {
		// 							return mapItem.key == taskID && mapItem.projectID == item.projectID;
		// 						});
		// 						item.parent = fartherObj[0]?.value ?? '';
		// 					}
		// 					return item;
		// 				});
		// 			}

		// 			updateRes.data = [...updateList, ...linkList];
		// 			//console.log('updateRes.data', updateRes.data);
		// 			goUpdateTask(updateRes.data);
		// 		}
		// 		// 	//提交给组件更新数据
		// 	} catch (error: any) {
		// 		toast.add({
		// 			severity: 'error',
		// 			detail: error.message ?? '',
		// 			summary: error.detail ?? '',
		// 			life: 5000,
		// 		});
		// 		showLoading.value = false;
		// 		undoAction(); //报错返回
		// 		return false;
		// 	}
		// };

		// //修改任务后触发
		// gantt.attachEvent('onAfterTaskUpdate', function (id: any, item: any) {
		// 	item.entityState = 1;
		// 	item.expectedStart = item.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
		// 	item.expectedFinish = item.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
		// 	ctx.emit('changeTask', item, appContext);
		// });

		// 当任务编辑完成后触发的事件
		// gantt.attachEvent('onAfterTaskUpdate', function (id, item) {
		// 	if (!item) {
		// 		const task = gantt.getTask(id);
		// 		if (task) {
		// 			task.entityState = 1;
		// 			task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
		// 			task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
		// 			changeTask(task, props.ctx);
		// 		}
		// 	} else {
		// 		item.entityState = 1;
		// 		item.expectedStart = item.start_date.toFormat('yyyy-MM-dd HH:mm:ss'); // 开始时间
		// 		item.expectedFinish = item.end_date.toFormat('yyyy-MM-dd HH:mm:ss'); // 结束时间
		// 		//constraintType类型为NONE，时间改成空
		// 		if (item.constraintType == 'NONE') {
		// 			item.constraintDate = null;
		// 		} else {
		// 			item.constraintDate = item.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss'); //限制时间
		// 		}
		// 		changeTask(item, props.ctx);
		// 	}
		// });

		const showPlanButton = ref(false);
		gantt.attachEvent('onBeforeTaskSelected', function (id) {
			const beforeTask = gantt.getTask(id);
			if (beforeTask.refName == 'loadMore' && beforeTask.refName == 'Project') {
				showPlanButton.value = false;
				return false;
			}

			return true;
		});
		//选中一行
		gantt.attachEvent('onTaskSelected', function (id) {
			const taskSelectedItem = gantt.getTask(id);

			if (taskSelectedItem.refName != 'loadMore' && taskSelectedItem.refName != 'Project') {
				showPlanButton.value = true;
			}
			return true;
		});

		//拖拽之前
		gantt.attachEvent('onBeforeTaskDrag', function (id: any, mode: any, e: any) {
			clearProjectScheduleTaskReadonly(gantt);
			moveTaskList.value = [];
			oriData = '';
			const beforeTask = gantt.getTask(id);

			if (beforeTask.refName == 'loadMore' || beforeTask.refName == 'Project') {
				return false;
			}

			if (mode == 'move' || mode == 'resize') {
				if (!canGanttScheduleTaskEdit(beforeTask)) {
					return false;
				}
				oriData = snapshotProjectScheduleOriData(gantt, id);
				return true;
			}

			if (mode == 'progress') {
				if (beforeTask.subtaskNum > 0) {
					return false;
				}
				return canGanttScheduleTaskEdit(beforeTask);
			}

			return false;
		});

		(gantt as any).attachEvent('onTaskDragStart', function () {
			removeLockedProjectScheduleTasksFromDragMultiple(gantt);
		});

		//甘特图 拖动事件
		gantt.attachEvent('onTaskDrag', function (id: any, mode: any, task: any, original: any) {
			const modes = gantt.config.drag_mode;
			const liveTask = gantt.getTask(id);

			if (mode == modes.move && isProjectScheduleTaskLocked(liveTask)) {
				restoreLockedProjectScheduleTaskDragCopy(task, id, original, gantt);
				return false;
			}

			const parentId = task.parent ?? liveTask?.parent;
			const parent = parentId && parentId !== 0 && parentId !== '0' ? gantt.getTask(parentId) : null,
				skipChildCascade = shouldSkipProjectScheduleChildCascade(gantt, id);

			let limitLeft = null,
				limitRight = null;

			//限制移动，拖动
			if (mode == modes.move) {
				// task.start_date.setHours(0, 0, 0);
				// task.end_date.setHours(0, 0, 0);
				//判断限制日期
				if (task.constraint_date && task.refName == 'Project') {
					// if (+task.end_date >= +task.constraint_date) {
					// 	const dur = task.end_date - task.start_date;
					// 	task.end_date = new Date(task.constraint_date);
					// 	task.start_date = new Date(+task.end_date - dur);
					// } else {
					//是否有限制之间
					limitLeft = limitMoveLeft;
					limitRight = limitMoveRight;
					//}
				} else {
					limitLeft = limitMoveLeft;
					limitRight = limitMoveRight;
				}
			} else if (mode == modes.resize) {
				if (task.constraint_date && task.refName == 'Project') {
					// if (+task.end_date >= +task.constraint_date) {
					// 	const dur = task.end_date - task.start_date;
					// 	task.end_date = new Date(task.constraint_date);
					// } else {
					//是否有限制时间
					limitLeft = limitResizeLeft;
					limitRight = limitResizeRight;
					//}
				} else {
					limitLeft = limitResizeLeft;
					limitRight = limitResizeRight;
				}
			}

			//父子拖动
			if (mode == modes.move) {
				//check parents constraints
				if (parent && +parent.end_date < +task.end_date) {
					limitLeft(task, parent);
				}
				// 子订单(ProductionOrder)允许开始早于父订单：按项目/按生产订单均不 limitRight
				if (parent && +parent.start_date > +task.start_date) {
					const childRef = liveTask?.refName || task?.refName;
					if (childRef !== 'ProductionOrder') {
						limitRight(task, parent);
					}
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
				//check parents constraints
				if (parent && +parent.end_date < +task.end_date) {
					limitLeft(task, parent);
				}
				if (parent && +parent.start_date > +task.start_date) {
					const childRef = liveTask?.refName || task?.refName;
					if (childRef !== 'ProductionOrder') {
						limitRight(task, parent);
					}
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
		/**
		 * 齐料检查
		 */

		const getPrepare = (context: UiBuildContext<any>) => {
			const { $api, $router, $toast: toast, $t: t } = context.globalProps;
			const query: Record<string, string> = {
				type: 'CompleteMaterial',
				moduleCode: $router.currentRoute.value.meta?.module?.moduleCode ?? '',
				scheduleView: scheduleViewMode.value,
			};
			if (isOrderScheduleView()) {
				const orderID =
					selectgOrderSearchword.value?.orderID ?? multiSelectList?.data[0]?.orderID ?? '';
				query.orderID = orderID ?? '';
			} else {
				const projectID =
					selectgProjectSearchword.value?.projectID ?? multiSelectList?.data[0]?.projectID ?? '';
				query.projectID = projectID ?? '';
			}
			const route = {
				path: '/MES/ComputeKitting',
				query,
			};

			// 在新标签页打开
			const routeUrl = $router.resolve(route);
			window.open(routeUrl.href, '_blank');
		};

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

		const moveTaskList = ref([]);

		//rounds the positions of child items to the scale
		gantt.attachEvent('onAfterTaskDrag', function (id: any, mode: any, e: any) {
			moveTaskList.value = [];
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
					task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
					gantt.refreshTask(task.id, true);
				}
			}

			if (task.constraint_date) {
				task.constraintDate = task.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
			}

			if (mode == modes.move) {
				if (oriData) {
					restoreLockedProjectScheduleChildrenFromSnapshot(gantt, id, oriData);
				}
				task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
				task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
				moveTaskList.value.push(task);

				gantt.eachTask(function (child) {
					if (isProjectScheduleTaskLocked(child)) {
						return;
					}
					if (child.start_date < task.start_date && shouldClampStartToParentStart(child, task)) {
						child.start_date = task.start_date;
					} else if (child.end_date > task.end_date) {
						child.end_date = new Date(task.end_date);
					}

					child.start_date = gantt.roundDate(child.start_date);
					child.end_date = gantt.calculateEndDate(child.start_date, child.duration);

					child.start_date.setHours(0, 0, 0);
					child.end_date.setHours(0, 0, 0);
					child.entityState = 1;
					child.expectedStart = child.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
					child.expectedFinish = child.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
					if (child.constraint_date) {
						child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
					}
					if (child.refName != 'loadMore') {
						moveTaskList.value.push(child);
					}
					gantt.refreshTask(child.id, true);
				}, id);

				// 结束时间统一为当天 00:00:00
				moveTaskList.value.forEach((item: any) => {
					const normalizedFinish = normalizeScheduleDateTimeString(item.expectedFinish);
					if (normalizedFinish) {
						item.expectedFinish = normalizedFinish;
					}
				});

				afterTaskOpened(moveTaskList.value);
			} else if (mode == modes.resize) {
				gantt.eachTask(function (child) {
					if (isProjectScheduleTaskLocked(child)) {
						return;
					}
					if (child.end_date > task.end_date) {
						task.end_date = child.end_date;
						gantt.refreshTask(child.id, true);
					}
				}, id);
				task.start_date.setHours(0, 0, 0);
				task.end_date.setHours(0, 0, 0);
				task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
				task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
				moveTaskList.value.push(task);

				afterTaskOpened(moveTaskList.value);
			}
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
						repository: 'ProductionScheduleTasks',
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
		//撤销
		const undoAction = () => {
			gantt.undo();
		};
		const undoTaskDrag = () => {
			if (oriData) {
				const orgList = JSON.parse(oriData);
				console.log('orgList', orgList);
				goUpdateTask(orgList);
				healProjectScheduleGanttLockState(gantt);
			}
		};

		gantt.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {
			moveTaskList.value = [];
			if (scheduleroleaction?.authority?.allowEdit == false) {
				return false;
			}

			const task = gantt.getTask(state.id);
			if (task.refName == 'Project' || task.refName == 'loadMore') {
				return false;
			}
			if (isProjectScheduleTaskLocked(task)) {
				return false;
			}

			//开始时间
			if (state.columnName == 'start_date' || state.columnName == 'end_date') {
				oriData = snapshotProjectScheduleOriData(gantt, state.id);

				task.orgStart = task.start_date;
				task.orgEnd = task.end_date;
				task.orgDuration = task.duration;
				gantt.updateTask(task.id);
			}
		});
		//控制编辑权限
		//gantt.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {});

		//甘特图内连编辑
		gantt.ext.inlineEditors.attachEvent('onSave', function (state: any) {
			if (state.id && scheduleroleaction?.authority?.allowEdit == true) {
				const col = state.columnName;
				const task: any = gantt.getTask(state.id);

				if (col == 'start_date' || col == 'end_date' || col == 'duration') {
					const parent = task.parent ? gantt.getTask(task.parent) : null;
					if (parent) {
						if (task.end_date >= parent.end_date) {
							task.end_date = parent.end_date;
							task.duration = gantt.calculateDuration(task.start_date, task.end_date);
							gantt.refreshTask(task.id, true);
						}
						if (shouldClampStartToParentStart(task, parent) && task.start_date < parent.start_date) {
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

					//	afterTaskUpdate(state.id, task);
					const diff = task.start_date - task.orgStart;
					task.entityState = 1;
					task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
					task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');

					if (task.constraintDate) {
						task.constraintDate = new Date(task.constraintDate);
						task.constraintDate = task.constraintDate.toFormat('yyyy-MM-dd HH:mm:ss');
					}

					moveTaskList.value.push(task);


					if (col == 'end_date') {
						gantt.eachTask(function (child) {
							if (isProjectScheduleTaskLocked(child)) {
								return;
							}
							child.end_date = new Date(child.end_date);
							if (child.end_date > task.end_date) {
								task.end_date = child.end_date;
								gantt.refreshTask(child.id, true);
							}
							// child.start_date.setHours(0, 0, 0);
							// child.end_date.setHours(0, 0, 0);
							// child.entityState = 1;
							// child.expectedStart = child.start_date.toFormat('yyyy-MM-dd  HH:mm:ss');
							// child.expectedFinish = child.end_date.toFormat('yyyy-MM-dd  HH:mm:ss');
							// if (child.constraint_date) {
							// 	child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
							// }
							// if (child.refName != 'loadMore') {
							// 	moveTaskList.value.push(child);
							// }
							gantt.refreshTask(state.id, true);
						}, state.id);
					}

					if (col == 'start_date') {
						gantt.eachTask(function (child) {
							if (isProjectScheduleTaskLocked(child)) {
								return;
							}
							child.start_date = new Date(child.start_date);
							child.end_date = new Date(child.end_date);
							child.start_date = new Date(+child.start_date + diff);
							child.end_date = new Date(+child.end_date + diff);


							if (child.start_date < task.start_date && shouldClampStartToParentStart(child, task)) {
								child.start_date = task.start_date;
							} else if (child.end_date > task.end_date) {
								child.end_date = new Date(task.end_date);
							}


							child.start_date.setHours(0, 0, 0);
							child.end_date.setHours(0, 0, 0);
							child.entityState = 1;
							child.expectedStart = child.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
							child.expectedFinish = child.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
							if (child.constraint_date) {
								child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
							}
							if (child.refName != 'loadMore') {
								moveTaskList.value.push(child);
							}
							gantt.refreshTask(child.id, true);
						}, state.id);
					}



					// gantt.eachTask(function (child) {
					// 	child.start_date = new Date(+child.start_date + diff);
					// 	child.end_date = new Date(+child.end_date + diff);
					// 	// child.start_date.setHours(0, 0, 0);
					// 	// child.end_date.setHours(0, 0, 0);
					// 	child.entityState = 1;
					// 	// child.expectedStart = child.start_date.toFormat('yyyy-MM-dd  HH:mm:ss');
					// 	// child.expectedFinish = child.end_date.toFormat('yyyy-MM-dd  HH:mm:ss');
					// 	if (child.constraint_date) {
					// 		child.constraintDate = child.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss');
					// 	}
					// 	if (child.refName != 'loadMore') {
					// 		moveTaskList.value.push(child);
					// 	}
					// 	gantt.refreshTask(child.id, true);
					// }, state.id);

					// 结束时间统一为当天 00:00:00
					moveTaskList.value.forEach((item: any) => {
						const normalizedFinish = normalizeScheduleDateTimeString(item.expectedFinish);
						if (normalizedFinish) {
							item.expectedFinish = normalizedFinish;
						}
					});




					// 			//父子拖动
					// if (mode == modes.move) {
					// 	//check parents constraints
					// 	if (parent && +parent.end_date < +task.end_date) {
					// 		limitLeft(task, parent);
					// 	}
					// 	if (parent && +parent.start_date > +task.start_date) {
					// 		limitRight(task, parent);
					// 	}
					// 	const diff3 = task.start_date - original.start_date;
					// 	gantt.eachTask(function (child) {
					// 		child.start_date = new Date(+child.start_date + diff3);
					// 		child.end_date = new Date(+child.end_date + diff3);
					// 		gantt.refreshTask(child.id, true);
					// 	}, id);
					// }

					// if (mode == modes.resize) {
					// 	//check parents constraints
					// 	if (parent && +parent.end_date < +task.end_date) {
					// 		limitLeft(task, parent);
					// 	}
					// 	if (parent && +parent.start_date > +task.start_date) {
					// 		limitRight(task, parent);
					// 	}

					// 	gantt.eachTask(function (child) {
					// 		if (child.start_date < task.start_date) {
					// 			task.start_date = child.start_date;
					// 			gantt.refreshTask(child.id, true);
					// 		}
					// 		if (child.end_date > task.end_date) {
					// 			task.end_date = child.end_date;
					// 			gantt.refreshTask(child.id, true);
					// 		}
					// 	}, id);
					// }











					afterTaskOpened(moveTaskList.value);
				}

				// else if (col == 'duration') {
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
				// 	task.entityState = 1;
				// 	task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
				// 	task.end_date.setHours(23, 59, 59);
				// 	task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
				// 	moveTaskList.value.push(task);
				// 	afterTaskOpened(moveTaskList.value);

				// }
			}
		});

		// //移动 拖拽， 忽视， 进度条的调用函数 mode ("resize", "progress", "move", "ignore")
		// const cTask = (id: any, mode: any, item: any) => {
		// 	if (mode == 'resize' || mode == 'move' || mode == 'update') {
		// 		if (!item) {
		// 			const task = gantt.getTask(id);
		// 			if (task) {
		// 				task.entityState = 1;
		// 				task.expectedStart = task.start_date.toFormat('yyyy-MM-dd HH:mm:ss');
		// 				task.expectedFinish = task.end_date.toFormat('yyyy-MM-dd HH:mm:ss');
		// 				changeTask(task,appContext);
		// 				ctx.emit('changeTask', task, appContext);
		// 			}
		// 		} else {
		// 			item.entityState = 1;
		// 			item.expectedStart = item.start_date.toFormat('yyyy-MM-dd HH:mm:ss'); // 开始时间
		// 			item.expectedFinish = item.end_date.toFormat('yyyy-MM-dd HH:mm:ss'); // 结束时间
		// 			//constraintType类型为NONE，时间改成空
		// 			if (item.constraintType == 'NONE') {
		// 				item.constraintDate = null;
		// 			} else {
		// 				item.constraintDate = item.constraint_date.toFormat('yyyy-MM-dd HH:mm:ss'); //限制时间
		// 			}
		// 			ctx.emit('changeTask', item, appContext);
		// 		}
		// 	}
		// };

		//link变动
		const cLink = (id: any, item: any, type: string) => {

			console.log("item",item);
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
			changeLink(item, appContext);
		};

		//task更新
		const goUpdateTask = (newData: any) => {
			newData.forEach((item: any) => {
				let task: Task;

				if (item.id) {
					task = gantt.getTask(item.id);
				} else {
					task = gantt.getTask(item.taskID);
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

					task.status = item.status;
					task.statusType = item.statusType ?? item.customProperties?.$status;
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
			hideGanttLightboxIfOpen();
			gantt.refreshData();
		};

		//link更新
		const goUpdateLink = (newData: any) => {
			gantt.refreshData();
			//getLinkRes(false);
		};
		//break 分解更新
		const goUpdateBreak = (newData: any) => {
			gantt.refreshData();
			goUpdateBreak(false);
		};

		//判断添加link之前：仅允许同级 TASK 级别任务手动连线（接口加载的 link 不校验）
		gantt.attachEvent('onBeforeLinkAdd', function (id: any, item: any) {
			if (item.getLoad) {
				canReflashLink.value = true;
				return true;
			}
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
			return validateManualScheduleLink(fromTask, toTask, toast, $t);
		});

		gantt.attachEvent('onBeforeLinkDelete', function (id: any, link: any) {
			if (link.getLoad) {
				return true;
			}
			const fromTask = gantt.getTask(link.source);
			const toTask = gantt.getTask(link.target);
			return validateManualScheduleLink(fromTask, toTask, toast, $t);
		});

		gantt.attachEvent('onBeforeLinkUpdate', function (id: any, link: any) {
			if (link.getLoad) {
				return true;
			}
			const fromTask = gantt.getTask(link.source);
			const toTask = gantt.getTask(link.target);
			return validateManualScheduleLink(fromTask, toTask, toast, $t);
		});
		const isProjectSearchDialogOpen = ref(false);
		const isOrderSearchDialogOpen = ref(false);
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
				// 注意：此处 buildColumns / confirmDialog 传入的是 props.ctx（生产看板上下文，metaui 为 null）。
				// 列定义带 SearchRelative cacheKey 时，弹窗关闭重渲染会走 context.with → _formatSubName，
				// 可能触发「Cannot read properties of undefined (reading 'primaryKey')」。
				// 若取消报错，应改用 props.ctx.selectContext({ repository, service, ctor }) 作为表格上下文。
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
						name: 'projectSearchForRelative',
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
		const openOrderSearchDialog = async () => {
			if (isOrderSearchDialogOpen.value) {
				return;
			}
			isOrderSearchDialogOpen.value = true;
			let data = [] as any;
			// 打开弹窗前缓存当前选中，取消/关闭时还原外层展示
			const snapshotSelected = resolveSelectedOrder();
			if (snapshotSelected?.orderID) {
				temporarilySelectOrder.value = { ...snapshotSelected };
			}
			try {
				const { metaui } = await props.ctx.logic.loadMetadata('ProductionOrders', 'mes', true);
				orderDataKEY.value = metaui.primaryKey;
				orderDialogPager.value = {
					pageSize: 10,
					pageNo: 1,
				};
				// 注意：此处 buildColumns / confirmDialog 传入的是 props.ctx（生产看板上下文，metaui 为 null）。
				// 列定义带 SearchRelative cacheKey 时，弹窗关闭重渲染会走 context.with → _formatSubName，
				// 可能触发「Cannot read properties of undefined (reading 'primaryKey')」。
				// 若取消报错，应改用 props.ctx.selectContext({ repository: 'ProductionOrders', service: 'mes', ctor: defineProductionOrder }) 作为表格上下文。
				const columns = await props.ctx.uiBuilder.buildColumns(metaui, props.ctx, {
					isSearch: true,
					cacheKey: `orderID/SearchRelative/${metaui.primaryKey}`,
				});
				props.ctx.uiBuilder.confirmDialog(
					(props.ctx.uiBuilder as any).buildSearchForRelativeContent(columns, {
						dataKey: orderDataKEY.value,
						onSearch: async (params: any) => {
							const { searchParams } = params;
							await getOrderDialogData(props.ctx, searchParams.searchWord);
							return { list: orderDialogData.value, pager: orderDialogPager.value };
						},
						onPage: ({ pageNo, pageSize }: any) => {
							orderDialogPager.value = {
								...orderDialogPager.value,
								pageNo,
								pageSize,
							};
						},
						onSelect: (selection: any, row: any) => {
							data = row;
						},
						onRowDblclick(data: any) {
							selectgOrderSearchword.value = data;
							selectgOrder.value = data;
							temporarilySelectOrder.value = data;
							reloadParam.orderID = data.orderID;
							multiSelectList.data = [];
							persistOrderFilterCache(data);
							ensureSelectedOrderInOuterOptions();
							triggerEscKey();
						},
					}),
					props.ctx,
					{
						name: 'orderSearchForRelative',
						title: $t('ganttLabel.selectProductionOrder'),
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
							selectgOrderSearchword.value = data;
							selectgOrder.value = data;
							temporarilySelectOrder.value = data;
							reloadParam.orderID = data.orderID;
							multiSelectList.data = [];
							persistOrderFilterCache(data);
							ensureSelectedOrderInOuterOptions();
							return true;
						},
						reject: async () => {
							const restored = Array.isArray(temporarilySelectOrder.value)
								? temporarilySelectOrder.value[0]
								: temporarilySelectOrder.value;
							selectgOrder.value = restored ?? null;
							selectgOrderSearchword.value = restored ?? null;
							reloadParam.orderID = restored?.orderID ?? null;
							ensureSelectedOrderInOuterOptions();
							return true;
						},
						onHide: () => {
							isOrderSearchDialogOpen.value = false;
							// 关窗（含点 X / 蒙层）后，把已选订单补回外层 options，避免 [object Object]
							ensureSelectedOrderInOuterOptions();
							return true;
						},
					}
				);
			} catch {
				isOrderSearchDialogOpen.value = false;
				ensureSelectedOrderInOuterOptions();
			}
		};
		const throttledOpenProjectSearchDialog = throttle(openProjectSearchDialog, 500);
		const throttledOpenOrderSearchDialog = throttle(openOrderSearchDialog, 500);
		return () =>
			h('div', {}, [
				scheduleroleaction?.authority?.allowRead == true
					? h('div', {}, [
						showLoading.value ? h('div', { class: 'loadingBox' }, [ui.factory.loading({})]) : '',
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
												},
												optionLabel: 'name',
											}),
									}
								),

								h('div', { class: showProjectFilter.value && !isOrderScheduleView() ? '' : 'hidden' }, [
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
								]),

								h('div', { class: isOrderScheduleView() && canReadProductionOrder.value ? '' : 'hidden' }, [
									ui.factory.formItem(
										{
											label: $t('ganttLabel.sProductionOrder'),
										},
										{
											default: () =>
												h('div', { class: 'selfdivBox project' }, [
													ui.factory.searchForRelative({
														role: `defectDesc-search-for-sProductionOrder`,
														name: 'defectDesc-search-for-sProductionOrder',
														id: 'defectDesc-search-for-sProductionOrder',
														modelValue: selectgOrderSearchword.value,
														placeholder: $t('ganttLabel.sProductionOrder'),
														options: orderData.value,
														dataKey: 'orderID',
														optionLabel: formatProductionOrderSelectLabel,
														onInput: (value: string) => {
															if (selectgOrderIsComposing.value) return;
															debounce(async () => {
																await getOrderData2(props.ctx, value);
															}, 500)();
														},
														onCompositionstart: () => {
															selectgOrderIsComposing.value = true;
														},
														onCompositionend: (e: any) => {
															debounce(async () => {
																await getOrderData2(props.ctx, e.target.value);
															}, 500)();
															selectgOrderIsComposing.value = false;
														},
														toSearch: () => {
															throttledOpenOrderSearchDialog();
														},
														onUpdate: (value: any) => {
															applyProductionOrderFilter(value);
														},
														onChange: (value: any) => {
															applyProductionOrderFilter(value);
														},
														// editable Select 点 X 有时不触发 onUpdate，业务侧拦截清除图标
														pt: {
															clearIcon: {
																onClick: (event: Event) => {
																	event.preventDefault();
																	event.stopPropagation();
																	clearProductionOrderFilter();
																},
															},
														},
													}),
												]),
										}
									),
								]),

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
												// 按生产订单时选项来自 ProductionOrders 状态枚举
												options: isOrderScheduleView() ? orderStatusListOptions.value : statusListOptions.value,
												placeholder: $t('ganttLabel.status'),
												onUpdate: (value: string) => {
													selectStatus.value = value;
													if (value && value.length > 0) {
														reloadParam.status = toSQL(value);
													} else {
														reloadParam.status = '';
													}

													props.ctx.app.localDb.put(`search/${props.ctx.logic.repository}/${getStatusCacheKey()}`, JSON.parse(JSON.stringify(value)));
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
												id: 'productionScheduleFuzzySearch',
												name: 'production_schedule_fuzzy_search',
												autoComplete: 'off',
												readonly: !scheduleFuzzySearchFocused.value,
												onFocus: (e: FocusEvent) => {
													scheduleFuzzySearchFocused.value = true;
													(e.target as HTMLInputElement)?.removeAttribute('readonly');
												},
												onBlur: (e: FocusEvent) => {
													scheduleFuzzySearchFocused.value = false;
													const el = e.target as HTMLInputElement;
													const clearAutofillLeak = () => {
														const leaked = el?.value ?? reloadParam.searchWord;
														if (isFuzzySearchAutofillLeak(leaked)) {
															reloadParam.searchWord = '';
															if (el) {
																el.value = '';
															}
														}
													};
													clearAutofillLeak();
													// 打开修改密码等弹窗后，浏览器可能延迟自动填充背景输入框
													setTimeout(clearAutofillLeak, 150);
													setTimeout(clearAutofillLeak, 500);
												},
												onUpdate: (value: string) => {
													if (!scheduleFuzzySearchFocused.value || isFuzzySearchAutofillLeak(value ?? '')) {
														return;
													}
													reloadParam.searchWord = value ?? '';
												},
											}),
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

									hasGanttData.value
										? ui.factory.button({
											id: 'exportGantt',
											icon: 'pi pi-file-export',
											severity: 'info',
											label: $t('ganttLabel.export'),
											onAction: () => {
												getGanntExcel();
											},
										})
										: null,
									hasGanttData.value
										? ui.factory.button({
											id: 'issue',
											icon: 'pi pi-pen-to-square',
											label: $t('ganttLabel.DevelopPlan'),
											onAction: () => {
												subPlanning('', props.ctx);
											},
										})
										: null,
									showComputeKitting.value == true
										? ui.factory.button({
											id: 'prepare',
											icon: 'pi pi-pen-to-square',
											severity: 'success',
											label: $t('ganttLabel.completeMaterialInspection'),
											onAction: () => {
												getPrepare(props.ctx);
											},
										})
										: null,
								]),
								showScheduleViewModeToggle.value
									? h('div', {
										class: [
											'scheduleViewModeToggle',
											scheduleViewModeSwitching.value ? 'scheduleViewModeToggle--loading' : '',
										],
									}, [
										scheduleViewModeSwitching.value
											? h('div', { class: 'scheduleViewModeToggle__spinner' }, [ui.factory.loading({})])
											: null,
										ui.factory.selectButton(scheduleViewMode, {
											id: 'scheduleViewModeToggle',
											key: `scheduleViewMode-${scheduleViewMode.value}`,
											disabled: scheduleViewModeSwitching.value,
											allowEmpty: false,
											options: [
												{ name: $t('ganttLabel.scheduleByProject'), value: 'project' },
												{ name: $t('ganttLabel.scheduleByOrder'), value: 'order' },
											],
											optionLabel: 'name',
											optionValue: 'value',
											onUpdate: (value: 'project' | 'order') => {
												if (scheduleViewModeSwitching.value) {
													return;
												}
												if (value === scheduleViewMode.value) {
													(document.activeElement as HTMLElement)?.blur?.();
													return;
												}
												switchScheduleViewMode(value);
											},
										}),
									])
									: null,
							]),
						]),
					])
					: '',
				h('div', { class: 'ganttBoxWrapper ganttBoxWrapper--schedule' }, [
					h('div', { ref: ganttBox, class: 'ganttBoxStyle2 ganttBoxInner' }),
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
			]);
	},
});
