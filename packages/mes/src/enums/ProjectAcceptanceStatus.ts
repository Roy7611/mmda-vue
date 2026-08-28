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
 * 0;INITIAL;未发起|1;SUBMITTED;已提交|2;RECTIFYING;整改中|4;ACCEPTED;已验收
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProjectAcceptanceStatus{
	//#region ~GENERATED PARTS BEGIN
	INITIAL = 'INITIAL',  //0 未发起
	SUBMITTED = 'SUBMITTED',  //1 已提交
	APPROVED = 'APPROVED',  //2 已批准
	ACCEPTED = 'ACCEPTED',  //4 已验收通过
	RECTIFYING = 'RECTIFYING',  //5 整改中
	CANCELLED = 'CANCELLED',  //-1 已取消
	
}
export const ProjectAcceptanceStatusEnum = {
	INITIAL_VALUE : 0,
	SUBMITTED_VALUE : 1,
	APPROVED_VALUE : 2,
	ACCEPTED_VALUE : 4,
	RECTIFYING_VALUE : 5,
	CANCELLED_VALUE : -1,
	
	INITIAL_TEXT : '未发起',
	SUBMITTED_TEXT : '已提交',
	APPROVED_TEXT : '已批准',
	ACCEPTED_TEXT : '已验收通过',
	RECTIFYING_TEXT : '整改中',
	CANCELLED_TEXT : '已取消',

	valueOf(enumCode: ProjectAcceptanceStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProjectAcceptanceStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END