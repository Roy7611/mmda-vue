/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 生产作业投料
 * 
 * @remarks 生产作业投料
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:29.0
 * 
 */
export interface ProductionJobFeeding extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 作业标识
	 */
	jobID: string;
	/**
	 * 项次
	 */
	itemID: number;
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
	 * 规格
	 */
	specs?: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 投料数量
	 */
	fedQuantity?: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 投料时间
	 */
	fedTime?: string;
	/**
	 * 批次号
	 */
	lotNo: string;
	/**
	 * 生产日期
	 */
	prodDate?: string;
	/**
	 * 有效日期
	 */
	expiryDate?: string;
	/**
	 * 制造厂家
	 */
	manufacturer?: string;
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产作业投料实体定义函数
 */
export const defineProductionJobFeeding = (o: object) => {
	const e = defineEntity<ProductionJobFeeding>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.jobID},${this.itemID}` }
	});
	return e;
}
