/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 退料单项
 * 
 * @remarks 退料单项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:28.0
 * 
 */
export interface MaterialReturnItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 退料单标识
	 */
	returnID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 组件号，根据物料信息哈希生成，如果有materialID则使用它来哈希，否则使用materialName,brand,specs,modelType,texture,other来计算
	 */
	partNo?: string;
	/**
	 * 物料类别
	 */
	materialCategory?: string;
	/**
	 * 物料标识
	 */
	materialID?: string;
	/**
	 * 物料编码，如型材号
	 */
	materialCode?: string;
	/**
	 * 物料名称
	 */
	materialName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格，玻璃为厚度*W*H，型材为算量后定长L
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
	 * 客(供)货号
	 */
	partnerPartNo?: string;
	/**
	 * 退料数量
	 */
	returnQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 退料单价，默认为原单价，仓库收货后反写
	 */
	returnPrice?: number;
	/**
	 * 退料成本
	 * returnQuantity * returnPrice
	 */
	returnCost?: number;
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
	 * 项目合同标识
	 */
	projectID?: string;
	/**
	 * 项目资源标识
	 */
	projectResID?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 退料单项实体定义函数
 */
export const defineMaterialReturnItem = (o: object) => {
	const e = defineEntity<MaterialReturnItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.returnID},${this.itemID}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
