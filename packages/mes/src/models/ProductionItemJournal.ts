/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { Worker } from './Worker';
import type { Equipment } from './Equipment';
/**
 * 生产件日志
 *
 * @remarks 生产件日志。指单件制品历经制程工艺的整个过程记录。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProductionItemJournal extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 铸件标识
	 */
	itemID: string;
	/**
	 * 加工日期
	 */
	opDate: string;
	/**
	 * 加工工位：REF Station(stationID,stationNo,stationName)
	 */
	stationID: string;
	/**
	 * 加工工序，例如起模、浇注
	 */
	opCodeName: string;
	/**
	 * 开始时间
	 */
	startTime?: string;
	/**
	 * 完成时间
	 */
	finishTime?: string;
	/**
	 * 加工设备：REF_ONE Equipment(equipID,equipNo,equipName) AS equipment
	 */
	equipID?: string;
	/**
	 * 操作工人：REF_ONE Worker(workerID,workerNo,workerName) AS worker
	 */
	workerID?: string;
	/**
	 * 质检结果：0;NI;待检品|1;OK;良品|2;DG;瑕疵品|3;AUC;让步接受|4;NG;不良品|8;SCRAP;废品
	 */
	qcResult: QaStatus;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产件日志实体定义函数
 */
export const defineProductionItemJournal = (o: object) => {
	const e = defineEntity<ProductionItemJournal>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.itemID},${this.opDate},${this.stationID},${this.opCodeName}` }
	});
	return e;
}
