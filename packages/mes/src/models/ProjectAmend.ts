/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 项目变更
 * 
 * @remarks 项目变更
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-02 12:03:29.0
 * 
 */
export interface ProjectAmend extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 变更次数
	 */
	amendIdx: number;
	/**
	 * 原值，JSON格式
	 */
	oldVal?: string;
	/**
	 * 现值，JSON格式
	 */
	newVal?: string;
	/**
	 * 变更时间
	 */
	amendTime: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目变更实体定义函数
 */
export const defineProjectAmend = (o: object) => {
	const e = defineEntity<ProjectAmend>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.projectID},${this.amendIdx}` }
	});
	return e;
}
