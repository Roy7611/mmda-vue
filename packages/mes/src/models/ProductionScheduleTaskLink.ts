/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { TaskRelationship } from '@mmda/base/src/enums/TaskRelationship';
/**
 * 生产排程任务链接
 * 
 * @remarks 生产排程任务链接
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-10-24 22:19:54.0
 * 
 */
export interface ProductionScheduleTaskLink extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 关系标识
	 */
	relationID: string;
	/**
	 * 源任务标识
	 */
	fromTaskID: string;
	/**
	 * 至任务标识
	 */
	toTaskID: string;
	/**
	 * 时间延搁(min)
	 */
	lag: number;
	/**
	 * 关系类型：0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;FINISH_TO_FINISH;完成-完成|3;START_TO_FINISH;开始-完成
	 */
	relationType: TaskRelationship;
	/**
	 * 
	 */
	refName: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产排程任务链接实体定义函数
 */
export const defineProductionScheduleTaskLink = (o: object) => {
	const e = defineEntity<ProductionScheduleTaskLink>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.relationID }
	});
	return e;
}
