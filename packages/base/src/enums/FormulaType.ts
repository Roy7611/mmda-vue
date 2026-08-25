/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 算量类型
 * 
 * 0;NONE;手工录入|1;FIXED;固定用量|2;TIMES;乘工程量|3;FORMULA;使用公式
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum FormulaType{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 手工录入
	FIXED = 'FIXED',  //1 固定用量
	TIMES = 'TIMES',  //2 乘工程量
	FORMULA = 'FORMULA',  //3 使用公式
	
}
export const FormulaTypeEnum = {
	NONE_VALUE : 0,
	FIXED_VALUE : 1,
	TIMES_VALUE : 2,
	FORMULA_VALUE : 3,
	
	NONE_TEXT : '手工录入',
	FIXED_TEXT : '固定用量',
	TIMES_TEXT : '乘工程量',
	FORMULA_TEXT : '使用公式',

	valueOf(enumCode: FormulaType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: FormulaType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END