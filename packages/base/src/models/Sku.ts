/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '../enums/UsageStatus';
import { type SkuFeature, defineSkuFeature } from './SkuFeature';
import { type SkuMedia, defineSkuMedia } from './SkuMedia';
/**
 * Sku
 * 
 * @remarks 产品库存单位Sku
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface Sku extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * SKU标识
	 */
	skuID: string;
	/**
	 * 产品ID
	 */
	materialID: string;
	/**
	 * Sku编码
	 */
	skuCode: string;
	/**
	 * Sku名称
	 */
	skuName: string;
	/**
	 * 图片
	 */
	skuPic?: string;
	/**
	 * 成本价，给代理会员
	 */
	costPrice: number;
	/**
	 * 原价
	 */
	originalPrice: number;
	/**
	 * 销售价
	 */
	salesPrice: number;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 外部SKU编码
	 */
	extKey?: string;
	/**
	 * 特征
	 */
	features?:  SkuFeature[];
	/**
	 * 媒体文件
	 */
	medias?:  SkuMedia[];
	//#endregion ~GENERATED PARTS END
}
/**
 * Sku实体定义函数
 */
export const defineSku = (o: object) => {
	const e = defineEntity<Sku>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.skuID }
	});
	//特征
	e.features = defineEntityArray(defineSkuFeature, e.features);
	//媒体文件
	e.medias = defineEntityArray(defineSkuMedia, e.medias);
	return e;
}
