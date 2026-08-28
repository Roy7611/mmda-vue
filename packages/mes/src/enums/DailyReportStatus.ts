/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 日报状态
 * 
 * 0;DRAFT;草稿|1;REPORTED;已上报
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum DailyReportStatus{
	//#region ~GENERATED PARTS BEGIN
	DRAFT = 'DRAFT',  //0 草稿
	REPORTED = 'REPORTED',  //1 已上报
	
}
export const DailyReportStatusEnum = {
	DRAFT_VALUE : 0,
	REPORTED_VALUE : 1,
	
	DRAFT_TEXT : '草稿',
	REPORTED_TEXT : '已上报',

	valueOf(enumCode: DailyReportStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DailyReportStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END