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
import { type LabelTemplate, defineLabelTemplate } from '../../models/LabelTemplate';
import { type LabelTemplatePartner, defineLabelTemplatePartner } from '../../models/LabelTemplatePartner';
import { type LabelTemplateMaterial, defineLabelTemplateMaterial } from '../../models/LabelTemplateMaterial';
// 贸易伙伴
import { type Partner, definePartner } from '../../models/Partner';
// 物料
import { type Material, defineMaterial } from '../../models/Material';


/**
 * 标签模板交互逻辑
 * @author mmda codebot
 * @since 2024-08-13 09:51:11.0
 * @revision 2024-09-02 14:46:07.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 标签模板交互逻辑
 */
export class LabelTemplateLogic extends UiLogic<LabelTemplate> {
	constructor(init: UiLogicInit) {
		super(defineLabelTemplate, init);
		this.addRelativeLogic<LabelTemplatePartner>('partners', (master) => new LabelTemplatePartnerLogic(this, master));
		this.addRelativeLogic<LabelTemplateMaterial>('materials', (master) => new LabelTemplateMaterialLogic(this, master));
	}
	beforeIndex(): UiLogicFnResult<LabelTemplate> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('status').searchable(true),
				this.field('CCC').searchable(true),
				this.field('qsMark').searchable(true),
				this.field('envMark').searchable(true),
				this.field('superMarketOnly').searchable(true),
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
			groups.push(
				this.group<LabelTemplatePartner>('partners').defaultAdder(this.newLabelTemplatePartner),
				this.group<LabelTemplateMaterial>('materials').defaultAdder(this.newLabelTemplateMaterial)
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
	 * 创建标签模板限用客户
	 * @param context 界面上下文
	 * @param target 项目模板
	 */
	newLabelTemplatePartner(context: UiContext, target: LabelTemplate) {
		context.select<Partner>({
			repository: 'Partners',
			searchParam: {
				pager: defaultPager(),
			},
			ctor: definePartner,
		}).then((selection: any) => {
			if (selection) {
				// 去重
				const sameArr = target.partners.filter(item => item.partnerID === selection.partnerID)
				if (sameArr.length > 0) return context.uiBuilder.toast(context, {
					severity: 'error',
                    summary: context.globalProps.$t('dialog.title.error'),
					group: 'br',
                    detail: context.globalProps.$t('invalid.requiredPartners'),
                    life: 3000
				})
				context.addSubGroupItems<LabelTemplatePartner>({
					target,
					group: 'partners',
					source: selection,
					propsMapper: {
						partnerID: m => ({
							partnerID: selection.partnerID,
							partnerCodeName: selection.partnerCodeName
						})
					},
				});

			}
		})
	}

	/**
	 * 创建标签模板限用产品
	 * @param context 界面上下文
	 * @param target 项目模板
	 */
	newLabelTemplateMaterial(context: UiContext, target: LabelTemplate) {
		context.select<Material>({
			repository: 'Materials',
			searchParam: {
				pager: defaultPager(),
			},
			ctor: defineMaterial,
		}).then((selection: any) => {
			if (selection) {
				context.addSubGroupItems<LabelTemplateMaterial>({
					target,
					group: 'materials',
					source: selection,
					propsMapper: {
						materialID: m => ({
							materialID: selection.materialID,
							materialCode: selection.materialCode,
							materialName: selection.materialName
						})
					},
				});

			}
		})
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造标签模板交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const LabelTemplateLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new LabelTemplateLogic({
	metaUiService: metaUiService,
	repository: 'LabelTemplates',
	router,
	module: module || metaUiService.findModule('LabelTemplate'),
})
/**
 * 专用于贸易伙伴交互逻辑
 */
export class LabelTemplatePartnerLogic extends UiGroupLogic<LabelTemplatePartner, LabelTemplate> {
	constructor(parent: LabelTemplateLogic, master: LabelTemplate) {
		super(defineLabelTemplatePartner, parent, master, 'partners')
	}
}
/**
 * 专用于物料交互逻辑
 */
export class LabelTemplateMaterialLogic extends UiGroupLogic<LabelTemplateMaterial, LabelTemplate> {
	constructor(parent: LabelTemplateLogic, master: LabelTemplate) {
		super(defineLabelTemplateMaterial, parent, master, 'materials')
	}
}
//#endregion ~GENERATED PARTS END
