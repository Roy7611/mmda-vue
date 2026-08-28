/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProductionReportingMode } from '../enums/ProductionReportingMode';
import type { EquippingType } from '../enums/EquippingType';
import type { DeviceRunningState } from '@mmda/base/src/enums/DeviceRunningState';
import type { ProductionLine } from './ProductionLine';
/**
 * 智能工位
 * 
 * @remarks 智能工位
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface StationPortal extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工位标识
	 */
	stationID: string;
	/**
	 * 工位编号
	 */
	stationNo: string;
	/**
	 * 工位名称
	 */
	stationName: string;
	/**
	 * 产线：HAS_ONE ProductionLine(lineID,lineName) AS prodLine
	 */
	lineID: string;
	/**
	 * 装备类型：0;NONE;无|1;SEMI_AUTO;半自动|2;AUTO;自动
	 */
	equippingType: EquippingType;
	/**
	 * 报工模式：0;NONE;无|1;MANUAL;手动报工|2;AUTO;自动计件
	 */
	reportingMode: ProductionReportingMode;
	/**
	 * 作业数
	 */
	jobCount: number;
	/**
	 * 任务数
	 */
	taskCount: number;
	/**
	 * 设备数
	 */
	equipCount: string;
	/**
	 * 设备未点检数
	 */
	unCheckedCount: number;
	/**
	 * 设备运行状态
	 */
	runningState?: DeviceRunningState;
	/**
	 * 产线
	 */
	prodLine?: ProductionLine;
	//#endregion ~GENERATED PARTS END
}
/**
 * 智能工位实体定义函数
 */
export const defineStationPortal = (o: object) => {
	const e = defineEntity<StationPortal>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.stationID }
	});
	return e;
}
