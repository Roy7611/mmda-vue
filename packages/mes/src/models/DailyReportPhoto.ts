/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 日报照片
 * 
 * @remarks 日报照片
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 23:10:03.0
 * 
 */
export interface DailyReportPhoto extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 报告ID
	 */
	reportID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 照片
	 */
	photo: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 日报照片实体定义函数
 */
export const defineDailyReportPhoto = (o: object) => {
	const e = defineEntity<DailyReportPhoto>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.reportID},${this.itemID}` }
	});
	return e;
}
