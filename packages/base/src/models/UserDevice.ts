/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UserDeviceStatus } from '../enums/UserDeviceStatus';
/**
 * 用户终端设备
 * 
 * @remarks 用户终端设备
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface UserDevice extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 设备唯一标识
	 */
	deviceUUID: string;
	/**
	 * 设备名称
	 */
	deviceName?: string;
	/**
	 * 用户ID
	 */
	userID: string;
	/**
	 * 平台。例如 ios,android,windows, mac
	 */
	platform: string;
	/**
	 * 制造厂商
	 */
	manufacturer?: string;
	/**
	 * 操作系统型号
	 */
	osModel?: string;
	/**
	 * 操作系统版本
	 */
	osVersion?: string;
	/**
	 * 语言区域，如zh-CN
	 */
	locale?: string;
	/**
	 * App版本号
	 */
	appVersion: string;
	/**
	 * 状态：0;OFFLINE;离线|1;ONLINE;在线|-1;DEPRECATED;已弃用
	 */
	status: UserDeviceStatus;
	/**
	 * 最近登录时间
	 */
	lastSignedIn?: string;
	/**
	 * 最近登录IP
	 */
	lastSignedInIP?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 用户终端设备实体定义函数
 */
export const defineUserDevice = (o: object) => {
	const e = defineEntity<UserDevice>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.deviceUUID }
	});
	return e;
}
