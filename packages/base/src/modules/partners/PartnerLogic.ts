/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, EntityUrlParam, isNullOrUndefined } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Partner, definePartner } from '../../models/Partner';
import { h } from 'vue'
import { PartnerCat } from '../../models/PartnerCat';
/**
 * 贸易伙伴交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:30.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 贸易伙伴交互逻辑
 */
export class PartnerLogic extends UiLogic<Partner> {
	constructor(init: UiLogicInit) {
		super(definePartner, init);
		this.beforeSave = (context: UiContext, model: Partner, action: EntityAction) => {
			const { tel } = model
			const { $t: t } = context.globalProps
			// 手机号验证
			const regPhone = /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/
			// 座机验证
			const regTel = /^(0\d{2,3}-)?\d{7,8}(-\d{1,4})?$/;
			if (!model.partnerRoles) return Promise.reject(Error(t('invalid.partnerRolesInvalid')));
			if (!(regPhone.test(tel) || regTel.test(tel)) && !isRefNone(tel)) return Promise.reject(Error(t('invalid.regTelFormat')));
			return Promise.resolve(true);
		};
	}
	async create(param: any = {}, entityUrlParam?: EntityUrlParam): Promise<Partner> {
		return super.create(Object.assign({}, param, {
			refID: this.currentCategoryID ?? '',
			refName: this.currentCategoryID ? 'PartnerCats' : '',
		}));
	}
	currentCategoryID: PartnerCat
	beforeIndex(): UiLogicFnResult<Partner> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('status').searchable(true),
				this.field('partnerRoles').searchable(true),
				this.field('qualifiedLevel').searchable(true),
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
			fields.push(
				// this.field('partnerRoles').setCustomEditor((fld, ctx, props) => {
				// 	const { $ui: ui, $t: t } = ctx.globalProps
				// 	const fldRef = fld.reference
				// 	if (!fldRef || !fldRef.isEnum) {
				// 		console.error(`${fld.fieldName} is not an enum field.`)
				// 		return h('span', { type: 'warning' }, { default: () => '不是枚举字段' })
				// 	}
				// 	const { labelFn } = fldRef
				// 	const numVal = ctx.model[fld.fieldName] ?? 0
				// 	const arrVal = fldRef.refOptions.filter((it) => it.id & numVal).map((it) => it.id)
				// 	return ui.factory.multiSelect({
				// 		showClear: true,
				// 		id: `search_${fld.fieldName}`,
				// 		editable: true,
				// 		display: 'chip',
				// 		placeholder: t('action.select'),
				// 		optionLabel: 'text',
				// 		optionValue: 'id',
				// 		class: 'ui-searchOp w-full md:w-80',
				// 		options: fldRef.refOptions.filter((item) => item.id > 0),
				// 		modelValue: arrVal,
				// 		maxSelectedLabels: 3,
				// 		onChange: (event: any) => {
				// 			ctx.model.partnerRoles = (event.value as number[]).reduce((prev, curr) => prev | curr, 0)
				// 			// 状态改为已修改
				// 			MetaModel.modify(ctx.model);
				// 		}
				// 	});

				// })
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
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造贸易伙伴交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const PartnerLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new PartnerLogic({
	service: metaUiService,
	repository: 'Partners',
	router,
	module: module || metaUiService.findModule('Partner'),
})
//#endregion ~GENERATED PARTS END
