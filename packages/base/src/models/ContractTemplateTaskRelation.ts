/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { TaskRelationship } from '../enums/TaskRelationship';
/**
 * 合同模板任务关系
 * 
 * @remarks 合同模板任务关系
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface ContractTemplateTaskRelation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模板标识
	 */
	templateID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 关系类型：0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;FINISH_TO_FINISH;完成-完成|3;START_TO_FINISH;开始-完成
	 */
	relationType: TaskRelationship;
	/**
	 * 前工序
	 */
	prevTaskCode: string;
	/**
	 * 后工序
	 */
	nextTaskCode: string;
	/**
	 * 时间延搁(天)
	 */
	lag: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 合同模板任务关系实体定义函数
 */
export const defineContractTemplateTaskRelation = (o: object) => {
	const e = defineEntity<ContractTemplateTaskRelation>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.templateID},${this.itemID}` }
	});
	return e;
}
