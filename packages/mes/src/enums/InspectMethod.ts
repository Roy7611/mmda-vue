/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 检验方式
 * 
 * 0;NONE;-|1;RANDOM;抽检|2;FULL;全检
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum InspectMethod{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	RANDOM = 'RANDOM',  //1 抽检
	FULL = 'FULL',  //2 全检
	
}
export const InspectMethodEnum = {
	NONE_VALUE : 0,
	RANDOM_VALUE : 1,
	FULL_VALUE : 2,
	
	NONE_TEXT : '-',
	RANDOM_TEXT : '抽检',
	FULL_TEXT : '全检',

	valueOf(enumCode: InspectMethod): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: InspectMethod): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END