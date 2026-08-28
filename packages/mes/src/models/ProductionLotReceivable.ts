/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 生产批次待收项
 * 
 * @remarks 生产批次待收项
 * 
 * @author mmda codebot 
 * @version 3.0.0 
 * @since 2024-08-07 10:30:04.0
 * 
 */
export interface ProductionLotReceivable extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 
	 */
	partNo?: string;
	/**
	 * 制品编码
	 */
	materialCode: string;
	/**
	 * 
	 */
	quantity?: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 批次号
	 */
	lotNo: string;
	/**
	 * 生产日期
	 */
	prodDate: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 订单标识
	 */
	orderID: string;
	/**
	 * 计划标识
	 */
	planID: string;
	/**
	 * 
	 */
	refName: string;
	/**
	 * 批次标识
	 */
	refID: string;
	/**
	 * 批次号
	 */
	refNo: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产批次待收项实体定义函数
 */
export const defineProductionLotReceivable = (o: object) => {
	const e = defineEntity<ProductionLotReceivable>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.refID }
	});
	return e;
}
