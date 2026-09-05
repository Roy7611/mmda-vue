import { resolve } from 'node:path';
/**
 * Copyright (c) 2006, 2020, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiFieldLogic, MetaUiField, MetaUiService, Module, ApiClient, EntityAction } from '@mmda/core';
import { MetaUiPack } from '@mmda/core';
import type { UiLogicInit, UiLogicFnResult, UiSearchForm } from '@mmda/vui';
import { UiLogic } from '@mmda/vui';
import { reactive, h, toRaw, ref, RendererElement, RendererNode, VNode, getCurrentInstance } from 'vue';
import { type ProductionSchedule, defineProductionSchedule } from '@/models/ProductionSchedule';
import { applyScheduleGanttTaskDates } from '@/components/GanntView/ganttScheduleDateHelpers';
import { primeVueFactory } from '@/compat/primevue_legacy'
import { getTaskData, getLinkRes, getPlanRes, getBreaks, getProSub } from '@/components/GanntView/ganntUpdate';
import { TaskRelationship, TaskRelationshipEnum } from '@mmda/base/src/enums/TaskRelationship';
import { TaskConstraintTypeEnum } from '@mmda/base/src/enums/TaskConstraintType';
import GanttPlanning, { resetGanttPlanningShell, type GanttPlanningShell } from '@/components/GanntView/GanttPlanning';
import type { UiBuildContext } from '@mmda/vui';

const notice = reactive({
	data: {
		ownerID: '',
		ownerName: '',
		ownerInvalid: false, //显示用 是否选择了用户
		ownerDeptID: '',
		ownerDeptName: '',
		importance: 'UNKNOWN', //重要性
		urgency: 'NORMAL', //紧急性
		notification: '', //待办事宜
		copyTo: [], //通知给
		copyToInvalid: false, //是否选择了 通知给谁。
	},
});
//公用action
// const beforeNotice = async (context: UiContext, model: ProductionSchedule, action: EntityAction, actionName: string, repositoryName: string) =>
// 	NoticeFn(context, {
// 		title: context.globalProps.$t('auth.submitInformation'),
// 		data: notice.data,
// 		id: model.orderID ?? '',
// 		action: actionName,
// 		repository: repositoryName,
// 		detail: context.globalProps.$t('success.operationSuccessful'),
// 	});
interface MetaData {
	repository: string;
	service?: string;
	reload?: boolean;
}

/**
 * 生产看板交互逻辑
 * @author mmda codebot
 * @since 2023-11-28 00:20:38.0
 * @revision 2023-11-28 01:38:08.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产看板交互逻辑
 */
const updateRes = reactive({
	data: [],
});
const linkRes = reactive({
	data: false,
});

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
	},
});

//甘特图日计划调用接口返回
const submitPlan = async (planItem: any, content: any) => {
	const { $api, $router, $toast, $t: t } = content.globalProps;
	planItem.action = null;
	try {
		let res: any = null;
		const apiClient = $api as ApiClient;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
				life: 3000,
			});
			getSub(content, planItem);
		}

		return true;
	} catch (error: any) {
		let errorMessage = null;
		errorMessage = error.message;
		if (error.validationErrors && error.validationErrors.length > 0) {
			errorMessage = error.validationErrors[0].error;
		}
		$toast.add({
			severity: 'error',
			title: 'dialog.title.error',
			summary: errorMessage ?? '',
			group: 'br',
			life: 3000,
		});
		return false;
	}
};
//权限
// const Qx = reactive({
// 	jurisdiction: <any>{},
// });

//根据ID获取 task
const getSub = async (appContext: any, task: any) => {
	const { $api, $router, $toast } = appContext.globalProps;
	const updateObj = {
		subList: <any>[],
		subLinkList: <any>[],
	};
	let query: any;
	if (task) {
		query = {
			taskID: task.taskID,
		};
	} else {
		query = null;
	}

	try {
		let res: any = null;
		const apiClient = $api as ApiClient;
		res = await apiClient.getAll({
			action: 'getAllSchedule',
			repository: 'ProductionScheduleTasks',
			service: 'mes',
			queryParams: query,
		});
		if (res.list) {
			updateObj.subList = res.list.tasks.map((item: any) => {
				item.id = item.taskID;
				item.text = item.productName;
				applyScheduleGanttTaskDates(item);
				item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
				item.duration = item.expectedDuration;
				item.statusType = item.customProperties.$status;
				item.parent = item.parentTaskID;
				item.taskColor = !item.taskColor ? 'DDDDDD' : item.taskColor;
				item.color = '#' + item.taskColor;
				item.constraint_type = item.customProperties.$constraintType;
				return item;
			});
			updateObj.subLinkList = res.list.links.map((item: any) => {
				item.id = item.relationID;
				item.source = item.fromTaskID;
				item.target = item.toTaskID;
				item.type = TaskRelationshipEnum.valueOf(item.relationType);
				return item;
			});
		}

		console.log('updateObj', updateObj);
		getProSub(updateObj);
	} catch (error: any) {
		$toast.add({
			severity: 'error',
			title: 'dialog.title.error',
			summary: error.detail ?? '',
			group: 'br',
			life: 3000,
		});
	}
};

export class ProductionScheduleLogic extends UiLogic<ProductionSchedule> {
	taskDatas: any;
	//甘特图模版
	skin = 'material'; //传入dark为黑暗模式
	scheduleroleaction: any = {}; //权限
	roleaction = getCurrentInstance().appContext.config.globalProperties.$app.context.modules;
	constructor(init: UiLogicInit) {
		super(defineProductionSchedule, init);
	}
	async initMetadata(reload: boolean = false) {
		// 接口调通后删除此方法
		// super.initMetadata();
		return Promise.resolve({ metaui: null });
	}

	beforeSearch() {
		const { searchFields, customSearchFields } = super.beforeSearch();
		// customSearchFields.push(
		// 		{
		// 		searchLabel: '状态',
		// 		searchParam: 'search',
		// 		renderer: (ctx: UiBuildContext<any> & any, csf) => {
		// 			const { $ui: ui, $t: t, $api: apiBox } = ctx.globalProps;
		// 			const searchValue = ref();
		// 			const tableData = reactive({
		// 				list: [],
		// 				column: [],
		// 			});
		// 			return ui.factory.searchForRelative({
		// 				modelValue: searchValue.value,
		// 				placeholder: t('action.select'),
		// 				toSearch: async (event: Event) => {
		// 					await ctx.metaUiService.get('ProductionTasks', 'mes').then(
		// 						(res: any) =>
		// 							(tableData.column = res.getListedFields().sort((prev: any, curr: any) => {
		// 								return Number(prev.fieldIdx) - Number(curr.fieldIdx);
		// 							}))
		// 					);
		// 				},
		// 			});
		// 		},
		// 	}
		// );
		return { searchFields, customSearchFields };
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			//fields.push(this.field('status'));
		}
		//获得权限

		return { fields, groups, customActions };
	}
	async getData() {
		return true;
	}


	// //获取甘特图数据
	// async getProSchedule(appContext: any, query: any) {
	// 	console.log('query', query);

	// 	const { $api, $router, $toast } = appContext.app.config.globalProperties;
	// 	const task = reactive({
	// 		taskData: {
	// 			data: <any>[],
	// 			link: <any>[],
	// 		},
	// 	});
	// 	this.taskDatas = task.taskData;

	// 	if (!query) {
	// 		query = null;
	// 	}

	// 	try {
	// 		let res: any = null;
	// 		const apiClient = $api as ApiClient;

	// 		res = await apiClient.getAll({
	// 			action: 'getAllSchedule',
	// 			repository: 'ProductionScheduleTasks',
	// 			service: 'mes',
	// 			//queryParams:query,
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
	// 				item.taskColor = !item.taskColor ? 'DDDDDD' : item.taskColor;
	// 				item.color = '#' + item.taskColor;
	// 				item.constraint_type = item.customProperties.$constraintType;
	// 				return item;
	// 			});
	// 			res.list.link = res.list.links.map((item: any) => {
	// 				item.id = item.relationID;
	// 				item.source = item.fromTaskID;
	// 				item.target = item.toTaskID;
	// 				item.type = TaskRelationshipEnum.valueOf(item.relationType);
	// 				return item;
	// 			});
	// 			return (this.taskDatas = res.list);
	// 		}
	// 	} catch (error: any) {
	// 		$toast.add({
	// 			severity: 'error',
	// 			title: 'dialog.title.error',
	// 			summary: error.detail ?? '',
	// 			life: 3000,
	// 		});
	// 		return task.taskData;
	// 	}
	// }

	//甘特图分解
	async changeBreaks(taskItem: any, appContext: any) {
		if (taskItem.action) {
			taskItem.action = null;
		}
		//appContext.uiBuilder.
		const res = appContext.uiBuilder.buildNotice(appContext, {
			onSubmit: async (data: any) => {
				//调用接口
				const { $t: t, $api: apiBox, $toast: toast } = appContext.globalProps;
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
							group: 'br',
							life: 3000,
						});

						getSub(appContext, null);
					}
					return true;
				} catch (error: any) {
					toast.add({
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: t('invalid.error'),
						group: 'br',
						life: 3000,
					});
					return false;
				}
			},
		});

		//beforeNotice(appContext, taskItem, null, 'breakDown', 'ProductionOrders');
		//提交给组件更新数据
		//getBreaks(await res);
	}
	//甘特图 拖拉拽
	async changeTasks(tasksItem: any, appContext: any) {
		const { $api, $router, $toast } = appContext.app.config.globalProperties;
		if (tasksItem.action) {
			tasksItem.action = null;
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
				tasksItem
			);
			if (res && res.length > 0) {
				res = res.map((item: any) => {
					item.id = item.taskID;
					item.text = item.productName;
					item.start_date = item.expectedStart;
					item.end_date = item.expectedFinish;
					item.duration = item.expectedDuration;
					item.statusType = item.customProperties.$status;
					item.parent = item.parentTaskID;
					item.taskColor = !item.taskColor ? 'DDDDDD' : item.taskColor;
					item.color = '#' + item.taskColor;
					item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
					//item.constraint_type = item.constraintType;
					item.constraint_typeName = item.customProperties.$constraintType;
					return item;
				});
				updateRes.data = res;
				//提交给组件更新数据
				getTaskData(updateRes.data);
			}
		} catch (error: any) {
			$toast.add({
				severity: 'error',
				title: 'dialog.title.error',
				summary: error.detail ?? '',
				group: 'br',
				life: 3000,
			});
			return false;
		}
	}



	//甘特图 link
	changeLinks = async (linkItem: any, appContext: any) => {
		if (linkItem.action) {
			linkItem.action = null;
		}

		linkItem.refName = 'ProductionOrderRelation';
		linkItem.fromTaskID = linkItem.source;
		linkItem.toTaskID = linkItem.target;
		linkItem.relationID = linkItem.id;
		linkItem.relationType = linkItem.type;
		const { $api, $router, $toast } = appContext.app.config.globalProperties;
		try {
			let res: any = null;
			const apiClient = $api as ApiClient;
			res = await apiClient.doAction(
				{
					action: 'saveLink',
					repository: 'ProductionScheduleTasks',
					service: 'mes',
				},
				linkItem
			);
			linkRes.data = res;
			getLinkRes(linkRes.data);
		} catch (error: any) {
			$toast.add({
				severity: 'error',
				title: 'dialog.title.error',
				summary: error.detail ?? '',
				group: 'br',
				life: 3000,
			});
			return false;
		}
	};

	//甘特图日计划弹窗
	async subPlanning(planDate: any, appContext: any) {
		resetGanttPlanningShell(dailyPlanning, planDate);
		dailyPlanning.data.date = planDate;
		dailyPlanning.submitHandler = async () => submitPlan(dailyPlanning.data, appContext);
		appContext.uiBuilder.confirmDialog(
			h(GanttPlanning, {
				key: `gantt-planning-${planDate}-${Date.now()}`,
				planningShell: dailyPlanning,
				dataModel: dailyPlanning.data,
				ctx: appContext,
			}),
			appContext,
			{
				title: appContext.t('ganttLabel.PrepareDaily'),
				showFooter: false,
				width: '50vw',
				height: 'auto',
				maxHeight: '85vh',
			}
		);
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		return { fields, groups, customActions };
	}
}

/**
 * 构造生产计划交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionScheduleLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionScheduleLogic({
		metaUiService: metaUiService,
		repository: 'ProductionSchedule',
		router,
		module: module || metaUiService.findModule('ProductionSchedule'),
		customPage: true,
	});
//#endregion ~GENERATED PARTS END
