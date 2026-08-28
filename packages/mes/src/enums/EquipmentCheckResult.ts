/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备检查结果
 * 
 * 0;NONE;-|1;OK;正常|2;EX;异常|3;EX_OK;异常修复
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EquipmentCheckResult{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	OK = 'OK',  //1 正常
	EX = 'EX',  //2 异常
	EX_OK = 'EX_OK',  //3 异常修复
	
}
export const EquipmentCheckResultEnum = {
	NONE_VALUE : 0,
	OK_VALUE : 1,
	EX_VALUE : 2,
	EX_OK_VALUE : 3,
	
	NONE_TEXT : '-',
	OK_TEXT : '正常',
	EX_TEXT : '异常',
	EX_OK_TEXT : '异常修复',

	valueOf(enumCode: EquipmentCheckResult): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EquipmentCheckResult): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END