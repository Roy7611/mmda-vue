/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 工序类型
 * 
 * 0;MAKE;生产|1;TEST;测试|2;SPECIAL;特殊|4;STORAGE;缓存
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum OpType{
	//#region ~GENERATED PARTS BEGIN
	MAKE = 'MAKE',  //0 生产
	TEST = 'TEST',  //1 测试
	SPECIAL = 'SPECIAL',  //2 特殊
	STORAGE = 'STORAGE',  //4 缓存
	
}
export const OpTypeEnum = {
	MAKE_VALUE : 0,
	TEST_VALUE : 1,
	SPECIAL_VALUE : 2,
	STORAGE_VALUE : 4,
	
	MAKE_TEXT : '生产',
	TEST_TEXT : '测试',
	SPECIAL_TEXT : '特殊',
	STORAGE_TEXT : '缓存',

	valueOf(enumCode: OpType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: OpType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END