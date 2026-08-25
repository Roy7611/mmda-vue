/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { FeedbackStatus } from '../enums/FeedbackStatus';
import { type FeedbackPhoto, defineFeedbackPhoto } from './FeedbackPhoto';
/**
 * 反馈
 * 
 * @remarks 反馈。收集用户的反馈，用于改进产品和服务。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface Feedback extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 反馈标识
	 */
	feedbackID: string;
	/**
	 * 反馈内容
	 */
	feedbackText: string;
	/**
	 * 状态：0;NEW;新|1;RESPONSED;已响应|4;CLOSED;已关闭
	 */
	status: FeedbackStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 响应内容
	 */
	responseText?: string;
	/**
	 * 响应时间
	 */
	responseDate?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 照片
	 */
	photos?:  FeedbackPhoto[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 反馈实体定义函数
 */
export const defineFeedback = (o: object) => {
	const e = defineEntity<Feedback>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.feedbackID }
	});
	//照片
	e.photos = defineEntityArray(defineFeedbackPhoto, e.photos);
	return e;
}
