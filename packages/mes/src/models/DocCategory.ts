/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 文档类别
 * 
 * @remarks 文档类别
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:03.0
 * 
 */
export interface DocCategory extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 类别标识
	 */
	categoryID: string;
	/**
	 * 类别编码
	 */
	categoryCode?: string;
	/**
	 * 类别名称
	 */
	categoryName: string;
	/**
	 * 上级类别标识
	 */
	parentCatID?: string;
	/**
	 * 预定义否
	 */
	predefined: boolean;
	/**
	 * 级深
	 */
	depth: number;
	/**
	 * 子节点数，0代表叶子节点
	 */
	childrenCount: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 文档类别实体定义函数
 */
export const defineDocCategory = (o: object) => {
	const e = defineEntity<DocCategory>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.categoryID }
	});
	return e;
}
