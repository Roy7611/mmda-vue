/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 退返修类型
 * 
 * 0;RETURN;退货|1;REPLACE;换货|2;REPLENISH;补零配件|4;REPAIR_WARRANTY;保修|5;REPAIR;维修
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum RmaType{
	//#region ~GENERATED PARTS BEGIN
	RETURN = 'RETURN',  //0 退货
	REPLACE = 'REPLACE',  //1 换货
	REPLENISH = 'REPLENISH',  //2 补零配件
	REPAIR_WARRANTY = 'REPAIR_WARRANTY',  //4 保修
	REPAIR = 'REPAIR',  //5 维修
	
}
export const RmaTypeEnum = {
	RETURN_VALUE : 0,
	REPLACE_VALUE : 1,
	REPLENISH_VALUE : 2,
	REPAIR_WARRANTY_VALUE : 4,
	REPAIR_VALUE : 5,
	
	RETURN_TEXT : '退货',
	REPLACE_TEXT : '换货',
	REPLENISH_TEXT : '补零配件',
	REPAIR_WARRANTY_TEXT : '保修',
	REPAIR_TEXT : '维修',

	valueOf(enumCode: RmaType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RmaType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

