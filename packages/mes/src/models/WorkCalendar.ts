/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { RestProgram } from '@mmda/base/src/enums/RestProgram';
import type { ShiftSystem } from '@mmda/base/src/enums/ShiftSystem';
import { type WorkCalendarDay, defineWorkCalendarDay } from './WorkCalendarDay';
import { type WorkShift, defineWorkShift } from './WorkShift';
/**
 * 工作日历
 * 
 * @remarks 工作日历
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface WorkCalendar extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 日历标识
	 */
	calendarID: string;
	/**
	 * 日历名称
	 */
	calendarName: string;
	/**
	 * 作息制度：0;DEFAULT;默认|1;SINGLE_OFF;单休制|2;DOUBLE_OFF;双休制|3;BIG_SMALL_WEEK;大小周
	 */
	restProgram: RestProgram;
	/**
	 * 轮班制：0;NONE;休息|1;ONE_SHIFT;单班制|2;TWO_SHIFTS;双班制|3;THREE_SHIFTS;三班倒|4;CUSTOM_SHIFTS;自定义
	 */
	shiftSystem: ShiftSystem;
	/**
	 * 月起始
	 */
	monthStart: number;
	/**
	 * 周起始，1-7表示周一至周日
	 */
	weekStart: number;
	/**
	 * 法定节假日
	 */
	holidays: string;
	/**
	 * 节假调休日
	 */
	days?:  WorkCalendarDay[];
	/**
	 * 轮班调整
	 */
	shifts?:  WorkShift[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作日历实体定义函数
 */
export const defineWorkCalendar = (o: object) => {
	const e = defineEntity<WorkCalendar>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.calendarID }
	});
	//节假调休日
	e.days = defineEntityArray(defineWorkCalendarDay, e.days);
	//轮班调整
	e.shifts = defineEntityArray(defineWorkShift, e.shifts);
	return e;
}
