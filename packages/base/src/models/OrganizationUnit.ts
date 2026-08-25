/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 组织单位
 * 
 * @remarks 组织单位
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface OrganizationUnit extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 组织ID
	 */
	orgID: string;
	/**
	 * 组织类型
	 */
	orgType: number;
	/**
	 * 组织代码
	 */
	orgCode?: string;
	/**
	 * 组织名称
	 */
	orgName: string;
	/**
	 * 简称
	 */
	shortName?: string;
	/**
	 * 上级组织ID
	 */
	parentOrgID?: string;
	/**
	 * 区域
	 */
	regionCode?: string;
	/**
	 * 地址
	 */
	addr?: string;
	/**
	 * 存续
	 */
	alive: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人
	 */
	creatorID?: string;
	/**
	 * 部门ID
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 最后修改人
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 组织单位实体定义函数
 */
export const defineOrganizationUnit = (o: object) => {
	const e = defineEntity<OrganizationUnit>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.orgID }
	});
	return e;
}
