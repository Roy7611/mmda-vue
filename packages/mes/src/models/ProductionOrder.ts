/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Urgency } from '@mmda/base/src/enums/Urgency';
import type { ProductionOrderStatus } from '../enums/ProductionOrderStatus';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { Bom } from './Bom';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
import type { Project } from './Project';
import type { MaterialPackage } from '@mmda/base/src/models/MaterialPackage';
import type { Partner } from '@mmda/base/src/models/Partner';
import { type ProductionOrderMaterial, defineProductionOrderMaterial } from './ProductionOrderMaterial';
/**
 * 生产订单
 *
 * @remarks 生产订单。来自销售订单明细项，默认选择最新主配方（其中定义了制程和工艺文档），根据配方计算所需组件用量，分解为子件订单和工序级生产作业，然后组合成生产计划进行齐套计算、最后下达。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:04.0
 * 
 */
export interface ProductionOrder extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 订单标识
	 */
	orderID: string;
	/**
	 * 订单编号
	 */
	orderNo: string;
	/**
	 * 订单概要，例如 【销售单号】制品编码 制品名称 数量 单位(换算)
	 */
	orderSummary?: string;
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
	bomID?: string;
	/**
	 * 制品类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	productCategoryID?: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 订单数量
	 */
	orderQuantity: number;
	/**
	 * 加产数量
	 */
	plusQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 批次号，来自ERP预先指定批次号，为空则在计划下达时再生成
	 */
	lotNo?: string;
	/**
	 * 交货日期
	 */
	deliveryDate: string;
	/**
	 * 包装规格：HAS_ONE base.MaterialPackage(packID,packFullName) AS pack
	 */
	packID?: string;
	/**
	 * 优先级：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	priority: Urgency;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 状态：0;NEW;新|1;BREAK_DOWN;已分解|2;PLANNED;已计划|3;PREPARED;已齐套|4;RELEASED;已下达|5;WORKING;进行中|6;PAUSED;已暂停|8;FINISHED;已完成|-1;CANCELED;已取消
	 */
	status: ProductionOrderStatus;
	/**
	 * 主订单：HAS_ONE ProductionOrder(orderID,orderNo) AS superOrder
	 */
	superOrderID?: string;
	/**
	 * 子订单数
	 */
	subOrderCount?: number;
	/**
	 * 子任务数
	 */
	subTaskCount?: number;
	/**
	 * 外协
	 */
	outsourced: boolean;
	/**
	 * 外协厂商：HAS_ONE base.Partner(partnerID,partnerCodeName) AS outsourcingManufacturer
	 */
	outsourcingManufacturerID?: string;
	/**
	 * 单位产值
	 */
	unitOutput?: number;
	/**
	 * 计划产值
	 * orderQuantity * unitOutput
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
	 * 已齐套数量，生产计划齐套后回写累计值
	 */
	kittingQuantity?: number;
	/**
	 * 已下达数量，生产计划下达后回写累计值
	 */
	releasedQuantity?: number;
	/**
	 * 实际开工
	 */
	actualStart?: string;
	/**
	 * 实际完工
	 */
	actualFinish?: string;
	/**
	 * 实际工期(天)
	 * to_days(actualFinish) - to_days(actualStart) + 1
	 */
	actualPeriod?: number;
	/**
	 * 产出数量，必须大于0
	 */
	producedQuantity?: number;
	/**
	 * 达成率%
	 * producedQuantity / orderQuantity
	 */
	producedRate?: number;
	/**
	 * 实际产值，必须大于0
	 */
	actualOutput?: number;
	/**
	 * 产值进度%
	 * actualOutput / expectedOutput
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
	 * 一次合格数量
	 */
	firstPassQuantity?: number;
	/**
	 * 直通率%
	 * firstPassQuantity / producedQuantity
	 */
	firstPassYield?: number;
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
	 * 不良品数
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
	 * 引用名称，例如SalesOrder
	 */
	refName?: string;
	/**
	 * 客户
	 */
	refCustomer?: string;
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
	 * 项目任务标识
	 */
	projectTaskID?: string;
	/**
	 * 项目资源标识
	 */
	projectResID?: number;
	/**
	 * 所有人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 原材料
	 */
	materials?: ProductionOrderMaterial[];
	/**
	 * 制品配方
	 */
	bom?: Bom;
	/**
	 * 制品类别
	 */
	productCategory?: MaterialCat;
	/**
	 * 工程项目
	 */
	project?: Project;
	/**
	 * 包装规格
	 */
	pack?: MaterialPackage;
	/**
	 * 主订单
	 */
	superOrder?: ProductionOrder;
	/**
	 * 外协厂商
	 */
	outsourcingManufacturer?: Partner;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产订单实体定义函数
 */
export const defineProductionOrder = (o: object) => {
	const e = defineEntity<ProductionOrder>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.orderID }
	});
	//原材料
	e.materials = defineEntityArray(defineProductionOrderMaterial, e.materials);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
