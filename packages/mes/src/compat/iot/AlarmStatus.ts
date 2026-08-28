/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 报警审计状态
 * 
 * 0;NEW;新|1;ACK;已确认|2;AUDIT;已审计|-1;DELETED;已删除
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum AlarmStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	ACK = 'ACK',  //1 已确认
	AUDIT = 'AUDIT',  //2 已审计
	DELETED = 'DELETED',  //-1 已删除
	
}
export const AlarmStatusEnum = {
	NEW_VALUE : 0,
	ACK_VALUE : 1,
	AUDIT_VALUE : 2,
	DELETED_VALUE : -1,
	
	NEW_TEXT : '新',
	ACK_TEXT : '已确认',
	AUDIT_TEXT : '已审计',
	DELETED_TEXT : '已删除',

	valueOf(enumCode: AlarmStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: AlarmStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

