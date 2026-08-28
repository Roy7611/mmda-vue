/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ProductionPlanStatus } from '../enums/ProductionPlanStatus';
import { type ProductionPlanItem, defineProductionPlanItem } from './ProductionPlanItem';
/**
 * 生产计划
 * 
 * @remarks 生产计划。选择同一类订单制品，创建生产计划，分批下达。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:04.0
 * 
 */
export interface ProductionPlan extends Entity {
	//#region ~GENERATED PARTS BEGIN
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
	 * 总数量
	 */
	totalQuantity?: number;
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
	 * 计划工期
	 * to_days(expectedFinish) - to_days(expectedStart) + 1
	 */
	expectedPeriod?: number;
	/**
	 * 状态：0;NEW;新|3;PREPARED;已齐套|4;RELEASED;已下达|5;WORKING;进行中|6;PAUSED;已暂停|8;FINISHED;已完成|-1;CANCELED;已取消
	 */
	status: ProductionPlanStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 已产数量
	 */
	producedQuantity?: number;
	/**
	 * 达成率%
	 * producedQuantity / totalQuantity
	 */
	producedRate?: number;
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
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 所有人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 计划任务
	 */
	items?: ProductionPlanItem[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产计划实体定义函数
 */
export const defineProductionPlan = (o: object) => {
	const e = defineEntity<ProductionPlan>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.planID }
	});
	//计划任务
	e.items = defineEntityArray(defineProductionPlanItem, e.items);

	return e;
}
