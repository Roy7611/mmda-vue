/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 资质等级
 * 
 * 0;UNQUALIFIED;未评级|1;A;战略|2;B;重要|3;C;普通|4;D;终止合作
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum PartnerQualifiedLevel{
	//#region ~GENERATED PARTS BEGIN
	UNQUALIFIED = 'UNQUALIFIED',  //0 未评级
	A = 'A',  //1 战略
	B = 'B',  //2 重要
	C = 'C',  //3 普通
	D = 'D',  //4 终止合作
	
}
export const PartnerQualifiedLevelEnum = {
	UNQUALIFIED_VALUE : 0,
	A_VALUE : 1,
	B_VALUE : 2,
	C_VALUE : 3,
	D_VALUE : 4,
	
	UNQUALIFIED_TEXT : '未评级',
	A_TEXT : '战略',
	B_TEXT : '重要',
	C_TEXT : '普通',
	D_TEXT : '终止合作',

	valueOf(enumCode: PartnerQualifiedLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PartnerQualifiedLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END