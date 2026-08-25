/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { BackgroundTaskStatus } from '../enums/BackgroundTaskStatus';
/**
 * 后台任务
 * 
 * @remarks 后台任务
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 19:23:17.0
 * 
 */
export interface BackgroundTask extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 任务ID
	 */
	taskID: string;
	/**
	 * 任务编号
	 */
	taskNo: string;
	/**
	 * 任务名称
	 */
	taskName: string;
	/**
	 * 任务状态：0;NEW;新任务|1;RUNNING;执行中|2;SUSPENDED;已暂停|8;SUCCEEDED;成功|-4;CANCELED;已取消|-8;FAILED;失败
	 */
	status: BackgroundTaskStatus;
	/**
	 * 预计完成时间
	 */
	expectedFinish?: string;
	/**
	 * 开始时间
	 */
	startedTime?: string;
	/**
	 * 完成时间
	 */
	finishedTime?: string;
	/**
	 * 进度
	 */
	taskProgress: number;
	/**
	 * 任务结果，可以是失败原因或者一个超链接用于查看和下载文件
	 */
	taskResult?: string;
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
	 * 创建时间
	 */
	createDate?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 后台任务实体定义函数
 */
export const defineBackgroundTask = (o: object) => {
	const e = defineEntity<BackgroundTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.taskID }
	});
	return e;
}
