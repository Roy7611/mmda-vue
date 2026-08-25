/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 标准类型
 * 
 * 0;ISO;国际标准|1;GB;国家标准|2;IS;行业标准|3;EB;企业标准
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum OpenStandardType{
	//#region ~GENERATED PARTS BEGIN
	ISO = 'ISO',  //0 国际标准
	GB = 'GB',  //1 国家标准
	IS = 'IS',  //2 行业标准
	EB = 'EB',  //3 企业标准
	
}
export const OpenStandardTypeEnum = {
	ISO_VALUE : 0,
	GB_VALUE : 1,
	IS_VALUE : 2,
	EB_VALUE : 3,
	
	ISO_TEXT : '国际标准',
	GB_TEXT : '国家标准',
	IS_TEXT : '行业标准',
	EB_TEXT : '企业标准',

	valueOf(enumCode: OpenStandardType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: OpenStandardType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END