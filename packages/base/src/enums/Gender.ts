/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 性别
 * 
 * 0;UNKNOWN;-|1;MALE;男|2;FEMALE;女
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum Gender{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	MALE = 'MALE',  //1 男
	FEMALE = 'FEMALE',  //2 女
	
}
export const GenderEnum = {
	UNKNOWN_VALUE : 0,
	MALE_VALUE : 1,
	FEMALE_VALUE : 2,
	
	UNKNOWN_TEXT : '-',
	MALE_TEXT : '男',
	FEMALE_TEXT : '女',

	valueOf(enumCode: Gender): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Gender): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END