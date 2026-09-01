/* eslint-disable no-useless-escape */
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
import { type Contactor, defineContactor } from '../../models/Contactor';
import { UsageStatus } from '../../enums/UsageStatus';
/**
 * 联系人交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 联系人交互逻辑
 */
export class ContactorLogic extends UiLogic<Contactor> {
	constructor(init: UiLogicInit) {
		super(defineContactor, init);
		this.beforeSave = (context: UiContext, model: Contactor, action: EntityAction) => {
			const { mobile, qq, email, officeTel } = model
			const { $t: t } = context.globalProps
			// 手机号验证
			const regPhone = /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/
			// 邮箱验证
			const regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			// qq号验证
			const regQQ = /^[1-9][0-9]{4,10}$/
			// 固定电话校验
			const regOfficeTel = /^0\d{2,3}-?\d{7,8}$/
			if (!regPhone.test(mobile) && !isRefNone(mobile)) return Promise.reject(Error(t('invalid.regPhoneFormat')));
			if (!regEmail.test(email) && !isRefNone(email)) return Promise.reject(Error(t('invalid.regEmailFormat')));
			if (!regQQ.test(qq) && !isRefNone(qq)) return Promise.reject(Error(t('invalid.regQQFormat')));
			if (!regOfficeTel.test(officeTel) && !isRefNone(officeTel)) return Promise.reject(Error(t('invalid.regOfficeTelFormat')));
			return Promise.resolve(true);
		};
	}
	beforeIndex(): UiLogicFnResult<Contactor> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				// this.field('contactorName').searchable(true),
				this.field('gender').searchable(true),
				// this.field('birthday').searchable(true),
				this.field('partnerID').searchable(true),
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
				this.field('partnerID').setSearchParam((context, model, fld) => ({
					status: `IN ${UsageStatus.USED}`
				}))
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
 * 构造联系人交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ContactorLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ContactorLogic({
	metaUiService: metaUiService,
	repository: 'Contactors',
	router,
	module: module || metaUiService.findModule('Contactor'),
})
//#endregion ~GENERATED PARTS END
