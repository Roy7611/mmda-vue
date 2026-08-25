/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 数据类型
 * 
 * 0;BOOL;布尔|1;BYTE;字节|2;WORD;字|3;INT;整型|4;DWORD;双字|5;DINT;双整型|6;REAL;实数|7;LREAL;长实数|8;STRING;字符串|10;DATETIME;日期时间
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum DeviceDataType{
	//#region ~GENERATED PARTS BEGIN
	BOOL = 'BOOL',  //0 布尔
	BYTE = 'BYTE',  //1 字节
	WORD = 'WORD',  //2 字
	INT = 'INT',  //3 整型
	DWORD = 'DWORD',  //4 双字
	DINT = 'DINT',  //5 双整型
	REAL = 'REAL',  //6 实数
	LREAL = 'LREAL',  //7 长实数
	STRING = 'STRING',  //8 字符串
	DATETIME = 'DATETIME',  //10 日期时间
	
}
export const DeviceDataTypeEnum = {
	BOOL_VALUE : 0,
	BYTE_VALUE : 1,
	WORD_VALUE : 2,
	INT_VALUE : 3,
	DWORD_VALUE : 4,
	DINT_VALUE : 5,
	REAL_VALUE : 6,
	LREAL_VALUE : 7,
	STRING_VALUE : 8,
	DATETIME_VALUE : 10,
	
	BOOL_TEXT : '布尔',
	BYTE_TEXT : '字节',
	WORD_TEXT : '字',
	INT_TEXT : '整型',
	DWORD_TEXT : '双字',
	DINT_TEXT : '双整型',
	REAL_TEXT : '实数',
	LREAL_TEXT : '长实数',
	STRING_TEXT : '字符串',
	DATETIME_TEXT : '日期时间',

	valueOf(enumCode: DeviceDataType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DeviceDataType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END