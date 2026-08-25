/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import { type RoleModuleAuth, defineRoleModuleAuth } from './RoleModuleAuth';
import { type RoleDataAuth, defineRoleDataAuth } from './RoleDataAuth';
import { type RoleUiAuth, defineRoleUiAuth } from './RoleUiAuth';
/**
 * 角色
 * 
 * @remarks 角色，权限的集合
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface Role extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 角色ID
	 */
	roleID: string;
	/**
	 * 角色编码
	 */
	roleCode?: string;
	/**
	 * 角色名称
	 */
	roleName?: string;
	/**
	 * 业务范畴，如SALES,CONSTRUCTION
	 */
	bizScope?: string;
	/**
	 * 角色类型，如STAFF,MANAGER
	 */
	roleType?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 创建人
	 */
	creator: string;
	/**
	 * 创建时间
	 */
	createdDate: string;
	/**
	 * 最后修改人
	 */
	lastModifier?: string;
	/**
	 * 最后修改时间
	 */
	lastModified: string;
	/**
	 * 功能权限
	 */
	moduleAuths?:  RoleModuleAuth[];
	/**
	 * 数据权限
	 */
	dataAuths?:  RoleDataAuth[];
	/**
	 * UI权限
	 */
	uiAuths?:  RoleUiAuth[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 角色实体定义函数
 */
export const defineRole = (o: object) => {
	const e = defineEntity<Role>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.roleID }
	});
	//功能权限
	e.moduleAuths = defineEntityArray(defineRoleModuleAuth, e.moduleAuths);
	//数据权限
	e.dataAuths = defineEntityArray(defineRoleDataAuth, e.dataAuths);
	//UI权限
	e.uiAuths = defineEntityArray(defineRoleUiAuth, e.uiAuths);
	return e;
}
