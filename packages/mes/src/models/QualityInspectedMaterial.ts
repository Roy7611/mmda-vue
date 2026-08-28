/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QcPhase } from '@mmda/base/src/enums/QcPhase';
import type { QcInProcessType } from '../enums/QcInProcessType';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { ProductionTask } from './ProductionTask';
import type { ProductionJob } from './ProductionJob';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
/**
 * 已检验物料
 *
 * @remarks 已检验物料
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:31.0
 *
 */
export interface QualityInspectedMaterial extends Entity {
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
	 * 检验日期
	 */
	inspectedDate?: string;
	/**
	 * 品控类型：0;QA;品质保证|1;IQC;来料品检|2;IPQC;制程品质管控|3;PQC;半成品检验|4;FQC;产终检验|5;OQC;出货检验
	 */
	qcPhase: QcPhase;
	/**
	 * 制程品控类型：0;NONE;无|1;FIRST_PIECE;首件检验|2;PATROL_INSPECTION;过程巡检|4;LAST_PIECE;末件终验
	 */
	inProcessType: QcInProcessType;
	/**
	 * 检验员
	 */
	inspector?: string;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,taskNo) AS task
	 */
	taskID?: string;
	/**
	 * 生产作业：HAS_ONE ProductionJob(jobID,jobNo) AS job
	 */
	jobID?: string;
	/**
	 * 物料类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	materialCategoryID?: string;
	/**
	 * 物料编码
	 */
	materialCode: string;
	/**
	 * 物料名称
	 */
	materialName?: string;
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
	qcQuantity?: number;
	/**
	 * 缺陷标识，NULL表示非标准缺陷
	 */
	defectID?: string;
	/**
	 * 缺陷描述
	 */
	defectDesc?: string;
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
	 * 生产任务
	 */
	task?: ProductionTask;
	/**
	 * 生产作业
	 */
	job?: ProductionJob;
	/**
	 * 物料类别
	 */
	productCategory?: MaterialCat;
	//#endregion ~GENERATED PARTS END
}
/**
 * 已检验物料实体定义函数
 */
export const defineQualityInspectedMaterial = (o: object) => {
	const e = defineEntity<QualityInspectedMaterial>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.inspectionID},${this.itemID}` }
	});
	return e;
}
