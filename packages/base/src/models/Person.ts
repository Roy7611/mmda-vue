/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 人员
 * 
 * @remarks 人员
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface Person extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 人员ID
	 */
	personID: string;
	/**
	 * 人员名称
	 */
	personName: string;
	/**
	 * 性别
	 */
	gender: number;
	/**
	 * 头像
	 */
	avatar?: string;
	/**
	 * 手机号
	 */
	mobile?: string;
	/**
	 * 区域类型
	 */
	relationType: number;
	/**
	 * 抬头
	 */
	titleName?: string;
	/**
	 * 部门ID
	 */
	deptID?: string;
	/**
	 * 部门名称
	 */
	deptName?: string;
	/**
	 * 组织ID
	 */
	orgID?: string;
	/**
	 * 组织名称
	 */
	orgName?: string;
	/**
	 * 办公电话
	 */
	officeTel?: string;
	/**
	 * 区域
	 */
	regionCode?: string;
	/**
	 * 地址
	 */
	addr?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 人员实体定义函数
 */
export const definePerson = (o: object) => {
	const e = defineEntity<Person>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.personID }
	});
	return e;
}
