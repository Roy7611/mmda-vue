/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 任务状态
 * 
 * 0;NEW;新任务|1;RUNNING;执行中|2;SUSPENDED;已暂停|8;SUCCEEDED;成功|-4;CANCELED;已取消|-8;FAILED;失败
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum BackgroundTaskStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新任务
	RUNNING = 'RUNNING',  //1 执行中
	SUSPENDED = 'SUSPENDED',  //2 已暂停
	SUCCEEDED = 'SUCCEEDED',  //8 成功
	CANCELED = 'CANCELED',  //-4 已取消
	FAILED = 'FAILED',  //-8 失败
	
}
export const BackgroundTaskStatusEnum = {
	NEW_VALUE : 0,
	RUNNING_VALUE : 1,
	SUSPENDED_VALUE : 2,
	SUCCEEDED_VALUE : 8,
	CANCELED_VALUE : -4,
	FAILED_VALUE : -8,
	
	NEW_TEXT : '新任务',
	RUNNING_TEXT : '执行中',
	SUSPENDED_TEXT : '已暂停',
	SUCCEEDED_TEXT : '成功',
	CANCELED_TEXT : '已取消',
	FAILED_TEXT : '失败',

	valueOf(enumCode: BackgroundTaskStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: BackgroundTaskStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END