/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, MetaModel } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProjectSettlement, defineProjectSettlement } from '@/models/ProjectSettlement';
import { type ProjectSettlementItem, defineProjectSettlementItem } from '@/models/ProjectSettlementItem';
import { CapitalFlows } from '@mmda/base/src/enums/CapitalFlows';
/**
 * 项目结算交互逻辑
 * @author mmda codebot
 * @since 2025-06-24 13:19:54.0
 * @revision 2025-06-24 13:24:37.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目结算交互逻辑
 */
export class ProjectSettlementLogic extends UiLogic<ProjectSettlement> {
	constructor(init: UiLogicInit) {
		super(defineProjectSettlement, init);
		this.addRelativeLogic<ProjectSettlementItem>('items', master => new ProjectSettlementItemLogic(this, master));
	}

	beforeIndex(): UiLogicFnResult<ProjectSettlement> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('projectID').searchable(true),
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
			groups.push(
				this.group<ProjectSettlementItem>('items').field('deduct').inPlaceEdit().parent
					.onChange((context, model) => {
						// 筛选未删除的数据
						const items = model.items.filter(value => value.entityState < 4)
						// 遍历item子项计算回填
						items.forEach((item: any) => {
							item.deduct = Number((MetaModel.sum(item.children, items => items.deduct)).toFixed(4))
							item.settledValue = Number((MetaModel.sum(item.children, items => items.settledValue)).toFixed(4))
						})
						// 竣工总额
						model.totalSettledValue = Number((MetaModel.sum(items, items => items.settledValue)).toFixed(4))
						// 甲方扣款总额
						model.deductedValue = Number((MetaModel.sum(items, items => items.deduct)).toFixed(4))
						// 应收总额
						model.totalReceivable = Number((model.totalSettledValue - model.deductedValue).toFixed(4))
						// 筛选出流出的数据
						const data = items.filter((value: any) => value.capitalFlows === CapitalFlows.COST)
						model.totalPayable = Number((MetaModel.sum(data, items => items.settledValue) - MetaModel.sum(data, items => items.deduct)).toFixed(4))
					})
					.field('settledValue').inPlaceEdit().parent,
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

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造项目结算交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectSettlementLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProjectSettlementLogic({
		service: metaUiService,
		repository: 'ProjectSettlements',
		router,
		module: module || metaUiService.findModule('ProjectSettlement'),
	});
/**
 * 结算分项交互逻辑
 */
export class ProjectSettlementItemLogic extends UiGroupLogic<ProjectSettlementItem, ProjectSettlement> {
	constructor(parent: ProjectSettlementLogic, master: ProjectSettlement) {
		super(defineProjectSettlementItem, parent, master, 'items');
	}

	beforeEdit(): UiLogicFnResult<ProjectSettlementItem> {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('deduct').lockIf((model, ctx) => ctx.treeLevel === 0),
				this.field('settledValue').lockIf((model, ctx) => ctx.treeLevel === 0),
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
