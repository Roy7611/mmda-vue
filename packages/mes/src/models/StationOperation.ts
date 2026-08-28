/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 工位工序
 * 
 * @remarks 工位工序。工时和标准工时产量默认为工序的设置，但因为工位配置了不同的机台可能效率不一样
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface StationOperation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工位标识
	 */
	stationID: string;
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 工序编码
	 */
	opCode: string;
	/**
	 * 准备时间(秒)
	 */
	setupTime?: number;
	/**
	 * 标准工时(秒)
	 */
	opTime?: number;
	/**
	 * 生产周期(秒)，setupTime+opTime+outRoute.lag
	 */
	cycleTime?: number;
	/**
	 * 标准工时产量
	 */
	outputQtyPerCycle?: number;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工位工序实体定义函数
 */
export const defineStationOperation = (o: object) => {
	const e = defineEntity<StationOperation>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.stationID},${this.processID},${this.opCode}` }
	});
	return e;
}
