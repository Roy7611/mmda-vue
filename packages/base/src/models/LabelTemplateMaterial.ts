/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { AddOrExceptional } from '../enums/AddOrExceptional';
import type { Material } from './Material';
/**
 * 标签模板限用产品
 * 
 * @remarks 标签模板限用产品。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-13 09:51:11.0
 * 
 */
export interface LabelTemplateMaterial extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标签标识
	 */
	labelTmplID: string;
	/**
	 * 产品：HAS_ONE base.Material(materialID,materialCode,materialFullName,unit)
	 */
	materialID: string;
	/**
	 * 额外/除外：0;DEFAULT;默认|1;ADDITIONAL;额外|4;EXCEPTIONAL;除外
	 */
	addOrExcept: AddOrExceptional;
	/**
	 * 产品
	 */
	material?: Material;
	//#endregion ~GENERATED PARTS END
}
/**
 * 标签模板限用产品实体定义函数
 */
export const defineLabelTemplateMaterial = (o: object) => {
	const e = defineEntity<LabelTemplateMaterial>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.labelTmplID},${this.materialID}` }
	});
	return e;
}
