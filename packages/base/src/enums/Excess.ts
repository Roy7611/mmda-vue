/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 超计划
 * 
 * 0;NONE;未超|1;PRICE;超价|2;QTY;超量|3;EXCEEDED;超量超价|4;OUT_OF_PLAN;计划外
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum Excess{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 未超
	PRICE = 'PRICE',  //1 超价
	QTY = 'QTY',  //2 超量
	EXCEEDED = 'EXCEEDED',  //3 超量超价
	OUT_OF_PLAN = 'OUT_OF_PLAN',  //4 计划外
	
}
export const ExcessEnum = {
	NONE_VALUE : 0,
	PRICE_VALUE : 1,
	QTY_VALUE : 2,
	EXCEEDED_VALUE : 3,
	OUT_OF_PLAN_VALUE : 4,
	
	NONE_TEXT : '未超',
	PRICE_TEXT : '超价',
	QTY_TEXT : '超量',
	EXCEEDED_TEXT : '超量超价',
	OUT_OF_PLAN_TEXT : '计划外',

	valueOf(enumCode: Excess): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Excess): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

