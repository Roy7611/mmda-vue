/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 物料搬运作业状态
 * 
 * 0;SCHEDULED;排队中|1;DISPATCHED;已派发指令|2;STARTED;已启动|3;READY;已就绪|4;SUSPENDED;已中断|8;FINISHED;已完成|9;FINISHED_MANUAL;已手动完成|16;CANCELED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum MaterialHandlingJobStatus{
	//#region ~GENERATED PARTS BEGIN
	SCHEDULED = 'SCHEDULED',  //0 排队中
	DISPATCHED = 'DISPATCHED',  //1 已派发指令
	STARTED = 'STARTED',  //2 已启动
	READY = 'READY',  //3 已就绪
	SUSPENDED = 'SUSPENDED',  //4 已中断
	FINISHED = 'FINISHED',  //8 已完成
	FINISHED_MANUAL = 'FINISHED_MANUAL',  //9 已手动完成
	CANCELED = 'CANCELED',  //16 已取消
	
}
export const MaterialHandlingJobStatusEnum = {
	SCHEDULED_VALUE : 0,
	DISPATCHED_VALUE : 1,
	STARTED_VALUE : 2,
	READY_VALUE : 3,
	SUSPENDED_VALUE : 4,
	FINISHED_VALUE : 8,
	FINISHED_MANUAL_VALUE : 9,
	CANCELED_VALUE : 16,
	
	SCHEDULED_TEXT : '排队中',
	DISPATCHED_TEXT : '已派发指令',
	STARTED_TEXT : '已启动',
	READY_TEXT : '已就绪',
	SUSPENDED_TEXT : '已中断',
	FINISHED_TEXT : '已完成',
	FINISHED_MANUAL_TEXT : '已手动完成',
	CANCELED_TEXT : '已取消',

	valueOf(enumCode: MaterialHandlingJobStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialHandlingJobStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

