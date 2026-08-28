/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import type { Site } from './Site';
import { type Station, defineStation } from './Station';
/**
 * 生产线
 *
 * @remarks 生产线
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:04.0
 * 
 */
export interface ProductionLine extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 站点标识
	 */
	lineID: string;
	/**
	 * 站点编码
	 */
	lineNo: string;
	/**
	 * 站点名称
	 */
	lineName: string;
	/**
	 * 所属父站点：HAS_ONE Site(siteID,siteName) AS superSite
	 */
	shopFloorID?: string;
	/**
	 * 生产日历：REF WorkCalendar(calendarID,calendarName)
	 */
	workCalendarID?: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 描述
	 */
	remark?: string;
	/**
	 * 工位
	 */
	stations?:  Station[];
	/**
	 * 所属父站点
	 */
	superSite?: Site;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产线实体定义函数
 */
export const defineProductionLine = (o: object) => {
	const e = defineEntity<ProductionLine>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.lineID }
	});
	//工位
	e.stations = defineEntityArray(defineStation, e.stations);
	return e;
}
