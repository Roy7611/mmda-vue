/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 领料单状态
 * 
 * 0;NEW;新|1;SUBMITTED;已提交|2;APPROVED;已批准|4;DONE;已完成|-1;DISAPPROVED;未批准
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MaterialRequisitionStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SUBMITTED = 'SUBMITTED',  //1 已提交
	APPROVED = 'APPROVED',  //2 已批准
	DONE = 'DONE',  //4 已完成
	CANCELED = 'CANCELED',  //-1 已取消
	DISAPPROVED = 'DISAPPROVED',  //-2 未批准
	
}
export const MaterialRequisitionStatusEnum = {
	NEW_VALUE : 0,
	SUBMITTED_VALUE : 1,
	APPROVED_VALUE : 2,
	DONE_VALUE : 4,
	CANCELED_VALUE : -1,
	DISAPPROVED_VALUE : -2,
	
	NEW_TEXT : '新',
	SUBMITTED_TEXT : '已提交',
	APPROVED_TEXT : '已批准',
	DONE_TEXT : '已完成',
	CANCELED_TEXT : '已取消',
	DISAPPROVED_TEXT : '未批准',

	valueOf(enumCode: MaterialRequisitionStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialRequisitionStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END