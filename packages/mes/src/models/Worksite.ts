/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
/**
 * 工作中心
 *
 * @remarks 工作中心。包含生产站点、仓库和项目工地
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 21:45:32.0
 * 
 */
export interface Worksite extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 站点标识
	 */
	siteID: string;
	/**
	 * 站点编码
	 */
	siteCode?: string;
	/**
	 * 站点名称
	 */
	siteName: string;
	/**
	 * 国家编码
	 */
	countryCode?: string;
	/**
	 * 区域编码
	 */
	regionCode?: string;
	/**
	 * 地址详情
	 */
	addressDetail?: string;
	/**
	 * 站点类型
	 */
	siteType: number;
	/**
	 * 特殊站点标识
	 */
	superSiteID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作中心实体定义函数
 */
export const defineWorksite = (o: object) => {
	const e = defineEntity<Worksite>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.siteID }
	});
	return e;
}
