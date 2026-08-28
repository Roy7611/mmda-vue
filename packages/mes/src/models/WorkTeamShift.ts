/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Urgency } from '@mmda/base/src/enums/Urgency';
/**
 * 班组出勤班次
 * 
 * @remarks 班组出勤班次
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-31 00:33:30.0
 * 
 */
export interface WorkTeamShift extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 班组ID
	 */
	teamID: string;
	/**
	 * 班次：REF Shift(shiftID,shiftName)
	 */
	shiftID: string;
	/**
	 * 优先级：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	priority: Urgency;
	/**
	 * 可用
	 */
	available: boolean;
	//#endregion ~GENERATED PARTS END
}
/**
 * 班组出勤班次实体定义函数
 */
export const defineWorkTeamShift = (o: object) => {
	const e = defineEntity<WorkTeamShift>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.teamID},${this.shiftID}` }
	});
	return e;
}
