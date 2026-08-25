/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 保密等级
 * 
 * 0;UNCLASSFIED;公开|1;SECRET;秘密|2;CONFIDENTIAL;机密|3;TOP_SECRET;绝密
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ConfidentialityLevel{
	//#region ~GENERATED PARTS BEGIN
	UNCLASSFIED = 'UNCLASSFIED',  //0 公开
	SECRET = 'SECRET',  //1 秘密
	CONFIDENTIAL = 'CONFIDENTIAL',  //2 机密
	TOP_SECRET = 'TOP_SECRET',  //3 绝密
	
}
export const ConfidentialityLevelEnum = {
	UNCLASSFIED_VALUE : 0,
	SECRET_VALUE : 1,
	CONFIDENTIAL_VALUE : 2,
	TOP_SECRET_VALUE : 3,
	
	UNCLASSFIED_TEXT : '公开',
	SECRET_TEXT : '秘密',
	CONFIDENTIAL_TEXT : '机密',
	TOP_SECRET_TEXT : '绝密',

	valueOf(enumCode: ConfidentialityLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ConfidentialityLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END