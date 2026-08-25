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
 * 省市
 * 
 * @remarks 省市
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface ProvinceNCity extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 区域编码
	 */
	regionCode: string;
	/**
	 * 区域名称
	 */
	regionName: string;
	/**
	 * 区域全程
	 */
	regionFullName?: string;
	/**
	 * 上级区域编码
	 */
	parentRegionCode?: string;
	/**
	 * 区域类型：0;COUNTRY;国家|1;PROVINCE;省|2;CITY;市|3;COUNTY;县
	 */
	regionType: RegionType;
	/**
	 * 邮编
	 */
	zipCode?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 省市实体定义函数
 */
export const defineProvinceNCity = (o: object) => {
	const e = defineEntity<ProvinceNCity>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.regionCode }
	});
	return e;
}
