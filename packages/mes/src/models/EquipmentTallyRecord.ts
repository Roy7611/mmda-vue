/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { EquipmentCheckResult } from '../enums/EquipmentCheckResult';
/**
 * 设备点检记录
 * 
 * @remarks 设备点检记录。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:03.0
 * 
 */
export interface EquipmentTallyRecord extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 计分表标识
	 */
	tallyID: string;
	/**
	 * 点检项次
	 */
	itemID: number;
	/**
	 * 点检表标识，为NULL表示临时增项
	 */
	checklistID?: string;
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
	/**
	 * 检查结果：0;NONE;-|1;OK;正常|2;EX;异常|3;EX_OK;异常修复
	 */
	checkResult: EquipmentCheckResult;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备点检记录实体定义函数
 */
export const defineEquipmentTallyRecord = (o: object) => {
	const e = defineEntity<EquipmentTallyRecord>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.tallyID},${this.itemID}` }
	});
	return e;
}
