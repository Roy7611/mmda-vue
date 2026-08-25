/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 招标方式
 * 
 * 0;INQUIRY;询价|1;OPEN_BIDDING;公开招标|2;INVITED_BIDDING;邀请招标|3;NEGOTIABLE_BIDDING;议标|4;COMPETITIVE_NEGOTIATION;竞争性谈判
 * 
 * @author mmda code robot 
 * @version 4.0.0 
 * 
 */
export const enum BiddingMode{
	//#region ~GENERATED PARTS BEGIN
	INQUIRY = 'INQUIRY',  //0 询价
	OPEN_BIDDING = 'OPEN_BIDDING',  //1 公开招标
	INVITED_BIDDING = 'INVITED_BIDDING',  //2 邀请招标
	NEGOTIABLE_BIDDING = 'NEGOTIABLE_BIDDING',  //3 议标
	COMPETITIVE_NEGOTIATION = 'COMPETITIVE_NEGOTIATION',  //4 竞争性谈判
	
}
export const BiddingModeEnum = {
	INQUIRY_VALUE : 0,
	OPEN_BIDDING_VALUE : 1,
	INVITED_BIDDING_VALUE : 2,
	NEGOTIABLE_BIDDING_VALUE : 3,
	COMPETITIVE_NEGOTIATION_VALUE : 4,
	
	INQUIRY_TEXT : '询价',
	OPEN_BIDDING_TEXT : '公开招标',
	INVITED_BIDDING_TEXT : '邀请招标',
	NEGOTIABLE_BIDDING_TEXT : '议标',
	COMPETITIVE_NEGOTIATION_TEXT : '竞争性谈判',

	valueOf(enumCode: BiddingMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: BiddingMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
