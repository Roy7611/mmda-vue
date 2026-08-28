/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 设备站点
 *
 * @remarks 设备站点。当设备可移动，服务于多工位时，此表记录设备与工位的关系。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2026-03-29 01:18:58.0
 *
 */
export interface EquipmentStation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 设备ID
	 */
	equipID: string;
	/**
	 * 工位：REF_ONE Station(stationID,stationNo,stationName)
	 */
	stationID: string;
	/**
	 * 产线：REF_ONE ProductionLine(lineID,lineNo,lineName)
	 */
	lineID: string;
	/**
	 * 优先级
	 */
	priority: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备站点实体定义函数
 */
export const defineEquipmentStation = (o: object) => {
	const e = defineEntity<EquipmentStation>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.equipID},${this.stationID}` }
	});
	return e;
}
