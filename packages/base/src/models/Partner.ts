/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { PartnerRole } from '../enums/PartnerRole';
import type { PartnerQualifiedLevel } from '../enums/PartnerQualifiedLevel';
import type { UsageStatus } from '../enums/UsageStatus';
import type { PartnerCat } from './PartnerCat';
/**
 * 贸易伙伴
 * 
 * @remarks 贸易伙伴。包括供应商、客户
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface Partner extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 伙伴标识
	 */
	partnerID: string;
	/**
	 * 伙伴编码
	 */
	partnerCode?: string;
	/**
	 * 伙伴图标
	 */
	partnerLogo?: string;
	/**
	 * 伙伴名称
	 */
	partnerName: string;
	/**
	 * 简称
	 */
	shortName?: string;
	/**
	 * 伙伴全称
	 * concat(ifnull(partnerCode,'_'),' ',ifnull(shortName,partnerName))
	 */
	partnerCodeName?: string;
	/**
	 * 伙伴角色：0;UNKNOWN;-|1;CUSTOMER;客户|2;SUPPLIER;供应商|4;CARGO_OWNER;货主|8;CARRIER;承运商
	 */
	partnerRoles: PartnerRole;
	/**
	 * 分组：HAS_ONE PartnerCat(categoryID,categoryName,parentCatID) AS category
	 */
	categoryID: string;
	/**
	 * 集团公司：HAS_ONE Partner(partnerID,partnerCodeName) AS partnerGroup
	 */
	partnerGroupID?: string;
	/**
	 * 国家：REF Country(countryCode,fullName)
	 */
	countryCode?: string;
	/**
	 * 地区：REF ProvinceNCity(regionCode,regionFullName,parentRegionCode)
	 */
	regionCode?: string;
	/**
	 * 联系地址
	 */
	contactAddr?: string;
	/**
	 * 常用联系人
	 */
	contactor?: string;
	/**
	 * 电话
	 */
	tel?: string;
	/**
	 * 传真
	 */
	fax?: string;
	/**
	 * 资质等级：0;UNQUALIFIED;未评级|1;A;战略|2;B;重要|3;C;普通|4;D;终止合作
	 */
	qualifiedLevel: PartnerQualifiedLevel;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 分组
	 */
	category?: PartnerCat;
	/**
	 * 集团公司
	 */
	partnerGroup?: Partner;
	//#endregion ~GENERATED PARTS END
}
/**
 * 贸易伙伴实体定义函数
 */
export const definePartner = (o: object) => {
	const e = defineEntity<Partner>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.partnerID }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
