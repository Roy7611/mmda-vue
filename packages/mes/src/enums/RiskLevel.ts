/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 风险等级
 * 
 * 0;UNKNOWN;-|1;VERY_LOW;很低|2;LOW;低|3;MEDIUM;中等|4;HIGH;高|5;VERY_HIGH;很高
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum RiskLevel{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	VERY_LOW = 'VERY_LOW',  //1 很低
	LOW = 'LOW',  //2 低
	MEDIUM = 'MEDIUM',  //3 中等
	HIGH = 'HIGH',  //4 高
	VERY_HIGH = 'VERY_HIGH',  //5 很高
	
}
export const RiskLevelEnum = {
	UNKNOWN_VALUE : 0,
	VERY_LOW_VALUE : 1,
	LOW_VALUE : 2,
	MEDIUM_VALUE : 3,
	HIGH_VALUE : 4,
	VERY_HIGH_VALUE : 5,
	
	UNKNOWN_TEXT : '-',
	VERY_LOW_TEXT : '很低',
	LOW_TEXT : '低',
	MEDIUM_TEXT : '中等',
	HIGH_TEXT : '高',
	VERY_HIGH_TEXT : '很高',

	valueOf(enumCode: RiskLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RiskLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END