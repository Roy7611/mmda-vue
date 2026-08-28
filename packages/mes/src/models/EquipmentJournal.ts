/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { DeviceRunningState } from '@mmda/base/src/enums/DeviceRunningState';
/**
 * 设备日志
 *
 * @remarks 设备日志。通过SCADA采集的设备状态记录
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:03.0
 *
 */
export interface EquipmentJournal extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 设备标识
	 */
	equipID: string;
	/**
	 * 记录时间
	 */
	recordTime: string;
	/**
	 * 运行状态：0;OFFLINE;离线|1;WORKING;工作中|2;IDLING;待机|4;ALARMED;报警
	 */
	runningState: DeviceRunningState;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备日志实体定义函数
 */
export const defineEquipmentJournal = (o: object) => {
	const e = defineEntity<EquipmentJournal>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.equipID},${this.recordTime}` }
	});
	return e;
}
