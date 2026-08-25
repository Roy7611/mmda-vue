/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Importance } from '../enums/Importance';
import type { Urgency } from '../enums/Urgency';
import type { MessageChannel } from '../enums/MessageChannel';
import type { NotificationStatus } from '../enums/NotificationStatus';
/**
 * 通知
 * 
 * @remarks 通知
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-23 20:54:04.0
 * 
 */
export interface Notification extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 通知标识
	 */
	noticeID: string;
	/**
	 * 通知时间
	 */
	noticeTime: string;
	/**
	 * 重要性：0;UNKNOWN;-|1;IMPORTANT;重要|2;VERY_IMPORTANT;非常重要
	 */
	importance: Importance;
	/**
	 * 紧急：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	emergency: Urgency;
	/**
	 * 待办事宜
	 */
	noticeContent: string;
	/**
	 * 通知用户ID
	 */
	noticeToUserID: string;
	/**
	 * 通知给：REF USER(userID,userName)
	 */
	noticeTo: string;
	/**
	 * 通知方式：0;INTERNAL;内部|1;MAIL;邮件|2;SMS;短信|4;PHONE_CALL;电话呼叫|8;PUSH;推送|16;WECHAT;微信|32;DING;钉钉
	 */
	notifyingThru: MessageChannel;
	/**
	 * 状态：0;NEW;新通知|1;READ;已读|2;DONE;已办
	 */
	status: NotificationStatus;
	/**
	 * 创建时间
	 */
	createDate?: string;
	/**
	 * 未办
	 */
	todo?: boolean;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	/**
	 * 流程追踪标识，当它已消费后反写status为已办。若为null，则已读就结束了
	 */
	flowTrailID?: string;
	/**
	 * 模块
	 */
	moduleCode: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 通知实体定义函数
 */
export const defineNotification = (o: object) => {
	const e = defineEntity<Notification>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.noticeID},${this.moduleCode}` }
	});
	return e;
}
