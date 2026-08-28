/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生产任务状态
 * 
 * 0;NEW;新|4;RELEASED;已下达|5;WORKING;进行中|6;PAUSED;已暂停|8;FINISHED;已完成|-1;CANCELED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProductionTaskStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	RELEASED = 'RELEASED',  //4 已下达
	WORKING = 'WORKING',  //5 进行中
	PAUSED = 'PAUSED',  //6 已暂停
	FINISHED = 'FINISHED',  //8 已完成
	CANCELED = 'CANCELED',  //-1 已取消
	
}
export const ProductionTaskStatusEnum = {
	NEW_VALUE : 0,
	RELEASED_VALUE : 4,
	WORKING_VALUE : 5,
	PAUSED_VALUE : 6,
	FINISHED_VALUE : 8,
	CANCELED_VALUE : -1,
	
	NEW_TEXT : '新',
	RELEASED_TEXT : '已下达',
	WORKING_TEXT : '进行中',
	PAUSED_TEXT : '已暂停',
	FINISHED_TEXT : '已完成',
	CANCELED_TEXT : '已取消',

	valueOf(enumCode: ProductionTaskStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductionTaskStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END