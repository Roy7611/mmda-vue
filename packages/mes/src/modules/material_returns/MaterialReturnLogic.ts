/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type MaterialReturn, defineMaterialReturn } from '@/models/MaterialReturn';
import { type MaterialReturnItem, defineMaterialReturnItem } from '@/models/MaterialReturnItem';
import { type ProductionTaskFeeding, defineProductionTaskFeeding } from '@/models/ProductionTaskFeeding';
import { type LinesideInventoryItem, defineLinesideInventoryItem } from '@/models/LinesideInventoryItem';
// import { NoticeFn } from '@/components/NoticeFn'
import { reactive } from 'vue'
/**
 * 退料单交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:28.0
 * @revision 2024-09-01 23:04:22.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 退料单交互逻辑
 */
// const notice = reactive({
// 	data: {
// 		ownerID: '',
// 		ownerName: '',
// 		ownerInvalid: false, //显示用 是否选择了用户
// 		ownerDeptID: '',
// 		ownerDeptName: '',
// 		importance: 'UNKNOWN', //重要性
// 		urgency: 'NORMAL', //紧急性
// 		notification: '', //待办事宜
// 		copyTo: [], //通知给
// 		copyToInvalid: false, //是否选择了 通知给谁。
// 	},
// });

// // 提交
// const beforeSubmit = async (context: UiContext, model: MaterialReturn, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Submit'),
// 	data: notice.data,
// 	id: model.returnID ?? '',
// 	action: 'submit',
// 	repository: 'MaterialReturns',
// 	detail: context.globalProps.$t('auth.SubmitSuccess')
// })

// // 取消
// const beforeCancel = async (context: UiContext, model: MaterialReturn, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('action.cancel'),
// 	data: notice.data,
// 	id: model.returnID ?? '',
// 	action: 'cancel',
// 	repository: 'MaterialReturns',
// 	detail: context.globalProps.$t('auth.CancelSuccess')
// })

// // 确认收料
// const beforeReceive = async (context: UiContext, model: MaterialReturn, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Receive'),
// 	data: notice.data,
// 	id: model.returnID ?? '',
// 	action: 'receive',
// 	repository: 'MaterialReturns',
// 	detail: context.globalProps.$t('auth.ReceiveSuccess')
// })

// // 驳回
// const beforeDisapprove = async (context: UiContext, model: MaterialReturn, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Disapprove'),
// 	data: notice.data,
// 	id: model.returnID ?? '',
// 	action: 'disapprove',
// 	repository: 'MaterialReturns',
// 	detail: context.globalProps.$t('auth.DisapproveSuccess')
// })

// //批准
// const beforeApprove = async (context: UiContext, model: MaterialReturn, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Approve'),
// 	data: notice.data,
// 	id: model.returnID ?? '',
// 	action: 'approve',
// 	repository: 'MaterialReturns',
// 	detail: context.globalProps.$t('auth.ApproveSuccess')
// })

export class MaterialReturnLogic extends UiLogic<MaterialReturn> {
	constructor(init: UiLogicInit) {
		super(defineMaterialReturn, init);
		this.addRelativeLogic<MaterialReturnItem>('items', master => new MaterialReturnItemLogic(this, master));
		// this.beforeAction = (context: UiContext, model: MaterialReturn, action: EntityAction) => {
		// 	try {
		// 		if (action.name == 'submit') return beforeSubmit(context, model, action);
		// 		if (action.name == 'cancel') return beforeCancel(context, model, action);
		// 		if (action.name == 'receive') return beforeReceive(context, model, action);
		// 		if (action.name == 'disapprove') return beforeDisapprove(context, model, action);
		// 		if (action.name == 'approve') return beforeApprove(context, model, action);
		// 		else return Promise.resolve(true);
		// 	} catch (error: any) {
		// 		return Promise.resolve(false);
		// 	}
		// };
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('status').searchable(true), this.field('projectID').searchable(true));
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
				// 生产任务筛选（工程项目）
				this.field('taskID').setSearchParam((ctx, model) => ({ projectID: model.projectID ?? '' }))
					.onChange((context, model) => {
						// 选中自动回填工程项目
						context.setFieldValue('projectID', model.prodTask?.project)
						console.log(model);
						
					}),
				this.field('siteID').setSearchParam((context, Model, fld) => {
					return { siteType: 'IN 2,4' }
				}),
				// 工程项目
				this.field('projectID').setSearchParam((ctx, model) => ({ projectID: model.prodTask?.projectID ?? '' }))
			)                                     
			/**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
		}
		if (groups.length == 0) {
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
			groups.push(this.group<MaterialReturnItem>('items').defaultAdder(this.newMaterialReturnItem)
				.addCustomAction({
					name: 'createLinesideInventoryItem',
					label: '从线边库存项中选择',
					icon: 'far fa-plus-circle',
					role: 'info',
					onAction: this.addLinesideInventoryItem,
					visible: t => !isRefNone(t.siteID)
				})
				.onChange((ctx, model) => {
					if (!model || !model.items) return;
					model.totalReturnQuantity = Math.round(MetaModel.sum(model.items, items => items.returnQuantity))
					MetaModel.modify(model);
				})
			);
		}
		return { fields, groups, customActions };
	}
	newMaterialReturnItem(context: UiContext<MaterialReturn>, target: MaterialReturn) {
		context.select<ProductionTaskFeeding>({
			repository: 'ProductionTaskFeedings',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					taskID: target.taskID ?? '',
					materialID: 'IS NOT NULL',
					reqQuantity: '>0',
					projectID: !isRefNone(target.projectID) ? target.projectID : ''
				},
			},
			ctor: defineProductionTaskFeeding,
			selectionMode: 'multiple',
		})
			.then((selection: any) => {
				if (selection) {
					// 取相同的数据
					const items = selection.filter((item:any) => MetaModel.hasAnyLike(target.items, { partNo: item.partNo }));
					if (items.length > 0) return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						group: 'br',
						detail: context.globalProps.$t('auth.MaterialReturnItemError'),
						life: 3000
					})
					context.addSubGroupItems<MaterialReturnItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							// materialID: m => m
							refName: m => 'ProductionTaskFeeding',
							returnQuantity: m => m.reqQuantity - m.retQuantity,
							refID: m => m.taskID,
							refItemID: m => m.itemID,
							projectID: m => target.projectID,
						},
					});
				}
			})
			.catch((error: any) => {
				console.log(error)
			});
	}
	addLinesideInventoryItem(context: UiContext<MaterialReturn>, target: MaterialReturn) {
		context.select<LinesideInventoryItem>({
			repository: 'LinesideInventoryItems',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					siteID: target.siteID ?? '',
					materialID: 'IS NOT NULL',
				},
			},
			ctor: defineLinesideInventoryItem,
			selectionMode: 'multiple',
		})
			.then((selection: any) => {
				if (selection) {
					// 取相同的数据
					const items = selection.filter((item:any) => MetaModel.hasAnyLike(target.items, { partNo: item.partNo }));
					if (items.length > 0) return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						group: 'br',
						detail: context.globalProps.$t('auth.MaterialReturnItemError'),
						life: 3000
					})
					context.addSubGroupItems<MaterialReturnItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							refName: m => 'MaterialReturn',
							refID: m => m.returnID,
							projectID: m => target.projectID,
							refItemID: m => m.itemID
						},
					});
				}
			})
			.catch((error: any) => {
				console.log(error)
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造退料单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialReturnLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new MaterialReturnLogic({
		service: metaUiService,
		repository: 'MaterialReturns',
		router,
		module: module || metaUiService.findModule('MaterialReturn'),
	});
/**
 * 退料清单交互逻辑
 */
export class MaterialReturnItemLogic extends UiGroupLogic<MaterialReturnItem, MaterialReturn> {
	constructor(parent: MaterialReturnLogic, master: MaterialReturn) {
		super(defineMaterialReturnItem, parent, master, 'items');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('returnQuantity').onChange((context, model, newVal) => {
					// 计算申请总数量
					this.master.totalReturnQuantity = Math.round(MetaModel.sum(this.master.items, items => items.returnQuantity))
					model.returnCost = Number((newVal * model.returnPrice).toPrecise(2))
				}),
				this.field('returnPrice').onChange((context, model, newVal) => {
					model.returnCost = Number((model.returnQuantity * newVal).toPrecise(2))
				}),
			)
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
