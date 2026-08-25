/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 贸易伙伴组
 * 
 * @remarks 贸易伙伴组。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface PartnerCat extends Entity {
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
 * 贸易伙伴组实体定义函数
 */
export const definePartnerCat = (o: object) => {
	const e = defineEntity<PartnerCat>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.categoryID }
	});
	return e;
}
