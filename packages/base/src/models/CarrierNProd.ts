/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 承运商和产品
 * 
 * @remarks 承运商产品
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface CarrierNProd extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 
	 */
	carrierProdCode?: string;
	/**
	 * 
	 */
	carrierProdName?: string;
	/**
	 * 
	 */
	depth: number;
	/**
	 * 
	 */
	prodName: string;
	/**
	 * 
	 */
	catalogCode?: string;
	/**
	 * 
	 */
	catalogName?: string;
	/**
	 * 
	 */
	carrierCode: string;
	/**
	 * 
	 */
	carrierName: string;
	/**
	 * 
	 */
	prodDesc?: string;
	/**
	 * 
	 */
	valueAdded: number;
	/**
	 * 
	 */
	prodParams?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 承运商和产品实体定义函数
 */
export const defineCarrierNProd = (o: object) => {
	const e = defineEntity<CarrierNProd>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.carrierProdCode }
	});
	return e;
}
