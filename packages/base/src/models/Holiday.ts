/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 节假日
 * 
 * @remarks 节假日
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface Holiday extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 节假日编码，例如G05.01
	 */
	holidayCode: string;
	/**
	 * 节假日名称，例如劳动节
	 */
	holidayName: string;
	/**
	 * 0;GREGORIAN;公历|1;LUNAR;阴历
	 */
	calendarType: number;
	/**
	 * 节假月
	 */
	holidayMonth: number;
	/**
	 * 节假日，为0需动态计算，如清明节
	 */
	holidayDay: number;
	/**
	 * GEC代码，如CN,US,TW
	 */
	countryCode: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 节假日实体定义函数
 */
export const defineHoliday = (o: object) => {
	const e = defineEntity<Holiday>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.holidayCode }
	});
	return e;
}
