/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { RmaType } from '@mmda/base/src/enums/RmaType';
type Supplier = Entity;
type SupplyContract = Entity;
/**
 * 待退货项
 * 
 * @remarks 待退货项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-07 15:42:31.0
 * 
 */
export interface PurchasedReturnableItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 退返类型：0;RETURN;退货|1;REPLACE;换货|2;REPLENISH;补零配件|4;REPAIR_WARRANTY;保修|5;REPAIR;维修
	 */
	rmaType: RmaType;
	/**
	 * 商品标识
	 */
	skuID?: string;
	/**
	 * 物料类别，如机械类、电气类、IT类
	 */
	skuCategory?: string;
	/**
	 * 商品图片
	 */
	skuPic?: string;
	/**
	 * 商品编码
	 */
	skuCode?: string;
	/**
	 * 商品名称及规格
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
	 * 数量
	 */
	quantity: number;
	/**
	 * 退货单价
	 */
	costPrice?: number;
	/**
	 * 退货金额
	 */
	cost?: number;
	/**
	 * 缺陷原因
	 */
	disabledReason?: string;
	/**
	 * 供应商：HAS_ONE Supplier(partnerID,partnerCodeName) AS supplier
	 */
	supplierID: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 购买合同：HAS_ONE SupplyContract(supplyContrID,supplyContrNo,supplyContrName)
	 */
	supplyContrID?: string;
	/**
	 * 引用名称
	 */
	refName: string;
	/**
	 * 申请单号
	 */
	refNo: string;
	/**
	 * 退返修标识
	 */
	refID: string;
	/**
	 * 项次
	 */
	refItemID: number;
	/**
	 * 项目标识
	 */
	projectID?: string;
	/**
	 * 项目物料项次
	 */
	projectResID?: number;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 供应商
	 */
	supplier?: Supplier;
	/**
	 * 购买合同
	 */
	supplyContract?: SupplyContract;
	//#endregion ~GENERATED PARTS END
}
/**
 * 待退货项实体定义函数
 */
export const definePurchasedReturnableItem = (o?: object) => {
	const e = defineEntity<PurchasedReturnableItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.refName},${this.refID},${this.refItemID}` }
	});
	return e;
}
