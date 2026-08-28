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
import type { Worker } from './Worker';
import { type ProductionItemTool, defineProductionItemTool } from './ProductionItemTool';
import { type ProductionItemJournal, defineProductionItemJournal } from './ProductionItemJournal';
import { type ProductionItemParam, defineProductionItemParam } from './ProductionItemParam';
import { type ProductionItemAlarm, defineProductionItemAlarm } from './ProductionItemAlarm';
/**
 * 生产单件
 *
 * @remarks 生产单件。在造型线填砂工位生成，后续历经每个工位全制程追踪。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProductionItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 单件标识
	 */
	itemID: string;
	/**
	 * 单件序列号
	 */
	itemNo?: string;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,productCode,taskQuantity,unit) AS task
	 */
	taskID: string;
	/**
	 * 生产作业：REF_ONE ProductionJob(jobID,jobNo) AS job
	 */
	jobID?: string;
	/**
	 * 序列号，指最后打码
	 */
	serialNo?: string;
	/**
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称
	 */
	productName: string;
	/**
	 * 班次：REF Shift(shiftID,shiftName)
	 */
	shiftID?: string;
	/**
	 * 工人：HAS_ONE Worker(workerID,workerName)
	 */
	workerID?: string;
	/**
	 * 当前工位
	 */
	currentStationNo?: string;
	/**
	 * 开工时间
	 */
	startTime?: string;
	/**
	 * 完工时间
	 */
	finishTime?: string;
	/**
	 * 生产货组
	 */
	plateID?: string;
	/**
	 * 批次号，如果有值用于汇总到生产批
	 */
	lotNo?: string;
	/**
	 * 质检结果：0;NI;待检品|1;OK;良品|2;DG;瑕疵品|3;AUC;让步接受|4;NG;不良品|8;SCRAP;废品
	 */
	qcResult: QaStatus;
	/**
	 * 瑕疵次数
	 */
	ngTimes: number;
	/**
	 * 创建日期
	 */
	createDate: string;
	/**
	 * 最后修改
	 */
	lastModified: string;
	/**
	 * 用具
	 */
	tools?:  ProductionItemTool[];
	/**
	 * 日志
	 */
	journals?: ProductionItemJournal[];
	/**
	 * 参数
	 */
	params?: ProductionItemParam[];
	/**
	 * 报警
	 */
	alarms?: ProductionItemAlarm[];
	/**
	 * 生产任务
	 */
	task?: ProductionTask;
	/**
	 * 工人
	 */
	worker?: Worker;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产单件实体定义函数
 */
export const defineProductionItem = (o: object) => {
	const e = defineEntity<ProductionItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.itemID }
	});
	//用具
	e.tools = defineEntityArray(defineProductionItemTool, e.tools);
	//日志
	e.journals = defineEntityArray(defineProductionItemJournal, e.journals);
	//参数
	e.params = defineEntityArray(defineProductionItemParam, e.params);
	//报警
	e.alarms = defineEntityArray(defineProductionItemAlarm, e.alarms);
	return e;
}
