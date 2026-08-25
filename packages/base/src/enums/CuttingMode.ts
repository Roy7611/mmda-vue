/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 切割方式
 * 
 * 0;NONE;不切割|1;X;切段|3;XY;切块
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum CuttingMode{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 不切割
	X = 'X',  //1 切段
	XY = 'XY',  //3 切块
	
}
export const CuttingModeEnum = {
	NONE_VALUE : 0,
	X_VALUE : 1,
	XY_VALUE : 3,
	
	NONE_TEXT : '不切割',
	X_TEXT : '切段',
	XY_TEXT : '切块',

	valueOf(enumCode: CuttingMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: CuttingMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END