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
import type { QualityInspectionStatus } from '../enums/QualityInspectionStatus';
import type { QualityControlStandard } from './QualityControlStandard';
import type { ProductionTask } from './ProductionTask';
import type { ProductionJob } from './ProductionJob';
import { type QualityInspectionItem, defineQualityInspectionItem } from './QualityInspectionItem';
import { type QualityInspectionMaterial, defineQualityInspectionMaterial } from './QualityInspectionMaterial';
/**
 * 质量检验
 *
 * @remarks 质量检验
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:05.0
 *
 */
export interface QualityInspection extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 质检标识
	 */
	inspectionID: string;
	/**
	 * 质检单号
	 */
	inspectionNo: string;
	/**
	 * 品控标准：HAS_ONE QualityControlStandard(qcsID,qcsNo,qcsName) AS qcStandard
	 */
	qcsID?: string;
	/**
	 * 品控类型：0;QA;品质保证|1;IQC;来料品检|2;IPQC;制程品质管控|3;PQC;半成品检验|4;FQC;产终检验|5;OQC;出货检验
	 */
	qcPhase: QcPhase;
	/**
	 * 制程品控类型：0;NONE;无|1;FIRST_PIECE;首件检验|2;PATROL_INSPECTION;过程巡检|4;LAST_PIECE;末件终验
	 */
	inProcessType: QcInProcessType;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,productCode,taskQuantity,unit) AS task
	 */
	taskID?: string;
	/**
	 * 生产作业：HAS_ONE ProductionJob(jobID,jobNo) AS job
	 */
	jobID?: string;
	/**
	 * 预设否
	 */
	preset: boolean;
	/**
	 * 状态：0;NEW;新|1;SAMPLED;已取样|2;INSPECTING;检验中|4;INSPECTED;已检验
	 */
	status: QualityInspectionStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 总数量
	 */
	totalQuantity?: number;
	/**
	 * 抽样总数
	 */
	totalSampled?: number;
	/**
	 * 合格总数，用于计算合格率%
	 * ifnull(totalGood,0) + ifnull(totalAuc,0)
	 */
	totalQualified?: number;
	/**
	 * 合格率%
	 * totalQualified / totalQuantity
	 */
	qualifiedRate?: number;
	/**
	 * 优良品数，质量完全合格，不包含让步接受的部分
	 */
	totalGood?: number;
	/**
	 * 优良率%
	 * totalGood / totalQuantity
	 */
	goodRate?: number;
	/**
	 * 让步接受数量
	 */
	totalAuc?: number;
	/**
	 * 不合格品总数
	 * ifnull(totalDefective,0) + ifnull(totalNg,0) + ifnull(totalScrap,0)
	 */
	totalUnqualified?: number;
	/**
	 * 不合格率%，作为缺陷率
	 * totalUnqualified / totalQuantity
	 */
	unqualifiedRate?: number;
	/**
	 * 次品数量。指有瑕疵的件数，可进一步返工或直接报废
	 */
	totalDefective?: number;
	/**
	 * 不良品数量
	 */
	totalNg?: number;
	/**
	 * 废品总数，用于计算废品率%
	 */
	totalScrap?: number;
	/**
	 * 废品率%
	 * totalScrap / totalQuantity
	 */
	scrapRate?: number;
	/**
	 * 检验日期
	 */
	inspectedDate?: string;
	/**
	 * 检验员
	 */
	inspector?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
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
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 所有人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 检验项
	 */
	items: QualityInspectionItem[];
	/**
	 * 检验物
	 */
	materials: QualityInspectionMaterial[];
	/**
	 * 品控标准
	 */
	qcStandard?: QualityControlStandard;
	/**
	 * 生产任务
	 */
	task?: ProductionTask;
	/**
	 * 生产作业
	 */
	job?: ProductionJob;
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量检验实体定义函数
 */
export const defineQualityInspection = (o: object) => {
	const e = defineEntity<QualityInspection>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.inspectionID }
	});
	//检验项
	e.items = defineEntityArray(defineQualityInspectionItem, e.items);
	//检验物
	e.materials = defineEntityArray(defineQualityInspectionMaterial, e.materials);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
