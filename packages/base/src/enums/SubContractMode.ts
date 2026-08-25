/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 分包方式
 * 
 * 0;UNKNOWN;-|1;LABOR;清包工|2;MATERIAL;单包（供料）|3;LABOR_AND_MATERIAL;双包（包工包料）|5;FEEDING_PROCESS;去料加工
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum SubContractMode{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	LABOR = 'LABOR',  //1 清包工
	MATERIAL = 'MATERIAL',  //2 单包（供料）
	LABOR_AND_MATERIAL = 'LABOR_AND_MATERIAL',  //3 双包（包工包料）
	FEEDING_PROCESS = 'FEEDING_PROCESS',  //5 去料加工
	
}
export const SubContractModeEnum = {
	UNKNOWN_VALUE : 0,
	LABOR_VALUE : 1,
	MATERIAL_VALUE : 2,
	LABOR_AND_MATERIAL_VALUE : 3,
	FEEDING_PROCESS_VALUE : 5,
	
	UNKNOWN_TEXT : '-',
	LABOR_TEXT : '清包工',
	MATERIAL_TEXT : '单包（供料）',
	LABOR_AND_MATERIAL_TEXT : '双包（包工包料）',
	FEEDING_PROCESS_TEXT : '去料加工',

	valueOf(enumCode: SubContractMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: SubContractMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
