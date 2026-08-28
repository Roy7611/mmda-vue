/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 在制品转移模式
 * 
 * 0;SHIFT;每班次|1;EACH;每件|2;BATCH;批量|4;PERIODIC;定期
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum WipTransMode{
	//#region ~GENERATED PARTS BEGIN
	SHIFT = 'SHIFT',  //0 每班次
	EACH = 'EACH',  //1 每件
	BATCH = 'BATCH',  //2 批量
	PERIODIC = 'PERIODIC',  //4 定期
	
}
export const WipTransModeEnum = {
	SHIFT_VALUE : 0,
	EACH_VALUE : 1,
	BATCH_VALUE : 2,
	PERIODIC_VALUE : 4,
	
	SHIFT_TEXT : '每班次',
	EACH_TEXT : '每件',
	BATCH_TEXT : '批量',
	PERIODIC_TEXT : '定期',

	valueOf(enumCode: WipTransMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: WipTransMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
