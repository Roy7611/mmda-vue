/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Gender } from '../enums/Gender';
import type { Partner } from './Partner';
/**
 * 联系人
 * 
 * @remarks 联系人。私人联系人，客户、供应商
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Contactor extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 联系人标识
	 */
	contactorID: string;
	/**
	 * 姓名
	 */
	contactorName: string;
	/**
	 * 手机
	 */
	mobile?: string;
	/**
	 * 性别：0;UNKNOWN;-|1;MALE;男|2;FEMALE;女
	 */
	gender: Gender;
	/**
	 * 头像
	 */
	avatar?: string;
	/**
	 * 生日
	 */
	birthday?: string;
	/**
	 * QQ
	 */
	qq?: string;
	/**
	 * 电子邮箱
	 */
	email?: string;
	/**
	 * 职务
	 */
	titleName?: string;
	/**
	 * 部门
	 */
	workDeptName?: string;
	/**
	 * 公司：HAS_ONE Partner(partnerID,partnerName) AS company
	 */
	partnerID?: string;
	/**
	 * 电话
	 */
	officeTel?: string;
	/**
	 * 地区：REF ProvinceNCity(regionCode,regionFullName,parentRegionCode)，部门所在城市和地区
	 */
	regionCode?: string;
	/**
	 * 联系地址
	 */
	contactAddr?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
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
	 * 公司
	 */
	company?: Partner;
	//#endregion ~GENERATED PARTS END
}
/**
 * 联系人实体定义函数
 */
export const defineContactor = (o: object) => {
	const e = defineEntity<Contactor>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.contactorID }
	});
	return e;
}
