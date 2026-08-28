/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ResourceType } from '../enums/ResourceType';
import type { Material } from '@mmda/base/src/models/Material';
/**
 * 工序需要资源
 * 
 * @remarks 工序需要资源。包括劳动技能、机械设备、工装器具、刀具等
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-31 02:25:14.0
 * 
 */
export interface ProcessOperationResource extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 工序编码
	 */
	opCode: string;
	/**
	 * 资源池：HAS_ONE Material(materialID,materialCode,materialFullName) AS resource
	 */
	resourceID: string;
	/**
	 * 资源类型：0;LABOR_SKILL;技能|16;EQUIP_TOOLS;机具设备
	 */
	resourceType: ResourceType;
	/**
	 * 需求数量
	 */
	requiredQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 消耗品
	 */
	consumable: boolean;
	/**
	 * 固定机台：REF_ONE Equipment(equipID,equipNo,equipName) AS machine WHERE(stationID IS NOT NULL)
	 */
	machineID?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工序需要资源实体定义函数
 */
export const defineProcessOperationResource = (o: object) => {
	const e = defineEntity<ProcessOperationResource>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.processID},${this.opCode},${this.resourceID}` }
	});
	return e;
}
