/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * Sku特征
 * 
 * @remarks Sku特征
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface SkuFeature extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * SKU标识
	 */
	skuID: string;
	/**
	 * 特征码，Color
	 */
	featureCode: string;
	/**
	 * 特征名，如颜色
	 */
	featureName: string;
	/**
	 * 特征值，如 Black;黑色
	 */
	featureValue: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * Sku特征实体定义函数
 */
export const defineSkuFeature = (o: object) => {
	const e = defineEntity<SkuFeature>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.skuID},${this.featureCode}` }
	});
	return e;
}
