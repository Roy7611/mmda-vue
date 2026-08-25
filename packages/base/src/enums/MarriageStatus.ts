/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 婚姻状况
 * 
 * 0;UNKNOWN;-|1;SINGLE;未婚|2;MARRIED;已婚|3;SEPERATED;分居|4;DIVOICED;离异|5;WIDOWED;丧偶
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MarriageStatus{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	SINGLE = 'SINGLE',  //1 未婚
	MARRIED = 'MARRIED',  //2 已婚
	SEPERATED = 'SEPERATED',  //3 分居
	DIVOICED = 'DIVOICED',  //4 离异
	WIDOWED = 'WIDOWED',  //5 丧偶
	
}
export const MarriageStatusEnum = {
	UNKNOWN_VALUE : 0,
	SINGLE_VALUE : 1,
	MARRIED_VALUE : 2,
	SEPERATED_VALUE : 3,
	DIVOICED_VALUE : 4,
	WIDOWED_VALUE : 5,
	
	UNKNOWN_TEXT : '-',
	SINGLE_TEXT : '未婚',
	MARRIED_TEXT : '已婚',
	SEPERATED_TEXT : '分居',
	DIVOICED_TEXT : '离异',
	WIDOWED_TEXT : '丧偶',

	valueOf(enumCode: MarriageStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MarriageStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END