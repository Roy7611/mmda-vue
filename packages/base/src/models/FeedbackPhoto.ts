/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 反馈截图
 * 
 * @remarks 反馈截图
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface FeedbackPhoto extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 反馈标识
	 */
	feedbackID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 图片
	 */
	photo: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 反馈截图实体定义函数
 */
export const defineFeedbackPhoto = (o: object) => {
	const e = defineEntity<FeedbackPhoto>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.feedbackID},${this.itemID}` }
	});
	return e;
}
