/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { TaskRelationship } from '@mmda/base/src/enums/TaskRelationship';
/**
 * 项目任务关系
 * 
 * @remarks 项目任务关系
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:31.0
 * 
 */
export interface ProjectTaskRelation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 源订单标识
	 */
	fromTaskID: string;
	/**
	 * 至订单标识
	 */
	toTaskID: string;
	/**
	 * 时间延搁(d)
	 */
	lag: number;
	/**
	 * 关系类型：0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;FINISH_TO_FINISH;完成-完成|3;START_TO_FINISH;开始-完成
	 */
	relationType: TaskRelationship;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目任务关系实体定义函数
 */
export const defineProjectTaskRelation = (o: object) => {
	const e = defineEntity<ProjectTaskRelation>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.projectID},${this.fromTaskID},${this.toTaskID}` }
	});
	return e;
}
