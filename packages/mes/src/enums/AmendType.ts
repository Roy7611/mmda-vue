/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 变更类型
 * 
 * 0;NONE;-|1;CHANGED;修改|2;ADDED;增项|4;REMOVED;减项
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum AmendType{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	MODIFIED = 'MODIFIED',  //1 内容修改
	ADDED = 'ADDED',  //2 增项
	REMOVED = 'REMOVED',  //4 减项
	
}
export const AmendTypeEnum = {
	NONE_VALUE : 0,
	MODIFIED_VALUE : 1,
	ADDED_VALUE : 2,
	REMOVED_VALUE : 4,
	
	NONE_TEXT : '-',
	MODIFIED_TEXT : '内容修改',
	ADDED_TEXT : '增项',
	REMOVED_TEXT : '减项',

	valueOf(enumCode: AmendType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: AmendType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END