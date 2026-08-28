/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 制品检验结果
 * 
 * 0;OK;-|1;AUC;让步接受|2;REWORK;返工维修|3;TRANSFORM;改作它用|4;SCRAP;报废补产
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ProductInspectedResult{
	//#region ~GENERATED PARTS BEGIN
	OK = 'OK',  //0 -
	AUC = 'AUC',  //1 让步接受
	REWORK = 'REWORK',  //2 返工维修
	TRANSFORM = 'TRANSFORM',  //3 改作它用
	SCRAP = 'SCRAP',  //4 报废补产
	
}
export const ProductInspectedResultEnum = {
	OK_VALUE : 0,
	AUC_VALUE : 1,
	REWORK_VALUE : 2,
	TRANSFORM_VALUE : 3,
	SCRAP_VALUE : 4,
	
	OK_TEXT : '-',
	AUC_TEXT : '让步接受',
	REWORK_TEXT : '返工维修',
	TRANSFORM_TEXT : '改作它用',
	SCRAP_TEXT : '报废补产',

	valueOf(enumCode: ProductInspectedResult): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductInspectedResult): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

