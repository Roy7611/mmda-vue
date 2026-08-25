/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 角色UI权限
 * 
 * @remarks 角色UI权限。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface RoleUiAuth extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 角色ID
	 */
	roleID: string;
	/**
	 * 域
	 */
	fieldName: string;
	/**
	 * 只读
	 */
	readOnly: boolean;
	/**
	 * 隐藏
	 */
	hidden: boolean;
	//#endregion ~GENERATED PARTS END
}
/**
 * 角色UI权限实体定义函数
 */
export const defineRoleUiAuth = (o: object) => {
	const e = defineEntity<RoleUiAuth>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.roleID},${this.fieldName}` }
	});
	return e;
}
