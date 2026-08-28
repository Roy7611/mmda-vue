/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QcPhase } from '@mmda/base/src/enums/QcPhase';
import type { QaMethod } from '@mmda/base/src/enums/QaMethod';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { type QualityControlStandardItem, defineQualityControlStandardItem } from './QualityControlStandardItem';
/**
 * 质量控制标准
 *
 * @remarks 质量控制标准
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:05.0
 *
 */
export interface QualityControlStandard extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 品控标准标识
	 */
	qcsID: string;
	/**
	 * 品控标准编号
	 */
	qcsNo: string;
	/**
	 * 品控标准名称
	 */
	qcsName: string;
	/**
	 * 品控阶段：0;QA;品质保证|1;IQC;来料品检|2;IPQC;制程品质管控|3;PQC;半成品检验|4;FQC;产终检验|5;OQC;出货检验
	 */
	qcPhase: QcPhase;
	/**
	 * 检验方法：0;SAMPLING;抽检|1;ALL;全检
	 */
	inspectionMethod: QaMethod;
	/**
	 * 抽检比例
	 */
	samplingRatio?: number;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 标签
	 */
	tags?: string;
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
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 检查项
	 */
	items: QualityControlStandardItem[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量控制标准实体定义函数
 */
export const defineQualityControlStandard = (o: object) => {
	const e = defineEntity<QualityControlStandard>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.qcsID }
	});
	//检查项
	e.items = defineEntityArray(defineQualityControlStandardItem, e.items);
	return e;
}
