/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 物料特征
 * 
 * @remarks 物料特征
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface MaterialFeature extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料ID
	 */
	materialID: string;
	/**
	 * 特征码，比如 Color
	 */
	featureCode: string;
	/**
	 * 特征名称，如颜色
	 */
	featureName: string;
	/**
	 * 特征选项，比如 Black;黑色|White;白色|Blue;蓝色
	 */
	featureValues: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料特征实体定义函数
 */
export const defineMaterialFeature = (o: object) => {
	const e = defineEntity<MaterialFeature>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.materialID},${this.featureCode}` }
	});
	return e;
}
