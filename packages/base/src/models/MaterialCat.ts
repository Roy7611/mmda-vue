/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { MaterialType } from '../enums/MaterialType';
/**
 * 物料类别
 * 
 * @remarks 物料类别。原材料分类
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface MaterialCat extends Entity {
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
	 * 物料用途：0;LABOR;劳动力|1;RAW_MATERIAL;原材料|2;PART;零配件|4;SEMI_PRODUCT;半成品|8;PRODUCT;产成品|16;TOOLS;机具设备|32;PACKAGING;包材|64;CONSUMABLE;办公用品|128;OTHER;其他
	 */
	materialType: MaterialType;
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
	/**
	 * 默认下单提前期
	 */
	defaultPreorderDays?: number;
	/**
	 * 扩展对象：REF metadata.XMetaObject(tenantObjName,displayLabel)
	 */
	materialX?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料类别实体定义函数
 */
export const defineMaterialCat = (o: object) => {
	const e = defineEntity<MaterialCat>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.categoryID }
	});
	return e;
}
