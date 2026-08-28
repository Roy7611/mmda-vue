/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 移料单工具清单
 * 
 * @remarks 移料单工具清单
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 17:39:13.0
 * 
 */
export interface MaterialTransTool extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 移料单ID
	 */
	transID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 器具ID
	 */
	toolID: string;
	/**
	 * 器具序列号
	 */
	serialNo: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 移料单工具清单实体定义函数
 */
export const defineMaterialTransTool = (o: object) => {
	const e = defineEntity<MaterialTransTool>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.transID},${this.itemID},${this.toolID}` }
	});
	return e;
}
