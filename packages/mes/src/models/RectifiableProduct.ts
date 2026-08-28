/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { ProductionTask } from './ProductionTask';
/**
 * 待整改制品
 *
 * @remarks 待整改制品
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:31.0
 *
 */
export interface RectifiableProduct extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料编码
	 */
	productCode: string;
	/**
	 * 物料名称
	 */
	productName?: string;
	/**
	 * 总数量
	 */
	producedQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
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
	rectifiableQuantity?: number;
	/**
	 * 缺陷描述
	 */
	defectDesc?: string;
	/**
	 * 检验日期
	 */
	inspectedDate?: string;
	/**
	 * 检验员
	 */
	inspector?: string;
	/**
	 *
	 */
	refName: string;
	/**
	 * 质检单号
	 */
	refNo: string;
	/**
	 * 质检标识
	 */
	refID: string;
	/**
	 * 项次
	 */
	refItemID: number;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,taskNo) AS task
	 */
	refTaskID?: string;
	/**
	 * 生产任务
	 */
	task?: ProductionTask;
	//#endregion ~GENERATED PARTS END
}
/**
 * 待整改制品实体定义函数
 */
export const defineRectifiableProduct = (o: object) => {
	const e = defineEntity<RectifiableProduct>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.refName},${this.refID},${this.refItemID}` }
	});
	return e;
}
