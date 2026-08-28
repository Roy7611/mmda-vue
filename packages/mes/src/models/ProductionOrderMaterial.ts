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
 * 生产订单原料
 * 
 * @remarks 生产订单原料。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 14:36:00.0
 * 
 */
export interface ProductionOrderMaterial extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 订单标识
	 */
	orderID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 组件号，根据物料信息哈希生成，如果有materialID则使用它来哈希，否则使用materialName,brand,specs,modelType,texture,other来计算
	 */
	partNo: string;
	/**
	 * 材料图片
	 */
	materialPic?: string;
	/**
	 * 物料类别，如机械类、电气类、IT类
	 */
	materialCategory?: string;
	/**
	 * 材料标识
	 */
	materialID?: string;
	/**
	 * 材料编码
	 */
	materialCode: string;
	/**
	 * 材料名称
	 */
	materialName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格型号
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 国标号
	 */
	gbNo?: string;
	/**
	 * 材质/颜色
	 */
	texture?: string;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 单位用量，已经包括损耗
	 */
	unitQuantity: number;
	/**
	 * 总用量
	 */
	totalQuantity: number;
	/**
	 * 成本单价
	 */
	costPrice?: number;
	/**
	 * 计划成本
	 * unitQuantity * costPrice
	 */
	cost?: number;
	/**
	 * 计划成本
	 * totalQuantity * costPrice
	 */
	totalCost?: number;
	/**
	 * 需求日期
	 */
	requiredDate?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 现场装配
	 */
	onSiteAssembly: boolean;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	tracingMode: MaterialTracingMode;
	/**
	 * 已齐套量，齐套时临时分配的数量，包含库存和在途
	 */
	preparedQuantity?: number;
	/**
	 * 缺料总量
	 */
	shortageQuantity?: number;
	/**
	 * 已供应量，从productiontaskfeeding合计
	 */
	suppliedQuantity?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如bomNo
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
 * 生产订单原料实体定义函数
 */
export const defineProductionOrderMaterial = (o: object) => {
	const e = defineEntity<ProductionOrderMaterial>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.orderID},${this.itemID}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
