/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Worker } from './Worker';
import type { Shift } from './Shift';
import type { Station } from './Station';
/**
 * 工人考勤
 * 
 * @remarks 工人考勤
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface WorkerAttendance extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标识ID
	 */
	attendanceID: string;
	/**
	 * 工人：HAS_ONE Worker(workerID,workerName)
	 */
	workerID: string;
	/**
	 * 日期
	 */
	clockDate: string;
	/**
	 * 上班时间
	 */
	clockInTime: string;
	/**
	 * 下班时间
	 */
	clockOutTime?: string;
	/**
	 * 班次：HAS_ONE Shift(shiftID,shiftName)
	 */
	shiftID: string;
	/**
	 * 工位：HAS_ONE Station(stationID,stationName)
	 */
	stationID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 工人
	 */
	worker?: Worker;
	/**
	 * 班次
	 */
	shift?: Shift;
	/**
	 * 工位
	 */
	station?: Station;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工人考勤实体定义函数
 */
export const defineWorkerAttendance = (o: object) => {
	const e = defineEntity<WorkerAttendance>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.attendanceID }
	});
	return e;
}
