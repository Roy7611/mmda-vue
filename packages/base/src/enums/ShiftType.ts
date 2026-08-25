/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 班次类型
 * 
 * 0;DEFAULT;默认|1;MORNING_SHIFT;早班|2;MIDDAY_SHIFT;中班|3;NIGHT_SHIFT;夜班|4;GRAVEYARD_SHIFT;大夜班
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ShiftType{
	//#region ~GENERATED PARTS BEGIN
	DEFAULT = 'DEFAULT',  //0 默认
	MORNING_SHIFT = 'MORNING_SHIFT',  //1 早班
	MIDDAY_SHIFT = 'MIDDAY_SHIFT',  //2 中班
	NIGHT_SHIFT = 'NIGHT_SHIFT',  //3 夜班
	GRAVEYARD_SHIFT = 'GRAVEYARD_SHIFT',  //4 大夜班
	
}
export const ShiftTypeEnum = {
	DEFAULT_VALUE : 0,
	MORNING_SHIFT_VALUE : 1,
	MIDDAY_SHIFT_VALUE : 2,
	NIGHT_SHIFT_VALUE : 3,
	GRAVEYARD_SHIFT_VALUE : 4,
	
	DEFAULT_TEXT : '默认',
	MORNING_SHIFT_TEXT : '早班',
	MIDDAY_SHIFT_TEXT : '中班',
	NIGHT_SHIFT_TEXT : '夜班',
	GRAVEYARD_SHIFT_TEXT : '大夜班',

	valueOf(enumCode: ShiftType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ShiftType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END