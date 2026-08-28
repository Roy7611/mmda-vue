/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaterialType } from '@mmda/base/src/enums/MaterialType';
/**
 * 器具类别
 * 
 * @remarks 器具类别
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-26 01:16:16.0
 * 
 */
export interface ToolCategory extends Entity {
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
	 * 物料扩展对象：REF metadata.XMetaObject(tenantObjName,displayLabel)
	 */
	materialX?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 器具类别实体定义函数
 */
export const defineToolCategory = (o: object) => {
	const e = defineEntity<ToolCategory>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.categoryID }
	});
	return e;
}
