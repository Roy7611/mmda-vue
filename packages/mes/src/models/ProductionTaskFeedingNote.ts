/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Worksite } from './Worksite';
/**
 * 生产任务投料记录
 *
 * @remarks 生产任务投料记录
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-10-21 17:13:33.0
 *
 */
export interface ProductionTaskFeedingNote extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 投料记录标识
	 */
	fedID: string;
	/**
	 * 投料时间
	 */
	fedTime?: string;
	/**
	 * 投料站点：HAS_ONE WorkSite(siteID,siteNo,siteName) AS fedSite
	 */
	fedSiteID?: string;
	/**
	 * 追溯码，批次号或者序列号，序列号多个逗号隔开
	 */
	traceCodes?: string;
	/**
	 * 投料数量
	 */
	fedQuantity?: number;
	/**
	 * 生产日期
	 */
	prodDate?: string;
	/**
	 * 有效日期
	 */
	expiryDate?: string;
	/**
	 * 制造厂家
	 */
	manufacturer?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 任务标识，taskID
	 */
	taskID?: string;
	/**
	 * 引用序号，ProductionTaskFeeding.itemID
	 */
	feedingItemID?: number;
	/**
	 * 生产作业标识，ProductionJob.jobID
	 */
	jobID?: string;
	/**
	 * 投料站点
	 */
	fedSite?: Worksite;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产任务投料记录实体定义函数
 */
export const defineProductionTaskFeedingNote = (o: object) => {
	const e = defineEntity<ProductionTaskFeedingNote>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.fedID }
	});
	return e;
}
