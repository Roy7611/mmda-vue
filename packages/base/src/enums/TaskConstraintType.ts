/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 任务限制类型
 * 
 * 0;NONE;无|1;AS_SOON_AS_POSSIBLE;尽快启动|2;AS_LATE_AS_POSSIBLE;尽可能晚启动|3;START_NO_EARLIER_THAN;启动不得早于|4;START_NO_LATER_THAN;启动不得晚于|5;FINISH_NO_EARLIER_THAN;完成不得早于|6;FINISH_NO_LATER_THAN;完成不得晚于|7;MUST_START_ON;必须开始于|8;MUST_FINISH_ON;必须于完成
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum TaskConstraintType{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 无
	AS_SOON_AS_POSSIBLE = 'AS_SOON_AS_POSSIBLE',  //1 尽快启动
	AS_LATE_AS_POSSIBLE = 'AS_LATE_AS_POSSIBLE',  //2 尽可能晚启动
	START_NO_EARLIER_THAN = 'START_NO_EARLIER_THAN',  //3 启动不得早于
	START_NO_LATER_THAN = 'START_NO_LATER_THAN',  //4 启动不得晚于
	FINISH_NO_EARLIER_THAN = 'FINISH_NO_EARLIER_THAN',  //5 完成不得早于
	FINISH_NO_LATER_THAN = 'FINISH_NO_LATER_THAN',  //6 完成不得晚于
	MUST_START_ON = 'MUST_START_ON',  //7 必须开始于
	MUST_FINISH_ON = 'MUST_FINISH_ON',  //8 必须于完成
	
}
export const TaskConstraintTypeEnum = {
	NONE_VALUE : 0,
	AS_SOON_AS_POSSIBLE_VALUE : 1,
	AS_LATE_AS_POSSIBLE_VALUE : 2,
	START_NO_EARLIER_THAN_VALUE : 3,
	START_NO_LATER_THAN_VALUE : 4,
	FINISH_NO_EARLIER_THAN_VALUE : 5,
	FINISH_NO_LATER_THAN_VALUE : 6,
	MUST_START_ON_VALUE : 7,
	MUST_FINISH_ON_VALUE : 8,
	
	NONE_TEXT : '无',
	AS_SOON_AS_POSSIBLE_TEXT : '尽快启动',
	AS_LATE_AS_POSSIBLE_TEXT : '尽可能晚启动',
	START_NO_EARLIER_THAN_TEXT : '启动不得早于',
	START_NO_LATER_THAN_TEXT : '启动不得晚于',
	FINISH_NO_EARLIER_THAN_TEXT : '完成不得早于',
	FINISH_NO_LATER_THAN_TEXT : '完成不得晚于',
	MUST_START_ON_TEXT : '必须开始于',
	MUST_FINISH_ON_TEXT : '必须于完成',

	valueOf(enumCode: TaskConstraintType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: TaskConstraintType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END