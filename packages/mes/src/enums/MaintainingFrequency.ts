/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备维护频率
 * 
 * 0;DAILY;每天|1;WEEKLY;每周|2;MONTHLY;每月|3;QUARTERLY;每季度|4;YEARLY;每年
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MaintainingFrequency{
	//#region ~GENERATED PARTS BEGIN
	DAILY = 'DAILY',  //0 每天
	WEEKLY = 'WEEKLY',  //1 每周
	MONTHLY = 'MONTHLY',  //2 每月
	QUARTERLY = 'QUARTERLY',  //3 每季度
	YEARLY = 'YEARLY',  //4 每年
	
}
export const MaintainingFrequencyEnum = {
	DAILY_VALUE : 0,
	WEEKLY_VALUE : 1,
	MONTHLY_VALUE : 2,
	QUARTERLY_VALUE : 3,
	YEARLY_VALUE : 4,
	
	DAILY_TEXT : '每天',
	WEEKLY_TEXT : '每周',
	MONTHLY_TEXT : '每月',
	QUARTERLY_TEXT : '每季度',
	YEARLY_TEXT : '每年',

	valueOf(enumCode: MaintainingFrequency): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaintainingFrequency): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END