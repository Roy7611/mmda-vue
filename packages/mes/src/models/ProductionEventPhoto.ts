/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 生产事件照片
 * 
 * @remarks 生产事件照片
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 09:10:06.0
 * 
 */
export interface ProductionEventPhoto extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 事件标识
	 */
	eventID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 照片
	 */
	photo: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产事件照片实体定义函数
 */
export const defineProductionEventPhoto = (o: object) => {
	const e = defineEntity<ProductionEventPhoto>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.eventID},${this.itemID}` }
	});
	return e;
}
