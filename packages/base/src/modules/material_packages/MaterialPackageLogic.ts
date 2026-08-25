/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { EntitySearchParam, MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type MaterialPackage, defineMaterialPackage } from '../../models/MaterialPackage';
import { UsageStatus } from '../../enums/UsageStatus';

/** 已启用状态禁止编辑 */
const disableEditIfUsed = (item: MaterialPackage) => {
	if (item.status === UsageStatus.USED) item.editable = false;
};
//#region ~GENERATED PARTS BEGIN
/**
 * 物料包装交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:30.0
 */
export class MaterialPackageLogic extends UiLogic<MaterialPackage> {
	constructor(init: UiLogicInit) {
		super(defineMaterialPackage, init);
		// 详情/编辑页加载后处理
		this.afterLoad = (_context, model) => {
			if (!model.list) disableEditIfUsed(model);
		};
	}
	// 列表搜索走 getAll，不走 afterLoad
	async getAll(param: EntitySearchParam = { pager: { pageSize: 10 } }, context?: UiContext) {
		const data = await super.getAll(param, context);
		data?.list?.forEach(disableEditIfUsed);
		return data;
	}
	beforeIndex(): UiLogicFnResult<MaterialPackage> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('status').searchable(true),
			)
		}
		return { fields, groups, customActions }
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
 * 构造物料包装交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialPackageLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new MaterialPackageLogic({
	service: metaUiService,
	repository: 'MaterialPackages',
	router,
	module: module || metaUiService.findModule('MaterialPackage'),
})
//#endregion ~GENERATED PARTS END
