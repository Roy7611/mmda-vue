/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type PaymentMethod, definePaymentMethod } from '../../models/PaymentMethod';
/**
 * 支付方式交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:30.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 支付方式交互逻辑
 */
export class PaymentMethodLogic extends UiLogic<PaymentMethod> {
	constructor(init: UiLogicInit) {
		super(definePaymentMethod, init);
	}
	beforeIndex(): UiLogicFnResult<PaymentMethod> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('methodName').searchable(true),
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
 * 构造支付方式交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const PaymentMethodLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new PaymentMethodLogic({
	service: metaUiService,
	repository: 'PaymentMethods',
	router,
	module: module || metaUiService.findModule('PaymentMethod'),
})
//#endregion ~GENERATED PARTS END
