/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { TaskLevel } from '@mmda/base/src/enums/TaskLevel';
import type { TaskPhase } from '@mmda/base/src/enums/TaskPhase';
/**
 * 工作结构分项
 * 
 * @remarks 工作结构分项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-07 03:41:03.0
 * 
 */
export interface WbsTask extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模板ID
	 */
	wbsID: string;
	/**
	 * 任务编号，多级编号如1, 1.1,1.2
	 */
	taskNo: string;
	/**
	 * 任务名称
	 */
	taskName: string;
	/**
	 * 任务级别：0;PHASE;阶段|1;TASK;任务|2;WORK_PACKAGE;工作包
	 */
	taskLevel: TaskLevel;
	/**
	 * 所属阶段：0;STAGE;筹划|1;DESIGN;设计|2;MAKE;生产|3;INSTALL;安装|4;TEST;测试|5;ACCEPT;验收
	 */
	taskPhase: TaskPhase;
	/**
	 * 工期权重，站工期比例
	 */
	taskWeight?: number;
	/**
	 * 里程碑
	 */
	milestone: boolean;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作结构分项实体定义函数
 */
export const defineWbsTask = (o: object) => {
	const e = defineEntity<WbsTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.wbsID},${this.taskNo}` }
	});
	return e;
}
