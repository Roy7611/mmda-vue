/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 项目资金状态
 * 
 * 0;NEW;新|1;BUDGETED;已预算|2;AUDITED;财务已审批|3;APPROVED;已同意|4;FINALIZED;已决算
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProjectCapitalStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	BUDGETED = 'BUDGETED',  //1 已预算
	AUDITED = 'AUDITED',  //2 财务已审批
	APPROVED = 'APPROVED',  //3 已同意
	FINALIZED = 'FINALIZED',  //4 已决算
	
}
export const ProjectCapitalStatusEnum = {
	NEW_VALUE : 0,
	BUDGETED_VALUE : 1,
	AUDITED_VALUE : 2,
	APPROVED_VALUE : 3,
	FINALIZED_VALUE : 4,
	
	NEW_TEXT : '新',
	BUDGETED_TEXT : '已预算',
	AUDITED_TEXT : '财务已审批',
	APPROVED_TEXT : '已同意',
	FINALIZED_TEXT : '已决算',

	valueOf(enumCode: ProjectCapitalStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProjectCapitalStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END