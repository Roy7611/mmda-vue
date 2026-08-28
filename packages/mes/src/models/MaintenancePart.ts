/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-01-14 15:04:14
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-01-14 16:07:51
 * @FilePath: /mmda-vue/packages/mes/src/models/MaintenancePart.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Material } from '@mmda/base/src/models/Material';
import type { EquipmentSparePart } from "./EquipmentSparePart";
/**
 * 维护配件
 *
 * @remarks 维护配件
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:03.0
 *
 */
export interface MaintenancePart extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工单标识
	 */
	maintenanceID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 配件：HAS_ONE EquipmentSparePart(partID,partCode,partName) AS part
	 * HAS_ONE EquipmentSparePart(materialID,materialCode,materialFullName) AS part
	 */
	partID: string;
	/**
	 * 数量
	 */
	quantity: number;
	/**
	 * 成本单价
	 */
	costPrice: number;
	/**
	 * 成本金额
	 * quantity * costPrice
	 */
	cost?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 配件
	 */
	part?: EquipmentSparePart;
	//#endregion ~GENERATED PARTS END
}
/**
 * 维护配件实体定义函数
 */
export const defineMaintenancePart = (o: object) => {
	const e = defineEntity<MaintenancePart>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.maintenanceID},${this.itemID}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
