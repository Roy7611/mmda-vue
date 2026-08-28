/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 备品备件
 * 
 * @remarks 备品备件
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:28.0
 * 
 */
export interface EquipmentSparePart extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料标识，可以是不入库的外部物料，控制必须有组件编号
	 */
	partID?: string;
	/**
	 * 物料编码
	 */
	partCode?: string;
	/**
	 * 物料名称
	 */
	partName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格，通常标准尺寸格式为L*W*H(mm)
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
	 * BOM标识
	 */
	bomID: string;
	/**
	 * 制品编码
	 */
	equipNo?: string;
	/**
	 * 制品名称，物料全称
	 */
	equipName: string;
	/**
	 * 
	 */
	equipNum: string;
	/**
	 * 
	 */
	partBaseQuantity?: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 
	 */
	partRequiredQuantity?: number;
	/**
	 * 
	 */
	linesideInvQuantity?: number;
	/**
	 * 
	 */
	shortage?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 备品备件实体定义函数
 */
export const defineEquipmentSparePart = (o: object) => {
	const e = defineEntity<EquipmentSparePart>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.partID }
	});
	return e;
}
