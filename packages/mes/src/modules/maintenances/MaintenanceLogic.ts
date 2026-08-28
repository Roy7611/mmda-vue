/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type UiContext, MetaModel, MetaAggregation, defaultPager, isRefNone } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type Maintenance, defineMaintenance } from '@/models/Maintenance';
import { type MaintenancePart, defineMaintenancePart } from '@/models/MaintenancePart';
import { type EquipmentSparePart, defineEquipmentSparePart } from '@/models/EquipmentSparePart';
import { type MaintenanceItem, defineMaintenanceItem } from '@/models/MaintenanceItem';
import { UsageStatus } from '@mmda/base/src/enums/UsageStatus';

/**
 * 总成本 = 设备清单费用之和 + 配件清单成本金额之和
 */
function rollupMaintenanceCost(m: Maintenance) {
	if (!m) return;
	m.totalCost = Number((
		MetaModel.sum(m.items ?? [], i => i.cost ?? 0) +
		MetaModel.sum(m.parts ?? [], p => p.cost ?? 0)
	).toFixed(4));
	m.totalHours = Number(MetaModel.sum(m.items ?? [], i => i.hours ?? 0).toFixed(4));
	MetaModel.modify(m);
}

/**
 * 设备维护交互逻辑
 * @author mmda codebot
 * @since 2023-05-15 12:52:40.0
 * @revision 2023-05-23 01:00:21.0
 */

//#region ~GENERATED PARTS BEGIN
/**
 * 设备维护工单交互逻辑
 */
export class MaintenanceLogic extends UiLogic<Maintenance> {
	constructor(init: UiLogicInit) {
		super(defineMaintenance, init);
		this.addRelativeLogic<MaintenancePart>('parts', master => new MaintenancePartLogic(this, master));
		this.addRelativeLogic<MaintenanceItem>('items', master => new MaintenanceItemLogic(this, master));
	}


	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				// 根据维护方式过滤
				this.field('maintainingMethod').searchable(true),
				// 根据期望复工过滤
				this.field('status').searchable(true)
			);
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
				// 来自器具 / 已派单 → 锁定
				this.field('maintainingMethod').lockIf((model, ctx) =>
					model?.refName?.includes("Tool") || model.status === 'DISPATCHED'
				),
				// 状态为已派单时的编辑权限限制
				// 主要信息：只允许编辑问题概要、使用备件
				// 概要信息：只允许编辑备注
				// 其他字段在已派单状态下锁定
				this.field('maintenanceNo').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('requestedDate').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('expectToFinish').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('priority').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('finishedTime').lockIf((model) => model.status === 'DISPATCHED').onValidate((value, model, ctx) => {
					if (value && new Date(value).isBefore(new Date())) {
						return '完成时间必须大于当前日期';
					}
				}),
				this.field('totalCost').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('totalHours').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('tags').lockIf((model) => model.status === 'DISPATCHED'),
				this.field('customJson').lockIf((model) => model.status === 'DISPATCHED'),
				// 关闭「使用备件」前：若已有配件清单，拦截并提示
				this.field('useParts').onChange((context, model, newVal) => {
					if (!newVal) {
						const partCount = (model.parts ?? []).filter(p => !MetaModel.deleted(p)).length;
						if (partCount > 0) {
							context.setFieldValue('useParts', true);
							context.uiBuilder.toast(context, {
								severity: 'warn',
								summary: '提示',
								group: 'br',
								detail: '当前已添加配件清单，请先清除后再关闭',
								life: 3000,
							});
						}
					}
				}),

			);
		}
		if (groups.length == 0) {
			groups.push(
				(() => {
					const partsGroup = this.group<MaintenancePart>('parts')
						.hideIf(m => !m.useParts)
						.onChange((context, model) => rollupMaintenanceCost(model))
						.defaultAdder(this.addMaintenancePart);
					// 数量、成本单价、成本金额：表格底部汇总
					Object.assign(partsGroup.field('quantity').field, { aggregationSet: MetaAggregation.SUM });
					Object.assign(partsGroup.field('costPrice').field, { aggregationSet: MetaAggregation.SUM });
					Object.assign(partsGroup.field('cost').field, { aggregationSet: MetaAggregation.SUM });
					partsGroup.field('quantity').inPlaceEdit().parent
						.field('costPrice').inPlaceEdit().parent
						.field('remark').inPlaceEdit();
					return partsGroup;
				})(),
				(() => {
					const itemsGroup = this.group<MaintenanceItem>('items')
						.addCustomAction({
							name: 'createContractItem',
							label: '创建',
							icon: 'far fa-plus-circle',
							role: 'info',
							onAction: this.addMaintenanceItem,
							view: UiViewOne.Edit,
							visible: t => !(t?.refName?.includes("Tool") || t?.status === 'DISPATCHED')
						})
						.clearIf(() => true)
						.onChange((context, model) => rollupMaintenanceCost(model));
					// 工时、费用：表格底部汇总
					Object.assign(itemsGroup.field('hours').field, { aggregationSet: MetaAggregation.SUM });
					Object.assign(itemsGroup.field('cost').field, { aggregationSet: MetaAggregation.SUM });
					return itemsGroup;
				})(),
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 * 添加设备清单
	 */
	addMaintenanceItem(context: UiContext<Maintenance>, target: Maintenance) {
		context.createSubGroupItems({
			group: 'items',
			target,
			propsMapper: {}
		}).then(item => {
			if (item) {
				context.addSubGroupItem('items', item)
			}
		})
	}
	/**
	 *
	 * @param context
	 * @param target
	 * 添加配件
	 */

	addMaintenancePart(context: UiContext<Maintenance>, target: Maintenance) {
		context.select<EquipmentSparePart>({
			service: 'mes',
			repository: 'EquipmentSpareParts',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					equipID: target.items?.map((item: MaintenanceItem) => item.equipID).join(',')
				},
			},
			ctor: defineEquipmentSparePart,
			selectionMode: 'multiple',
			selectableFn: (part: EquipmentSparePart) =>
				!(target.parts && target.parts.find(
					(item) => !MetaModel.deleted(item) && item.partID === part.partID
				)),
		})
			.then(selection => {
				if (selection) {
					context.addSubGroupItems<MaintenancePart>({
						target,
						group: 'parts',
						source: selection,
						sequenceKey: 'itemID',
						propsMapper: {
							maintenanceID: m => m.maintenanceID,
							partID: p => p,
							quantity: m => Math.round(m.partBaseQuantity / m.equipNum),
							costPrice: m => m.unitPrice,
							cost: m => Number((Math.round(m.partBaseQuantity / m.equipNum) * m.unitPrice).toFixed(4))
						},
					});
				}


			});
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(
				(() => {
					const partsGroup = this.group<MaintenancePart>('parts').hideIf(m => !m.useParts);
					Object.assign(partsGroup.field('quantity').field, { aggregationSet: MetaAggregation.SUM });
					Object.assign(partsGroup.field('costPrice').field, { aggregationSet: MetaAggregation.SUM });
					Object.assign(partsGroup.field('cost').field, { aggregationSet: MetaAggregation.SUM });
					return partsGroup;
				})(),
				(() => {
					const itemsGroup = this.group<MaintenanceItem>('items');
					Object.assign(itemsGroup.field('hours').field, { aggregationSet: MetaAggregation.SUM });
					Object.assign(itemsGroup.field('cost').field, { aggregationSet: MetaAggregation.SUM });
					return itemsGroup;
				})(),
			);
		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造设备维护工单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaintenanceLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new MaintenanceLogic({
		service: metaUiService,
		repository: 'Maintenances',
		router,
		module: module || metaUiService.findModule('Maintenance'),
	});
/**
 * 配件交互逻辑
 */
export class MaintenancePartLogic extends UiGroupLogic<MaintenancePart, Maintenance> {
	constructor(parent: MaintenanceLogic, master: Maintenance) {
		super(defineMaintenancePart, parent, master, 'parts');
		this.afterDelete = () => rollupMaintenanceCost(this.master);
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 配件由备件选择添加，不允许手动修改
				this.field('partID').lock(),
				this.field('costPrice').onChange<number>((ctx, model, newVal) => {
					model.cost = Math.round(Number(newVal * model.quantity) * 100) / 100;
					rollupMaintenanceCost(this.master);
				}),
				this.field('quantity').onChange<number>((ctx, model, newVal) => {
					model.cost = Math.round(Number(newVal * model.costPrice) * 100) / 100;
					rollupMaintenanceCost(this.master);
				})
			);
		}
		return { fields, groups, customActions };
	}

	
}
/**
 * 清单交互逻辑
 */
export class MaintenanceItemLogic extends UiGroupLogic<MaintenanceItem, Maintenance> {
	constructor(parent: MaintenanceLogic, master: Maintenance) {
		super(defineMaintenanceItem, parent, master, 'items');
		this.afterDelete = () => rollupMaintenanceCost(this.master);
	}

	beforeEdit(): UiLogicFnResult<MaintenanceItem> {
		const { fields, groups, customActions } = super.beforeEdit();

		if (fields.length == 0) {
			fields.push(
				this.field('equipID')
					.lockIf((model, ctx) => ctx.root.model?.refName?.includes("Tool") || ctx.root.model?.status === 'DISPATCHED'),
				this.field('transReasonID')
					.lockIf((model, ctx) => ctx.root.model?.refName?.includes("Tool") || ctx.root.model?.status === 'DISPATCHED')
					.setSearchParam((context, model, fld) => ({
						status: `IN ${UsageStatus.USED}`,
						equipType: model.equip ? model.equip.equipType : ''
					})),
				this.field('toStatus')
					.lockIf((model, ctx) => ctx.root.model?.refName?.includes("Tool") || ctx.root.model?.refName?.includes("Equipment|repair") || ctx.root.model?.status === 'DISPATCHED'),
				this.field('toSiteID')
					.lockIf((model, ctx) => ctx.root.model?.status === 'DISPATCHED'),
				this.field('hours').onChange(() => rollupMaintenanceCost(this.master)),
				this.field('cost').onChange(() => rollupMaintenanceCost(this.master)),
			);
		}

		return { fields, groups, customActions };
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf(model => isRefNone(model.remark)),
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
