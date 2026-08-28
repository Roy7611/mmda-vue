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
import { type Bank, defineBank } from '../../models/Bank';
/**
 * 银行交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-07-17 08:54:31.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 银行交互逻辑
 */
export class BankLogic extends UiLogic<Bank> {
	constructor(init: UiLogicInit) {
		super(defineBank, init);
	}
	beforeIndex(): UiLogicFnResult<Bank> {
		const { fields, groups, customActions } = super.beforeIndex();
		// if (fields.length === 0) {
		// 	// fields.push(
		// 	// 	// this.field('bankColor').searchable(true),
		// 	// )
		// }
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
 * 构造银行交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const BankLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new BankLogic({
	service: metaUiService,
	repository: 'Banks',
	router,
	module: module || metaUiService.findModule('Bank'),
})
//#endregion ~GENERATED PARTS END
