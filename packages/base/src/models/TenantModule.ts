/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { LicenseStatus } from '../enums/LicenseStatus';
/**
 * 租赁模块
 * 
 * @remarks 租赁模块。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface TenantModule extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 租户ID
	 */
	tenantID: number;
	/**
	 * 服务编码
	 */
	moduleCode: string;
	/**
	 * 语言区域
	 */
	locale: string;
	/**
	 * 元对象名称
	 */
	objName?: string;
	/**
	 * 服务名称
	 */
	moduleLabel?: string;
	/**
	 * 短标签
	 */
	shortLabel?: string;
	/**
	 * 必须有创建参数
	 */
	requiredCreateParam: boolean;
	/**
	 * 到期时间
	 */
	expiryDate?: string;
	/**
	 * 用户数上限
	 */
	userNumLimit?: number;
	/**
	 * 数据量上限
	 */
	dataNumLimit?: number;
	/**
	 * 许可状态：0;UNLICENSED;未经许可|1;TRIAL_LICENSED;试用许可|2;LICENSED;正式许可|4;LICENSE_EXPIRED;许可过期
	 */
	licStatus: LicenseStatus;
	/**
	 * 许可证编码
	 */
	licCode?: string;
	/**
	 * 描述
	 */
	description?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 租赁模块实体定义函数
 */
export const defineTenantModule = (o: object) => {
	const e = defineEntity<TenantModule>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.tenantID},${this.moduleCode},${this.locale}` }
	});
	return e;
}
