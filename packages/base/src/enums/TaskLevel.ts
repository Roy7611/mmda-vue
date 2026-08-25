/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 任务类型
 * 
 * 0;PHASE;阶段|1;TASK;任务|2;WORK_PACKAGE;工作包
 * 
 * @author mmda code robot 
 * @version 4.0.0 
 * 
 */
export const enum TaskLevel{
	//#region ~GENERATED PARTS BEGIN
	PHASE = 'PHASE',  //0 阶段
	TASK = 'TASK',  //1 任务
	WORK_PACKAGE = 'WORK_PACKAGE',  //2 工作包
	
}
export const TaskLevelEnum = {
	PHASE_VALUE : 0,
	TASK_VALUE : 1,
	WORK_PACKAGE_VALUE : 2,
	
	PHASE_TEXT : '阶段',
	TASK_TEXT : '任务',
	WORK_PACKAGE_TEXT : '工作包',

	valueOf(enumCode: TaskLevel): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: TaskLevel): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END