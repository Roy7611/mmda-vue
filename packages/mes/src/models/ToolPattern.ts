/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import { type Tool } from "./Tool";
import type { Partner } from '@mmda/base/src/models/Partner';
/**
 * 模具
 * 
 * @remarks 模具，Cope and drag pattern 上模和下模 
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 11:16:16.0
 * 
 */
export interface ToolPattern extends Tool {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模具ID
	 */
	toolID: string;
	/**
	 * 客户名称：HAS_ONE base.Partner(partnerID,partnerCode,partnerName) AS customer
	 */
	customerID?: string;
	/**
	 * 客户物料号
	 */
	custPartNo?: string;
	/**
	 * 累计造型次数
	 */
	totalUsedCycles: number;
	/**
	 * 模具材质
	 */
	patternTexture: string;
	/**
	 * 造型方式
	 */
	moldingMethod: string;
	/**
	 * 型板长度(mm)
	 */
	length: number;
	/**
	 * 型板宽度(mm)
	 */
	width: number;
	/**
	 * 模数
	 */
	moldNum: number;
	/**
	 * 芯盒数量
	 */
	coreBoxNum: number;
	/**
	 * 活块数量
	 */
	movableBlockNum: number;
	/**
	 * 客户名称
	 */
	customer?: Partner;
	//#endregion ~GENERATED PARTS END
}
/**
 * 模具实体定义函数
 */
export const defineToolPattern = (o: object) => {
	const e = defineEntity<ToolPattern>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.toolID }
	});
	return e;
}
