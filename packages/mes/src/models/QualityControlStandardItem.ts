/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 品质控制标准项
 * 
 * @remarks 品质控制标准项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:05.0
 * 
 */
export interface QualityControlStandardItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 品控标准标识
	 */
	qcsID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 类别
	 */
	category: string;
	/**
	 * 检查内容
	 */
	itemName: string;
	/**
	 * 判定基准
	 */
	criterion: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 品质控制标准项实体定义函数
 */
export const defineQualityControlStandardItem = (o: object) => {
	const e = defineEntity<QualityControlStandardItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.qcsID},${this.itemID}` }
	});
	return e;
}
