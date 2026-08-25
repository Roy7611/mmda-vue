/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { RegionType } from '../enums/RegionType';
/**
 * 区域
 * 
 * @remarks 区域，包含国家、省、市、区（县）
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface Region extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 语言区域编码
	 */
	localeCode: string;
	/**
	 * 国家代码
	 */
	countryCode: string;
	/**
	 * 区域编码
	 */
	regionCode: string;
	/**
	 * 区域名称
	 */
	regionName: string;
	/**
	 * 区域类型：0;COUNTRY;国家|1;PROVINCE;省|2;CITY;市|3;COUNTY;县
	 */
	regionType: RegionType;
	/**
	 * 上级区域编码
	 */
	parentRegionCode?: string;
	/**
	 * 上级区域名称
	 */
	parentRegionName: string;
	/**
	 * 上上级区域名称
	 */
	grandRegionName: string;
	/**
	 * 大小，m2
	 */
	size?: number;
	/**
	 * 人口
	 */
	population?: number;
	/**
	 * 电话区号
	 */
	telPrefix?: string;
	/**
	 * 邮编
	 */
	zipCode?: string;
	/**
	 * 经度
	 */
	longitude?: number;
	/**
	 * 纬度
	 */
	latitude?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 区域实体定义函数
 */
export const defineRegion = (o: object) => {
	const e = defineEntity<Region>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.localeCode},${this.countryCode},${this.regionCode}` }
	});
	return e;
}
