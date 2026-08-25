/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 发货状态
 * 
 * 0;NONE;无|1;PARTIAL;部分|2;DONE;全部
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum DeliveredStatus{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 无
	PARTIAL = 'PARTIAL',  //1 部分
	DONE = 'DONE',  //2 全部
	
}
export const DeliveredStatusEnum = {
	NONE_VALUE : 0,
	PARTIAL_VALUE : 1,
	DONE_VALUE : 2,
	
	NONE_TEXT : '无',
	PARTIAL_TEXT : '部分',
	DONE_TEXT : '全部',

	valueOf(enumCode: DeliveredStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DeliveredStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END