/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * SKU媒体
 * 
 * @remarks SKU媒体
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface SkuMedia extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * SKU标识
	 */
	skuID: string;
	/**
	 * 物料编号
	 */
	materialID: string;
	/**
	 * 序号
	 */
	itemID: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * SKU媒体实体定义函数
 */
export const defineSkuMedia = (o: object) => {
	const e = defineEntity<SkuMedia>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.skuID},${this.materialID},${this.itemID}` }
	});
	return e;
}
