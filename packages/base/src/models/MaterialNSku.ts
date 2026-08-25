/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { MaterialType } from '../enums/MaterialType';
import type { MaterialTracingMode } from '../enums/MaterialTracingMode';
import type { CirculationSpeed } from '../enums/CirculationSpeed';
import type { UsageStatus } from '../enums/UsageStatus';
import type { MaterialCat } from './MaterialCat';
/**
 * 物料SKU
 * 
 * @remarks 物料SKU
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface MaterialNSku extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 
	 */
	skuID: string;
	/**
	 * 物料标识
	 */
	materialID: string;
	/**
	 * 物料编码
	 */
	materialCode: string;
	/**
	 * 物料用途：0;LABOR;劳动力|1;RAW_MATERIAL;原材料|2;PART;零配件|4;SEMI_PRODUCT;半成品|8;PRODUCT;产成品|16;TOOLS;机具设备|32;PACKAGING;包材|64;CONSUMABLE;办公用品|128;OTHER;其他
	 */
	materialType: MaterialType;
	/**
	 * 分类：HAS_ONE MaterialCat(categoryID,categoryName,parentCatID) AS category
	 */
	categoryID: string;
	/**
	 * 
	 */
	skuPic?: string;
	/**
	 * 
	 */
	skuCode: string;
	/**
	 * 
	 */
	skuName?: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 最小数量，销售时通常按此数量报价
	 */
	minQty?: number;
	/**
	 * 单位，计价单位引用Unit(unit,unit)
	 */
	unit: string;
	/**
	 * 安全库存量，所有库存相加低于此数量报警
	 */
	safetyStockQty?: number;
	/**
	 * 启用包装
	 */
	supportPackage: boolean;
	/**
	 * 特征SKU，0表示不启用特征和SKU
	 */
	featuredSku: boolean;
	/**
	 * 
	 */
	costPrice?: number;
	/**
	 * 
	 */
	salesPrice?: number;
	/**
	 * 质检比例
	 */
	qcRatio: number;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	trackingMode: MaterialTracingMode;
	/**
	 * 流通速率：0;UNKNOWN;-|1;HIGH;高速|2;MEDIUM;中速|3;LOW;低速|4;DEAD;呆滞
	 */
	turnoverFrequency: CirculationSpeed;
	/**
	 * 保质期（天）
	 */
	expirationDays?: number;
	/**
	 * 下单提前期
	 */
	preorderDays?: number;
	/**
	 * 客(供)货号
	 */
	partnerPartNo?: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 
	 */
	extKey?: string;
	/**
	 * 分类
	 */
	category?: MaterialCat;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料SKU实体定义函数
 */
export const defineMaterialNSku = (o: object) => {
	const e = defineEntity<MaterialNSku>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.skuID }
	});
	return e;
}
