/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 计价模式
 * 
 * 0;FP;总价合同|1;TM;单价合同|2;CR;成本加酬金
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum PriceMode{
	//#region ~GENERATED PARTS BEGIN
	FP = 'FP',  //0 总价合同
	TM = 'TM',  //1 单价合同
	CR = 'CR',  //2 成本加酬金
	
}
export const PriceModeEnum = {
	FP_VALUE : 0,
	TM_VALUE : 1,
	CR_VALUE : 2,
	
	FP_TEXT : '总价合同',
	TM_TEXT : '单价合同',
	CR_TEXT : '成本加酬金',

	valueOf(enumCode: PriceMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PriceMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
