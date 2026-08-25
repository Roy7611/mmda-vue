/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 物料用途
 * 
 * 0;LABOR;劳动力|1;RAW_MATERIAL;原材料|2;PART;零配件|4;SEMI_PRODUCT;半成品|8;PRODUCT;产成品|16;TOOLS;机具设备|32;PACKAGING;包材|64;CONSUMABLE;办公用品|128;OTHER;其他
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MaterialType{
	//#region ~GENERATED PARTS BEGIN
	LABOR = 'LABOR',  //0 劳动力
	RAW_MATERIAL = 'RAW_MATERIAL',  //1 原材料
	PART = 'PART',  //2 零配件
	SEMI_PRODUCT = 'SEMI_PRODUCT',  //4 半成品
	PRODUCT = 'PRODUCT',  //8 产成品
	TOOLS = 'TOOLS',  //16 机具设备
	PACKAGING = 'PACKAGING',  //32 包材
	CONSUMABLE = 'CONSUMABLE',  //64 办公用品
	OTHER = 'OTHER',  //128 其他
	
}
export const MaterialTypeEnum = {
	LABOR_VALUE : 0,
	RAW_MATERIAL_VALUE : 1,
	PART_VALUE : 2,
	SEMI_PRODUCT_VALUE : 4,
	PRODUCT_VALUE : 8,
	TOOLS_VALUE : 16,
	PACKAGING_VALUE : 32,
	CONSUMABLE_VALUE : 64,
	OTHER_VALUE : 128,
	
	LABOR_TEXT : '劳动力',
	RAW_MATERIAL_TEXT : '原材料',
	PART_TEXT : '零配件',
	SEMI_PRODUCT_TEXT : '半成品',
	PRODUCT_TEXT : '产成品',
	TOOLS_TEXT : '机具设备',
	PACKAGING_TEXT : '包材',
	CONSUMABLE_TEXT : '办公用品',
	OTHER_TEXT : '其他',

	valueOf(enumCode: MaterialType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END