/* eslint-disable no-useless-escape */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, MetaModel, isRefNone } from '@mmda/core';
import { type EntityLogicInit, EntityLogic, SubEntityLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Address, defineAddress } from '../../models/Address';
import { type Country } from '../../models/Country';

/**
 * 常用地址交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-08-04 00:11:30.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 常用地址交互逻辑
 */
export class AddressLogic extends EntityLogic<Address> {
	constructor(init: EntityLogicInit) {
		super(defineAddress, init);
		this.beforeSave = (context: UiContext, model: Address, action: EntityAction) => {
			const { tel, email, telPrefix } = model
			const { $t: t } = context.globalProps
			// 手机号验证
			const regPhone = /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/
			// 座机验证
			const regTel = /^(0\d{2,3}-)?\d{7,8}(-\d{1,4})?$/;
			// 邮箱验证
			const regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			// 国家区号验证
			const regTelPrefix = /\+\d{1,3}\s?/g
			if (!(regPhone.test(tel) || regTel.test(tel)) && !isRefNone(tel)) return Promise.reject(Error(t('invalid.regTelFormat')));
			if (!regEmail.test(email) && !isRefNone(email)) return Promise.reject(Error(t('invalid.regEmailFormat')));
			if (!regTelPrefix.test(telPrefix) && !isRefNone(telPrefix)) return Promise.reject(Error(t('invalid.regTelPrefixFormat')));
			return Promise.resolve(true);
		};
	}
	beforeIndex(): UiLogicFnResult<Address> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('countryCode'),
				this.field('lastUsed'),
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

			fields.push(
				this.field('countryCode')
					.onChange((ctx, model, newVal) => {
						if (newVal) {
							const countryId = String(newVal).includes(',') ? newVal : `${ctx.locale ?? 'zh-Hans'},${newVal}`;
							this.loadOf<Country>('Countries', countryId)
								.then((c) => {
									if (c?.telPrefix) ctx.setFieldValue('telPrefix', '+' + c.telPrefix);
								})
								.catch(() => { });
						} else {
							// 没有值清除电话区号
							ctx.clearFieldValue('telPrefix')
						}
						return true;
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
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		return { fields, groups, customActions }
	}
}

/**
 * 构造常用地址交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const AddressLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) => new AddressLogic({
	metaUiService: metaUiService,
	repository: 'Addresses',
	
	module: module || metaUiService.findModule('Address'),
})
//#endregion ~GENERATED PARTS END
