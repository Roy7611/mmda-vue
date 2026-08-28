/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 班次日
 * 
 * 0;ACTUAL_DAY;实际日|1;SHIFT_START;班次开始日|2;SHIFT_END;班次结束日
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ShiftDay{
	//#region ~GENERATED PARTS BEGIN
	ACTUAL_DAY = 'ACTUAL_DAY',  //0 实际日
	SHIFT_START = 'SHIFT_START',  //1 班次开始日
	SHIFT_END = 'SHIFT_END',  //2 班次结束日
	
}
export const ShiftDayEnum = {
	ACTUAL_DAY_VALUE : 0,
	SHIFT_START_VALUE : 1,
	SHIFT_END_VALUE : 2,
	
	ACTUAL_DAY_TEXT : '实际日',
	SHIFT_START_TEXT : '班次开始日',
	SHIFT_END_TEXT : '班次结束日',

	valueOf(enumCode: ShiftDay): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ShiftDay): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
