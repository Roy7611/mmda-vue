/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
/**
 * 质量检验物料
 * 
 * @remarks 质量检验物料。
来料检验引用MaterialTransItem,ReceiptNoteItem, 制程品检验引用ProductionLot, ProductionPlate, ProductionItem，出货检验引用MaterialTransItem,DeliveryOrder
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:31.0
 * 
 */
export interface QualityInspectionMaterial extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 质检标识
	 */
	inspectionID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 物料编码
	 */
	materialCode: string;
	/**
	 * 物料名称
	 */
	materialName?: string;
	/**
	 * 物料类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	materialCategoryID?: string;
	/**
	 * 总数量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 批次/序列号
	 */
	traceNo?: string;
	/**
	 * 取样数量
	 */
	samplingQuantity?: number;
	/**
	 * 质检结果：0;NI;待检品|1;OK;良品|2;DG;瑕疵品|3;AUC;让步接受|4;NG;不良品|8;SCRAP;废品
	 */
	qcResult: QaStatus;
	/**
	 * 质检数量
	 */
	qcQuantity?: number;
	/**
	 * 合格数量
	 */
	qualifiedQuantity?: number;
	/**
	 * 不合格数量
	 */
	unqualifiedQuantity?: number;
	/**
	 * 缺陷标识，NULL表示非标准缺陷
	 */
	defectID?: string;
	/**
	 * 缺陷描述
	 */
	defectDesc?: string;
	/**
	 * 整改否
	 */
	rectified?: boolean;
	/**
	 * 整改数量，返工或补产后反写
	 */
	rectifiedQuantity?: number;
	/**
	 * 引用名称，MaterialTrans,ProductionLot,ProductionPlate等
	 */
	refName?: string;
	/**
	 * 引用单号
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
	 * 物料类别
	 */
	productCategory?: MaterialCat;
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量检验物料实体定义函数
 */
export const defineQualityInspectionMaterial = (o: object) => {
	const e = defineEntity<QualityInspectionMaterial>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.inspectionID},${this.itemID}` }
	});
	return e;
}
