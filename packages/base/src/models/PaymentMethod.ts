/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 支付方式
 * 
 * @remarks 支付方式
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface PaymentMethod extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 方式ID
	 */
	methodID: number;
	/**
	 * 方式编码
	 */
	methodCode?: string;
	/**
	 * 方式名称
	 */
	methodName: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 支付方式实体定义函数
 */
export const definePaymentMethod = (o: object) => {
	const e = defineEntity<PaymentMethod>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.methodID }
	});
	return e;
}
