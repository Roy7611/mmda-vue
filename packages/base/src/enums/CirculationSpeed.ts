/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 流通速率
 * 
 * 0;UNKNOWN;-|1;HIGH;高速|2;MEDIUM;中速|3;LOW;低速|4;DEAD;呆滞
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum CirculationSpeed{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	HIGH = 'HIGH',  //1 高速
	MEDIUM = 'MEDIUM',  //2 中速
	LOW = 'LOW',  //3 低速
	DEAD = 'DEAD',  //4 呆滞
	
}
export const CirculationSpeedEnum = {
	UNKNOWN_VALUE : 0,
	HIGH_VALUE : 1,
	MEDIUM_VALUE : 2,
	LOW_VALUE : 3,
	DEAD_VALUE : 4,
	
	UNKNOWN_TEXT : '-',
	HIGH_TEXT : '高速',
	MEDIUM_TEXT : '中速',
	LOW_TEXT : '低速',
	DEAD_TEXT : '呆滞',

	valueOf(enumCode: CirculationSpeed): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: CirculationSpeed): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END