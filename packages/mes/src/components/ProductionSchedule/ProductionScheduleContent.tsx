import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, inject } from 'vue';
import { isRefNone, type ApiClient } from '@mmda/core';
import './ProductionSchedule.less';


import { get } from 'http';
import { build } from 'vite';
import '@/assets/animate.min.css';
import { uiBuilder } from '@/mes';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { ProductionOrderStatus, ProductionOrderStatusEnum } from '@/enums/ProductionOrderStatus';
import type { UiViewManyProps, UiBuilder, UiLayout, UiListTileRenderer, UiListTileSlots } from '@mmda/vui';
import { MES_KEY } from '@/keys';


export default defineComponent({
	name: 'ProductionScheduleContent',
	// props: {
	//   // 当前实体上下文
	//   entityContext: Object
	// },
	//props: ['entityContext'],
	setup(props, ctx) {
		type TasksType = {
			data: any;
			links: any;
		};
		const ganttBox = ref();
		//const apiBox = getCurrentInstance().appContext;
		const apiClient = getCurrentInstance().appContext.app.config.globalProperties.$api as ApiClient;
		const { $t, appGlobal } = getCurrentInstance().appContext.app.config.globalProperties;
		//const { entityContext: context } = props
		//const { metaUiService } = context
		//const { $api: apiBox, $ui: ui, $router: router } = context.globalProps

		const { appContext } = getCurrentInstance();
		const mes = inject(MES_KEY);
		const { meta: metaUiService, di, i18n, ui } = mes;
		let field: any
		metaUiService.getPack({ repository: 'Stations', service: 'mes' }).then((res: any) => {
			const { metaui } = res
			field = metaui.getField("lineID")
			console.log('res', res, field, ui);
		});


		//搜索条件
		const queryDate = reactive({
			qDate: {
				refNo: null, //订单
				lineID: null, //产线
				status: null, //状态
			},
		});

		const linePageInfo = reactive({
			searchWord: '',
		});
		//产线下拉选择
		const lineOptionsAll = ref([]);
		//获取产线列表
		const getLineList = async (query: any) => {
			try {
				let res = null;
				if (query) {
					linePageInfo.searchWord = query;
				} else {
					linePageInfo.searchWord = '';
				}
				res = await apiClient.getAll({
					repository: 'ProductionLines',
					queryParams: linePageInfo,
					service: 'mes',
				});

				if (res.list && res.list.length > 0) {
					lineOptionsAll.value = [];

					lineOptionsAll.value = res.list.map((item: any) => {
						return {
							lineID: `${item.lineID}`,
							label: `${item.lineName ?? ''}`,
						};
					});
				} else {
					lineOptionsAll.value = [];
				}
			} catch (error: any) {
				appGlobal.uiBuilder.toast({
					severity: 'error',
					title: $t('dialog.title.error'),
					summary: error.detail ?? '',
					group: 'br',
					life: 3000,
				});
				return false;
			}
		};


		const productionOrderStatusEnum: any[] = [];





		//过滤产线
		const lineFilter = (event: any) => {
			if (event.value) {
				getLineList(event.value);
			} else {
				getLineList('');
			}
		};

		// 计划排程的编辑权限
		const scheduleauthorityEdit = ref(true);
		//甘特图数据
		const tasks = reactive<TasksType>({
			data: [],
			links: [],
		});

		//{ id: 1, source: 1, target: 2, type: '0' }
		// { id: 1, text: 'Task #1', start_date: '15-04-2017', personName: '张总', duration: 3, progress: 0.6 },
		// { id: 2, text: 'Task #2', start_date: '18-04-2017', personName: '李总', duration: 3, progress: 0.4 },
		// { id: 3, text: 'Task #2-1', start_date: '20-04-2017', personName: '赵总', duration: 3, progress: 0.4, parent: 2 },

		//选中的时间
		const durationUnit = reactive({
			select: {
				name: '按日',
				value: 'day',
			},
		});

		const timeList = [
			{
				name: '按小时',
				value: 'hour',
			},
			{
				name: '按日',
				value: 'day',
			},
			// {
			// 	name: '按周',
			// 	value: 'week',
			// },
			{
				name: '按月',
				value: 'month',
			},
			{
				name: '按年',
				value: 'year',
			},
		];
		//选择时间切换
		const selectTimeChange = () => {
			const ganntTime = JSON.stringify(durationUnit.select);
			localStorage.setItem('ganntTime', ganntTime);
			getGannt();
		};
		const ganntColumnList = [
			{ name: 'text', label: '计划名称', tree: true },
			{ name: 'productCategory', label: '产品类型', align: 'center' },
			// { name: 'content', label: '加工内容', align: 'center', width: '300' },
			// { name: 'processName', label: '制程', align: 'center', width: '300' },
			// { name: 'expectedOutput', label: '面积', align: 'center', width: '300' },
			// {
			// 	name: 'actualOutput',
			// 	label: '完成面积',
			// 	align: 'center',
			// 	width: '300',
			// 	template: function (obj: any) {
			// 		if (obj.actualOutput == 0) {
			// 			obj.actualOutput = '';
			// 		}
			// 		return obj.actualOutput;
			// 	},
			// },
			// {
			// 	name: 'surplusOutput',
			// 	label: '剩余面积',
			// 	align: 'center',
			// 	width: '300',
			// 	template: function (obj: any) {
			// 		if (obj.surplusOutput == 0) {
			// 			obj.surplusOutput = '';
			// 		}
			// 		return obj.surplusOutput;
			// 	},
			// },
			// {
			// 	name: 'progress',
			// 	label: '进度',
			// 	align: 'center',
			// 	width: '40',
			// 	template: function (obj: any) {
			// 		let res = '';
			// 		if (obj.progress == 0) {
			// 			res = '';
			// 		} else {
			// 			res = Math.floor(obj.progress * 100).toString() + '%';
			// 		}
			// 		return res;
			// 	},
			// },
			// { name: 'status', label: '状态', align: 'center' },
		];

		const showGanntColumn = ganntColumnList;

		const getGannt = () => {
			gantt.i18n.setLocale('cn'); // 国际化
			//gantt.config.grid_elastic_columns = true;
			//布局
			// gantt.config.layout = {
			// 	css: 'gantt_container',
			// 	cols: [
			// 		{
			// 			rows: [
			// 				{
			// 					view: 'grid',
			// 					scrollable: true,
			// 					scrollX: 'scrollHor1',
			// 					scrollY: 'scrollVer',
			// 					width: 200,
			// 				},
			// 				{
			// 					view: 'scrollbar',
			// 					id: 'scrollHor1',
			// 					scroll: 'x',
			// 					group: 'hor',
			// 				},
			// 			],
			// 		},
			// 		{ resizer: true, width: 1 },
			// 		{
			// 			rows: [
			// 				{
			// 					view: 'timeline',
			// 					scrollX: 'scrollHor',
			// 					scrollY: 'scrollVer',
			// 				},
			// 				{
			// 					view: 'scrollbar',
			// 					id: 'scrollHor',
			// 					scroll: 'x',
			// 					group: 'hor',
			// 				},
			// 			],
			// 		},
			// 		{
			// 			view: 'scrollbar',
			// 			id: 'scrollVer',
			// 		},
			// 	],
			// };
			gantt.config.scale_height = 50;
			gantt.config.show_tasks_outside_timescale = true;
			gantt.config.duration_unit = durationUnit.select.value;

			//左侧显示列名
			gantt.config.columns = showGanntColumn;

			//弹出层 %H:%i
			gantt.config.lightbox.sections = [
				// { name: 'text', height: 30, map_to: 'text', type: 'textarea', focus: true, width: 200 },
				// { name: 'time', height: 30, map_to: 'auto', type: 'time', time_format: ['%Y', '%m', '%d', '%H:%i'] },
				{ name: 'time', height: 30, map_to: 'auto', type: 'time', time_format: ['%Y', '%m', '%d', '%H:%i'] },
				{
					name: 'color',
					height: 30,
					map_to: 'color',
					type: 'select',
					options: [
						{ key: '#0099ff', label: '蓝色' },
						{ key: '#00CC33', label: '绿色' },
						{ key: '#FF9933', label: '橙色' },
						{ key: '#FF0066', label: '红色' },
					],
				},
			];
			//弹窗标题 日期范围
			gantt.templates.task_time = function (start, end, task) {
				return start.toFormat('YYYY-MM-DD HH:mm:ss') + ' - ' + end.toFormat('YYYY-MM-DD HH:mm:ss');
			};
			//弹窗标题 计划名称
			gantt.templates.task_text = function (start, end, task) {
				return task.text;
			};
			gantt.templates.tooltip_text = function (start, end, task) {
				if (task.refName == 'ProductionJob') {
					task.text = task.text == null ? '' : task.text;
					task.productionNo = task.productionNo == null ? '' : task.productionNo;
					task.kitting = task.kitting == null ? '' : task.kitting;
					task.opGroup = task.opGroup == null ? '' : task.opGroup;
					task.opName = task.opName == null ? '' : task.opName;
					task.content = task.content == null ? '' : task.content;
					task.processName = task.processName == null ? '' : task.processName;
					task.expectedOutput = task.expectedOutput == null ? '' : task.expectedOutput;
					task.actualOutput = task.actualOutput == null ? '' : task.actualOutput;
					task.surplusOutput = task.surplusOutput == null ? '' : task.surplusOutput;
					task.quantity = task.quantity == null ? '' : task.quantity;
					task.productCategory = task.productCategory == null ? '' : task.productCategory;
					task.status = task.status == null ? '' : task.status;
					return (
						'<b>任务名称:</b> ' +
						task.text +
						'<br/><b>' +
						task.productionNo +
						'<br/>' +
						'<b style="margin-top:20px;">材料情况:</b> ' +
						//task.kitting +
						'<br/>'
						// +'<b style="margin-top:20px;">工序组:</b> ' +
						// task.opGroup +
						// '<br/>' +
						// '<b style="margin-top:20px;">工序:</b> ' +
						// task.opName +
						// '<br/>' +
						// '<b style="margin-top:20px;">加工内容:</b> ' +
						// task.content +
						// '<br/>' +
						// '<b style="margin-top:20px;">任务时间:</b> ' +
						// start.toFormat('YYYY-MM-DD HH:mm:ss') +
						// ' - ' +
						// start.toFormat('YYYY-MM-DD HH:mm:ss') +
						// '<br/>' +
						// '<b style="margin-top:20px;">制程:</b> ' +
						// task.processName +
						// '<br/>' +
						// '<b style="margin-top:20px;">面积:</b> ' +
						// task.expectedOutput +
						// '<br/>' +
						// '<b style="margin-top:20px;">完成面积:</b> ' +
						// task.actualOutput +
						// '<br/>' +
						// '<b style="margin-top:20px;">剩余面积:</b> ' +
						// task.surplusOutput +
						// '<br/>' +
						// '<b style="margin-top:20px;">数量:</b> ' +
						// task.quantity +
						// '<br/>' +
						// '<b style="margin-top:20px;">产品类型:</b> ' +
						// task.productCategory +
						// '<br/>' +
						// '<b style="margin-top:20px;">状态:</b> ' +
						// task.status
					);
				} else {
					return '';
				}
			};
			gantt.plugins({
				tooltip: true, //鼠标划过任务是否显示明细
				grouping: true,
				quick_info: true, // 快速信息框
				//auto_scheduling: true,//根据任务之间的关系自动安排任务
				// multiselect: true, //为任务激活多任务选择
			});

			// gantt.config.drag_move = scheduleauthorityEdit.value;
			// gantt.config.drag_resize = scheduleauthorityEdit.value;
			// gantt.config.details_on_dblclick = scheduleauthorityEdit.value;
			// gantt.config.show_links = scheduleauthorityEdit.value; // 禁用连线
			// if (!scheduleauthorityEdit.value) {
			// 	gantt.config.quickinfo_buttons = [];
			// } else {
			// 	gantt.config.quickinfo_buttons = ['icon_edit'];
			// }

			// if(!scheduleauthorityEdit.value){
			// 	gantt.config.quickinfo_buttons=[];
			// }else{
			// 	gantt.config.quickinfo_buttons=["icon_edit"];
			// }

			gantt.init(ganttBox.value);
			gantt.parse(tasks);
		};

		//修改任务后触发
		gantt.attachEvent('onAfterTaskUpdate', function (id, item) {
			//editLinks.push(item);
			// console.log('触发改变');
			// console.log('canSave.value', canSave.value);
			// if (canSave.value == 1) {
			// 	return false;
			// } else {
			// 	changeTask(id, item);
			// }
		});
		//保存验证
		gantt.attachEvent('onLightboxSave', function (id, item) {
			if (!item.text) {
				gantt.message({ type: 'error', text: '请填写计划名称!' });
				return false;
			}
			return true;
		});

		gantt.attachEvent('onBeforeLinkAdd', function (id, item) {
			const sourceTask = gantt.getTask(item.source);
			const targetTask = gantt.getTask(item.target);
			const soucreID: any = sourceTask.id;
			const targetID: any = targetTask.id;

			if (sourceTask.parent != targetTask.parent) {
				// ui.notify({
				// 	title: '错误',
				// 	message: '同一个父类下才可以链接',
				// 	type: 'error',
				// 	position: 'bottom-right',
				// });

				return false;
			}
			if (soucreID[0] != 'J' || targetID[0] != 'J') {
				// ui.notify({
				// 	title: '错误',
				// 	message: '只有指令才可以进行连接操作',
				// 	type: 'error',
				// 	position: 'bottom-right',
				// });
				return false;
			}
		});

		//添加链接后触发
		gantt.attachEvent('onAfterLinkAdd', function (id, item) {
			if (changeLinkType.value == true) {
				return;
			} else {
				changeLink(item, 'add');
			}
		});
		//更新链接后触发
		gantt.attachEvent('onAfterLinkUpdate', function (id, item) {
			if (changeLinkType.value == true) {
				return;
			} else {
				changeLink(item, 'update');
			}
		});
		//删除链接后触发
		gantt.attachEvent('onAfterLinkDelete', function (id, item) {
			if (changeLinkType.value == true) {
				return;
			} else {
				changeLink(item, 'delete');
			}
		});
		//  禁止点击进行弹窗
		gantt.attachEvent('onTaskDblClick', function (id, e) {
			return false;
		});

		//是否显示灯箱
		gantt.attachEvent(
			'onBeforeLightbox',
			function (id) {
				if (!scheduleauthorityEdit.value) {
					// ui.notify({
					// 	title: '错误',
					// 	message: '用户没有编辑的权限。',
					// 	type: 'error',
					// 	position: 'bottom-right',
					// });
					return false; // 返回 false
				} else {
					return true;
				}
			},
			{}
		);

		// type taskOneType = {
		// 	rowNum: string | number;
		// 	entityState: string | number;
		// 	assemblyState: string | number;
		// 	customProperties: any;
		// 	id: string | number;
		// 	text: any;
		// 	start_date: any;
		// 	end_date: any;
		// 	duration: number | undefined;
		// 	progress: number | undefined;
		// 	parent: string | number | undefined;
		// 	status: string | undefined;
		// 	deliveryDate: any;
		// 	color: string | undefined;
		// 	constraintType: string | undefined;
		// 	constraintDate: any;
		// 	editable: boolean;
		// 	deletable: boolean;
		// 	productCategory: string | null | undefined;
		// };

		// remark: any | undefined;
		type openTaskType = string | number;

		//模块变动方法
		const changeTask = (id: any, item: any) => {
			// if (canSave.value == 1) {
			// 	return false;
			// }
			// //清空数据
			// tskID.value = '';
			// tskItem.data = {};
			// //提交
			// editLinks.push(item);
			// tskID.value = id;
			// tskItem.data = item;
			// debouncedTask();
		};

		const changeLinkType = ref(false);
		//链接变动方法
		const changeLink = async (item: any, type: any) => {
			if (changeLinkType.value == true) {
				return false;
			}
			changeLinkType.value = true;
			if (type == 'add') {
				item.entityState = 2;
			} else if (type == 'update') {
				item.entityState = 1;
			} else if (type == 'delete') {
				item.entityState = 4;
			}
			if (item) {
				// let subLink = {
				// 	entityState: item.entityState,
				// 	id: item.id,
				// 	source: item.source,
				// 	target: item.target,
				// 	type: item.type,
				// };

				try {
					const res = await apiClient.http.postJson('mes/ProductionSchedules/batchSaveLink', {}); //subLink
					if (res == true) {
						let taskLinks = reactive<any>([]);
						taskLinks = gantt.getLinks();
						tasks.links = taskLinks;
						changeLinkType.value = false;
					}
				} catch (error: any) {
					// ui.notify({
					// 	title: '错误',
					// 	message: error.message.toString(),
					// 	type: 'error',
					// 	position: 'bottom-right',
					// });
					changeLinkType.value = false;
				}
			}

			//加载
			//gantt.parse(tasks);
		};

		// //最终保存
		// const saveGantt = async (id: any, item: any) => {
		// 	console.log('canSave.value111111', canSave.value);
		// 	if (canSave.value == 1) {
		// 		return;
		// 	}
		// 	canSave.value = 1;
		// 	let submitItems: {
		// 		assemblyState: any;
		// 		color: any;
		// 		constraintDate: any;
		// 		constraintType: any;
		// 		customProperties: any;
		// 		deletable: any;
		// 		deliveryDate: any;
		// 		duration: any;
		// 		editable: any;
		// 		end_date: string;
		// 		entityState: any;
		// 		id: any;
		// 		parent: any;
		// 		productionNo: any;
		// 		progress: any;
		// 		quantity: any;
		// 		rowNum: any;
		// 		start_date: string;
		// 		status: any;
		// 		text: any;
		// 		productCategory: any;
		// 	}[] = [];

		// 	console.log('editLinks', editLinks);
		// 	console.log('canSave.value222', canSave.value);
		// 	console.log('editLinks', editLinks);
		// 	//setTimeout(async () => {
		// 	if (editLinks.length > 0) {
		// 		console.log('canSave.value3333', canSave.value);

		// 		editLinks.forEach((item: any) => {
		// 			item.start_date = item.start_date == '' ? null : item.start_date;
		// 			item.end_date = item.end_date == '' ? null : item.end_date;
		// 			let subItem = {
		// 				assemblyState: item.assemblyState,
		// 				color: item.color,
		// 				constraintDate: item.constraintDate,
		// 				constraintType: item.constraintType,
		// 				customProperties: item.customProperties,
		// 				deletable: item.deletable,
		// 				deliveryDate: item.deliveryDate,
		// 				duration: item.duration,
		// 				editable: item.editable,
		// 				end_date: item.end_date,
		// 				entityState: item.entityState,
		// 				id: item.id,
		// 				parent: item.parent,
		// 				productionNo: item.productionNo,
		// 				progress: item.progress,
		// 				quantity: item.quantity,
		// 				rowNum: item.rowNum,
		// 				start_date: item.start_date,
		// 				status: item.status,
		// 				text: item.text,
		// 				productCategory: item.productCategory,
		// 			};

		// 			if (subItem.start_date === '') {
		// 				subItem.start_date = null;
		// 			} else {
		// 				subItem.start_date = moment(subItem.start_date).format('YYYY-MM-DD HH:mm:ss');
		// 			}

		// 			if (subItem.end_date === '') {
		// 				subItem.end_date = null;
		// 			} else {
		// 				subItem.end_date = moment(subItem.end_date).format('YYYY-MM-DD HH:mm:ss');
		// 			}
		// 			// console.log("subItem.start_date");
		// 			// console.log(subItem.start_date);
		// 			// console.log("subItem.end_date");
		// 			// console.log(subItem.end_date);
		// 			submitItems.push(subItem);
		// 		});
		// 		try {
		// 			// if (canReflash.value == 0) {
		// 			// if (canGet.value == 1) {
		// 			// 	return;
		// 			// }
		// 			console.log('canSave.value4444', canSave.value);
		// 			let res = await apiBox.http.postJson('mes/ProductionSchedules/batchSchedule', submitItems);
		// 			console.log('res', res);
		// 			if (res && res.length > 0) {
		// 				//canGet.value = 1;
		// 				//canReflash.value = 1;
		// 				canSave.value = 1;
		// 				console.log('解除锁定0', res);
		// 				for (let i = 0; i < res.length; i++) {
		// 					let result = gantt.getTask(res[i].id);
		// 					res[i].start_date = res[i].start_date == '' ? null : res[i].start_date;
		// 					res[i].end_date = res[i].end_date == '' ? null : res[i].end_date;

		// 					if (!res[i].start_date) {
		// 						break;
		// 					} else {
		// 						result.start_date = new Date(res[i].start_date);
		// 					}

		// 					if (!res[i].end_date) {
		// 						break;
		// 					} else {
		// 						result.end_date = new Date(res[i].end_date);
		// 					}

		// 					// console.log("result.start_date", result.start_date);
		// 					// console.log("result.end_date", result.end_date);
		// 					result.color = res[i].color;
		// 					result.constraintType = res[i].constraintType;
		// 					result.constraintDate = res[i].constraintDate;
		// 					// console.log("result.constraintDate", result.constraintDate);
		// 					result.duration = res[i].duration;
		// 					gantt.updateTask(res[i].id);
		// 				}

		// 				editLinks = [];
		// 				setTimeout(() => {
		// 					console.log('解除锁定1', canSave.value);
		// 					canSave.value = 0;
		// 				}, 300);
		// 			} else {
		// 				console.log('解除锁定2', canSave.value);
		// 				editLinks = [];
		// 				//canReflash.value = 0;
		// 				canSave.value = 0;
		// 			}
		// 			// } else {
		// 			// 	console.log('解除锁定3',canSave.value);
		// 			// 	return;
		// 			// }
		// 		} catch (error: any) {
		// 			console.log('解除锁定4', canSave.value);
		// 			//canReflash.value = 0;
		// 			canSave.value = 0;
		// 			editLinks = [];

		// 			ui.notify({
		// 				title: '错误',
		// 				message: error.message.toString(),
		// 				type: 'error',
		// 				position: 'bottom-right',
		// 			});
		// 			return;
		// 		}
		// 	} else {
		// 		console.log('解除锁定54', canSave.value);
		// 		//canReflash.value = 0;
		// 		canSave.value = 0;
		// 		editLinks = [];
		// 		ui.notify({
		// 			title: '警告',
		// 			message: '数据无改变',
		// 			type: 'warning',
		// 			position: 'bottom-right',
		// 		});
		// 		return;
		// 	}
		// };

		onMounted(() => {
			//console.log(ProductionOrderStatus);
			getLineList(''); //获取产线列表
			getObj(ProductionOrderStatusEnum)
			// const slTime = JSON.parse(localStorage.getItem('ganntTime'));
			// if (slTime) {
			// 	durationUnit.select = slTime;
			// } else {
			// 	durationUnit.select = timeList[1];
			// }
			// console.log('22222', ganttBox.value);
			// nextTick(() => {
			// 	// console.log('3333', ganttBox.value);
			//getGannt();
			// });
			// gantt.init(ganttBox.value);
			// gantt.parse(tasks);
		});
		const getObj = (obj: any) => {
			console.log(obj, 'obj');

		}
		nextTick(() => {
			console.log('4444', ganttBox.value);
		});

		return () => (
			<div class="mainCon">
				{/* {ui.buildField(field,ctx)} */}
				<div class="searchTitle w-full flex flex-row flex-wrap">
					<div class="sm:w-full md:w-full lg:w-1/3  xl:w-1/3  2xl:w-1/3">
						订单号:
						{ui.factory.input(queryDate.qDate.refNo, {})}
					</div>
					<div class="sm:w-full md:w-full  lg:w-1/3  xl:w-1/3  2xl:w-1/3">
						产线:
						{ui.factory.select({
							labelStyle: { textAlign: 'left' },
							id: 'lines',
							class: 'w-full',
							showClear: queryDate.qDate.lineID ? true : false,
							filter: true,
							placeholder: $t('auth.selectALine'),
							modelValue: queryDate.qDate.lineID,
							options: lineOptionsAll.value,
							onUpdate: (value: string) => (queryDate.qDate.lineID = value),
							optionLabel: 'label',
							optionValue: 'lineID',
							onFilter: lineFilter,
						})}
					</div>
					<div class="sm:w-full md:w-full lg:w-1/3  xl:w-1/3  2xl:w-1/3">状态: {ui.factory.input(queryDate.qDate.refNo, {})}</div>
				</div>

				<div ref={ganttBox} class="ganttBoxStyle"></div>
			</div>
		);
	},
});
