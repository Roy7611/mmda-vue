/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 预警
 * 
 * 0;NONE;-|1;WARNING;警告|4;FATAL;禁用
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum AlertingState{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	WARNING = 'WARNING',  //1 警告
	FATAL = 'FATAL',  //4 禁用
	
}
export const AlertingStateEnum = {
	NONE_VALUE : 0,
	WARNING_VALUE : 1,
	FATAL_VALUE : 4,
	
	NONE_TEXT : '-',
	WARNING_TEXT : '警告',
	FATAL_TEXT : '禁用',

	valueOf(enumCode: AlertingState): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: AlertingState): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END