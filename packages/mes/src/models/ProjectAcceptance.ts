/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProjectCheckType } from '../enums/ProjectCheckType';
import type { ProjectAcceptanceStatus } from '../enums/ProjectAcceptanceStatus';
import type { Project } from './Project';
import { type ProjectAcceptanceItem, defineProjectAcceptanceItem } from './ProjectAcceptanceItem';
/**
 * 项目验收
 * 
 * @remarks 项目验收
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 09:10:08.0
 * 
 */
export interface ProjectAcceptance extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 验收标识
	 */
	acceptID: string;
	/**
	 * 验收单号
	 */
	acceptNo: string;
	/**
	 * 验收描述
	 */
	acceptSummary: string;
	/**
	 * 项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID: string;
	/**
	 * 验收类型：0;PRELIMINARY;初验|1;FINAL;终验
	 */
	checkType: ProjectCheckType;
	/**
	 * 验收日期
	 */
	checkDate?: string;
	/**
	 * 验收结果
	 */
	checkResult?: string;
	/**
	 * 验收人
	 */
	checker?: string;
	/**
	 * 竣工日期
	 */
	acceptedDate?: string;
	/**
	 * 状态：0;INITIAL;未发起|1;SUBMITTED;已提交|2;RECTIFYING;整改中|4;ACCEPTED;已验收
	 */
	status: ProjectAcceptanceStatus;
	/**
	 * 备注
	 */
	remark?: string;
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
	 * 验收分项
	 */
	items:  ProjectAcceptanceItem[];
	/**
	 * 项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目验收实体定义函数
 */
export const defineProjectAcceptance = (o: object) => {
	const e = defineEntity<ProjectAcceptance>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.acceptID}` }
	});
	//验收分项
	e.items = defineEntityArray(defineProjectAcceptanceItem, e.items);
	return e;
}
