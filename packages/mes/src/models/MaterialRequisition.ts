/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaterialRequisitionStatus } from '../enums/MaterialRequisitionStatus';
import type { Worksite } from './Worksite';
import type { ProductionPlanItem } from './ProductionPlanItem';
import type { Project } from './Project';
import { type MaterialRequisitionItem, defineMaterialRequisitionItem } from './MaterialRequisitionItem';
/**
 * 领料单
 *
 * @remarks 领料单。指生产车间向主管部门申请需要的原材料，拉动方式的叫料
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface MaterialRequisition extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 申请标识
	 */
	reqID: string;
	/**
	 * 申请日期
	 */
	reqDate: string;
	/**
	 * 申请单号
	 */
	reqNo: string;
	/**
	 * 补料
	 */
	replenished: boolean;
	/**
	 * 申请内容
	 */
	reqSummary?: string;
	/**
	 * 申请站点：HAS_ONE Worksite(siteID,siteNo,siteName)
	 */
	siteID?: string;
	/**
	 * 生产任务：HAS_ONE ProductionPlanItem(taskID,taskNo) AS prodTask
	 */
	taskID?: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 申请总数量
	 */
	totalReqQuantity?: number;
	/**
	 * 发料总数量
	 */
	totalDlvQuantity?: number;
	/**
	 * 状态：0;NEW;新|1;SUBMITTED;已提交|2;APPROVED;已批准|4;DONE;已完成|-1;DISAPPROVED;未批准
	 */
	status: MaterialRequisitionStatus;
	/**
	 * 标签
	 */
	tags?: string;
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
	 * 领料清单
	 */
	items: MaterialRequisitionItem[];
	/**
	 * 申请站点
	 */
	Worksite?: Worksite;
	/**
	 * 生产任务
	 */
	prodTask?: ProductionPlanItem;
	/**
	 * 工程项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 领料单实体定义函数
 */
export const defineMaterialRequisition = (o: object) => {
	const e = defineEntity<MaterialRequisition>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.reqID }
	});
	//领料清单
	e.items = defineEntityArray(defineMaterialRequisitionItem, e.items);
	return e;
}
