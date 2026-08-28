/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { DocShareStatus } from '../enums/DocShareStatus';
import type { Doc } from './Doc';
/**
 * 文档分享
 * 
 * @remarks 文档分享
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:03.0
 * 
 */
export interface DocShare extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 分享标识
	 */
	shareID: string;
	/**
	 * 文档：HAS_ONE Doc(docID,docTitle)
	 */
	docID: string;
	/**
	 * 访问令牌，私钥才能访问
	 */
	accessToken: string;
	/**
	 * 分享给：REF User(userID,userName)
	 */
	shareeID: string;
	/**
	 * 有效时间
	 */
	validTo?: string;
	/**
	 * 要求回复
	 */
	replyRequired: boolean;
	/**
	 * 状态：0;NEW;新|1;READ;已阅|2;REPLIED;已回复|-1;RECLAIMED;已回收
	 */
	status: DocShareStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 分享人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 分享日期
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 文档
	 */
	doc?: Doc;
	//#endregion ~GENERATED PARTS END
}
/**
 * 文档分享实体定义函数
 */
export const defineDocShare = (o: object) => {
	const e = defineEntity<DocShare>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.shareID }
	});
	return e;
}
