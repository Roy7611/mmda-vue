/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { TenantStatus } from '../enums/TenantStatus';
import type { Country } from './Country';
import { type TenantModule, defineTenantModule } from './TenantModule';
/**
 * 租户
 *
 * @remarks 租户。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-07-17 07:38:59.0
 *
 */
export interface Tenant extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 租户ID
	 */
	tenantID: number;
	/**
	 * 租户Logo，图片URL
	 */
	tenantLogo?: string;
	/**
	 * 租户编码
	 */
	tenantCode: string;
	/**
	 * 租户名称
	 */
	tenantName: string;
	/**
	 * 默认语言
	 */
	locale?: string;
	/**
	 * 联系人
	 */
	contactor?: string;
	/**
	 * 手机
	 */
	mobile: string;
	/**
	 * 邮箱
	 */
	email?: string;
	/**
	 * 状态：0;NEWL;新|1;LIVE;已激活|-1;DEAD;已终止
	 */
	status: TenantStatus;
	/**
	 * 国家：HAS_ONE Country(countryCode,countryName)briefName
	 */
	countryCode?: string;
	/**
	 * 地区：REF Region(regionCode,regionName)
	 */
	regionCode?: string;
	/**
	 * 经营地址
	 */
	operatingAddr?: string;
	/**
	 * 邮政编码
	 */
	zipCode?: string;
	/**
	 * 联系电话
	 */
	tel?: string;
	/**
	 * 传真
	 */
	fax?: string;
	/**
	 * 网站
	 */
	website?: string;
	/**
	 * 营业执照
	 */
	businessLicense?: string;
	/**
	 * 统一社会信用代码
	 */
	businessLicenseCode?: string;
	/**
	 * 经营范围
	 */
	businessScope?: string;
	/**
	 * 法人代表
	 */
	legalOwner?: string;
	/**
	 * 默认币种：REF CurrencyUnit(currCode,currName)
	 */
	currCode?: string;
	/**
	 * 注册资金
	 */
	registerCapital?: string;
	/**
	 * 注册地址
	 */
	registerAddr?: string;
	/**
	 * 开户银行
	 */
	bankName?: string;
	/**
	 * 银行账号
	 */
	bankAcctNo?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建时间
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 租赁模块
	 */
	modules?: TenantModule[];
	/**
	 * 国家
	 */
	country?: Country;
	//#endregion ~GENERATED PARTS END
}
/**
 * 租户实体定义函数
 */
export const defineTenant = (o: object) => {
	const e = defineEntity<Tenant>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () {
			return this.tenantID;
		},
	});
	//租赁模块
	e.modules = defineEntityArray(defineTenantModule, e.modules);
	return e;
};
