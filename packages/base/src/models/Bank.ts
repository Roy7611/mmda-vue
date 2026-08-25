/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 银行
 * 
 * @remarks 银行
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Bank extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 语言区域编码
	 */
	localeCode: string;
	/**
	 * 代码, LOGO.png
	 */
	bankCode: string;
	/**
	 * 银行名称
	 */
	bankName: string;
	/**
	 * 颜色
	 */
	bankColor: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 银行实体定义函数
 */
export const defineBank = (o: object) => {
	const e = defineEntity<Bank>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.localeCode},${this.bankCode}` }
	});
	return e;
}
