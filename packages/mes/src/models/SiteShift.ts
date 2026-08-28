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
 * 站点班次
 * 
 * @remarks 站点班次。设置工厂、车间可用班次，即上不上班，时间维度的可用性，用于排程约束。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-31 00:33:20.0
 * 
 */
export interface SiteShift extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 站点标识
	 */
	siteID: string;
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
 * 站点班次实体定义函数
 */
export const defineSiteShift = (o: object) => {
	const e = defineEntity<SiteShift>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.siteID},${this.shiftID}` }
	});
	return e;
}
