/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 承运商产品服务
 * 
 * @remarks 承运商产品服务
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface CarrierProduct extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 承运商编码
	 */
	carrierCode: string;
	/**
	 * 产品类别
	 */
	catalogCode: string;
	/**
	 * 产品编码
	 */
	prodCode: string;
	/**
	 * 产品名称
	 */
	prodName: string;
	/**
	 * 产品描述
	 */
	prodDesc?: string;
	/**
	 * 增值服务
	 */
	valueAdded: boolean;
	/**
	 * 可选参数项，例如尾托取件增值服务有委托类型(1;保密|2;带函|3;保密+带函)
	 */
	prodOptions?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 承运商产品服务实体定义函数
 */
export const defineCarrierProduct = (o: object) => {
	const e = defineEntity<CarrierProduct>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.carrierCode},${this.catalogCode},${this.prodCode}` }
	});
	return e;
}
