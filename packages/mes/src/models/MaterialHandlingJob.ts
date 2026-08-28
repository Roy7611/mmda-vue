/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Urgency } from '@mmda/base/src/enums/Urgency';
import type { MaterialHandlingJobStatus } from '@mmda/base/src/enums/MaterialHandlingJobStatus';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { MaterialHandlingJobGroupMode } from '@mmda/base/src/enums/MaterialHandlingJobGroupMode';
import type { Equipment } from './Equipment';
import { type MaterialHandlingJobStep, defineMaterialHandlingJobStep } from './MaterialHandlingJobStep';
import { type MaterialHandlingJobRelation, defineMaterialHandlingJobRelation } from './MaterialHandlingJobRelation';
/**
 * 物料搬运作业
 * 
 * @remarks 物料搬运作业
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-11-03 12:12:33.0
 * 
 */
export interface MaterialHandlingJob extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 作业标识
	 */
	jobID: string;
	/**
	 * 作业指令
	 */
	jobCode: string;
	/**
	 * 作业日期
	 */
	jobDate: string;
	/**
	 * 作业概要，搬运物可以是载具、货组编号或者穿梭车设备名称
	 */
	jobSummary?: string;
	/**
	 * 优先级：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	priority: Urgency;
	/**
	 * 执行设备：HAS_ONE Equipment(equipID,equipNo,equipName) AS equipment
	 */
	equipID?: string;
	/**
	 * 生产任务标识
	 */
	prodTaskID?: string;
	/**
	 * 生产订单标识
	 */
	prodOrderID?: string;
	/**
	 * 工作站点：REF Worksite(siteID,siteNo,siteName)
	 */
	siteID: string;
	/**
	 * 自工位
	 */
	fromStationNo?: string;
	/**
	 * 至工位
	 */
	toStationNo?: string;
	/**
	 * 路线号
	 */
	routeNo?: string;
	/**
	 * 状态：0;SCHEDULED;排队中|1;DISPATCHED;已发送指令|2;STARTED;已启动|3;READY;已取货|4;SUSPENDED;已中断|8;FINISHED;已完成|9;FINISHED_MANUAL;已手动完成|16;CANCELED;已取消
	 */
	status: MaterialHandlingJobStatus;
	/**
	 * 多步骤
	 */
	multiStep: boolean;
	/**
	 * 计划开始
	 */
	expectedStart?: string;
	/**
	 * 计划完成
	 */
	expectedFinish?: string;
	/**
	 * 计划工时(s)
	 * time_to_sec(expectedFinish) - time_to_sec(expectedStart)
	 */
	expectedDuration?: number;
	/**
	 * 任务颜色
	 */
	taskColor?: string;
	/**
	 * 限制类型：0;NONE;无|1;AS_SOON_AS_POSSIBLE;尽快启动|2;AS_LATE_AS_POSSIBLE;尽可能晚启动|3;START_NO_EARLIER_THAN;启动不得早于|4;START_NO_LATER_THAN;启动不得晚于|5;FINISH_NO_EARLIER_THAN;完成不得早于|6;FINISH_NO_LATER_THAN;完成不得晚于|7;MUST_START_ON;必须开始于|8;MUST_FINISH_ON;必须于完成
	 */
	constraintType: TaskConstraintType;
	/**
	 * 限制日期
	 */
	constraintTime?: string;
	/**
	 * 开始时间
	 */
	actualStart?: string;
	/**
	 * 完成时间
	 */
	actualFinish?: string;
	/**
	 * 实际工时(s)
	 * time_to_sec(actualFinish) - time_to_sec(actualStart)
	 */
	duration?: number;
	/**
	 * 创建时间
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义，可存储skuCode,skuName,skuPic,lotNo,qs,packNo,lpNo等
	 */
	customJson?: string;
	/**
	 * 组合作业
	 */
	groupJobID: string;
	/**
	 * 组合模式：0;NONE;-|1;START;开始|2;CONTINUE;继续|4;FINISH;完成
	 */
	groupMode: MaterialHandlingJobGroupMode;
	/**
	 * 引用单据：REF metadata.MetaObject(objName,displayLabel)
	 */
	refName?: string;
	/**
	 * 引用单号
	 */
	refNo?: string;
	/**
	 * 引用单据ID
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	/**
	 * 外部任务标识，用于和第三方控制系统同步作业状态
	 */
	extTaskID?: string;
	/**
	 * 作业步骤
	 */
	steps?:  MaterialHandlingJobStep[];
	/**
	 * 作业关系
	 */
	relations?:  MaterialHandlingJobRelation[];
	/**
	 * 执行设备
	 */
	equipment?: Equipment;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料搬运作业实体定义函数
 */
export const defineMaterialHandlingJob = (o: object) => {
	const e = defineEntity<MaterialHandlingJob>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.jobID }
	});
	//作业步骤
	e.steps = defineEntityArray(defineMaterialHandlingJobStep, e.steps);
	//作业关系
	e.relations = defineEntityArray(defineMaterialHandlingJobRelation, e.relations);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
