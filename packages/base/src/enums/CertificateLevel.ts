/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 证书等级
 * 
 * 0;ELEMENTARY;初级|1;INTERMEDIATE;中级|2;ADVANCED;高级
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum CertificateLevel{
	//#region ~GENERATED PARTS BEGIN
	ELEMENTARY = 'ELEMENTARY',  //0 初级
	INTERMEDIATE = 'INTERMEDIATE',  //1 中级
	ADVANCED = 'ADVANCED',  //2 高级
	
}
export const CertificateLevelEnum = {
	ELEMENTARY_VALUE : 0,
	INTERMEDIATE_VALUE : 1,
	ADVANCED_VALUE : 2,
	
	ELEMENTARY_TEXT : '初级',
	INTERMEDIATE_TEXT : '中级',
	ADVANCED_TEXT : '高级',

	valueOf(enumCode: CertificateLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: CertificateLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END