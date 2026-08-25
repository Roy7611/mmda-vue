/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 数值超限
 * 
 * 0;NONE;-|1;LOWER;超低|2;HIGHER;超高
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ValueExcess{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	LOWER = 'LOWER',  //1 超低
	HIGHER = 'HIGHER',  //2 超高
	
}
export const ValueExcessEnum = {
	NONE_VALUE : 0,
	LOWER_VALUE : 1,
	HIGHER_VALUE : 2,
	
	NONE_TEXT : '-',
	LOWER_TEXT : '超低',
	HIGHER_TEXT : '超高',

	valueOf(enumCode: ValueExcess): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ValueExcess): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END