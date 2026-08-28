/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 项目状态
 * 
 * 0;NEW;新|1;STAGED;已筹划|2;MAKING;制造中|4;DELIVERING;交付中|6;ACCEPTING;验收中|8;MAITAINING;维保中
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProjectStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	STAGED = 'STAGED',  //1 已筹划
	MAKING = 'MAKING',  //2 制造中
	DELIVERING = 'DELIVERING',  //3 交付中
	PAUSED = 'PAUSED',  //4 已暂停
	ACCEPTING = 'ACCEPTING',  //7 验收中
	MAITAINING = 'MAITAINING',  //8 维保中
	TERMINATED = 'TERMINATED',  //-4 已终止
	
}
export const ProjectStatusEnum = {
	NEW_VALUE : 0,
	STAGED_VALUE : 1,
	MAKING_VALUE : 2,
	DELIVERING_VALUE : 3,
	PAUSED_VALUE : 4,
	ACCEPTING_VALUE : 7,
	MAITAINING_VALUE : 8,
	TERMINATED_VALUE : -4,
	
	NEW_TEXT : '新',
	STAGED_TEXT : '已筹划',
	MAKING_TEXT : '制造中',
	DELIVERING_TEXT : '交付中',
	PAUSED_TEXT : '已暂停',
	ACCEPTING_TEXT : '验收中',
	MAITAINING_TEXT : '维保中',
	TERMINATED_TEXT : '已终止',

	valueOf(enumCode: ProjectStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProjectStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END