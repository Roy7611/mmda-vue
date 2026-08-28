/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备点检周期
 * 
 * 0;SHIFT;每班次|1;DAY;天|2;WEEK;周
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EquipmentCheckCycle{
	//#region ~GENERATED PARTS BEGIN
	SHIFT = 'SHIFT',  //0 每班次
	DAY = 'DAY',  //1 天
	WEEK = 'WEEK',  //2 周
	
}
export const EquipmentCheckCycleEnum = {
	SHIFT_VALUE : 0,
	DAY_VALUE : 1,
	WEEK_VALUE : 2,
	
	SHIFT_TEXT : '每班次',
	DAY_TEXT : '天',
	WEEK_TEXT : '周',

	valueOf(enumCode: EquipmentCheckCycle): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EquipmentCheckCycle): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END