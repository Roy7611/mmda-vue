/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 制程品质管控类型
 * 
 * 0;NONE;无|1;FIRST_PIECE;首件检验|2;PATROL_INSPECTION;过程巡检|4;LAST_PIECE;末件终验
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum QcInProcessType{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 无
	FIRST_PIECE = 'FIRST_PIECE',  //1 首件检验
	PATROL_INSPECTION = 'PATROL_INSPECTION',  //2 过程巡检
	LAST_PIECE = 'LAST_PIECE',  //4 末件终验
	
}
export const QcInProcessTypeEnum = {
	NONE_VALUE : 0,
	FIRST_PIECE_VALUE : 1,
	PATROL_INSPECTION_VALUE : 2,
	LAST_PIECE_VALUE : 4,
	
	NONE_TEXT : '无',
	FIRST_PIECE_TEXT : '首件检验',
	PATROL_INSPECTION_TEXT : '过程巡检',
	LAST_PIECE_TEXT : '末件终验',

	valueOf(enumCode: QcInProcessType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: QcInProcessType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END