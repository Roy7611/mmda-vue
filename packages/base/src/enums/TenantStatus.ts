/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 租户状态
 * 
 * 0;NEWL;新|1;LIVE;已激活|-1;DEAD;已终止
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum TenantStatus{
	//#region ~GENERATED PARTS BEGIN
	NEWL = 'NEWL',  //0 新
	LIVE = 'LIVE',  //1 已激活
	DEAD = 'DEAD',  //-1 已终止
	
}
export const TenantStatusEnum = {
	NEWL_VALUE : 0,
	LIVE_VALUE : 1,
	DEAD_VALUE : -1,
	
	NEWL_TEXT : '新',
	LIVE_TEXT : '已激活',
	DEAD_TEXT : '已终止',

	valueOf(enumCode: TenantStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: TenantStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END