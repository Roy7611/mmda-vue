/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ProjectInspectionStatus } from '../enums/ProjectInspectionStatus';
import type { Project } from './Project';
/**
 * 项目自检
 * 
 * @remarks 项目自检。完成项目的建设并经过初步调试和试运行，发起自检和初验工作，包括资料准备、试运行结果和初验结论。初验结论包括项目的完成情况、存在的问题和改进建议等。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 09:10:08.0
 * 
 */
export interface ProjectInspection extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID: string;
	/**
	 * 完工日期
	 */
	finishDate: string;
	/**
	 * 初验结论
	 */
	inspectedResult?: string;
	/**
	 * 检验日期
	 */
	inspectedDate?: string;
	/**
	 * 存在问题
	 */
	problems?: string;
	/**
	 * 状态：0;INITIAL;未开始|1;INSPECTING;检验中|2;RECTIFYING;整改中|4;COMPLETED;已完成
	 */
	status?: ProjectInspectionStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 项目任务标识
	 */
	projectTaskID?: string;
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
	 * 项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目自检实体定义函数
 */
export const defineProjectInspection = (o: object) => {
	const e = defineEntity<ProjectInspection>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.projectID }
	});
	return e;
}
