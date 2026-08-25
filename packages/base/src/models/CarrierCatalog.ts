/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 承运商服务目录
 * 
 * @remarks 承运商服务目录，如冷运、快运、速运等
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface CarrierCatalog extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 承运商编码
	 */
	carrierCode: string;
	/**
	 * 服务编码
	 */
	catalogCode: string;
	/**
	 * 服务名称
	 */
	catalogName: string;
	/**
	 * 服务参数
	 */
	catalogParams?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 承运商服务目录实体定义函数
 */
export const defineCarrierCatalog = (o: object) => {
	const e = defineEntity<CarrierCatalog>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.carrierCode},${this.catalogCode}` }
	});
	return e;
}
