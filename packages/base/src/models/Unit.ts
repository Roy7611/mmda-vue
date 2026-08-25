/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import { type UnitConversion, defineUnitConversion } from './UnitConversion';
/**
 * 计量单位
 * 
 * @remarks 计量单位。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface Unit extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 单位名称
	 */
	unit: string;
	/**
	 * 取整方式：0;不取整|1;逢一进位|3;二舍三入|5;四舍五入
	 */
	roundMode: number;
	/**
	 * 单位类型：0;计数|1;长度|2;面积|3;体积|4;重量|32;其他
	 */
	unitType: number;
	/**
	 * 单位转换
	 */
	conversions?:  UnitConversion[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 计量单位实体定义函数
 */
export const defineUnit = (o: object) => {
	const e = defineEntity<Unit>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.unit }
	});
	//单位转换
	e.conversions = defineEntityArray(defineUnitConversion, e.conversions);
	return e;
}
