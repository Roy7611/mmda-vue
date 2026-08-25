/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 取整模式
 * 
 * 0;NONE;不取整|1;ONE;逢一进位|3;THREE;二舍三入|5;FIVE;四舍五入
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum RoundMode{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 不取整
	ONE = 'ONE',  //1 逢一进位
	THREE = 'THREE',  //3 二舍三入
	FIVE = 'FIVE',  //5 四舍五入
	
}
export const RoundModeEnum = {
	NONE_VALUE : 0,
	ONE_VALUE : 1,
	THREE_VALUE : 3,
	FIVE_VALUE : 5,
	
	NONE_TEXT : '不取整',
	ONE_TEXT : '逢一进位',
	THREE_TEXT : '二舍三入',
	FIVE_TEXT : '四舍五入',

	valueOf(enumCode: RoundMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RoundMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END