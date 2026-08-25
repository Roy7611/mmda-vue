/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 审计追踪
 * 
 * @remarks 审计追踪
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface AuditTrail extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 审计标识
	 */
	trailID: string;
	/**
	 * 审计时间
	 */
	auditTime: string;
	/**
	 * 用户标识：REF User(userID,userName)
	 */
	userID?: string;
	/**
	 * 模块编码
	 */
	moduleCode?: string;
	/**
	 * 操作
	 */
	operation?: string;
	/**
	 * 访问设备
	 */
	deviceUUID?: string;
	/**
	 * 访问IP
	 */
	ipAddress?: string;
	/**
	 * 访问IPv6
	 */
	ipAddressV6?: string;
	/**
	 * 经度
	 */
	longitude?: number;
	/**
	 * 纬度
	 */
	latitude?: number;
	/**
	 * 数据更改
	 */
	dataChanges?: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 审计追踪实体定义函数
 */
export const defineAuditTrail = (o: object) => {
	const e = defineEntity<AuditTrail>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.trailID }
	});
	return e;
}
