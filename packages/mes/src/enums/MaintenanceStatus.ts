/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 维护单状态
 * 
 * 0;NEW;新|1;DISPATCHED;已派单|2;COMPLETED;已完成|-1;CANCELLED;已取消
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MaintenanceStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	DISPATCHED = 'DISPATCHED',  //1 已派单
	COMPLETED = 'COMPLETED',  //2 已完成
	CANCELLED = 'CANCELLED',  //-1 已取消
	
}
export const MaintenanceStatusEnum = {
	NEW_VALUE : 0,
	DISPATCHED_VALUE : 1,
	COMPLETED_VALUE : 2,
	CANCELLED_VALUE : -1,
	
	NEW_TEXT : '新',
	DISPATCHED_TEXT : '已派单',
	COMPLETED_TEXT : '已完成',
	CANCELLED_TEXT : '已取消',

	valueOf(enumCode: MaintenanceStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaintenanceStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END