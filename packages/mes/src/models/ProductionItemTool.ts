/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Tool } from './Tool';
/**
 * 生产单件用具
 * 
 * @remarks 生产单件用具
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-10-15 22:23:36.0
 * 
 */
export interface ProductionItemTool extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 单件标识
	 */
	itemID: string;
	/**
	 * 绑定工位：REF Station(stationID,stationNo,stationName)
	 */
	stationID: string;
	/**
	 * 工装器具：HAS_ONE Tool(toolID,toolNo,toolName,serialNo)
	 */
	toolID: string;
	/**
	 * 换装识码，例如RFID、条码等
	 */
	toolingTag: string;
	/**
	 * 换装时间
	 */
	toolingTime: string;
	/**
	 * 操作工人：REF_ONE Worker(workerID,workerName)
	 */
	workerID?: string;
	/**
	 * 工装器具
	 */
	tool?: Tool;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产单件用具实体定义函数
 */
export const defineProductionItemTool = (o: object) => {
	const e = defineEntity<ProductionItemTool>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.itemID},${this.stationID},${this.toolID}` }
	});
	return e;
}
