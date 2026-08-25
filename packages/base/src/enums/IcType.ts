/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 证件类型
 * 
 * 0;ID_CARD;身份证|1;PASSPORT;护照|2;MILITARY_CARD;军人证|3;SAR_ID_CARD;港澳台身份证|9;OTHER;其他证件
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum IcType{
	//#region ~GENERATED PARTS BEGIN
	ID_CARD = 'ID_CARD',  //0 身份证
	PASSPORT = 'PASSPORT',  //1 护照
	MILITARY_CARD = 'MILITARY_CARD',  //2 军人证
	SAR_ID_CARD = 'SAR_ID_CARD',  //3 港澳台身份证
	OTHER = 'OTHER',  //9 其他证件
	
}
export const IcTypeEnum = {
	ID_CARD_VALUE : 0,
	PASSPORT_VALUE : 1,
	MILITARY_CARD_VALUE : 2,
	SAR_ID_CARD_VALUE : 3,
	OTHER_VALUE : 9,
	
	ID_CARD_TEXT : '身份证',
	PASSPORT_TEXT : '护照',
	MILITARY_CARD_TEXT : '军人证',
	SAR_ID_CARD_TEXT : '港澳台身份证',
	OTHER_TEXT : '其他证件',

	valueOf(enumCode: IcType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: IcType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END