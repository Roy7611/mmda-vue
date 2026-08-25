/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 货币单位
 * 
 * @remarks 货币单位。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface CurrencyUnit extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 货币编码
	 */
	currCode: string;
	/**
	 * 货币名称
	 */
	currName: string;
	/**
	 * 符号
	 */
	currSymbol: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 货币单位实体定义函数
 */
export const defineCurrencyUnit = (o: object) => {
	const e = defineEntity<CurrencyUnit>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.currCode }
	});
	return e;
}
