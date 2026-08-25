/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 许可状态
 * 
 * 0;UNLICENSED;未经许可|1;TRIAL_LICENSED;试用许可|2;LICENSED;正式许可|4;LICENSE_EXPIRED;许可过期
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum LicenseStatus{
	//#region ~GENERATED PARTS BEGIN
	UNLICENSED = 'UNLICENSED',  //0 未经许可
	TRIAL_LICENSED = 'TRIAL_LICENSED',  //1 试用许可
	LICENSED = 'LICENSED',  //2 正式许可
	LICENSE_EXPIRED = 'LICENSE_EXPIRED',  //4 许可过期
	
}
export const LicenseStatusEnum = {
	UNLICENSED_VALUE : 0,
	TRIAL_LICENSED_VALUE : 1,
	LICENSED_VALUE : 2,
	LICENSE_EXPIRED_VALUE : 4,
	
	UNLICENSED_TEXT : '未经许可',
	TRIAL_LICENSED_TEXT : '试用许可',
	LICENSED_TEXT : '正式许可',
	LICENSE_EXPIRED_TEXT : '许可过期',

	valueOf(enumCode: LicenseStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: LicenseStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END