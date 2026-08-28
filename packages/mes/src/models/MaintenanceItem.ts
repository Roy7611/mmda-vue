/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { EquipmentStatus } from '../enums/EquipmentStatus';
import type { Maintainable } from './Maintainable';
/**
 * 设备维护工单项
 * 
 * @remarks 设备维护工单项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 17:39:12.0
 * 
 */
export interface MaintenanceItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工单标识
	 */
	maintenanceID: string;
	/**
	 * 器具设备：HAS_ONE Maintainable(equipID,equipNo,equipName) AS equip
	 */
	equipID: string;
	/**
	 * 维护要求
	 */
	requirement?: string;
	/**
	 * 工时
	 */
	hours?: number;
	/**
	 * 费用
	 */
	cost?: number;
	/**
	 * 维护人
	 */
	maintainer?: string;
	/**
	 * 核验人
	 */
	verifier?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 事务原因：REF_ONE MaterialTransReason(reasonID,reasonCode,reasonName)
	 */
	transReasonID: string;
	/**
	 * 至状态：0;NONE;-|1;NORMAL;正常使用|2;ALERTED;谨慎使用|4;DISABLED;暂停使用|-1;SCAPPED;已报废|-2;TRANSFORMED;已改制|-3;EOL;寿命终结|-4;DISPOSED;已处置
	 */
	toStatus?: EquipmentStatus;
	/**
	 * 至站点：REF_ONE Worksite(siteID,siteCode,siteName)
	 */
	toSiteID?: string;
	/**
	 * 至位置
	 */
	newLoc?: string;
	/**
	 * 增加使用次数
	 */
	renewCycles?: number;
	/**
	 * 延长至
	 */
	renewDays?: string;
	/**
	 * 器具设备
	 */
	equip?: Maintainable;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备维护工单项实体定义函数
 */
export const defineMaintenanceItem = (o: object) => {
	const e = defineEntity<MaintenanceItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.maintenanceID},${this.equipID}` }
	});
	return e;
}
