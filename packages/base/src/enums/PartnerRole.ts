/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 伙伴角色
 * 
 * 0;UNKNOWN;-|1;CUSTOMER;客户|2;SUPPLIER;供应商|4;CARGO_OWNER;货主|8;CARRIER;承运商
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum PartnerRole{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	CUSTOMER = 'CUSTOMER',  //1 客户
	SUPPLIER = 'SUPPLIER',  //2 供应商
	CARGO_OWNER = 'CARGO_OWNER',  //4 货主
	CARRIER = 'CARRIER',  //8 承运商
	
}
export const PartnerRoleEnum = {
	UNKNOWN_VALUE : 0,
	CUSTOMER_VALUE : 1,
	SUPPLIER_VALUE : 2,
	CARGO_OWNER_VALUE : 4,
	CARRIER_VALUE : 8,
	
	UNKNOWN_TEXT : '-',
	CUSTOMER_TEXT : '客户',
	SUPPLIER_TEXT : '供应商',
	CARGO_OWNER_TEXT : '货主',
	CARRIER_TEXT : '承运商',

	valueOf(enumCode: PartnerRole): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PartnerRole): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END