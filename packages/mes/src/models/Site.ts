/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { SiteLevel } from '../enums/SiteLevel';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import type { Address } from '@mmda/base/src/models/Address';
import { type SiteShift, defineSiteShift } from './SiteShift';
/**
 * 生产站点
 * 
 * @remarks 生产站点。固定地理位置的生产现场，例如一栋厂房。一个工厂Plant可分为多个Site，便于计算和比较OEE, Downtime和生产绩效指标。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface Site extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 站点标识
	 */
	siteID: string;
	/**
	 * 站点编码
	 */
	siteCode: string;
	/**
	 * 站点名称
	 */
	siteName: string;
	/**
	 * 站点级别：0;PLANT;工厂|1;BUILDING;厂房|2;SHOP_FLOOR;车间|3;PROD_LINE;产线
	 */
	siteLevel: SiteLevel;
	/**
	 * 所属父站点：HAS_ONE Site(siteID,siteName) AS superSite
	 */
	superSiteID?: string;
	/**
	 * 站点地址：HAS_ONE base.Address(addressID,regionCode,addressDetails)
	 */
	addressID?: string;
	/**
	 * 生产日历：REF WorkCalendar(calendarID,calendarName)
	 */
	workCalendarID?: string;
	/**
	 * 核算币种：REF base.CurrencyUnit(currCode,currName)
	 */
	currCode: string;
	/**
	 * 启用日期
	 */
	openDate?: string;
	/**
	 * 关闭日期
	 */
	closeDate?: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 描述
	 */
	remark?: string;
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
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 开动班次
	 */
	shifts?:  SiteShift[];
	/**
	 * 所属父站点
	 */
	superSite?: Site;
	/**
	 * 站点地址
	 */
	address?: Address;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产站点实体定义函数
 */
export const defineSite = (o: object) => {
	const e = defineEntity<Site>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.siteID }
	});
	//开动班次
	e.shifts = defineEntityArray(defineSiteShift, e.shifts);
	return e;
}
