/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2026-04-12 16:41:36
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-04-16 11:06:10
 * @FilePath: /mmda-vue/packages/mes/src/modules/ToolCategories/MaterialCatLogic.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, EntityUrlParam, MetaUiPack } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type ToolCategory, defineToolCategory } from "@/models/ToolCategory";
import { MaterialTypeEnum, MaterialType } from '@mmda/base/src/enums/MaterialType';


/**
 * 物料交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 物料交互逻辑
 */
export class ToolCategoryLogic extends UiLogic<ToolCategory> {
	constructor(init: UiLogicInit) {
		super(defineToolCategory, init);
	}

	async create(param?: any, entityUrlParam?: EntityUrlParam): Promise<ToolCategory> {
		return await this.apiClient.createOne({}, {
			repository: 'MaterialCats',
			service: 'base',
			path: `create`,
		}).then(res => {
			const model = this.createEntity(res);
			model.materialType = MaterialType.TOOLS;
			model.depth = param?.depth ?? 0;
			model.parentCatID = param?.parentCatID ?? '';
			model.materialX = param?.materialX ?? '';
			return model
		});
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			// fields.push(
			// 	this.field('status').searchable(true),
			// 	this.field('supportPackage').searchable(true),
			// 	this.field('trackingMode').searchable(true),
			// )
		}
		return { fields, groups, customActions }
	}

	private materialXOptions = [
		{ id: 0, value: 'ToolFlask', text: 'tool.flask' },
		{ id: 1, value: 'ToolMeasure', text: 'tool.measuringInstrument' },
		{ id: 2, value: 'ToolPattern', text: 'tool.pattern' },
	]

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('materialType')
					.lockIf((model, ctx) => true)
					.setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
						return ctx.uiBuilder.factory.textSpan(MaterialTypeEnum.textOf(MaterialType.TOOLS));
					}),
				this.field('materialX')
					.lockIf((model, ctx) => !!model.parentCatID)
					.setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
						return ctx.uiBuilder.factory.textSpan(ctx.model.materialX ? ctx.t(this.materialXOptions.find(x => x.value == ctx.model.materialX)?.text ?? '') : '-');
					})
					.setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
						return ctx.uiBuilder.factory.select({
							options: this.materialXOptions.map(option => ({ ...option, text: ctx.t(option.text) })),
							optionLabel: 'text',
							optionValue: 'value',
							modelValue: ctx.model.materialX,
							onUpdate: (value: any) => {
								ctx.model.materialX = value;
							}
						})
					})
			);

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
 * 构造物料交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ToolCategoryLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ToolCategoryLogic({
	metaUiService: metaUiService,
	repository: 'ToolCategories',
	router,
	module: module || metaUiService.findModule('ToolCategories'),
})
//#endregion ~GENERATED PARTS END
