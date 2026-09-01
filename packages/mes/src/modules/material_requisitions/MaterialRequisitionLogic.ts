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
import { type MaterialRequisition, defineMaterialRequisition } from '@/models/MaterialRequisition';
import { type MaterialRequisitionItem, defineMaterialRequisitionItem } from '@/models/MaterialRequisitionItem';
import { type ProductionTaskFeeding, defineProductionTaskFeeding } from '@/models/ProductionTaskFeeding';
//import { NoticeFn } from '@/components/NoticeFn'
import { Material, defineMaterial } from '@mmda/base/src/models/Material';
import { h, reactive } from 'vue'
/**
 * 领料单交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-09-01 23:04:22.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 领料单交互逻辑
 */
export class MaterialRequisitionLogic extends UiLogic<MaterialRequisition> {
	constructor(init: UiLogicInit) {
		super(defineMaterialRequisition, init);
		this.addRelativeLogic<MaterialRequisitionItem>('items', master => new MaterialRequisitionItemLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('status').searchable(true), this.field('projectID').searchable(true), this.field('replenished').searchable(true), this.field('reqDate').searchable(true));
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
				this.field('siteID').setSearchParam((context, Model, fld) => {
					return { siteType: 'IN 2,4' }
				}),
				this.field('totalReqQuantity').hideIf(() => true),
				this.field('totalDlvQuantity').hideIf(() => true),
				// 生产任务筛选（工程项目）
				this.field('taskID').setSearchParam((context, model) => ({ projectID: model.projectID ?? '' }))
					.onChange((context, model) => {
						// 选中自动回填工程项目
						context.setFieldValue('projectID', model.prodTask?.project)
					}),
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
			groups.push(this.group<MaterialRequisitionItem>('items')
				.defaultAdder(this.newMaterialRequisitionItem)
				.addCustomAction({
					name: 'createProductionTaskFeeding',
					label: 'materialRequisition.selectFromTaskFeeding',
					icon: 'far fa-plus-circle',
					role: 'info',
					onAction: this.addProductionTaskFeeding,
				})
				.onChange((ctx, model) => {
					if (!model || !model.items) return;
					model.totalReqQuantity = MetaModel.sum(model.items, items => items.reqQuantity)
					model.totalDlvQuantity = MetaModel.sum(model.items, items => items.dlvQuantity)
					const newItems = model.items.filter(item => item.entityState < 4)
					switch (newItems.length) {
						case 0:
							model.reqSummary = ''
							break;
						case 1:
							model.reqSummary = newItems.map(v => ctx.t('materialRequisition.itemSummary', { name: v.material.materialName ?? '', quantity: v.reqQuantity ?? 0, unit: v.unit ?? '' })).join()
							break;
						default:
							model.reqSummary = newItems.map(v => ctx.t('materialRequisition.itemsSummary', { name: v.material.materialName ?? '', quantity: v.reqQuantity ?? 0, unit: v.unit ?? '', count: newItems.length ?? 0 }))[0]
							break;
					}
					MetaModel.modify(model);
				}),
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 *
	 * @param context
	 * @param target
	 * 创建领料单
	 */
	newMaterialRequisitionItem(context: UiContext<MaterialRequisition>, target: MaterialRequisition) {
		context.select<Material>({
			repository: 'Materials',
			searchParam: {
				pager: defaultPager(),
				queryParams: {},
			},
			service: 'base',
			ctor: defineMaterial,
			selectionMode: 'multiple',
		})
			.then(selection => {
				if (Array.isArray(selection)) {
					// console.log(selection);
					context.addSubGroupItems<MaterialRequisitionItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							materialID: m => m,
							usage: m => MetaModel.getRefProp(m, 'materialType')
						},
					});
				}
			})
			.catch((error: any) => {
				console.log(error)
			});
	}

	/**
	 * 从生产任务投料中选择
	 *
	 * @param context
	 * @param target
	 */
	addProductionTaskFeeding(context: UiContext<MaterialRequisition>, target: MaterialRequisition) {
		context.select<ProductionTaskFeeding>({
			repository: 'ProductionTaskFeedings',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					taskID: target.taskID ?? '',
					materialID: 'IS NOT NULL',
					projectID: !isRefNone(target.projectID) ? target.projectID : ''
				},
			},
			ctor: defineProductionTaskFeeding,
			selectionMode: 'multiple',
		})
			.then(selection => {
				if (Array.isArray(selection)) {
					context.addSubGroupItems<MaterialRequisitionItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							materialID: m => m,
							refName: m => 'ProductionTaskFeeding',
							reqQuantity: m => m.quotaQuantity < m.reqQuantity ? 1 : m.quotaQuantity - m.reqQuantity,
							refID: m => m.taskID,
							refItemID: m => m.itemID,
							projectID: m => target.projectID,
						},
					});
					// 筛选并过滤有相同标识的数组
					target.items = target.items.filter((item, index, arr) =>
						index === arr.findIndex((t) => t.materialID === item.materialID)
					);
					// 状态变为已修改
					MetaModel.modify(target.items)
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
 * 构造领料单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialRequisitionLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new MaterialRequisitionLogic({
		metaUiService: metaUiService,
		repository: 'MaterialRequisitions',
		router,
		module: module || metaUiService.findModule('MaterialRequisition'),
	});
/**
 * 领料清单交互逻辑
 */
export class MaterialRequisitionItemLogic extends UiGroupLogic<MaterialRequisitionItem, MaterialRequisition> {
	constructor(parent: MaterialRequisitionLogic, master: MaterialRequisition) {
		super(defineMaterialRequisitionItem, parent, master, 'items');
	}
}
//#endregion ~GENERATED PARTS END
