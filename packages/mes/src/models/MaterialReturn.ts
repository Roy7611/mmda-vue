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
import { type MaterialReturnItem, defineMaterialReturnItem } from './MaterialReturnItem';
/**
 * 退料单
 *
 * @remarks 退料单
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:28.0
 *
 */
export interface MaterialReturn extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 退料单ID
	 */
	returnID: string;
	/**
	 * 退料日期
	 */
	returnDate: string;
	/**
	 * 退料单号
	 */
	returnNo: string;
	/**
	 * 退料内容
	 */
	returnSummary?: string;
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
	 * 退料总数量
	 */
	totalReturnQuantity?: number;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 状态：0;NEW;新|1;SUBMITTED;已提交|2;APPROVED;已批准|4;DONE;已完成|-1;CANCELED;已取消|-2;DISAPPROVED;未批准
	 */
	status: MaterialRequisitionStatus;
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
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 所有人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 退料清单
	 */
	items: MaterialReturnItem[];
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
 * 退料单实体定义函数
 */
export const defineMaterialReturn = (o: object) => {
	const e = defineEntity<MaterialReturn>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.returnID }
	});
	//退料清单
	e.items = defineEntityArray(defineMaterialReturnItem, e.items);
	return e;
}
