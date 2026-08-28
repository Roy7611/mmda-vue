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
 * 生产作业关系
 * 
 * @remarks 生产作业关系
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 21:45:30.0
 * 
 */
export interface ProductionJobRelation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 关系标识
	 */
	relationID: string;
	/**
	 * 源作业标识
	 */
	fromJobID: string;
	/**
	 * 至作业标识
	 */
	toJobID: string;
	/**
	 * 时间延搁(min)
	 */
	lag: number;
	/**
	 * 关系类型：0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;START_TO_FINISH;开始-完成|3;FINISH_TO_FINISH;完成-完成
	 */
	relationType: TaskRelationship;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产作业关系实体定义函数
 */
export const defineProductionJobRelation = (o: object) => {
	const e = defineEntity<ProductionJobRelation>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.relationID }
	});
	return e;
}
