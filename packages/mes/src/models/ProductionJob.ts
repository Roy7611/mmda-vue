/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ProductionJobType } from '../enums/ProductionJobType';
import type { OpPhase } from '../enums/OpPhase';
import type { QcInProcessType } from '../enums/QcInProcessType';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { ProductionJobStatus } from '../enums/ProductionJobStatus';
import type { InProgressQcStatus } from '../enums/InProgressQcStatus';
import type { Project } from './Project';
import type { Product } from './Product';
import type { ProductionPlanItem } from './ProductionPlanItem';
import type { ProductionOrder } from './ProductionOrder';
import type { Station } from './Station';
import type { Equipment } from './Equipment';
import type { Doc } from './Doc';
import { type ProductionJobFeeding, defineProductionJobFeeding } from './ProductionJobFeeding';
/**
 * 生产作业
 *
 * @remarks 生产作业。离散制造中一个工位的生产指令，通常关联一道工序。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 21:45:29.0
 * 
 */
export interface ProductionJob extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 作业标识
	 */
	jobID: string;
	/**
	 * 作业编号
	 */
	jobNo: string;
	/**
	 * 作业类型：0;UNKNOWN;-|1;TRIAL;试产|2;VOLUME;量产|3;REWORK;返工|4;COMPLEMENT;补产
	 */
	jobType: ProductionJobType;
	/**
	 * 作业日期
	 */
	jobDate: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 加工工序
	 */
	opCode: string;
	/**
	 * 工序类型：0;PREPARE;准备|1;START;启动|2;MID;中间|4;END;结束
	 */
	opPhase: OpPhase;
	/**
	 * (半)制品：HAS_ONE Product(productID,productName)
	 */
	productID?: string;
	/**
	 * 制品数量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 单位产值
	 */
	unitOutput?: number;
	/**
	 * 生产任务：HAS_ONE ProductionPlanItem(taskID,taskNo,taskName) AS prodTask
	 */
	taskID: string;
	/**
	 * 生产订单标识
	 */
	orderID: string;
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 执行工位：HAS_ONE Station(stationID,stationName)
	 */
	stationID?: string;
	/**
	 * 执行设备：HAS_ONE Equipment(equipID,equipNo,equipName) AS equipment
	 */
	equipID?: string;
	/**
	 * SOP文档：HAS_ONE Doc(docID,docNo) AS sopDoc
	 */
	sopDocID?: string;
	/**
	 * 在制品检验：0;NONE;无|1;FIRST_PIECE;首件检验|2;PATROL_INSPECTION;过程巡检|4;LAST_PIECE;末件终验
	 */
	qcInProcessTypes: QcInProcessType;
	/**
	 * 计划产值
	 */
	expectedOutput?: number;
	/**
	 * 计划开工
	 */
	expectedStart?: string;
	/**
	 * 计划完工
	 */
	expectedFinish?: string;
	/**
	 * 计划工时(H)
	 * timestampdiff(HOUR,expectedStart,expectedFinish)
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
	constraintDate?: string;
	/**
	 * 状态：0;NEW;新|1;PREPAIRING;准备中|2;WORKING;进行中|3;INSPECTING;待检验|4;PAUSED;已暂停|8;FINISHED;已完成|16;INSPECTED;已终验|-1;CANCELLED;已取消
	 */
	status: ProductionJobStatus;
	/**
	 * 制程品控状态：0;NONE;-|1;FP_INSPECTED;首件已检验|2;PATROL_INSPECTED;已巡检|4;LP_INSPECTED;末件已检验
	 */
	qcInProcessStatus: InProgressQcStatus;
	/**
	 * 实际产值
	 */
	actualOutput?: number;
	/**
	 * 产值进度%
	 * case when expectedOutput > 0 then actualOutput / expectedOutput else NULL end
	 */
	outputProgress?: number;
	/**
	 * 已产数量，根据质量检验要求，首件报工和末件报工触发质检任务
	 */
	producedQuantity?: number;
	/**
	 * 达成率%
	 * (producedQuantity - scrapQuantity) / quantity
	 */
	producedRate?: number;
	/**
	 * 实际开工
	 */
	actualStart?: string;
	/**
	 * 实际完工
	 */
	actualFinish?: string;
	/**
	 * 实际工时(H)
	 * timestampdiff(HOUR,actualStart,actualFinish)
	 */
	duration?: number;
	/**
	 * 瑕疵数量，计算返修率
	 */
	defectiveQuantity?: number;
	/**
	 * 废品数量
	 */
	scrapQuantity?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 整改单标识
	 */
	rectificationID?: string;
	/**
	 * 引用名称，来自ProductionPlan
	 */
	refName?: string;
	/**
	 * 引用单号，例如生产计划号
	 */
	refNo?: string;
	/**
	 * 引用标识，生产计划标识
	 */
	refID?: string;
	/**
	 * 引用序号，生产计划项次
	 */
	refItemID?: number;
	/**
	 * 投料清单
	 */
	feedings?: ProductionJobFeeding[];
	/**
	 * 工程项目
	 */
	project?: Project;
	/**
	 * (半)制品
	 */
	product?: Product;
	/**
	 * 生产任务标识
	 */
	prodTask?: ProductionPlanItem;
	/**
	 * 生产订单
	 */
	order?: ProductionOrder;
	/**
	 * 工位
	 */
	station?: Station;
	/**
	 * 执行设备
	 */
	equipment?: Equipment;
	/**
	 * SOP文档
	 */
	sopDoc?: Doc;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产作业实体定义函数
 */
export const defineProductionJob = (o: object) => {
	const e = defineEntity<ProductionJob>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.jobID }
	});
	//投料清单
	e.feedings = defineEntityArray(defineProductionJobFeeding, e.feedings);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
