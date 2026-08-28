/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import { type Tool, defineTool } from './Tool';
/**
 * 工具包
 * 
 * @remarks 工具包
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-31 08:20:01.0
 * 
 */
export interface Toolkit extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工具包ID
	 */
	toolkitID: string;
	/**
	 * 工具包编号
	 */
	toolkitNo: string;
	/**
	 * 工具包名称
	 */
	toolkitName: string;
	/**
	 * 工具数量
	 */
	toolCount: number;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName,parentDeptID)
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
	 * 工具
	 */
	tools:  Tool[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 工具包实体定义函数
 */
export const defineToolkit = (o: object) => {
	const e = defineEntity<Toolkit>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.toolkitID }
	});
	//工具
	e.tools = defineEntityArray(defineTool, e.tools);
	return e;
}
