/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 自定义查询
 * 
 * @remarks 自定义查询
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-26 23:51:56.0
 * 
 */
export interface CustomizedQuery extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 查询标识
	 */
	queryID: string;
	/**
	 * 对象名称
	 */
	objName: string;
	/**
	 * 查询名称
	 */
	queryName: string;
	/**
	 * 查询表达式，Json对象或者Sql条件表达式
	 */
	queryExpression: string;
	/**
	 * 私有的
	 */
	creatorOnly: boolean;
	/**
	 * 预定义的
	 */
	predifined: boolean;
	/**
	 * 备注
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 自定义查询实体定义函数
 */
export const defineCustomizedQuery = (o: object) => {
	const e = defineEntity<CustomizedQuery>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.queryID }
	});
	return e;
}
