/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 用户关系
 * 
 * @remarks 用户关系
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface UserRelation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 用户ID
	 */
	userID: string;
	/**
	 * 父用户ID
	 */
	parentUserID?: string;
	/**
	 * 推荐人用户ID
	 */
	referralUserID: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 用户关系实体定义函数
 */
export const defineUserRelation = (o: object) => {
	const e = defineEntity<UserRelation>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.userID }
	});
	return e;
}
