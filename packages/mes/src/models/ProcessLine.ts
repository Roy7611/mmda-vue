/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { WorkTeamType } from './WorkTeamType';
/**
 * 制程产线
 * 
 * @remarks 制程产线。一条产线可执行类似的多个制程，例如某道工序走2遍或者忽略。一个制程可由多条产线完成，例如配置了多条一样的产线。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:04.0
 * 
 */
export interface ProcessLine extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 产线标识
	 */
	lineID: string;
	/**
	 * 工序组
	 */
	opGroup?: string;
	/**
	 * 需要班组类型：HAS_ONE WorkTeamType(teamTypeID,teamTypeCode,teamTypeName) AS requiredTeamType
	 */
	requiredTeamTypeID?: string;
	/**
	 * 优先级
	 */
	priority: number;
	/**
	 * 生产节拍(min)
	 */
	cycleMinutes?: number;
	/**
	 * 节拍产量
	 */
	cycleOutputQty?: number;
	/**
	 * 需要班组类型
	 */
	requiredTeamType?: WorkTeamType;
	//#endregion ~GENERATED PARTS END
}
/**
 * 制程产线实体定义函数
 */
export const defineProcessLine = (o: object) => {
	const e = defineEntity<ProcessLine>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.processID},${this.lineID}` }
	});
	return e;
}
