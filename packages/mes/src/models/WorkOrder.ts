/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { DispatchType } from '../enums/DispatchType';
import type { WorkOrderStatus } from '../enums/WorkOrderStatus';
import type { Worksite } from './Worksite';
import { type WorkOrderMember, defineWorkOrderMember } from './WorkOrderMember';
/**
 * 派工单
 * 
 * @remarks 派工单
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-07 17:41:04.0
 * 
 */
export interface WorkOrder extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 派工单ID
	 */
	orderID: string;
	/**
	 * 派工单编号
	 */
	orderNo: string;
	/**
	 * 派工日期
	 */
	orderDate: string;
	/**
	 * 派工类型：0;AFFAIRS;事务|1;ONSITE_WORK;生产装配|2;INSPECTION;巡检|4;RECTIFICATION;整改|8;SERVICE;保维修
	 */
	workType: DispatchType;
	/**
	 * 工作地点：HAS_ONE Worksite(siteID,siteNo,siteName)
	 */
	worksiteID: string;
	/**
	 * 工作任务
	 */
	workDesc: string;
	/**
	 * 计划开始
	 */
	expectedStart: string;
	/**
	 * 计划完成
	 */
	expectedFinish: string;
	/**
	 * 计划工期
	 * to_days(expectedFinish) - to_days(expectedStart) + 1
	 */
	expectedDuration?: number;
	/**
	 * 状态：0;NEW;新|1;DISPATCHED;已派遣|2;ACCEPTED;已接收|-1;CANCELED;已取消
	 */
	status: WorkOrderStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 解决方案
	 */
	solutions?: string;
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
	 * 派工人员
	 */
	members:  WorkOrderMember[];
	/**
	 * 工作地点
	 */
	worksite?: Worksite;
	//#endregion ~GENERATED PARTS END
}
/**
 * 派工单实体定义函数
 */
export const defineWorkOrder = (o: object) => {
	const e = defineEntity<WorkOrder>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.orderID }
	});
	//派工人员
	e.members = defineEntityArray(defineWorkOrderMember, e.members);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
