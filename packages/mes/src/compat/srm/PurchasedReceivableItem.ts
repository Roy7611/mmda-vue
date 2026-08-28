/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
type Supplier = Entity;
type SupplyContract = Entity;
/**
 * 待收货项
 * 
 * @remarks 待收货项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-01 00:04:30.0
 * 
 */
export interface PurchasedReceivableItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 商品标识
	 */
	skuID?: string;
	/**
	 * 商品图片
	 */
	skuPic?: string;
	/**
	 * 商品编码
	 */
	skuCode?: string;
	/**
	 * 商品名称
	 */
	skuName: string;
	/**
	 * 规格型号
	 */
	specs?: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 待收数量
	 */
	receivableQuantity?: number;
	/**
	 * 采购单价
	 */
	purchasePrice: number;
	/**
	 * 不含税价
	 */
	costPrice: number;
	/**
	 * 待收金额
	 */
	receivableAmount?: number;
	/**
	 * 待收成本
	 */
	receivableCost?: number;
	/**
	 * 含进项税否
	 */
	includeTax?: boolean;
	/**
	 * 税率%
	 */
	taxRate: number;
	/**
	 * 进项税金
	 */
	tax?: number;
	/**
	 * 交货期限
	 */
	deliverDeadline?: string;
	/**
	 * 图号
	 */
	drawingNo?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 订单日期
	 */
	orderDate: string;
	/**
	 * 供应商：HAS_ONE Supplier(partnerID,partnerCodeName) AS supplier
	 */
	supplierID?: string;
	/**
	 * 供应合同：HAS_ONE SupplyContract(supplyContrID,supplyContrName) WHERE(subContractMode>1)
	 */
	supplyContrID?: string;
	/**
	 * 项目ID
	 */
	projectID?: string;
	/**
	 * 项目资源ID
	 */
	projectResID?: number;
	/**
	 * 引用名称：REF sycloud_metadata.MetaObject(objName,displayName)
	 */
	refName: string;
	/**
	 * 引用标识
	 */
	refID: string;
	/**
	 * 引用单号
	 */
	refNo: string;
	/**
	 * 引用序号
	 */
	refItemID: number;
	/**
	 * 供应商
	 */
	supplier?: Supplier;
	/**
	 * 供应合同
	 */
	supplyContract?: SupplyContract;
	//#endregion ~GENERATED PARTS END
}
/**
 * 待收货项实体定义函数
 */
export const definePurchasedReceivableItem = (o?: object) => {
	const e = defineEntity<PurchasedReceivableItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.refName},${this.refID},${this.refItemID}` }
	});
	return e;
}
