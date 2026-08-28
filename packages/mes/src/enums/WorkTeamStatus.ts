/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 状态
 * 
 * 0;NEW;新|1;ACTIVE;可用|4;OFF_DUTY;不可用|-1;DISBANDED;解散
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum WorkTeamStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	ACTIVE = 'ACTIVE',  //1 可用
	OFF_DUTY = 'OFF_DUTY',  //4 不可用
	DISBANDED = 'DISBANDED',  //-1 解散
	
}
export const WorkTeamStatusEnum = {
	NEW_VALUE : 0,
	ACTIVE_VALUE : 1,
	OFF_DUTY_VALUE : 4,
	DISBANDED_VALUE : -1,
	
	NEW_TEXT : '新',
	ACTIVE_TEXT : '可用',
	OFF_DUTY_TEXT : '不可用',
	DISBANDED_TEXT : '解散',

	valueOf(enumCode: WorkTeamStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: WorkTeamStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
