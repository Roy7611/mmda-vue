/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 用户角色
 * 
 * @remarks 用户角色。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface UserRole extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 用户：REF User(userID,userName)
	 */
	userID: string;
	/**
	 * 角色：REF Role(roleID,roleName)
	 */
	roleID: string;
	/**
	 * 部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 兼任
	 */
	parttime: boolean;
	//#endregion ~GENERATED PARTS END
}
/**
 * 用户角色实体定义函数
 */
export const defineUserRole = (o: object) => {
	const e = defineEntity<UserRole>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.userID},${this.roleID}` }
	});
	return e;
}
