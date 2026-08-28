/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 制程类型
 * 
 * 0;PROCESS;流程制造|1;DISCRETE;离散制造
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProcessType{
	//#region ~GENERATED PARTS BEGIN
	PROCESS = 'PROCESS',  //0 流程制造
	DISCRETE = 'DISCRETE',  //1 离散制造
	
}
export const ProcessTypeEnum = {
	PROCESS_VALUE : 0,
	DISCRETE_VALUE : 1,
	
	PROCESS_TEXT : '流程制造',
	DISCRETE_TEXT : '离散制造',

	valueOf(enumCode: ProcessType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProcessType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END