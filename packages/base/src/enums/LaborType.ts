/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 劳工类型
 * 
 * 0;EMPLOYED;职工|1;OUTSOURCED;劳务工|2;TEMPORARY;临时工
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum LaborType{
	//#region ~GENERATED PARTS BEGIN
	EMPLOYED = 'EMPLOYED',  //0 职工
	OUTSOURCED = 'OUTSOURCED',  //1 劳务工
	TEMPORARY = 'TEMPORARY',  //2 临时工
	
}
export const LaborTypeEnum = {
	EMPLOYED_VALUE : 0,
	OUTSOURCED_VALUE : 1,
	TEMPORARY_VALUE : 2,
	
	EMPLOYED_TEXT : '职工',
	OUTSOURCED_TEXT : '劳务工',
	TEMPORARY_TEXT : '临时工',

	valueOf(enumCode: LaborType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: LaborType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END