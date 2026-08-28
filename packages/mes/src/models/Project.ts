/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Importance } from '@mmda/base/src/enums/Importance';
import type { ProjectStatus } from '../enums/ProjectStatus';
import type { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import type { Partner } from '@mmda/base/src/models/Partner';
// import type { Contract } from './Contract';
import type { Address } from '@mmda/base/src/models/Address';
import { type ProjectMember, defineProjectMember } from './ProjectMember';
import { type ProjectMaterial, defineProjectMaterial } from './ProjectMaterial';
import { type ProjectTask, defineProjectTask } from './ProjectTask';
// import { type ProjectAmend, defineProjectAmend } from './ProjectAmend';
import { type ProjectDeliveryItem, defineProjectDeliveryItem } from './ProjectDeliveryItem';
import { type ProjectDeliveryItemAmend, defineProjectDeliveryItemAmend } from './ProjectDeliveryItemAmend';
import { type ProjectTaskRelation, defineProjectTaskRelation } from './ProjectTaskRelation';
/**
 * 项目
 *
 * @remarks 项目
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:31.0
 *
 */
export interface Project extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 项目编号
	 */
	projectNo: string;
	/**
	 * 项目名称
	 */
	projectName: string;
	/**
	 * 重要性：0;UNKNOWN;-|1;IMPORTANT;重要|2;VERY_IMPORTANT;非常重要
	 */
	importance: Importance;
	/**
	 * 甲方客户：HAS_ONE base.Partner(partnerID,partnerCodeName) AS customer
	 */
	customerID: string;
	/**
	 * 项目合同：HAS_ONE crm.Contract(contractID,contractNo,beginDate,endDate)
	 */
	contractID?: string;
	/**
	 * 项目地址：HAS_ONE base.Address(addressID,regionCode,addressDetails)
	 */
	addressID?: string;
	/**
	 * 状态：0;NEW;新|1;STAGED;已筹划|2;MAKING;制造中|4;DELIVERING;交付中|6;ACCEPTING;验收中|8;MAITAINING;维保中
	 */
	status: ProjectStatus;
	/**
	 * 工作分解模板：REF Wbs(wbsID,wbsName)
	 */
	wbsID?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 工单数
	 */
	orderCount?: number;
	/**
	 * 计划开工
	 */
	expectedStart?: string;
	/**
	 * 计划完工
	 */
	expectedFinish?: string;
	/**
	 * 计划工期(天)
	 * to_days(expectedFinish) - to_days(expectedStart) + 1
	 */
	expectedDuration?: number;
	/**
	 * 预计延期(天)，根据合同限制完成日期计算
	 * to_days(expectedFinish) - to_days(constraintDate) + 1
	 */
	expectedDelay?: number;
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
	 * 验收日期
	 */
	acceptedDate?: string;
	/**
	 * 实际工期(天)
	 * to_days(actualStart) - to_days(actualFinish) + 1
	 */
	actualDuration?: number;
	/**
	 * 工程进度%
	 */
	progress?: number;
	/**
	 * 产值进度%
	 */
	outputProgress?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 变更次数
	 */
	amendIdx: number;
	/**
	 * 变更日期
	 */
	amendDate?: string;
	/**
	 * 变更说明
	 */
	amendDesc?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 团队成员
	 */
	members?: ProjectMember[];
	/**
	 * 交付物
	 */
	deliveryItems?: ProjectDeliveryItem[];
	/**
	 * 甲方客户
	 */
	customer?: Partner;
	/**
	 * 项目合同
	 */
	// contract?: Contract;
	/**
	 * 项目地址
	 */
	address?: Address;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目实体定义函数
 */
export const defineProject = (o: object) => {
	const e = defineEntity<Project>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () {
			return this.projectID;
		},
	});
	//团队成员
	e.members = defineEntityArray(defineProjectMember, e.members);
	//交付物
	e.deliveryItems = defineEntityArray(defineProjectDeliveryItem, e.deliveryItems);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/ return e;
}
