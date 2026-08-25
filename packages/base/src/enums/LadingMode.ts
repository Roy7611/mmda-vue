/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 提货方式
 * 
 * 0;DEFAULT;-|1;SELLER;供方送货|2;BUYER;需方自提|3;CONSIGNED;供方代发
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum LadingMode{
	//#region ~GENERATED PARTS BEGIN
	DEFAULT = 'DEFAULT',  //0 -
	SELLER = 'SELLER',  //1 供方送货
	BUYER = 'BUYER',  //2 需方自提
	CONSIGNED = 'CONSIGNED',  //3 供方代发
	
}
export const LadingModeEnum = {
	DEFAULT_VALUE : 0,
	SELLER_VALUE : 1,
	BUYER_VALUE : 2,
	CONSIGNED_VALUE : 3,
	
	DEFAULT_TEXT : '-',
	SELLER_TEXT : '供方送货',
	BUYER_TEXT : '需方自提',
	CONSIGNED_TEXT : '供方代发',

	valueOf(enumCode: LadingMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: LadingMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END