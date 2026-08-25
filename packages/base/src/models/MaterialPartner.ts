/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Partner } from './Partner';
import type { MaterialPackage } from './MaterialPackage';
/**
 * 物料客供伙伴
 * 
 * @remarks 物料客供伙伴
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-16 15:27:50.0
 * 
 */
export interface MaterialPartner extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料标识
	 */
	materialID: string;
	/**
	 * 伙伴：HAS_ONE Partner(partnerID,partnerCode,partnerName)
	 */
	partnerID: string;
	/**
	 * 物料图片
	 */
	materialPic?: string;
	/**
	 * 客(供)货号
	 */
	partnerPartNo?: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 单价
	 */
	unitPrice?: number;
	/**
	 * 包装规格：HAS_ONE MaterialPackage(packID,packFullName) AS pack
	 */
	packID?: string;
	/**
	 * 保质期（天）
	 */
	expirationDays?: number;
	/**
	 * 下单提前期
	 */
	preorderDays?: number;
	/**
	 * 伙伴
	 */
	partner?: Partner;
	/**
	 * 包装规格
	 */
	pack?: MaterialPackage;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料客供伙伴实体定义函数
 */
export const defineMaterialPartner = (o: object) => {
	const e = defineEntity<MaterialPartner>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.materialID},${this.partnerID}` }
	});
	return e;
}
