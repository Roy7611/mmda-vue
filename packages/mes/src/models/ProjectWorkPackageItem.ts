/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-12-24 13:29:19
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-06-17 12:00:29
 * @FilePath: /mmda-vue/packages/mes/src/models/ProjectWorkPackageItem.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
/**
 * 项目工作包跟踪
 * 
 * @remarks 项目工作包跟踪
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-23 20:55:50.0
 * 
 */
export interface ProjectWorkPackageItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 任务ID
	 */
	taskID?: string;
	/**
	 * 任务名称
	 */
	taskName?: string;
	/**
	 * 负责人：REF mmda_base.User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 任务进度
	 */
	taskProgress?: number;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 引用名称
	 */
	refName: string;
	/**
	 * 引用ID
	 */
	refID: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目工作包跟踪实体定义函数
 */
export const defineProjectWorkPackageItem = (o: object) => {
	const e = defineEntity<ProjectWorkPackageItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.taskID},${this.refID},${this.refName}` }
	});
	return e;
}
