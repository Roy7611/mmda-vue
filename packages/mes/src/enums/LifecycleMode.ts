/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生命周期
 * 
 * 0;NONE;-|1;TM;时间|2;FM;次数|4;CM;价值
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum LifecycleMode{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	TM = 'TM',  //1 时间
	FM = 'FM',  //2 次数
	CM = 'CM',  //4 价值
	
}
export const LifecycleModeEnum = {
	NONE_VALUE : 0,
	TM_VALUE : 1,
	FM_VALUE : 2,
	CM_VALUE : 4,
	
	NONE_TEXT : '-',
	TM_TEXT : '时间',
	FM_TEXT : '次数',
	CM_TEXT : '价值',

	valueOf(enumCode: LifecycleMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: LifecycleMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END