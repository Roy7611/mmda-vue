/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生产作业类型
 * 
 * 0;UNKNOWN;-|1;TRIAL;试产|2;VOLUME;量产|3;REWORK;返工|4;COMPLEMENT;补产
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProductionJobType{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	TRIAL = 'TRIAL',  //1 试产
	VOLUME = 'VOLUME',  //2 量产
	REWORK = 'REWORK',  //3 返工
	COMPLEMENT = 'COMPLEMENT',  //4 补产
	
}
export const ProductionJobTypeEnum = {
	UNKNOWN_VALUE : 0,
	TRIAL_VALUE : 1,
	VOLUME_VALUE : 2,
	REWORK_VALUE : 3,
	COMPLEMENT_VALUE : 4,
	
	UNKNOWN_TEXT : '-',
	TRIAL_TEXT : '试产',
	VOLUME_TEXT : '量产',
	REWORK_TEXT : '返工',
	COMPLEMENT_TEXT : '补产',

	valueOf(enumCode: ProductionJobType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductionJobType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END