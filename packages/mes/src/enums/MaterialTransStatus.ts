/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 物流单状态
 * 
 * 0;NEW;新|1;PREPARED;已准备|2;QC_APPLIED;已申请检验|3;QC_RELEASED;已放行|4;SHIPPED;已发货|5;RECEIVED;已收货|-1;CANCELED;已取消|-2;REPEALED;已作废
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum MaterialTransStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	PREPARED = 'PREPARED',  //1 已准备
	QC_APPLIED = 'QC_APPLIED',  //2 已申请检验
	QC_RELEASED = 'QC_RELEASED',  //3 已放行
	SHIPPED = 'SHIPPED',  //4 已发货
	RECEIVED = 'RECEIVED',  //5 已收货
	CANCELED = 'CANCELED',  //-1 已取消
	REPEALED = 'REPEALED',  //-2 已作废
	
}
export const MaterialTransStatusEnum = {
	NEW_VALUE : 0,
	PREPARED_VALUE : 1,
	QC_APPLIED_VALUE : 2,
	QC_RELEASED_VALUE : 3,
	SHIPPED_VALUE : 4,
	RECEIVED_VALUE : 5,
	CANCELED_VALUE : -1,
	REPEALED_VALUE : -2,
	
	NEW_TEXT : '新',
	PREPARED_TEXT : '已准备',
	QC_APPLIED_TEXT : '已申请检验',
	QC_RELEASED_TEXT : '已放行',
	SHIPPED_TEXT : '已发货',
	RECEIVED_TEXT : '已收货',
	CANCELED_TEXT : '已取消',
	REPEALED_TEXT : '已作废',

	valueOf(enumCode: MaterialTransStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialTransStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END