/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 任务状态
 * 
 * 0;NEW;新|1;ASSIGNED;已分配|2;STARTED;已开始|3;FINISHED;已完成|4;REWORKING;返工中|-1;CANCELLED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum TaskStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SUBMITTED = 'SUBMITTED',  //1 已提交
	RELEASED = 'RELEASED',  //2 已下达
	STARTED = 'STARTED',  //3 已开始
	PAUSED = 'PAUSED',  //4 已暂停
	REWORKING = 'REWORKING',  //6 返工中
	FINISHED = 'FINISHED',  //8 已完成
	REVIEWED = 'REVIEWED',  //9 已评审通过
	CANCELLED = 'CANCELLED',  //-4 已取消
	
}
export const TaskStatusEnum = {
	NEW_VALUE : 0,
	SUBMITTED_VALUE : 1,
	RELEASED_VALUE : 2,
	STARTED_VALUE : 3,
	PAUSED_VALUE : 4,
	REWORKING_VALUE : 6,
	FINISHED_VALUE : 8,
	REVIEWED_VALUE : 9,
	CANCELLED_VALUE : -4,
	
	NEW_TEXT : '新',
	SUBMITTED_TEXT : '已提交',
	RELEASED_TEXT : '已下达',
	STARTED_TEXT : '已开始',
	PAUSED_TEXT : '已暂停',
	REWORKING_TEXT : '返工中',
	FINISHED_TEXT : '已完成',
	REVIEWED_TEXT : '已评审通过',
	CANCELLED_TEXT : '已取消',

	valueOf(enumCode: TaskStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: TaskStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END