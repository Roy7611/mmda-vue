/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 用户状态
 * 
 * 0;NEW;新注册|1;ACTIVATED;已激活|-1;LOCKED;锁定|-2;DEACTIVATED;已注销
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum UserStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新注册
	ACTIVATED = 'ACTIVATED',  //1 已激活
	LOCKED = 'LOCKED',  //-1 锁定
	DEACTIVATED = 'DEACTIVATED',  //-2 已注销
	
}
export const UserStatusEnum = {
	NEW_VALUE : 0,
	ACTIVATED_VALUE : 1,
	LOCKED_VALUE : -1,
	DEACTIVATED_VALUE : -2,
	
	NEW_TEXT : '新注册',
	ACTIVATED_TEXT : '已激活',
	LOCKED_TEXT : '锁定',
	DEACTIVATED_TEXT : '已注销',

	valueOf(enumCode: UserStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: UserStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END