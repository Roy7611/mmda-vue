/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * BOM状态
 * 
 * 0;NEW;新|10;UNDER_DEVELOPMENT;开发中|20;CERTIFIED;已审核|-1;ABANDONED;已弃用
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum BomStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	DRAFTED = 'DRAFTED',  //1 已起草
	CERTIFIED = 'CERTIFIED',  //2 已审核
	APPROVED = 'APPROVED',  //4 已批准
	REVISING = 'REVISING',  //5 变更中
	ABANDONED = 'ABANDONED',  //-1 已弃用
	
}
export const BomStatusEnum = {
	NEW_VALUE : 0,
	DRAFTED_VALUE : 1,
	CERTIFIED_VALUE : 2,
	APPROVED_VALUE : 4,
	REVISING_VALUE : 5,
	ABANDONED_VALUE : -1,
	
	NEW_TEXT : '新',
	DRAFTED_TEXT : '已起草',
	CERTIFIED_TEXT : '已审核',
	APPROVED_TEXT : '已批准',
	REVISING_TEXT : '变更中',
	ABANDONED_TEXT : '已弃用',

	valueOf(enumCode: BomStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: BomStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END