/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 分批付款
 * 
 * 0;ADVANCE;预付款|1;DELIVERY;交货款|2;PROGRESSING;进度款|3;ACCEPTANCE;验收款|4;GUARANTEE;保修金
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum PhasedPayment{
	//#region ~GENERATED PARTS BEGIN
	ADVANCE = 'ADVANCE',  //0 预付款
	SHIP = 'SHIP',//1 发货款
	ARRIVAL='ARRIVAL',//2 到货款
	// DELIVERY = 'DELIVERY',  //1 交货款 //0105会议纪要    款项类型 交货款 改为 发货款 到货款
	PROGRESSING = 'PROGRESSING',  //3 进度款
	ACCEPTANCE = 'ACCEPTANCE',  //4验收款
	GUARANTEE = 'GUARANTEE',  //5 保修金
	COMPLETE='COMPLETE' ,//6 完工款
	SIGN='SIGN' //7 会签款
	
}
export const PhasedPaymentEnum = {
	ADVANCE_VALUE: 0,
	SHIP_VALUE: 1,
	ARRIVAL_VALUE: 2,
	// DELIVERY_VALUE : 1,
	PROGRESSING_VALUE : 3,
	ACCEPTANCE_VALUE : 4,
	GUARANTEE_VALUE : 5,
	COMPLETE_VALUE: 6,
	SIGN_VALUE: 7,		

	ADVANCE_TEXT: '预付款',
	SHIP_TEXT: '发货款',
	ARRIVAL_TEXT: '到货款',
	// DELIVERY_TEXT : '交货款',
	PROGRESSING_TEXT : '进度款',
	ACCEPTANCE_TEXT : '验收款',
	GUARANTEE_TEXT : '保修金',
	COMPLETE_TEXT: '完工款',
	SIGN_TEXT: '会签款',	

	valueOf(enumCode: PhasedPayment): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PhasedPayment): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
