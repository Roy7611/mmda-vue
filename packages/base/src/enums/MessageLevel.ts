/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 消息级别
 * 
 * 0;INFO;信息|1;SUCCESS;成功|2;WARNING;警告|4;DANGER;危险
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MessageLevel{
	//#region ~GENERATED PARTS BEGIN
	INFO = 'INFO',  //0 信息
	SUCCESS = 'SUCCESS',  //1 成功
	WARNING = 'WARNING',  //2 警告
	DANGER = 'DANGER',  //4 危险
	
}
export const MessageLevelEnum = {
	INFO_VALUE : 0,
	SUCCESS_VALUE : 1,
	WARNING_VALUE : 2,
	DANGER_VALUE : 4,
	
	INFO_TEXT : '信息',
	SUCCESS_TEXT : '成功',
	WARNING_TEXT : '警告',
	DANGER_TEXT : '危险',

	valueOf(enumCode: MessageLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MessageLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END