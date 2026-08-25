/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 使用状态
 * 
 * 0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum UsageStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	USED = 'USED',  //1 已启用
	DEPRECATED = 'DEPRECATED',  //-1 已弃用
	
}
export const UsageStatusEnum = {
	NEW_VALUE : 0,
	USED_VALUE : 1,
	DEPRECATED_VALUE : -1,
	
	NEW_TEXT : '新',
	USED_TEXT : '已启用',
	DEPRECATED_TEXT : '已弃用',

	valueOf(enumCode: UsageStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: UsageStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END