/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备状态
 * 
 * 0;OFFLINE;离线|1;IDLING;待机|2;WORKING;工作中|4;ALARMED;报警
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EquipmentState{
	//#region ~GENERATED PARTS BEGIN
	OFFLINE = 'OFFLINE',  //0 离线
	IDLING = 'IDLING',  //1 待机
	WORKING = 'WORKING',  //2 工作中
	ALARMED = 'ALARMED',  //4 报警
	
}
export const EquipmentStateEnum = {
	OFFLINE_VALUE : 0,
	IDLING_VALUE : 1,
	WORKING_VALUE : 2,
	ALARMED_VALUE : 4,
	
	OFFLINE_TEXT : '离线',
	IDLING_TEXT : '待机',
	WORKING_TEXT : '工作中',
	ALARMED_TEXT : '报警',

	valueOf(enumCode: EquipmentState): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EquipmentState): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

