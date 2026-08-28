/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 制程品控状态
 * 
 * 0;NONE;-|1;FP_INSPECTED;首件已检验|2;PATROL_INSPECTED;已巡检|4;LP_INSPECTED;末件已检验
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum InProgressQcStatus{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	FP_INSPECTED = 'FP_INSPECTED',  //1 首件已检验
	PATROL_INSPECTED = 'PATROL_INSPECTED',  //2 已巡检
	LP_INSPECTED = 'LP_INSPECTED',  //4 末件已检验
	
}
export const InProgressQcStatusEnum = {
	NONE_VALUE : 0,
	FP_INSPECTED_VALUE : 1,
	PATROL_INSPECTED_VALUE : 2,
	LP_INSPECTED_VALUE : 4,
	
	NONE_TEXT : '-',
	FP_INSPECTED_TEXT : '首件已检验',
	PATROL_INSPECTED_TEXT : '已巡检',
	LP_INSPECTED_TEXT : '末件已检验',

	valueOf(enumCode: InProgressQcStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: InProgressQcStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
