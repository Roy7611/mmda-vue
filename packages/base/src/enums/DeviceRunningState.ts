/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备运行状态
 * 
 * 0;OFFLINE;离线|1;WORKING;工作中|2;IDLING;待机|4;ALARMED;报警
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum DeviceRunningState{
	//#region ~GENERATED PARTS BEGIN
	OFFLINE = 'OFFLINE',  //0 离线
	WORKING = 'WORKING',  //1 工作中
	IDLING = 'IDLING',  //2 待机
	ALARMED = 'ALARMED',  //4 报警
	
}
export const DeviceRunningStateEnum = {
	OFFLINE_VALUE : 0,
	WORKING_VALUE : 1,
	IDLING_VALUE : 2,
	ALARMED_VALUE : 4,
	
	OFFLINE_TEXT : '离线',
	WORKING_TEXT : '工作中',
	IDLING_TEXT : '待机',
	ALARMED_TEXT : '报警',

	valueOf(enumCode: DeviceRunningState): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DeviceRunningState): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
