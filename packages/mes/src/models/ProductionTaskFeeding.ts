/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaterialTracingMode } from '@mmda/base/src/enums/MaterialTracingMode';
/**
 * 生产任务投料
 *
 * @remarks 生产任务投料
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:30.0
 *
 */
export interface ProductionTaskFeeding extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 任务标识
	 */
	taskID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 物料类别
	 */
	materialCategory?: string;
	/**
	 * 组件号，根据物料信息哈希生成，如果引用了此表本身则直接使用
	 */
	partNo: string;
	/**
	 * 物料标识
	 */
	materialID?: string;
	/**
	 * 物料编码
	 */
	materialCode: string;
	/**
	 * 物料名称
	 */
	materialName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 材质
	 */
	texture?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 配额数量
	 */
	quotaQuantity?: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 已领数量
	 */
	reqQuantity?: number;
	/**
	 * 已退数量
	 */
	retQuantity?: number;
	/**
	 * 投料数量
	 */
	fedQuantity?: number;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	tracingMode: MaterialTracingMode;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如零料单号
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产任务投料实体定义函数
 */
export const defineProductionTaskFeeding = (o: object) => {
	const e = defineEntity<ProductionTaskFeeding>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.taskID},${this.itemID}` }
	});
	return e;
}
