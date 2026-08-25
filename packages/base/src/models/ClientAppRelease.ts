/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 客户端应用发布
 * 
 * @remarks 客户端应用发布
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface ClientAppRelease extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 应用标识
	 */
	appId: string;
	/**
	 * 发布版本，比如1.0.0
	 */
	releasedVersion: string;
	/**
	 * 发布时间
	 */
	releasedAt: string;
	/**
	 * 获取链接
	 */
	getUri: string;
	/**
	 * 发布日志Uri，说明更新了哪些内容
	 */
	releaseNotesUri: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 客户端应用发布实体定义函数
 */
export const defineClientAppRelease = (o: object) => {
	const e = defineEntity<ClientAppRelease>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.appId},${this.releasedVersion}` }
	});
	return e;
}
