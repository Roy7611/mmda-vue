/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { AlarmStatus } from '@/compat/iot/AlarmStatus';

/**
 * 生产件报警
 * 
 * @remarks 生产件报警。单件产品在制程中出现的设备报警记录，包括时间、报警内容、工位（地点）。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:04.0
 * 
 */
export interface ProductionItemAlarm extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 生产件标识
	 */
	itemID: string;
	/**
	 * 报警工位：REF Station(stationID,stationNo,stationName)
	 */
	stationID: string;
	/**
	 * 报警时间
	 */
	alarmTime: string;
	/**
	 * 报警编码
	 */
	alarmCode: string;
	/**
	 * 报警设备：REF_ONE Equipment(equipID,equipNo,equipName)
	 */
	equipID?: string;
	/**
	 * 报警消息
	 */
	alarmMessage: string;
	/**
	 * 关闭时间
	 */
	closedTime?: string;
	/**
	 * 状态： 0;NEW;新|1;CLOSED;已关闭|2;AUDIT;已审计|-1;DELETED;已删除
	 */
	status: AlarmStatus;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产件报警实体定义函数
 */
export const defineProductionItemAlarm = (o: object) => {
	const e = defineEntity<ProductionItemAlarm>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.itemID},${this.stationID},${this.alarmTime},${this.alarmCode}` }
	});
	return e;
}
