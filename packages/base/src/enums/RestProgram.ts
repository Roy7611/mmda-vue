/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 作息制度
 * 
 * 0;DEFAULT;默认|1;SINGLE_OFF;单休制|2;DOUBLE_OFF;双休制|3;BIG_SMALL_WEEK;大小周
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum RestProgram{
	//#region ~GENERATED PARTS BEGIN
	DEFAULT = 'DEFAULT',  //0 默认
	SINGLE_OFF = 'SINGLE_OFF',  //1 单休制
	DOUBLE_OFF = 'DOUBLE_OFF',  //2 双休制
	BIG_SMALL_WEEK = 'BIG_SMALL_WEEK',  //3 大小周
	
}
export const RestProgramEnum = {
	DEFAULT_VALUE : 0,
	SINGLE_OFF_VALUE : 1,
	DOUBLE_OFF_VALUE : 2,
	BIG_SMALL_WEEK_VALUE : 3,
	
	DEFAULT_TEXT : '默认',
	SINGLE_OFF_TEXT : '单休制',
	DOUBLE_OFF_TEXT : '双休制',
	BIG_SMALL_WEEK_TEXT : '大小周',

	valueOf(enumCode: RestProgram): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RestProgram): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END