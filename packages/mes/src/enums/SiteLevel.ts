/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 站点级别
 * 
 * 0;PLANT;工厂|1;BUILDING;厂房|2;SHOP_FLOOR;车间|3;PROD_LINE;产线
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum SiteLevel{
	//#region ~GENERATED PARTS BEGIN
	PLANT = 'PLANT',  //0 工厂
	BUILDING = 'BUILDING',  //1 厂房
	SHOP_FLOOR = 'SHOP_FLOOR',  //2 车间
	PROD_LINE = 'PROD_LINE',  //3 产线
	
}
export const SiteLevelEnum = {
	PLANT_VALUE : 0,
	BUILDING_VALUE : 1,
	SHOP_FLOOR_VALUE : 2,
	PROD_LINE_VALUE : 3,
	
	PLANT_TEXT : '工厂',
	BUILDING_TEXT : '厂房',
	SHOP_FLOOR_TEXT : '车间',
	PROD_LINE_TEXT : '产线',

	valueOf(enumCode: SiteLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: SiteLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END