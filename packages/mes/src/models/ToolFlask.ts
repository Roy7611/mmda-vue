/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import { type Tool } from "./Tool";
/**
 * 砂箱
 * 
 * @remarks 砂箱
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 11:16:16.0
 * 
 */
export interface ToolFlask extends Tool {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 砂箱ID
	 */
	toolID: string;
	/**
	 * 长(cm)
	 */
	length: number;
	/**
	 * 宽(cm)
	 */
	width: number;
	/**
	 * 高(cm)
	 */
	height: number;
	/**
	 * 内高(cm)
	 */
	innerHeight: number;
	/**
	 * 有无箱带
	 */
	hasBelt: boolean;
	/**
	 * 重量(kg)
	 */
	weight: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 砂箱实体定义函数
 */
export const defineToolFlask = (o: object) => {
	const e = defineEntity<ToolFlask>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.toolID }
	});
	return e;
}
