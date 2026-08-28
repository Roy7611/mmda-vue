/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaintainingFrequency } from '../enums/MaintainingFrequency';
/**
 * 维护计划
 * 
 * @remarks 维护计划
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:03.0
 * 
 */
export interface MaintenancePlan extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 计划标识
	 */
	planID: string;
	/**
	 * 计划名称
	 */
	planName: string;
	/**
	 * 维护频率：0;DAILY;每天|1;WEEKLY;每周|2;MONTHLY;每月|3;QUARTERLY;每季度|4;YEARLY;每年
	 */
	frequency: MaintainingFrequency;
	/**
	 * 第几天
	 */
	onDay: number;
	/**
	 * 至第几天
	 */
	toDay?: number;
	/**
	 * 开始时间
	 */
	startTime: string;
	/**
	 * 结束时间
	 */
	endTime: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 维护计划实体定义函数
 */
export const defineMaintenancePlan = (o: object) => {
	const e = defineEntity<MaintenancePlan>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.planID }
	});
	return e;
}
