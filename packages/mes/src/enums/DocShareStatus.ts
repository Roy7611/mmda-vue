/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 文档分享状态
 * 
 * 0;NEW;新|10;READ;已阅|20;REPLIED;已回复
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum DocShareStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	READ = 'READ',  //1 已阅
	REPLIED = 'REPLIED',  //2 已回复
	RECLAIMED = 'RECLAIMED',  //-1 已回收
	
}
export const DocShareStatusEnum = {
	NEW_VALUE : 0,
	READ_VALUE : 1,
	REPLIED_VALUE : 2,
	RECLAIMED_VALUE : -1,
	
	NEW_TEXT : '新',
	READ_TEXT : '已阅',
	REPLIED_TEXT : '已回复',
	RECLAIMED_TEXT : '已回收',

	valueOf(enumCode: DocShareStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DocShareStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END