/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 消息通道
 * 
 * 0;SYSTEM;系统|1;MAIL;邮件|2;SMS;短信|4;PUSH;推送消息
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum MessageChannel{
	//#region ~GENERATED PARTS BEGIN
	INTERNAL = 'INTERNAL',  //0 内部
	MAIL = 'MAIL',  //1 邮件
	SMS = 'SMS',  //2 短信
	PHONE_CALL = 'PHONE_CALL',  //4 电话呼叫
	PUSH = 'PUSH',  //8 推送
	WECHAT = 'WECHAT',  //16 微信
	DING = 'DING',  //32 钉钉
	
}
export const MessageChannelEnum = {
	INTERNAL_VALUE : 0,
	MAIL_VALUE : 1,
	SMS_VALUE : 2,
	PHONE_CALL_VALUE : 4,
	PUSH_VALUE : 8,
	WECHAT_VALUE : 16,
	DING_VALUE : 32,
	
	INTERNAL_TEXT : '内部',
	MAIL_TEXT : '邮件',
	SMS_TEXT : '短信',
	PHONE_CALL_TEXT : '电话呼叫',
	PUSH_TEXT : '推送',
	WECHAT_TEXT : '微信',
	DING_TEXT : '钉钉',

	valueOf(enumCode: MessageChannel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MessageChannel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END