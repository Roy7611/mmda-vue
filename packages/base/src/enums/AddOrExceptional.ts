/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 额外或除外
 * 
 * 0;DEFAULT;默认|1;ADDITIONAL;额外|4;EXCEPTIONAL;除外
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum AddOrExceptional{
	//#region ~GENERATED PARTS BEGIN
	DEFAULT = 'DEFAULT',  //0 默认
	ADDITIONAL = 'ADDITIONAL',  //1 额外
	EXCEPTIONAL = 'EXCEPTIONAL',  //4 除外
	
}
export const AddOrExceptionalEnum = {
	DEFAULT_VALUE : 0,
	ADDITIONAL_VALUE : 1,
	EXCEPTIONAL_VALUE : 4,
	
	DEFAULT_TEXT : '默认',
	ADDITIONAL_TEXT : '额外',
	EXCEPTIONAL_TEXT : '除外',

	valueOf(enumCode: AddOrExceptional): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: AddOrExceptional): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
