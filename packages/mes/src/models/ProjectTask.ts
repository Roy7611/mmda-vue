/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { TaskLevel } from '@mmda/base/src/enums/TaskLevel';
import type { TaskPhase } from '@mmda/base/src/enums/TaskPhase';
import type { RiskLevel } from '../enums/RiskLevel';
import type { ManualTaskStatus } from '@mmda/base/src/enums/ManualTaskStatus';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { Project } from './Project';
/**
 * 项目任务
 *
 * @remarks 项目任务
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:31.0
 *
 */
export interface ProjectTask extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 任务标识
	 */
	taskID: string;
	/**
	 * 任务编号，多级编号如1, 1.1,1.2
	 */
	taskNo: string;
	/**
	 * 任务名称
	 */
	taskName: string;
	/**
	 * 级别
	 */
	taskLevel: TaskLevel;
	/**
	 * 所属阶段：0;STAGE;筹划|1;DESIGN;设计|2;MAKE;生产|3;INSTALL;安装|4;TEST;测试|5;ACCEPT;验收
	 */
	taskPhase: TaskPhase;
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 关键
	 */
	critical: boolean;
	/**
	 * 里程碑
	 */
	milestone: boolean;
	/**
	 * 风险等级：0;UNKNOWN;-|1;VERY_LOW;很低|2;LOW;低|3;MEDIUM;中等|4;HIGH;高|5;VERY_HIGH;很高
	 */
	riskLevel: RiskLevel;
	/**
	 * 子任务数
	 */
	subtaskNum: number;
	/**
	 * 状态：0;NEW;新|1;SUBMITTED;已提交|2;RELEASED;已下达|3;STARTED;已开始|4;PAUSED;已暂停|6;REWORKING;返工中|8;FINISHED;已完成|9;REVIEWED;已评审通过|-4;CANCELLED;已取消
	 */
	status: ManualTaskStatus;
	/**
	 * 计划开工
	 */
	expectedStart?: string;
	/**
	 * 计划完工
	 */
	expectedFinish?: string;
	/**
	 * 计划工时
	 * to_days(expectedFinish) - to_days(expectedStart) + 1
	 */
	expectedDuration?: number;
	/**
	 * 任务颜色
	 */
	taskColor?: string;
	/**
	 * 限制类型：0;NONE;无|1;AS_SOON_AS_POSSIBLE;尽快启动|2;AS_LATE_AS_POSSIBLE;尽可能晚启动|3;START_NO_EARLIER_THAN;启动不得早于|4;START_NO_LATER_THAN;启动不得晚于|5;FINISH_NO_EARLIER_THAN;完成不得早于|6;FINISH_NO_LATER_THAN;完成不得晚于|7;MUST_START_ON;必须开始于|8;MUST_FINISH_ON;必须于完成
	 */
	constraintType?: TaskConstraintType;
	/**
	 * 限制日期
	 */
	constraintDate?: string;
	/**
	 * 实际开始
	 */
	actualStart?: string;
	/**
	 * 实际完成
	 */
	actualFinish?: string;
	/**
	 * 完成比%
	 */
	progress?: number;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
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
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如备料单号
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	/**
	 * 项目标识
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目任务实体定义函数
 */
export const defineProjectTask = (o: object) => {
	const e = defineEntity<ProjectTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.taskID }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
