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
 * 日报任务
 * 
 * @remarks 日报任务。现场任务完成进度和推进情况
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-10 22:57:52.0
 * 
 */
export interface DailyReportTask extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 日报ID
	 */
	reportID: string;
	/**
	 * 任务：HAS_ONE ProjectTask(taskID,taskNo,taskName)
	 */
	taskID: string;
	/**
	 * 完成比%
	 */
	progress?: number;
	/**
	 * 照片，采用#1, #2引用上传的DailyReportPhoto
	 */
	refPhotos?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 任务
	 */
	projectTask?: ProjectTask;
	//#endregion ~GENERATED PARTS END
}
/**
 * 日报任务实体定义函数
 */
export const defineDailyReportTask = (o: object) => {
	const e = defineEntity<DailyReportTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.reportID},${this.taskID}` }
	});
	return e;
}
