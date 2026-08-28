/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { MaterialPackage } from '@mmda/base/src/models/MaterialPackage';
/**
 * 生产作业分班
 * 
 * @remarks 生产作业分班
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-31 02:25:15.0
 * 
 */
export interface ProductionJobShift extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 作业ID
	 */
	jobID: string;
	/**
	 * 班次日期
	 */
	shiftDate: string;
	/**
	 * 班次：REF Shift(shiftID,shiftName)
	 */
	shiftID: string;
	/**
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称
	 */
	productName?: string;
	/**
	 * 计划数量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 包装数
	 */
	packQty?: number;
	/**
	 * 包装规格：HAS_ONE base.MaterialPackage(packID,packFullName) AS pack
	 */
	packID?: string;
	/**
	 * 班组：REF_ONE WorkTeam(teamID,teamNo,teamName)
	 */
	workTeamID?: string;
	/**
	 * 报工数量
	 */
	producedQuantity?: number;
	/**
	 * 批次号，如果有值用于汇总至生产批
	 */
	lotNo?: string;
	/**
	 * 质检结果：0;NI;待检品|1;OK;良品|2;DG;瑕疵品|3;AUC;让步接受|4;NG;不良品|8;SCRAP;废品
	 */
	qcResult: QaStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 包装规格
	 */
	pack?: MaterialPackage;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产作业分班实体定义函数
 */
export const defineProductionJobShift = (o: object) => {
	const e = defineEntity<ProductionJobShift>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.jobID},${this.shiftDate},${this.shiftID}` }
	});
	return e;
}
