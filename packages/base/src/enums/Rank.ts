/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 星级
 * 
 * 0;NONE;-|1;A;A级|2;B;B级|3;C;C级|4;D;D级
 * 
 * @author mmda code robot 
 * @version 4.0.0 
 * 
 */
export const enum Rank{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	A = 'A',  //1 A级
	B = 'B',  //2 B级
	C = 'C',  //3 C级
	D = 'D',  //4 D级
	
}
export const RankEnum = {
	NONE_VALUE : 0,
	A_VALUE : 1,
	B_VALUE : 2,
	C_VALUE : 3,
	D_VALUE : 4,
	
	NONE_TEXT : '-',
	A_TEXT : 'A级',
	B_TEXT : 'B级',
	C_TEXT : 'C级',
	D_TEXT : 'D级',

	valueOf(enumCode: Rank): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Rank): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

