/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 通知状态
 * 
 * 0;NEW;新通知|1;READ;已读|2;DONE;已办
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum NotificationStatus {
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新通知
	SENT = 'SENT',  //1 已送达
	READ = 'READ',  //2 已读
	DONE = 'DONE',  //4 已办

}
export const NotificationStatusEnum = {
	NEW_VALUE: 0,
	SENT_VALUE: 1,
	READ_VALUE: 2,
	DONE_VALUE: 4,

	NEW_TEXT: '新通知',
	SENT_TEXT: '已送达',
	READ_TEXT: '已读',
	DONE_TEXT: '已办',

	valueOf(enumCode: NotificationStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: NotificationStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;

export const notificationStatusList = [
	{
		label: '全部',
		value: null,
	},
	{
		label: NotificationStatusEnum.textOf(NotificationStatus.NEW),
		value: NotificationStatusEnum.valueOf(NotificationStatus.NEW),
	},
	{
		label: NotificationStatusEnum.textOf(NotificationStatus.SENT),
		value: NotificationStatusEnum.valueOf(NotificationStatus.SENT),
	},
	{
		label: NotificationStatusEnum.textOf(NotificationStatus.READ),
		value: NotificationStatusEnum.valueOf(NotificationStatus.READ),
	},
	{
		label: NotificationStatusEnum.textOf(NotificationStatus.DONE),
		value: NotificationStatusEnum.valueOf(NotificationStatus.DONE),
	},
]
//#endregion ~GENERATED PARTS END