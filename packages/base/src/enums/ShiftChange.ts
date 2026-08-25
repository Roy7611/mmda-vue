/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 作息调整
 * 
 * 0;DEFALUT;默认|1;WORK;工作|2;REST;休息
 * 
 * @author mmda code robot 
 * @version 4.0.0 
 * 
 */
export const enum ShiftChange{
	//#region ~GENERATED PARTS BEGIN
	DEFALUT = 'DEFALUT',  //0 默认
	WORK = 'WORK',  //1 工作
	REST = 'REST',  //2 休息
	
}
export const ShiftChangeEnum = {
	DEFALUT_VALUE : 0,
	WORK_VALUE : 1,
	REST_VALUE : 2,
	
	DEFALUT_TEXT : '默认',
	WORK_TEXT : '工作',
	REST_TEXT : '休息',

	valueOf(enumCode: ShiftChange): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ShiftChange): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END