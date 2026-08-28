/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import { type WbsTask, defineWbsTask } from './WbsTask';
/**
 * 工作分解结构
 * 
 * @remarks 工作分解结构
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-07 03:41:03.0
 * 
 */
export interface Wbs extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模板ID
	 */
	wbsID: string;
	/**
	 * 模板编号
	 */
	wbsNo: string;
	/**
	 * 模板名称
	 */
	wbsName: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
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
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 分解任务
	 */
	tasks:  WbsTask[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作分解结构实体定义函数
 */
export const defineWbs = (o: object) => {
	const e = defineEntity<Wbs>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.wbsID }
	});
	//分解任务
	e.tasks = defineEntityArray(defineWbsTask, e.tasks);
	return e;
}
