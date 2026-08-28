/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
/**
 * 项目结算项
 * 
 * @remarks 项目结算项。根据项目资金计划，核算各往来方的应收应付、扣款、可抵扣税金和已支付金额，计算项目毛利
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-06-24 13:19:55.0
 * 
 */
export interface ProjectSettlementItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 结算标识
	 */
	settlementID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 资金代码
	 */
	capitalCode: string;
	/**
	 * 资金名称
	 */
	capitalName: string;
	/**
	 * 资金流向：0;PROFIT;利润|1;REVENUE;收入|-1;COST;成本费用
	 */
	capitalFlows: number;
	/**
	 * 往来方
	 */
	partnerID: string;
	/**
	 * 结算额
	 */
	settledValue: number;
	/**
	 * 扣款
	 */
	deduct?: number;
	/**
	 * 支付额
	 */
	payedValue?: number;
	/**
	 * 税额
	 */
	taxValue: number;
	/**
	 * 综合税率%
	 * taxValue / (settledValue - ifnull(deduct,0))
	 */
	taxRate?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称，如Contract, SupplyContract, PurchaseOrder等
	 */
	refName?: string;
	/**
	 * 引用单号，如合同号、订单号
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
 * 项目结算项实体定义函数
 */
export const defineProjectSettlementItem = (o: object) => {
	const e = defineEntity<ProjectSettlementItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.settlementID},${this.itemID}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
