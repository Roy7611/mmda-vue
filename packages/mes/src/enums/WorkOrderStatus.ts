/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 派工单状态
 * 
 * 0;NEW;新|1;DISPATCHED;已派遣|2;ACCEPTED;已接收|-1;CANCELED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum WorkOrderStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	DISPATCHED = 'DISPATCHED',  //1 已派遣
	ACCEPTED = 'ACCEPTED',  //2 已接收
	CANCELED = 'CANCELED',  //-1 已取消
	
}
export const WorkOrderStatusEnum = {
	NEW_VALUE : 0,
	DISPATCHED_VALUE : 1,
	ACCEPTED_VALUE : 2,
	CANCELED_VALUE : -1,
	
	NEW_TEXT : '新',
	DISPATCHED_TEXT : '已派遣',
	ACCEPTED_TEXT : '已接收',
	CANCELED_TEXT : '已取消',

	valueOf(enumCode: WorkOrderStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: WorkOrderStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
