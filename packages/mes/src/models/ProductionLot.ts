/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProductionTask } from './ProductionTask';
import type { Worker } from './Worker';
/**
 * 生产批次
 * 
 * @remarks 生产批次。生产订单分批报工、质检。用于混砂、制芯、熔炼这些生产原材料的前置工序。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:04.0
 * 
 */
export interface ProductionLot extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 批次标识
	 */
	lotID: string;
	/**
	 * 批次号
	 */
	lotNo: string;
	/**
	 * 生产日期
	 */
	prodDate: string;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,productCode,taskQuantity,unit) AS task
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
	 * 批次数量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 货组数，有货组的情况合计反写
	 */
	plateQty?: number;
	/**
	 * 班次：REF Shift(shiftID,shiftName)
	 */
	shiftID: string;
	/**
	 * 工人：HAS_ONE Worker(workerID,workerName)
	 */
	workerID?: string;
	/**
	 * 合格数量，包含良品和让步接收
	 * ifnull(goodQuantity,0) + ifnull(aucQuantity,0)
	 */
	qualifiedQuantity?: number;
	/**
	 * 优良品数，质量完全合格，不包含让步接受的部分
	 */
	goodQuantity?: number;
	/**
	 * 让步接受数量
	 */
	aucQuantity?: number;
	/**
	 * 不合格数量，包含瑕疵、不良和废品数，作为缺陷数可按PPM显示
	 * ifnull(defectiveQuantity,0) + ifnull(ngQuantity,0) + ifnull(scrapQuantity,0)
	 */
	unqualifiedQuantity?: number;
	/**
	 * 次品数量。指有瑕疵的件数，可进一步返工或直接报废
	 */
	defectiveQuantity?: number;
	/**
	 * 不良品数量
	 */
	ngQuantity?: number;
	/**
	 * 废品数量
	 */
	scrapQuantity?: number;
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
	 * 工人
	 */
	worker?: Worker;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产批次实体定义函数
 */
export const defineProductionLot = (o: object) => {
	const e = defineEntity<ProductionLot>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.lotID }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
