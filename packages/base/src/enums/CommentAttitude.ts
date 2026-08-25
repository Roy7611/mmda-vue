/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 评论态度
 * 
 * 0;NONE;-|1;LIKE;点赞|2;DISLIKE;不喜欢
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum CommentAttitude{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	LIKE = 'LIKE',  //1 点赞
	DISLIKE = 'DISLIKE',  //2 不喜欢
	
}
export const CommentAttitudeEnum = {
	NONE_VALUE : 0,
	LIKE_VALUE : 1,
	DISLIKE_VALUE : 2,
	
	NONE_TEXT : '-',
	LIKE_TEXT : '点赞',
	DISLIKE_TEXT : '不喜欢',

	valueOf(enumCode: CommentAttitude): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: CommentAttitude): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END