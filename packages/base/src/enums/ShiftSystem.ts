/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 班次制度
 * 
 * 0;DEFAULT;默认|1;ONE_SHIFT;单班制|2;TWO_SHIFTS;双班制|3;THREE_SHIFTS;三班倒
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ShiftSystem{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	ONE_SHIFT = 'ONE_SHIFT',  //1 单班制
	TWO_SHIFTS = 'TWO_SHIFTS',  //2 双班制
	THREE_SHIFTS = 'THREE_SHIFTS',  //3 三班倒
	
}
export const ShiftSystemEnum = {
	NONE_VALUE : 0,
	ONE_SHIFT_VALUE : 1,
	TWO_SHIFTS_VALUE : 2,
	THREE_SHIFTS_VALUE : 3,
	
	NONE_TEXT : '-',
	ONE_SHIFT_TEXT : '单班制',
	TWO_SHIFTS_TEXT : '双班制',
	THREE_SHIFTS_TEXT : '三班倒',

	valueOf(enumCode: ShiftSystem): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ShiftSystem): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END