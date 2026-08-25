/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '../enums/UsageStatus';
import { type ContractTemplateTask, defineContractTemplateTask } from './ContractTemplateTask';
import { type ContractTemplateTaskRelation, defineContractTemplateTaskRelation } from './ContractTemplateTaskRelation';
/**
 * 项目模板
 * 
 * @remarks 项目模板
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface ContractTemplate extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模版标识
	 */
	templateID: string;
	/**
	 * 模板编号
	 */
	templateNo: string;
	/**
	 * 合同模板名称
	 */
	templateName: string;
	/**
	 * 必须调研
	 */
	surveyRequired: boolean;
	/**
	 * 必答总分
	 */
	surveyHardScore: number;
	/**
	 * 选答总分
	 */
	surveySoftScore: number;
	/**
	 * 模版合同文件
	 */
	contractFile?: string;
	/**
	 * 收入类型：REF Capital(capitalID,capitalCode,capitalName) WHERE(capitalFlows>0)
	 */
	revenueID?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID: string;
	/**
	 * 创建日期
	 */
	createDate: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified: string;
	/**
	 * 任务
	 */
	tasks?:  ContractTemplateTask[];
	/**
	 * 任务关系
	 */
	taskRelations?:  ContractTemplateTaskRelation[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目模板实体定义函数
 */
export const defineContractTemplate = (o: object) => {
	const e = defineEntity<ContractTemplate>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.templateID }
	});
	//任务
	e.tasks = defineEntityArray(defineContractTemplateTask, e.tasks);
	//任务关系
	e.taskRelations = defineEntityArray(defineContractTemplateTaskRelation, e.taskRelations);
	return e;
}
