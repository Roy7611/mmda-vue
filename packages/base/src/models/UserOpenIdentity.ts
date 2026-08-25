/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 用户开放标识
 * 
 * @remarks 用户开放标识
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface UserOpenIdentity extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 用户ID
	 */
	userID: string;
	/**
	 * 开放标识类型
	 */
	openIDType: string;
	/**
	 * 开放标识
	 */
	openID?: string;
	/**
	 * 头像
	 */
	avatar?: string;
	/**
	 * 联合标识
	 */
	unionID?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 用户开放标识实体定义函数
 */
export const defineUserOpenIdentity = (o: object) => {
	const e = defineEntity<UserOpenIdentity>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.userID},${this.openIDType}` }
	});
	return e;
}
