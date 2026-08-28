/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { RectificationMethod } from '../enums/RectificationMethod';
import type { ProductionTask } from './ProductionTask';
/**
 * 质量异常整改项
 *
 * @remarks 质量异常整改项。数据来源于质量检验单，引用QualityInspection，一旦有整改项，则检验单的rectified变为1
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:05.0
 *
 */
export interface RectificationItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 整改单标识
	 */
	rectificationID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称及规格
	 */
	productName: string;
	/**
	 * 生产数量
	 */
	producedQuantity?: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 缺陷标识，NULL表示非标准缺陷
	 */
	defectID?: string;
	/**
	 * 缺陷描述
	 */
	defectiveDesc?: string;
	/**
	 * 质检结果：0;NI;待检品|1;OK;良品|2;DG;瑕疵品|3;AUC;让步接受|4;NG;不良品|8;SCRAP;废品
	 */
	qcResult: QaStatus;
	/**
	 * 整改数量
	 */
	rectifiableQuantity: number;
	/**
	 * 整改措施：0;NONE;-|1;REWORK;返工|2;TRANSFORM;改作它用|4;SCRAP_MAKEUP;报废补产
	 */
	rectificationMethod: RectificationMethod;
	/**
	 * 整改措施建议
	 */
	rectificationProposal?: string;
	/**
	 * 返工补产任务：HAS_ONE ProductionTask(taskID,taskNo) AS reworkTask
	 */
	reworkTaskID?: string;
	/**
	 * 引用名称
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
	 * 引用任务标识
	 */
	refTaskID?: string;
	/**
	 * 返工补产任务
	 */
	reworkTask?: ProductionTask;
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量异常整改项实体定义函数
 */
export const defineRectificationItem = (o: object) => {
	const e = defineEntity<RectificationItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.rectificationID},${this.itemID}` }
	});
	return e;
}
