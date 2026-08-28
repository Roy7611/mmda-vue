/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * BOM用途
 * 
 * 0;GENERAL;通用|1;DESIGN;设计|2;PRODUCTION;生产|4;MAINTENANCE;保养|8;SALES;销售
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum BomUsage{
	//#region ~GENERATED PARTS BEGIN
	GENERAL = 'GENERAL',  //0 通用
	DESIGN = 'DESIGN',  //1 设计
	PRODUCTION = 'PRODUCTION',  //2 生产
	MAINTENANCE = 'MAINTENANCE',  //4 保养
	SALES = 'SALES',  //8 销售
	
}
export const BomUsageEnum = {
	GENERAL_VALUE : 0,
	DESIGN_VALUE : 1,
	PRODUCTION_VALUE : 2,
	MAINTENANCE_VALUE : 4,
	SALES_VALUE : 8,
	
	GENERAL_TEXT : '通用',
	DESIGN_TEXT : '设计',
	PRODUCTION_TEXT : '生产',
	MAINTENANCE_TEXT : '保养',
	SALES_TEXT : '销售',

	valueOf(enumCode: BomUsage): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: BomUsage): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END