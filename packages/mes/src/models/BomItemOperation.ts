/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
/**
 * 物料清单项工序
 *
 * @remarks 物料清单项工序
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 21:45:27.0
 * 
 */
export interface BomItemOperation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * BOM标识
	 */
	bomID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 加工工序，如04 预表干，05 流涂，06 表干，多个工序用逗号隔开，第一个为上料工序，若无工序则纯配件只提供而已
	 */
	opCode: string;
	/**
	 * 加工参数，JSON格式定义此工序的工艺参数，例如冷却时间
	 */
	opParams?: string;
	/**
	 * 准备时间(秒)
	 */
	setupTime: number;
	/**
	 * 加工工时(秒)，null表示使用标准工时
	 */
	opTime: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料清单项工序实体定义函数
 */
export const defineBomItemOperation = (o: object) => {
	const e = defineEntity<BomItemOperation>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.bomID},${this.itemID},${this.opCode}` }
	});
	return e;
}
