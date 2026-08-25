/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
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
import { type MaterialPartner, defineMaterialPartner } from './MaterialPartner';
import { type MaterialFeature, defineMaterialFeature } from './MaterialFeature';
import { type MaterialMedia, defineMaterialMedia } from './MaterialMedia';
import { type Sku, defineSku } from './Sku';
/**
 * 物料
 * 
 * @remarks 物料。原材料
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface Material extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料标识
	 */
	materialID: string;
	/**
	 * 物料用途：0;LABOR;劳动力|1;RAW_MATERIAL;原材料|2;PART;零配件|4;SEMI_PRODUCT;半成品|8;PRODUCT;产成品|16;TOOLS;机具设备|32;PACKAGING;包材|64;CONSUMABLE;办公用品|128;OTHER;其他
	 */
	materialType: MaterialType;
	/**
	 * 分类：HAS_ONE MaterialCat(categoryID,categoryName,parentCatID) AS category
	 */
	categoryID: string;
	/**
	 * 物料图片
	 */
	materialPic?: string;
	/**
	 * 物料编码
	 */
	materialCode: string;
	/**
	 * 物料名称
	 */
	materialName: string;
	/**
	 * 物料全称
	 * concat_ws(' ',brand,materialName,specs,modelType,series,texture,grade,prodPlace,other)
	 */
	materialFullName?: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 系列
	 */
	series?: string;
	/**
	 * 材质
	 */
	texture?: string;
	/**
	 * 等级
	 */
	grade?: string;
	/**
	 * 产地
	 */
	prodPlace?: string;
	/**
	 * 其他
	 */
	other?: string;
	/**
	 * 最小数量，销售时通常按此数量报价
	 */
	minQty?: number;
	/**
	 * 单位，计价单位引用Unit(unit,unit)
	 */
	unit: string;
	/**
	 * 单位重量(KG)
	 */
	unitWeight?: number;
	/**
	 * 单位体积(M3)
	 */
	unitVolume?: number;
	/**
	 * 安全库存量，所有库存相加低于此数量报警
	 */
	safetyStockQty?: number;
	/**
	 * 成本单价，指采购价或出厂价
	 */
	costPrice?: number;
	/**
	 * 销售单价，用于工程项目或批发价
	 */
	salesPrice?: number;
	/**
	 * 零售价
	 */
	retailPrice?: number;
	/**
	 * 质检比例
	 */
	qcRatio: number;
	/**
	 * 特征SKU，0表示不启用特征和SKU
	 */
	featuredSku: boolean;
	/**
	 * 启用包装
	 */
	supportPackage: boolean;
	/**
	 * 追踪供货号，即不同贸易伙伴的物料号追踪
	 */
	tracingPartNo: boolean;
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
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 修改日志标识，引用ChangeLog.logID
	 */
	changeLogID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
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
	 * 外部SKU编码
	 */
	extKey?: string;
	/**
	 * 供货号
	 */
	partNos?:  MaterialPartner[];
	/**
	 * 特征
	 */
	features?:  MaterialFeature[];
	/**
	 * 媒体文件
	 */
	medias?:  MaterialMedia[];
	/**
	 * SKU
	 */
	skus?:  Sku[];
	/**
	 * 分类
	 */
	category?: MaterialCat;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料实体定义函数
 */
export const defineMaterial = (o: object) => {
	const e = defineEntity<Material>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.materialID }
	});
	//供货号
	e.partNos = defineEntityArray(defineMaterialPartner, e.partNos);
	//特征
	e.features = defineEntityArray(defineMaterialFeature, e.features);
	//媒体文件
	e.medias = defineEntityArray(defineMaterialMedia, e.medias);
	//SKU
	e.skus = defineEntityArray(defineSku, e.skus);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
