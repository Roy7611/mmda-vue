/**
 * Copyright (c) 2006, 2020, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 质检方法
 * 
 * 0;SAMPLING;抽检|1;ALL;全检
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum QualityInspectionMethod{
	//#region ~GENERATED PARTS BEGIN
	SAMPLING = 'SAMPLING',  //0 抽检
	ALL = 'ALL',  //1 全检
	
}
export const QualityInspectionMethodEnum = {
	SAMPLING_VALUE : 0,
	ALL_VALUE : 1,
	
	SAMPLING_TEXT : '抽检',
	ALL_TEXT : '全检',

	valueOf(enumCode: QualityInspectionMethod): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: QualityInspectionMethod): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

