/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 设备点检项
 * 
 * @remarks 设备点检项。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:03.0
 * 
 */
export interface EquipmentChecklistItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 点检表标识
	 */
	checklistID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 类别
	 */
	category: string;
	/**
	 * 点检内容
	 */
	itemName: string;
	/**
	 * 判定基准
	 */
	criterion: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备点检项实体定义函数
 */
export const defineEquipmentChecklistItem = (o: object) => {
	const e = defineEntity<EquipmentChecklistItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.checklistID},${this.itemID}` }
	});
	return e;
}
