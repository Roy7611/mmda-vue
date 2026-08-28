/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生产事件状态
 * 
 * 0;NEW;新|1;PUBLISHED;已通知|2;SEEN;已知悉|3;HANDLED;已处理|4;VERIFIED;已验证|-1;IGNORED;已忽略
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ProductionEventStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	REPORTED = 'REPORTED',  //1 已上报
	ARRANGED = 'ARRANGED',  //2 已安排
	HANDLED = 'HANDLED',  //3 已处理
	CLOSED = 'CLOSED',  //4 已关闭
	
}
export const ProductionEventStatusEnum = {
	NEW_VALUE : 0,
	REPORTED_VALUE : 1,
	ARRANGED_VALUE : 2,
	HANDLED_VALUE : 3,
	CLOSED_VALUE : 4,
	
	NEW_TEXT : '新',
	REPORTED_TEXT : '已上报',
	ARRANGED_TEXT : '已安排',
	HANDLED_TEXT : '已处理',
	CLOSED_TEXT : '已关闭',

	valueOf(enumCode: ProductionEventStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductionEventStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END