/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { CommentAttitude } from '../enums/CommentAttitude';
/**
 * 贸易伙伴评论
 * 
 * @remarks 贸易伙伴评论
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface PartnerComment extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 评论ID
	 */
	commentID: string;
	/**
	 * 被评论人ID
	 */
	commentateeID: string;
	/**
	 * 评论人ID
	 */
	commentatorID: string;
	/**
	 * 评论时间
	 */
	commentTime: string;
	/**
	 * 评论态度：0;NONE;-|1;LIKE;点赞|2;DISLIKE;不喜欢
	 */
	commentType: CommentAttitude;
	/**
	 * 评论消息
	 */
	commentText?: string;
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 贸易伙伴评论实体定义函数
 */
export const definePartnerComment = (o: object) => {
	const e = defineEntity<PartnerComment>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.commentID }
	});
	return e;
}
