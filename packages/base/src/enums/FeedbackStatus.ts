/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 反馈问题状态
 * 
 * 0;NEW;新|1;RESPONSED;已响应|2;RESOLVED;已解决|4;CLOSED;已关闭
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum FeedbackStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	RESPONSED = 'RESPONSED',  //1 已响应
	RESOLVED = 'RESOLVED',  //2 已解决
	CLOSED = 'CLOSED',  //4 已关闭
	
}
export const FeedbackStatusEnum = {
	NEW_VALUE : 0,
	RESPONSED_VALUE : 1,
	RESOLVED_VALUE : 2,
	CLOSED_VALUE : 4,
	
	NEW_TEXT : '新',
	RESPONSED_TEXT : '已响应',
	RESOLVED_TEXT : '已解决',
	CLOSED_TEXT : '已关闭',

	valueOf(enumCode: FeedbackStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: FeedbackStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END