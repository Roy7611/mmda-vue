/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 质检单状态
 * 
 * 0;NEW;新|1;INSPECTED;已检验|-1;CANCELLED;已放弃
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum QualityInspectionStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SAMPLED = 'SAMPLED',  //1 已取样
	INSPECTING = 'INSPECTING',  //2 检验中
	INSPECTED = 'INSPECTED',  //4 已检验
	
}
export const QualityInspectionStatusEnum = {
	NEW_VALUE : 0,
	SAMPLED_VALUE : 1,
	INSPECTING_VALUE : 2,
	INSPECTED_VALUE : 4,
	
	NEW_TEXT : '新',
	SAMPLED_TEXT : '已取样',
	INSPECTING_TEXT : '检验中',
	INSPECTED_TEXT : '已检验',

	valueOf(enumCode: QualityInspectionStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: QualityInspectionStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END