/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 发票类型
 * 
 * 0;RECEIPT;收据|1;INVOICE;普通发票|2;SPECIAL_INVOICE;专用增票
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum InvoiceType{
	//#region ~GENERATED PARTS BEGIN
	RECEIPT = 'RECEIPT',  //0 收据
	INVOICE = 'INVOICE',  //1 普通发票
	SPECIAL_INVOICE = 'SPECIAL_INVOICE',  //2 专用增票
	
}
export const InvoiceTypeEnum = {
	RECEIPT_VALUE : 0,
	INVOICE_VALUE : 1,
	SPECIAL_INVOICE_VALUE : 2,
	
	RECEIPT_TEXT : '收据',
	INVOICE_TEXT : '普通发票',
	SPECIAL_INVOICE_TEXT : '专用增票',

	valueOf(enumCode: InvoiceType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: InvoiceType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
