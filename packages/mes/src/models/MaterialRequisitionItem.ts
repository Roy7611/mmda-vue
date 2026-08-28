/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Material } from '@mmda/base/src/models/Material';
/**
 * 领料单项
 *
 * @remarks 领料单项
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface MaterialRequisitionItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 申请标识
	 */
	reqID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 物料：HAS_ONE base.Material(materialID,materialCode,materialFullName)
	 */
	materialID?: string;
	/**
	 * 申请数量
	 */
	reqQuantity: number;
	/**
	 * 单位，计价单位引用Unit(unit,unit)
	 */
	unit: string;
	/**
	 * 超领数量
	 */
	excessQuantity?: number;
	/**
	 * 发货数量
	 */
	dlvQuantity?: number;
	/**
	 * 发料单价，仓库发货后反写
	 */
	dlvPrice?: number;
	/**
	 * 发料成本
	 * dlvQuantity * dlvPrice
	 */
	dlvCost?: number;
	/**
	 * 用途，部位
	 */
	usage?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如备料单号
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	/**
	 * 项目标识
	 */
	projectID?: string;
	/**
	 * 项目资源标识
	 */
	projectResID?: number;
	/**
	 * 物料
	 */
	material?: Material;
	//#endregion ~GENERATED PARTS END
}
/**
 * 领料单项实体定义函数
 */
export const defineMaterialRequisitionItem = (o: object) => {
	const e = defineEntity<MaterialRequisitionItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.reqID},${this.itemID}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
