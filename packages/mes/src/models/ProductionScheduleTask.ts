/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { ProductionTaskStatus } from '../enums/ProductionTaskStatus';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
import type { Bom } from './Bom';
import type { ProductionLine } from './ProductionLine';
import type { Project } from './Project';
/**
 * 生产排程任务
 *
 * @remarks 生产排程任务
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-10-24 22:19:54.0
 *
 */
export interface ProductionScheduleTask extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 任务标识
	 */
	taskID: string;
	/**
	 * 任务编号
	 */
	taskNo?: string;
	/**
	 * 任务概要
	 */
	taskSummary?: string;
	/**
	 * 制品类别：HAS_ONE base.MaterialCat(categoryID,categoryCode,categoryName) AS productCategory
	 */
	productCategoryID?: string;
	/**
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称，物料全称
	 */
	productName: string;
	/**
	 * 任务数量
	 */
	taskQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 
	 */
	lotNo?: string;
	/**
	 * 任务级别：
	 */
	taskLevel: number;
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
	 * 实际开工
	 */
	actualStart?: string;
	/**
	 * 实际完工
	 */
	actualFinish?: string;
	/**
	 * 实际工时
	 */
	actualDuration?: number;
	/**
	 * 产值进度%
	 */
	outputProgress?: number;
	/**
	 * 进度%
	 */
	progress?: number;
	/**
	 * 状态：0;NEW;新|1;BREAK_DOWN;已分解|2;PLANNED;已计划|3;PREPARED;已齐备|4;RELEASED;已下达|5;WORKING;进行中|6;PAUSED;已暂停|8;FINISHED;已完成|-1;CANCELED;已取消
	 */
	status: ProductionTaskStatus;
	/**
	 * 制品配方标识
	 */
	bomID?: string;
	/**
	 * 制品配方编号
	 */
	bomNo: string;
	/**
	 * 产线：HAS_ONE ProductionLine(lineID,lineName) AS prodLine
	 */
	lineID?: string;
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
	refName: string;
	/**
	 * 引用标识
	 */
	refID: string;
	/**
	 * 引用单号，例如销售订单号
	 */
	refNo?: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 客户PO
	 */
	custPoNo?: string;
	/**
	 * 订单标识
	 */
	orderID: string;
	/**
	 * 委外
	 */
	outsourced: boolean;
	/**
	 * 父任务标识
	 */
	parentTaskID?: string;
	/**
	 * 子任务数
	 */
	childrenTaskNum?: number;
	/**
	 * 生产计划标识
	 */
	planID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 制品类别标识
	 */
	productCategory?: MaterialCat;
	/**
	 * 产线
	 */
	prodLine?: ProductionLine;
	/**
	 * 工程项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产排程任务实体定义函数
 */
export const defineProductionScheduleTask = (o: object) => {
	const e = defineEntity<ProductionScheduleTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.taskID }
	});
	return e;
}
