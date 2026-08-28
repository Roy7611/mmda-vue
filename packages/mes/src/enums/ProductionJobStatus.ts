/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生产作业状态
 * 
 * 0;NEW;新|1;PREPAIRING;准备中|2;WORKING;进行中|3;INSPECTING;待检验|4;PAUSED;已暂停|8;FINISHED;已完成|16;INSPECTED;已终验|-1;CANCELLED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProductionJobStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	PREPAIRING = 'PREPAIRING',  //1 准备中
	WORKING = 'WORKING',  //2 进行中
	INSPECTING = 'INSPECTING',  //3 待检验
	PAUSED = 'PAUSED',  //4 已暂停
	FINISHED = 'FINISHED',  //8 已完成
	INSPECTED = 'INSPECTED',  //16 已终验
	CANCELLED = 'CANCELLED',  //-1 已取消
	
}
export const ProductionJobStatusEnum = {
	NEW_VALUE : 0,
	PREPAIRING_VALUE : 1,
	WORKING_VALUE : 2,
	INSPECTING_VALUE : 3,
	PAUSED_VALUE : 4,
	FINISHED_VALUE : 8,
	INSPECTED_VALUE : 16,
	CANCELLED_VALUE : -1,
	
	NEW_TEXT : '新',
	PREPAIRING_TEXT : '准备中',
	WORKING_TEXT : '进行中',
	INSPECTING_TEXT : '待检验',
	PAUSED_TEXT : '已暂停',
	FINISHED_TEXT : '已完成',
	INSPECTED_TEXT : '已终验',
	CANCELLED_TEXT : '已取消',

	valueOf(enumCode: ProductionJobStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductionJobStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END