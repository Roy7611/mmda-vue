/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
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
 * @since 2026-01-07 14:52:35.0
 * 
 */
export interface ModuleAuditTrail extends Entity {
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
	 * 修改日志标识，引用ChangeLog.logID
	 */
	changeLogID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 审计追踪实体定义函数
 */
export const defineModuleAuditTrail = (o: object) => {
	const e = defineEntity<ModuleAuditTrail>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.trailID},${this.moduleCode}` }
	});
	return e;
}
