/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 推送状态
 * 
 * 0;NEW;新|1;SENT;已送达|-1;CANCELED;已取消
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum PushStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	SENT = 'SENT',  //1 已送达
	CANCELED = 'CANCELED',  //-1 已取消
	
}
export const PushStatusEnum = {
	NEW_VALUE : 0,
	SENT_VALUE : 1,
	CANCELED_VALUE : -1,
	
	NEW_TEXT : '新',
	SENT_TEXT : '已送达',
	CANCELED_TEXT : '已取消',

	valueOf(enumCode: PushStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PushStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

