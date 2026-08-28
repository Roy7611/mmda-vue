/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, type EntityAction, defaultPager, MetaModel } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type WorkOrder, defineWorkOrder } from '@/models/WorkOrder';
import { EmployeeStatus } from '@mmda/base/src/enums/EmployeeStatus';
import { type WorkOrderMember, defineWorkOrderMember } from '@/models/WorkOrderMember';
import { type Worker, defineWorker } from '@/models/Worker';
import { h } from 'vue';

//时间对比
const compareTime = (time1: any, time2: any) => {
	const date1 = new Date(time1).getTime();
	const date2 = new Date(time2).getTime();
	if (date1 <= date2) {
		return -1;
	} else if (date1 > date2) {
		return 1;
	}
	return 1;
};

//计算两个天数之间的日期
const getDaysBetweenDates = (date1: any, date2: any) => {
	const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
	const time1 = new Date(date1).getTime();
	const time2 = new Date(date2).getTime();
	const diffDays = Math.round((time2 - time1) / oneDay);
	return diffDays + 1;
};

/**
 * 派工单交互逻辑
 * @author mmda codebot
 * @since 2024-12-07 03:41:04.0
 * @revision 2024-12-07 03:41:04.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 派工单交互逻辑
 */
export class WorkOrderLogic extends UiLogic<WorkOrder> {
	constructor(init: UiLogicInit) {
		super(defineWorkOrder, init);
		this.addRelativeLogic<WorkOrderMember>('members', (master) => new WorkOrderMemberLogic(this, master));

		this.beforeSave = (context: UiContext<WorkOrder>, model: WorkOrder, action: EntityAction) => {
			const { $t: t } = context.globalProps;
			//同时有开始时间，结束时间
			if (model.expectedStart && model.expectedFinish) {
				if (compareTime(model.expectedStart, model.expectedFinish) == 1) {
					return Promise.reject(Error(t('invalid.planTimeToSmall')));
				}
			}

			return Promise.resolve(true);
		};


	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('workType').searchable(true),
				this.field('expectedStart').searchable(true),
				this.field('status').searchable(true));
		}
		return { fields, groups, customActions };
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {

			fields.push(
				this.field('expectedStart').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedFinish) {
						const days = getDaysBetweenDates(newVal, model.expectedFinish);
						model.expectedDuration = Number(days);
					} else {
						model.expectedDuration = null;
					}
				}),
				this.field('expectedFinish').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedStart) {
						const days = getDaysBetweenDates(model.expectedStart, newVal);
						model.expectedDuration = Number(days);
					} else {
						model.expectedDuration = null;
					}
				}),
				this.field('expectedDuration').setCustomRenderer((fld, ctx: UiViewContext<any>, porps) => {
					return ctx.globalProps.$ui.factory.textSpan(ctx.model.expectedDuration ? ctx.model.expectedDuration + '天' : '')
				})
			);

		}
		if (groups.length == 0) {
			groups.push(this.group<WorkOrderMember>('members')
				.defaultAdder(this.NewWorkers)
				// 	.addCustomAction({
				// 	name: 'createWorker',
				// 	label: 'action.create',
				// 	icon: 'far fa-plus-circle',
				// 	role: 'info',
				// 	onAction: this.NewWorkers,
				// 	view: UiViewOne.Edit,
				// })
			)

			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
		}
		return { fields, groups, customActions };
	}
	/**
	 * 创建派工人员
	 * @param context 
	 * @param target 
	*/
	NewWorkers(context: UiContext<WorkOrder>, target: WorkOrder) {
		context.select<Worker>({
			service: 'mes',
			repository: 'Workers',
			ctor: defineWorker,
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					// status: `IN ${PaymentStatus.PAYED}`,
					status: EmployeeStatus.ON_BOARD
				},

			},
		})
			.then((selection: any) => {
				if (selection) {
					// 取相同的数据
					const items = selection.filter((item: any) => MetaModel.hasAnyLike(target.members, { workerID: item.workerID }));
					if (items.length > 0) return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						group: 'br',
						detail: context.globalProps.$t('auth.WorkerError'),
						life: 3000
					})
					context.addSubGroupItems<WorkOrderMember>({
						target,
						group: 'members',
						source: selection,
						sequenceKey: 'orderID',
						propsMapper: {
							workerID: p => p,
						},
					});
				}
			});
		// context.newSubGroupItem<WorkOrderMember>({
		// 		group: 'members',
		// 		// sequenceKey: 'itemID',
		// 		target,
		// 	})
		// 	.then(item => {
		// 		if (item) {
		// 			target.members.push(item);
		// 		}
		// 	});
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length === 0) {
			fields.push(
				this.field('expectedDuration').setCustomRenderer((fld, ctx: UiViewContext<any>, porps) => {
					return ctx.globalProps.$ui.factory.textSpan(ctx.model.expectedDuration ? ctx.model.expectedDuration + '天' : '')
				})
			)
		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造派工单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const WorkOrderLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new WorkOrderLogic({
	service: metaUiService,
	repository: 'WorkOrders',
	router,
	module: module || metaUiService.findModule('WorkOrder'),
})
/**
 * 派工人员交互逻辑
 */
export class WorkOrderMemberLogic extends UiGroupLogic<WorkOrderMember, WorkOrder> {
	constructor(parent: WorkOrderLogic, master: WorkOrder) {
		super(defineWorkOrderMember, parent, master, 'members')
	}
}
//#endregion ~GENERATED PARTS END
