/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProductionTaskStatus } from '../enums/ProductionTaskStatus';
import type { InProgressQcStatus } from '../enums/InProgressQcStatus';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { Urgency } from '@mmda/base/src/enums/Urgency';
import type { ProcessType } from '../enums/ProcessType';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
import type { ProductionLine } from './ProductionLine';
import type { MaterialPackage } from '@mmda/base/src/models/MaterialPackage';
import type { Project } from './Project';
import type { Bom } from './Bom';
import type { Doc } from './Doc';
import type { Process } from './Process';
import { type ProductionTaskFeeding, defineProductionTaskFeeding } from './ProductionTaskFeeding';
/**
 * 生产任务
 *
 * @remarks 生产任务
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProductionTask extends Entity {
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
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称，物料全称
	 */
	productName: string;
	/**
	 * 制品类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	productCategoryID?: string;
	/**
	 * 制品图片
	 */
	productPic?: string;
	/**
	 * 规格，如尺寸
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 材质，型材颜色、玻璃颜色
	 */
	texture?: string;
	/**
	 * 任务数量
	 */
	taskQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 批次号，来自生产订单，如果为空则自动生成
	 */
	lotNo?: string;
	/**
	 * 状态：0;NEW;新|4;RELEASED;已下达|5;WORKING;进行中|6;PAUSED;已暂停|8;FINISHED;已完成|-1;CANCELED;已取消
	 */
	status: ProductionTaskStatus;
	/**
	 * 制程品控状态：0;NONE;-|1;FP_INSPECTED;首件已检验|2;PATROL_INSPECTED;已巡检|4;LP_INSPECTED;末件已检验
	 */
	qcInProcessStatus: InProgressQcStatus;
	/**
	 * 预期产量
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
	 * 已产数量
	 */
	producedQuantity?: number;
	/**
	 * 达成率%
	 */
	producedRate?: number;
	/**
	 * 实际产量
	 */
	actualOutput?: number;
	/**
	 * 产值进度%
	 */
	outputProgress?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 合格数量，包含良品和让步接受数量
	 */
	qualifiedQuantity?: number;
	/**
	 * 合格率%，yield rate
	 */
	qualifiedRate?: number;
	/**
	 * 不合格数量，包含瑕疵、不良和废品数，作为缺陷数可按PPM显示
	 */
	unqualifiedQuantity?: number;
	/**
	 * 不合格率%，作为缺陷率
	 */
	unqualifiedRate?: number;
	/**
	 * 优良品数，质量完全合格，不包含让步接受的部分
	 */
	goodQuantity?: number;
	/**
	 * 优良率%
	 */
	goodRate?: number;
	/**
	 * 让步接受数量
	 */
	aucQuantity?: number;
	/**
	 * 次品数量。指有瑕疵的件数，可进一步返工或直接报废
	 */
	defectiveQuantity?: number;
	/**
	 * 不良品数量
	 */
	ngQuantity?: number;
	/**
	 * 废品数量
	 */
	scrapQuantity?: number;
	/**
	 * 废品率%
	 */
	scrapRate?: number;
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
	 * 计划标识
	 */
	planID: string;
	/**
	 * 计划号
	 */
	planNo: string;
	/**
	 * 计划日期
	 */
	planDate: string;
	/**
	 * 订单标识
	 */
	orderID: string;
	/**
	 * 订单编号
	 */
	orderNo: string;
	/**
	 * 单位产值
	 */
	unitOutput?: number;
	/**
	 * 包装规格：HAS_ONE base.MaterialPackage(packID,packFullName) AS pack
	 */
	packID?: string;
	/**
	 * 交货日期
	 */
	deliveryDate: string;
	/**
	 * 优先级：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	priority: Urgency;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 项目编号
	 */
	projectNo?: string;
	/**
	 * 项目名称
	 */
	projectName?: string;
	/**
	 * 制品配方：HAS_ONE Bom(bomID,bomNo,productName)
	 */
	bomID: string;
	/**
	 * BOM编号
	 */
	bomNo: string;
	/**
	 * 工艺文档：HAS_ONE Doc(docID,docNo)
	 */
	docID?: string;
	/**
	 * 制程：HAS_ONE Process(processID,processName)
	 */
	processID?: string;
	/**
	 * 制程编码
	 */
	processCode: string;
	/**
	 * 制程名称
	 */
	processName: string;
	/**
	 * 制程类型：0;PROCESS;流程制造|1;DISCRETE;离散制造
	 */
	processType: ProcessType;
	/**
	 * 终结工序
	 */
	endOpCode: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如销售订单号
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
	 * 投料清单
	 */
	feedings?:  ProductionTaskFeeding[];
	/**
	 * 制品类别
	 */
	productCategory?: MaterialCat;
	/**
	 * 产线
	 */
	prodLine?: ProductionLine;
	/**
	 * 包装规格
	 */
	pack?: MaterialPackage;
	/**
	 * 工程项目
	 */
	project?: Project;
	/**
	 * 制品配方
	 */
	bom?: Bom;
	/**
	 * 工艺文档
	 */
	doc?: Doc;
	/**
	 * 制程
	 */
	process?: Process;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产任务实体定义函数
 */
export const defineProductionTask = (o: object) => {
	const e = defineEntity<ProductionTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.taskID }
	});
	//投料清单
	e.feedings = defineEntityArray(defineProductionTaskFeeding, e.feedings);
	return e;
}
