/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 合同状态
 * 
 * 0;NEW;新|1;SIGNED;已签约|2;SCHEDULED;已计划|3;EXECUTING;履约中|4;COMPLETED;已完成|5;BALANCED;已结算|6;CLOSED;已关闭|-1;TERMINATED;已终止
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ContractStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SUBMITTED = 'SUBMITTED',  //1 已提交
	APPROVED = 'APPROVED',  //2 已批准
	SIGNED = 'SIGNED',  //3 已签约
	DISAPPROVED = 'DISAPPROVED',  //-1 已驳回
	TERMINATED = 'TERMINATED',  //-4 已终止
	
}
export const ContractStatusEnum = {
	NEW_VALUE : 0,
	SUBMITTED_VALUE : 1,
	APPROVED_VALUE : 2,
	SIGNED_VALUE : 3,
	DISAPPROVED_VALUE : -1,
	TERMINATED_VALUE : -4,
	
	NEW_TEXT : '新',
	SUBMITTED_TEXT : '已提交',
	APPROVED_TEXT : '已批准',
	SIGNED_TEXT : '已签约',
	DISAPPROVED_TEXT : '已驳回',
	TERMINATED_TEXT : '已终止',

	valueOf(enumCode: ContractStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ContractStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
