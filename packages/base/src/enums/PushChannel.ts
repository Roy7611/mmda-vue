/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 推送通道
 * 
 * 0;NONE;无|1;EMAIL;邮件|2;WECHAT;微信|4;DINGTALK;钉钉|8;SMS;短信|16;PHONE_CALL;电话呼叫
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum PushChannel{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 无
	EMAIL = 'EMAIL',  //1 邮件
	WECHAT = 'WECHAT',  //2 微信
	DINGTALK = 'DINGTALK',  //4 钉钉
	SMS = 'SMS',  //8 短信
	PHONE_CALL = 'PHONE_CALL',  //16 电话呼叫
	
}
export const PushChannelEnum = {
	NONE_VALUE : 0,
	EMAIL_VALUE : 1,
	WECHAT_VALUE : 2,
	DINGTALK_VALUE : 4,
	SMS_VALUE : 8,
	PHONE_CALL_VALUE : 16,
	
	NONE_TEXT : '无',
	EMAIL_TEXT : '邮件',
	WECHAT_TEXT : '微信',
	DINGTALK_TEXT : '钉钉',
	SMS_TEXT : '短信',
	PHONE_CALL_TEXT : '电话呼叫',

	valueOf(enumCode: PushChannel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PushChannel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

