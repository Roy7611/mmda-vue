/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备参数日志化
 * 
 * 0;NEVER;从不|1;ALWAYS;总是|2;ON_CHANGE;变化时
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum DeviceDataJournalizability{
	//#region ~GENERATED PARTS BEGIN
	NEVER = 'NEVER',  //0 从不
	ALWAYS = 'ALWAYS',  //1 总是
	ON_CHANGE = 'ON_CHANGE',  //2 变化时
	
}
export const DeviceDataJournalizabilityEnum = {
	NEVER_VALUE : 0,
	ALWAYS_VALUE : 1,
	ON_CHANGE_VALUE : 2,
	
	NEVER_TEXT : '从不',
	ALWAYS_TEXT : '总是',
	ON_CHANGE_TEXT : '变化时',

	valueOf(enumCode: DeviceDataJournalizability): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DeviceDataJournalizability): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END