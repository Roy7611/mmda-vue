/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProjectTask } from './ProjectTask';
/**
 * 项目自检项
 * 
 * @remarks 项目自检项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 09:10:08.0
 * 
 */
export interface ProjectInspectionItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 品控标准标识，NULL表示临时增项
	 */
	qcsID?: string;
	/**
	 * 类别
	 */
	category: string;
	/**
	 * 检查内容
	 */
	itemName: string;
	/**
	 * 判定基准
	 */
	criterion?: string;
	/**
	 * 合格否
	 */
	qualified?: boolean;
	/**
	 * 缺陷标识，NULL表示非标准缺陷
	 */
	defectID?: string;
	/**
	 * 缺陷描述
	 */
	defectDesc?: string;
	/**
	 * 需整改，若为1则自动生成整改任务（ProjectTask）工作包，然后可通过日报跟踪
	 */
	rectifiable: boolean;
	/**
	 * 整改措施建议
	 */
	rectificationProposal?: string;
	/**
	 * 整改任务：HAS_ONE ProjectTask(taskID,taskNo,taskName)
	 */
	rectifiedTaskID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如制品、项目交付物等
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
	 * 整改任务
	 */
	projectTask?: ProjectTask;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目自检项实体定义函数
 */
export const defineProjectInspectionItem = (o: object) => {
	const e = defineEntity<ProjectInspectionItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.projectID},${this.itemID}` }
	});
	return e;
}
