/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 需质量控制
 * 
 * 0;NONE;-|1;TRANS_BEFORE;转移前|2;TRANS_AFTER;转移后
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum RequiredQc{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	TRANS_BEFORE = 'TRANS_BEFORE',  //1 转移前
	TRANS_AFTER = 'TRANS_AFTER',  //2 转移后
	
}
export const RequiredQcEnum = {
	NONE_VALUE : 0,
	TRANS_BEFORE_VALUE : 1,
	TRANS_AFTER_VALUE : 2,
	
	NONE_TEXT : '-',
	TRANS_BEFORE_TEXT : '转移前',
	TRANS_AFTER_TEXT : '转移后',

	valueOf(enumCode: RequiredQc): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RequiredQc): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END