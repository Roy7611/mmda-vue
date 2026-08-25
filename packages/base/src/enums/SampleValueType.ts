/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 采样值类型
 * 
 * 0;NEVER;-|1;MIN;最小值|2;MAX;最大值|3;MIN_MAX;最小最大值|4;ALL;所有
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum SampleValueType{
	//#region ~GENERATED PARTS BEGIN
	NEVER = 'NEVER',  //0 -
	MIN = 'MIN',  //1 最小值
	MAX = 'MAX',  //2 最大值
	MIN_MAX = 'MIN_MAX',  //3 最小最大值
	ALL = 'ALL',  //4 所有
	
}
export const SampleValueTypeEnum = {
	NEVER_VALUE : 0,
	MIN_VALUE : 1,
	MAX_VALUE : 2,
	MIN_MAX_VALUE : 3,
	ALL_VALUE : 4,
	
	NEVER_TEXT : '-',
	MIN_TEXT : '最小值',
	MAX_TEXT : '最大值',
	MIN_MAX_TEXT : '最小最大值',
	ALL_TEXT : '所有',

	valueOf(enumCode: SampleValueType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: SampleValueType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END