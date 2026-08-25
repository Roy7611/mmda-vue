/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 字节序
 * 
 * 0;LITTLE;小端|1;BIG;大端
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum Endianness{
	//#region ~GENERATED PARTS BEGIN
	LITTLE = 'LITTLE',  //0 小端
	BIG = 'BIG',  //1 大端
	
}
export const EndiannessEnum = {
	LITTLE_VALUE : 0,
	BIG_VALUE : 1,
	
	LITTLE_TEXT : '小端',
	BIG_TEXT : '大端',

	valueOf(enumCode: Endianness): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Endianness): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END