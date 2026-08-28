/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProjectCapitalStatus } from '../enums/ProjectCapitalStatus';
import type { RiskLevel } from '../enums/RiskLevel';
import type { Project } from './Project';
import { type ProjectCapitalItem, defineProjectCapitalItem } from './ProjectCapitalItem';
/**
 * 项目资金
 * 
 * @remarks 项目资金
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:31.0
 * 
 */
export interface ProjectCapital extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 预算日期
	 */
	budgetedDate: string;
	/**
	 * 预计收入
	 */
	expectedRevenue?: number;
	/**
	 * 预计成本
	 */
	expectedCost?: number;
	/**
	 * 预计毛利
	 */
	expectedGrossProfit?: number;
	/**
	 * 计划毛利率%
	 */
	expectedGrossProfitRate?: number;
	/**
	 * 状态：0;NEW;新|1;BUDGETED;已预算|2;AUDITED;财务已审批|3;APPROVED;已同意|4;FINALIZED;已决算
	 */
	status: ProjectCapitalStatus;
	/**
	 * 垫资
	 */
	advanceFund?: number;
	/**
	 * 风险等级：0;UNKNOWN;-|1;VERY_LOW;很低|2;LOW;低|3;MEDIUM;中等|4;HIGH;高|5;VERY_HIGH;很高
	 */
	riskLevel: RiskLevel;
	/**
	 * 决算日期
	 */
	finalizedDate?: string;
	/**
	 * 决算毛利率%
	 */
	finalGrossProfitRate?: number;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
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
	 * 资金项
	 */
	items:  ProjectCapitalItem[];
	/**
	 * 项目标识
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目资金实体定义函数
 */
export const defineProjectCapital = (o: object) => {
	const e = defineEntity<ProjectCapital>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.projectID }
	});
	//资金项
	e.items = defineEntityArray(defineProjectCapitalItem, e.items);
	return e;
}
