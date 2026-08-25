/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 流程令牌状态
 * 
 * 0;NEW;未办理|1;DONE;已办理|-1;CANCELLED;已取消|-2;TERMINATED;已终止
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum FlowTokenStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 未办理
	DONE = 'DONE',  //1 已办理
	CANCELLED = 'CANCELLED',  //-1 已取消
	TERMINATED = 'TERMINATED',  //-2 已终止
	
}
export const FlowTokenStatusEnum = {
	NEW_VALUE : 0,
	DONE_VALUE : 1,
	CANCELLED_VALUE : -1,
	TERMINATED_VALUE : -2,
	
	NEW_TEXT : '未办理',
	DONE_TEXT : '已办理',
	CANCELLED_TEXT : '已取消',
	TERMINATED_TEXT : '已终止',

	valueOf(enumCode: FlowTokenStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: FlowTokenStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END