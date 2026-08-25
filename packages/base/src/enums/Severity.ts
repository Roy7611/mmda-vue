/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 严重等级
 * 
 * 0;UNDEFINED;-|1;MINOR;轻微|2;MEDIUM;中等|3;CRITICAL;严重|4;FATAL;致命
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum Severity{
	//#region ~GENERATED PARTS BEGIN
	UNDEFINED = 'UNDEFINED',  //0 -
	MINOR = 'MINOR',  //1 轻微
	MEDIUM = 'MEDIUM',  //2 中等
	CRITICAL = 'CRITICAL',  //3 严重
	FATAL = 'FATAL',  //4 致命
	
}
export const SeverityEnum = {
	UNDEFINED_VALUE : 0,
	MINOR_VALUE : 1,
	MEDIUM_VALUE : 2,
	CRITICAL_VALUE : 3,
	FATAL_VALUE : 4,
	
	UNDEFINED_TEXT : '-',
	MINOR_TEXT : '轻微',
	MEDIUM_TEXT : '中等',
	CRITICAL_TEXT : '严重',
	FATAL_TEXT : '致命',

	valueOf(enumCode: Severity): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Severity): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END