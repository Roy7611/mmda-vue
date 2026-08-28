/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ShiftSystem } from '@mmda/base/src/enums/ShiftSystem';
import type { ShiftDay } from '../enums/ShiftDay';
/**
 * 班次时钟
 * 
 * @remarks 班次时钟
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface Shift extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 班次标识
	 */
	shiftID: string;
	/**
	 * 班次名称，如白班8:00AM-5:00PM
	 */
	shiftName: string;
	/**
	 * 轮班制：0;NONE;休息|1;ONE_SHIFT;单班制|2;TWO_SHIFTS;双班制|3;THREE_SHIFTS;三班倒|4;CUSTOM_SHIFTS;自定义
	 */
	shiftSystem: ShiftSystem;
	/**
	 * 上班时间
	 */
	clockInTime: string;
	/**
	 * 休息开始
	 */
	restFrom?: string;
	/**
	 * 休息结束
	 */
	restTo?: string;
	/**
	 * 下班时间，第二天时间超过24小时
	 */
	clockOutTime: string;
	/**
	 * 班次时长
	 * timediff(clockOutTime,clockInTime)
	 */
	shiftTimeSpan?: string;
	/**
	 * 休息时长
	 * timediff(restTo,restFrom)
	 */
	restTimeSpan?: string;
	/**
	 * 工作时长
	 * timediff(shiftTimeSpan,restTimeSpan)
	 */
	workTimeSpan?: string;
	/**
	 * 跨天
	 */
	crossMidnight: boolean;
	/**
	 * 班次日：0;ACTUAL_DAY;实际日|1;SHIFT_START;班次开始日|2;SHIFT_END;班次结束日
	 */
	shiftDay: ShiftDay;
	/**
	 * 预定义的，不能删除
	 */
	predefined: boolean;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 班次时钟实体定义函数
 */
export const defineShift = (o: object) => {
	const e = defineEntity<Shift>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.shiftID }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
