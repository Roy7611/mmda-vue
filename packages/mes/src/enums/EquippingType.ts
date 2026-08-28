/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 装备类型
 * 
 * 0;NONE;无|1;SEMI_AUTO;半自动|2;AUTO;自动
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EquippingType{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 无
	SEMI_AUTO = 'SEMI_AUTO',  //1 半自动
	AUTO = 'AUTO',  //2 自动
	
}
export const EquippingTypeEnum = {
	NONE_VALUE : 0,
	SEMI_AUTO_VALUE : 1,
	AUTO_VALUE : 2,
	
	NONE_TEXT : '无',
	SEMI_AUTO_TEXT : '半自动',
	AUTO_TEXT : '自动',

	valueOf(enumCode: EquippingType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EquippingType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END