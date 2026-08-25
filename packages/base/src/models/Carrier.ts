/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import { type CarrierCatalog, defineCarrierCatalog } from './CarrierCatalog';
import { type CarrierProduct, defineCarrierProduct } from './CarrierProduct';
/**
 * 承运商
 * 
 * @remarks 承运商
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Carrier extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 承运商编码
	 */
	carrierCode: string;
	/**
	 * 承运商名称
	 */
	carrierName: string;
	/**
	 * 生产环境地址
	 */
	apiProdUrl?: string;
	/**
	 * 沙箱环境地址
	 */
	apiTestUrl?: string;
	/**
	 * 产品目录
	 */
	catalogs?:  CarrierCatalog[];
	/**
	 * 产品
	 */
	products?:  CarrierProduct[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 承运商实体定义函数
 */
export const defineCarrier = (o: object) => {
	const e = defineEntity<Carrier>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.carrierCode }
	});
	//产品目录
	e.catalogs = defineEntityArray(defineCarrierCatalog, e.catalogs);
	//产品
	e.products = defineEntityArray(defineCarrierProduct, e.products);
	return e;
}
