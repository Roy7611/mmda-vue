/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 整改单状态
 * 
 * 0;NEW;新|1;SENT;已发出|2;APPROVED;已评审|3;RECTIFYING;整改中|4;COMPLETED;整改完成|-1;CANCELLED;已放弃
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum RectificationStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SENT = 'SENT',  //1 已发出
	APPROVED = 'APPROVED',  //2 已批准
	STARTED = 'STARTED',  //3 已开始
	COMPLETED = 'COMPLETED',  //4 已完成
	CANCELLED = 'CANCELLED',  //-1 已取消
	
}
export const RectificationStatusEnum = {
	NEW_VALUE : 0,
	SENT_VALUE : 1,
	APPROVED_VALUE : 2,
	STARTED_VALUE : 3,
	COMPLETED_VALUE : 4,
	CANCELLED_VALUE : -1,
	
	NEW_TEXT : '新',
	SENT_TEXT : '已发出',
	APPROVED_TEXT : '已批准',
	STARTED_TEXT : '已开始',
	COMPLETED_TEXT : '已完成',
	CANCELLED_TEXT : '已取消',

	valueOf(enumCode: RectificationStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RectificationStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END