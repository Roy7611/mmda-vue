/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 用户设备状态
 * 
 * 0;OFFLINE;离线|1;ONLINE;在线|-1;DEPRECATED;已弃用
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum UserDeviceStatus{
	//#region ~GENERATED PARTS BEGIN
	OFFLINE = 'OFFLINE',  //0 离线
	ONLINE = 'ONLINE',  //1 在线
	DEPRECATED = 'DEPRECATED',  //-1 已弃用
	
}
export const UserDeviceStatusEnum = {
	OFFLINE_VALUE : 0,
	ONLINE_VALUE : 1,
	DEPRECATED_VALUE : -1,
	
	OFFLINE_TEXT : '离线',
	ONLINE_TEXT : '在线',
	DEPRECATED_TEXT : '已弃用',

	valueOf(enumCode: UserDeviceStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: UserDeviceStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END