/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 状态
 * 
 * 0;NEW;新|1;SUBMITTED;已提交|2;APPROVED;已批准|3;DISAPPROVED;驳回|4;SETTLED;已结算|-1;CANCELED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProjectSettlementStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SUBMITTED = 'SUBMITTED',  //1 已提交
	APPROVED = 'APPROVED',  //2 已批准
	DISAPPROVED = 'DISAPPROVED',  //3 驳回
	SETTLED = 'SETTLED',  //4 终验结算
	FINAL_SETTLED = 'FINAL_SETTLED',  //5 最终结算
	CANCELED = 'CANCELED',  //-1 已取消
	
}
export const ProjectSettlementStatusEnum = {
	NEW_VALUE : 0,
	SUBMITTED_VALUE : 1,
	APPROVED_VALUE : 2,
	DISAPPROVED_VALUE : 3,
	SETTLED_VALUE : 4,
	FINAL_SETTLED_VALUE : 5,
	CANCELED_VALUE : -1,
	
	NEW_TEXT : '新',
	SUBMITTED_TEXT : '已提交',
	APPROVED_TEXT : '已批准',
	DISAPPROVED_TEXT : '驳回',
	SETTLED_TEXT : '终验结算',
	FINAL_SETTLED_TEXT : '最终结算',
	CANCELED_TEXT : '已取消',

	valueOf(enumCode: ProjectSettlementStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProjectSettlementStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
