/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 模块状态
 * 
 * 0;DEV;开发中|1;TESTING;测试中|2;RELEASED;已发布|-1;DEPRECATED;已停用
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ModuleStatus{
	//#region ~GENERATED PARTS BEGIN
	DEV = 'DEV',  //0 开发中
	TESTING = 'TESTING',  //1 测试中
	RELEASED = 'RELEASED',  //2 已发布
	REMOVED = 'REMOVED',  //-1 已下架
	
}
export const ModuleStatusEnum = {
	DEV_VALUE : 0,
	TESTING_VALUE : 1,
	RELEASED_VALUE : 2,
	REMOVED_VALUE : -1,
	
	DEV_TEXT : '开发中',
	TESTING_TEXT : '测试中',
	RELEASED_TEXT : '已发布',
	REMOVED_TEXT : '已下架',

	valueOf(enumCode: ModuleStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ModuleStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END