/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 通知类型
 * 
 * 0;SYSTEM;系统|1;MAIL;邮件|2;SMS;短信|4;PUSH;推送消息
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum NotificationType{
	//#region ~GENERATED PARTS BEGIN
	SYSTEM = 'SYSTEM',  //0 系统
	MAIL = 'MAIL',  //1 邮件
	SMS = 'SMS',  //2 短信
	PUSH = 'PUSH',  //4 推送消息
	
}
export const NotificationTypeEnum = {
	SYSTEM_VALUE : 0,
	MAIL_VALUE : 1,
	SMS_VALUE : 2,
	PUSH_VALUE : 4,
	
	SYSTEM_TEXT : '系统',
	MAIL_TEXT : '邮件',
	SMS_TEXT : '短信',
	PUSH_TEXT : '推送消息',

	valueOf(enumCode: NotificationType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: NotificationType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END