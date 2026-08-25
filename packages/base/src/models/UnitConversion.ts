/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 计量单位转换
 * 
 * @remarks 计量单位转换。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface UnitConversion extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 左边单位
	 */
	unitLeft: string;
	/**
	 * 右边单位
	 */
	unitRight: string;
	/**
	 * 转换系数
	 */
	convertFactor: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 计量单位转换实体定义函数
 */
export const defineUnitConversion = (o: object) => {
	const e = defineEntity<UnitConversion>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.unitLeft},${this.unitRight}` }
	});
	return e;
}
