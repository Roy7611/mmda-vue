/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ProductionTaskStatus } from '../enums/ProductionTaskStatus';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { Bom } from './Bom';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
import type { ProductionLine } from './ProductionLine';
import type { InProgressQcStatus } from '../enums/InProgressQcStatus';
import type { ProductionOrder } from './ProductionOrder';
/**
 * 生产计划任务
 *
 * @remarks 生产计划任务。生产订单（ProductionOrder）分批计划、下达至产线班次的任务。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProductionPlanItem extends Entity {
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
	 * 计划标识
	 */
	planID: string;
	/**
	 * 订单标识：HAS_ONE ProductionOrder(orderID,orderNo) AS order
	*/
	orderID: string;
	/**
	 * 关联订单对象
	 */
	order?: ProductionOrder;
	/**
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称
	 */
	productName: string;
	/**
	 * 制品配方：HAS_ONE Bom(bomID,bomNo,productName)
	 */
	bomID: string;
	/**
	 * 制品配方
	 */
	bom?: Bom;
	/**
	 * 制品类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	productCategoryID?: string;
	/**
	 * 执行产线：HAS_ONE ProductionLine(lineID,lineName) AS prodLine
	 */
	lineID?: string;
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
	 * 备注
	 */
	remark?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
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
	 * 计划工时
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
	 * timestampdiff(HOUR,actualStart,actualFinish)
	 */
	actualDuration?: number;
	/**
	 * 已产数量
	 */
	producedQuantity?: number;
	/**
	 * 达成率%
	 * producedQuantity / taskQuantity
	 */
	producedRate?: number;
	/**
	 * 实际产值，必须大于0或者null
	 */
	actualOutput?: number;
	/**
	 * 产值进度%
	 */
	outputProgress?: number;
	/**
	 * 合格数量，包含良品和让步接受数量
	 * ifnull(goodQuantity,0) + ifnull(aucQuantity,0)
	 */
	qualifiedQuantity?: number;
	/**
	 * 合格率%，yield rate
	 * qualifiedQuantity / producedQuantity
	 */
	qualifiedRate?: number;
	/**
	 * 不合格数量，包含瑕疵、不良和废品数，作为缺陷数可按PPM显示
	 * ifnull(defectiveQuantity,0) + ifnull(ngQuantity,0) + ifnull(scrapQuantity,0)
	 */
	unqualifiedQuantity?: number;
	/**
	 * 不合格率%，作为缺陷率
	 * unqualifiedQuantity / producedQuantity
	 */
	unqualifiedRate?: number;
	/**
	 * 优良品数，质量完全合格，不包含让步接受的部分
	 */
	goodQuantity?: number;
	/**
	 * 优良率%
	 * goodQuantity / producedQuantity
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
	 * scrapQuantity / producedQuantity
	 */
	scrapRate?: number;
	/**
	 * 制品类别
	 */
	productCategory?: MaterialCat;
	/**
	 * 执行产线
	 */
	prodLine?: ProductionLine;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产计划任务实体定义函数
 */
export const defineProductionPlanItem = (o: object) => {
	const e = defineEntity<ProductionPlanItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.taskID }
	});
	return e;
}
