/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ShiftSystem } from '@mmda/base/src/enums/ShiftSystem';
/**
 * 工作轮班
 * 
 * @remarks 工作轮班
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-10-13 10:25:12.0
 * 
 */
export interface WorkShift extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 日历标识
	 */
	calendarID: string;
	/**
	 * 调整开始日
	 */
	startDate: string;
	/**
	 * 调整轮班制：0;NONE;-|1;ONE_SHIFT;单班制|2;TWO_SHIFTS;双班制|3;THREE_SHIFTS;三班倒
	 */
	shiftSystem: ShiftSystem;
	/**
	 * 预计结束日
	 */
	expectedEndDate?: string;
	/**
	 * 到期恢复轮班制：0;NONE;-|1;ONE_SHIFT;单班制|2;TWO_SHIFTS;双班制|3;THREE_SHIFTS;三班倒
	 */
	recoverShiftSystem?: ShiftSystem;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作轮班实体定义函数
 */
export const defineWorkShift = (o: object) => {
	const e = defineEntity<WorkShift>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.calendarID},${this.startDate}` }
	});
	return e;
}
