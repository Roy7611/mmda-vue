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
import type { MaterialPackage } from '@mmda/base/src/models/MaterialPackage';
import type { Worker } from './Worker';
/**
 * 生产货组
 *
 * @remarks 生产货组。将生产的半成品、成品包装成一组，方便码盘、入库。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:30.0
 *
 */
export interface ProductionPlate extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 生产货组ID
	 */
	plateID: string;
	/**
	 * 生产货组编号
	 */
	plateNo: string;
	/**
	 * 生产日期
	 */
	prodDate: string;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,taskNo) AS task
	 */
	taskID: string;
	/**
	 * 制品编码
	 */
	productCode: string;
	/**
	 * 制品名称
	 */
	productName?: string;
	/**
	 * 产出数量
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
	 * 上级货组ID，例如托盘
	 */
	parentPlateID?: string;
	/**
	 * 班次：REF Shift(shiftID,shiftName)
	 */
	shiftID: string;
	/**
	 * 班组：HAS_ONE Worker(workerID,workerName)
	 */
	workerID?: string;
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
	 * 标签
	 */
	tags?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如销售订单号
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
	 * 包装规格
	 */
	pack?: MaterialPackage;
	/**
	 * 班组
	 */
	worker?: Worker;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产货组实体定义函数
 */
export const defineProductionPlate = (o: object) => {
	const e = defineEntity<ProductionPlate>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.plateID }
	});
	return e;
}
