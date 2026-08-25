/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 寻源模式
 * 
 * 0;INVENTORY;库存|1;DIRECT_PURCHASE;直采|2;MAKE;自制|3;OUTSOURCE;外协
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum SourcingMode{
	//#region ~GENERATED PARTS BEGIN
	INVENTORY = 'INVENTORY',  //0 库存
	DIRECT_PURCHASE = 'DIRECT_PURCHASE',  //1 直采
	MAKE = 'MAKE',  //2 自制
	OUTSOURCE = 'OUTSOURCE',  //3 外协
	
}
export const SourcingModeEnum = {
	INVENTORY_VALUE : 0,
	DIRECT_PURCHASE_VALUE : 1,
	MAKE_VALUE : 2,
	OUTSOURCE_VALUE : 3,
	
	INVENTORY_TEXT : '库存',
	DIRECT_PURCHASE_TEXT : '直采',
	MAKE_TEXT : '自制',
	OUTSOURCE_TEXT : '外协',

	valueOf(enumCode: SourcingMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: SourcingMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END