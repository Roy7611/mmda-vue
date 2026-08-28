/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Material } from '@mmda/base/src/models/Material';
/**
 * 替代料策略项
 * 
 * @remarks 替代料策略项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-09-28 05:32:04.0
 * 
 */
export interface AlternativeStrategyItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 策略标识
	 */
	strategyID: string;
	/**
	 * 物料：HAS_ONE base.Material(materialID,materialCode,materialFullName)
	 */
	materialID: string;
	/**
	 * 优先级
	 */
	priority: number;
	/**
	 * 使用概率
	 */
	usageProbability: number;
	/**
	 * 物料
	 */
	material?: Material;
	//#endregion ~GENERATED PARTS END
}
/**
 * 替代料策略项实体定义函数
 */
export const defineAlternativeStrategyItem = (o: object) => {
	const e = defineEntity<AlternativeStrategyItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.strategyID},${this.materialID}` }
	});
	return e;
}
