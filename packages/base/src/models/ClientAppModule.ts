/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 客户端应用模块
 * 
 * @remarks 客户端应用模块
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface ClientAppModule extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 
	 */
	appId: string;
	/**
	 * 
	 */
	moduleCode: string;
	/**
	 * 必要的
	 */
	indispensable: boolean;
	/**
	 * 月租金
	 */
	monthlyRent: number;
	/**
	 * 起租月数
	 */
	minMonths: number;
	/**
	 * 用户数限制
	 */
	maxUserNum?: number;
	/**
	 * 数据量限制
	 */
	maxDataNum?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 客户端应用模块实体定义函数
 */
export const defineClientAppModule = (o: object) => {
	const e = defineEntity<ClientAppModule>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.appId},${this.moduleCode}` }
	});
	return e;
}
