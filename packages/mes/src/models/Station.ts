/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { EquippingType } from '../enums/EquippingType';
import type { ProductionReportingMode } from '../enums/ProductionReportingMode';
import type { ProductionLine } from './ProductionLine';
import { type StationOperation, defineStationOperation } from './StationOperation';
/**
 * 工位
 * 
 * @remarks 工位。若关联pouID则为线边库暂存工位，可进行入库暂存、拉料出库操作。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface Station extends Entity {
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
	 * 备注
	 */
	remark?: string;
	/**
	 * 工序
	 */
	operations?:  StationOperation[];
	/**
	 * 产线
	 */
	prodLine?: ProductionLine;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工位实体定义函数
 */
export const defineStation = (o: object) => {
	const e = defineEntity<Station>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.stationID }
	});
	//工序
	e.operations = defineEntityArray(defineStationOperation, e.operations);
	return e;
}
