/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 收款单状态
 * 
 * 0;NEW;新|1;COLLECTING;催款中|2;COLLECTED;已到款|-1;REPEALED;已作废
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ReceiptStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	COLLECTING = 'COLLECTING',  //1 催款中
	COLLECTED = 'COLLECTED',  //2 已到款
	REPEALED = 'REPEALED',  //-1 已作废
	
}
export const ReceiptStatusEnum = {
	NEW_VALUE : 0,
	COLLECTING_VALUE : 1,
	COLLECTED_VALUE : 2,
	REPEALED_VALUE : -1,
	
	NEW_TEXT : '新',
	COLLECTING_TEXT : '催款中',
	COLLECTED_TEXT : '已到款',
	REPEALED_TEXT : '已作废',

	valueOf(enumCode: ReceiptStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ReceiptStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
