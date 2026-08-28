/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ShiftSystem } from '@mmda/base/src/enums/ShiftSystem';
import type { Shift } from './Shift';
/**
 * 工作日历天
 * 
 * @remarks 工作日历天
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface WorkCalendarDay extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 日历标识
	 */
	calendarID: string;
	/**
	 * 工作日
	 */
	calendarDay: string;
	/**
	 * 轮班作息：0;NONE;休息|1;ONE_SHIFT;单班制|2;TWO_SHIFTS;双班制|3;THREE_SHIFTS;三班倒|4;CUSTOM_SHIFTS;自定义
	 */
	shiftSystem: ShiftSystem;
	/**
	 * 使用特殊班次：HAS_ONE Shift(shiftID,shiftName) AS specificShift
	 */
	specificShiftID?: string;
	/**
	 * 节假日：REF Holiday(holidayCode,holidayName)
	 */
	holidayCode?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 使用特殊班次
	 */
	specificShift?: Shift;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作日历天实体定义函数
 */
export const defineWorkCalendarDay = (o: object) => {
	const e = defineEntity<WorkCalendarDay>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.calendarID},${this.calendarDay}` }
	});
	return e;
}
