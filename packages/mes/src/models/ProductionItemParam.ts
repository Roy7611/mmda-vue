/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ValueExcess } from '@mmda/base/src/enums/ValueExcess';
/**
 * 生产件参数
 *
 * @remarks 生产件参数。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProductionItemParam extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 单件标识
	 */
	itemID: string;
	/**
	 * 加工工位：REF Station(stationID,stationNo,stationName)
	 */
	stationID: string;
	/**
	 * 参数代码
	 */
	paramCode: string;
	/**
	 * 采集时间
	 */
	collectTime: string;
	/**
	 * 采集设备：REF_ONE Equipment(equipID,equipNo,equipName)
	 */
	equipID?: string;
	/**
	 * 参数值
	 */
	paramValue: number;
	/**
	 * 参数，显示用，例如加了计量单位
	 */
	paramText?: string;
	/**
	 * 超界限：0;NONE;-|1;LOWER;超低|2;HIGHER;超高
	 */
	exceedingType: ValueExcess;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产件参数实体定义函数
 */
export const defineProductionItemParam = (o: object) => {
	const e = defineEntity<ProductionItemParam>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.itemID},${this.stationID},${this.paramCode},${this.collectTime}` }
	});
	return e;
}
