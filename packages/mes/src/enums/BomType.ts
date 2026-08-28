/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * BOM类型
 * 
 * 0;PRIMARY;主配方|1;ALTERNATE;替代配方|2;VARIANT;变种配方
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum BomType{
	//#region ~GENERATED PARTS BEGIN
	PRIMARY = 'PRIMARY',  //0 主配方
	ALTERNATE = 'ALTERNATE',  //1 替代配方
	VARIANT = 'VARIANT',  //2 变种配方
	
}
export const BomTypeEnum = {
	PRIMARY_VALUE : 0,
	ALTERNATE_VALUE : 1,
	VARIANT_VALUE : 2,
	
	PRIMARY_TEXT : '主配方',
	ALTERNATE_TEXT : '替代配方',
	VARIANT_TEXT : '变种配方',

	valueOf(enumCode: BomType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: BomType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END