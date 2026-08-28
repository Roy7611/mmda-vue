/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { DailyReportStatus } from '../enums/DailyReportStatus';
import type { Project } from './Project';
import { type DailyReportPhoto, defineDailyReportPhoto } from './DailyReportPhoto';
import { type DailyReportTask, defineDailyReportTask } from './DailyReportTask';
import { type DailyReportEvent, defineDailyReportEvent } from './DailyReportEvent';
/**
 * 日报
 * 
 * @remarks 日报。图片和视频作为附件上传，可在异常情况中输入#异常问题@负责人来快速创建异常事件AbnormalEvent。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 21:45:27.0
 * 
 */
export interface DailyReport extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 报告ID
	 */
	reportID: string;
	/**
	 * 报告编号
	 */
	reportNo: string;
	/**
	 * 报告日期
	 */
	reportDate: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 今日完成
	 */
	fullfillment: string;
	/**
	 * 异常情况
	 */
	abnormalities: string;
	/**
	 * 明日计划
	 */
	nextPoints: string;
	/**
	 * 状态：0;DRAFT;草稿|1;REPORTED;已上报
	 */
	status: DailyReportStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
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
	 * 现场照片
	 */
	photos:  DailyReportPhoto[];
	/**
	 * 任务进展
	 */
	tasks?: DailyReportTask[];
	/**
	 * 事件
	 */
	events?: DailyReportEvent[];
	/**
	 * 工程项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 日报实体定义函数
 */
export const defineDailyReport = (o: object) => {
	const e = defineEntity<DailyReport>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.reportID }
	});
	//现场照片
	e.photos = defineEntityArray(defineDailyReportPhoto, e.photos);
	//任务进展
	e.tasks = defineEntityArray(defineDailyReportTask, e.tasks);
	//事件
	e.events = defineEntityArray(defineDailyReportEvent, e.events);
	return e;
}
