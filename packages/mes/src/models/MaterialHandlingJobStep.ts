/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { MaterialHandlingJobStatus } from '@mmda/base/src/enums/MaterialHandlingJobStatus';
import type { TaskRelationship } from '@mmda/base/src/enums/TaskRelationship';
/**
 * 物料搬运作业步骤
 * 
 * @remarks 物料搬运作业步骤
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-11-03 12:12:33.0
 * 
 */
export interface MaterialHandlingJobStep extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 
	 */
	jobID: string;
	/**
	 * 步骤ID
	 */
	stepID: number;
	/**
	 * 步骤类别
	 */
	stepCategory?: string;
	/**
	 * 步骤名称
	 */
	stepName: string;
	/**
	 * 步进至
	 */
	stepTo?: string;
	/**
	 * 激活时间
	 */
	activeTime?: string;
	/**
	 * 放行
	 */
	resolved: boolean;
	/**
	 * 放行时间
	 */
	resolvedTime?: string;
	/**
	 * 开始时间
	 */
	stepTime?: string;
	/**
	 * 结束时间
	 */
	endTime?: string;
	/**
	 * 状态：0;SCHEDULED;排队中|1;DISPATCHED;已发送指令|2;STARTED;已启动|3;READY;已取货|4;SUSPENDED;已中断|8;FINISHED;已完成|9;FINISHED_MANUAL;已手动完成|16;CANCELED;已取消
	 */
	status: MaterialHandlingJobStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 临时中转
	 */
	stepBy?: string;
	/**
	 * 荷载
	 */
	loaded: boolean;
	/**
	 * 轨道ID
	 */
	railID?: string;
	/**
	 * 前置作业
	 */
	prevJobID?: string;
	/**
	 * 前置步骤
	 */
	prevStepID?: number;
	/**
	 * 前置步骤关系：0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;FINISH_TO_FINISH;完成-完成|3;START_TO_FINISH;开始-完成
	 */
	prevStepRelation: TaskRelationship;
	/**
	 * 后续作业
	 */
	nextJobID?: string;
	/**
	 * 后续步骤
	 */
	nextStepID?: number;
	/**
	 * 关节
	 */
	joint: boolean;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料搬运作业步骤实体定义函数
 */
export const defineMaterialHandlingJobStep = (o: object) => {
	const e = defineEntity<MaterialHandlingJobStep>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.jobID},${this.stepID}` }
	});
	return e;
}
