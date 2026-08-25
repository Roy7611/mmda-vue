/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 常用地址
 * 
 * @remarks 常用地址，用于发货
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Address extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 地址ID
	 */
	addressID: string;
	/**
	 * 所属人ID，可能是partnerID，personID
	 */
	ownerID: string;
	/**
	 * 所属人名称，所属人姓名或公司名称
	 */
	ownerName: string;
	/**
	 * 国家：REF Country(countryCode,fullName)
	 */
	countryCode: string;
	/**
	 * 电话国家区号，如86
	 */
	telPrefix: string;
	/**
	 * 电话
	 */
	tel: string;
	/**
	 * 区域：REF ProvinceNCity(regionCode,regionFullName,parentRegionCode)
	 */
	regionCode: string;
	/**
	 * 地址详情，如街道，门牌号
	 */
	addressDetail: string;
	/**
	 * 地址标签，例如家、公司
	 */
	tags?: string;
	/**
	 * 经度
	 */
	longitude?: number;
	/**
	 * 纬度
	 */
	latitude?: number;
	/**
	 * 邮编
	 */
	postalCode?: string;
	/**
	 * 电子邮箱
	 */
	email?: string;
	/**
	 * 是否默认地址
	 */
	lastUsed?: boolean;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 常用地址实体定义函数
 */
export const defineAddress = (o: object) => {
	const e = defineEntity<Address>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.addressID }
	});
	return e;
}
