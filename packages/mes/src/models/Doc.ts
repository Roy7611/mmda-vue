/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Importance } from '@mmda/base/src/enums/Importance';
import type { ConfidentialityLevel } from '@mmda/base/src/enums/ConfidentialityLevel';
import type { DocCategory } from './DocCategory';
import type { Project } from './Project';
import { type DocAudit, defineDocAudit } from './DocAudit';
import { type DocShare, defineDocShare } from './DocShare';
/**
 * 文档
 *
 * @remarks 文档
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:03.0
 *
 */
export interface Doc extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 文档标识
	 */
	docID: string;
	/**
	 * 文档编号
	 */
	docNo: string;
	/**
	 * 标题
	 */
	docTitle: string;
	/**
	 * 概要
	 */
	docSummary: string;
	/**
	 * 类别：HAS_ONE DocCategory(categoryID,categoryName) AS category
	 */
	categoryID: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 文件
	 */
	docFile?: string;
	/**
	 * 重要性：0;UNKNOWN;-|1;IMPORTANT;重要|2;VERY_IMPORTANT;非常重要
	 */
	importance: Importance;
	/**
	 * 保密等级：0;UNCLASSFIED;公开|1;SECRET;秘密|2;CONFIDENTIAL;机密|3;TOP_SECRET;绝密
	 */
	confidentialityLevel: ConfidentialityLevel;
	/**
	 * 起草人
	 */
	drafter?: string;
	/**
	 * 审核人
	 */
	auditor?: string;
	/**
	 * 修订版次
	 */
	revision: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 回收的
	 */
	reclaimed?: boolean;
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
	 * 访问记录
	 */
	audits?: DocAudit[];
	/**
	 * 分享
	 */
	shares?: DocShare[];
	/**
	 * 类别
	 */
	category?: DocCategory;
	/**
	 * 工程项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 文档实体定义函数
 */
export const defineDoc = (o: object) => {
	const e = defineEntity<Doc>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.docID }
	});
	//访问记录
	e.audits = defineEntityArray(defineDocAudit, e.audits);
	//分享
	e.shares = defineEntityArray(defineDocShare, e.shares);
	return e;
}
