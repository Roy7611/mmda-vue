/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生产报工方式
 * 
 * 0;NONE;无|1;MANUAL;手动报工|2;AUTO;自动计件
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProductionReportingMode{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 无
	MANUAL = 'MANUAL',  //1 手动报工
	AUTO = 'AUTO',  //2 自动计件
	
}
export const ProductionReportingModeEnum = {
	NONE_VALUE : 0,
	MANUAL_VALUE : 1,
	AUTO_VALUE : 2,
	
	NONE_TEXT : '无',
	MANUAL_TEXT : '手动报工',
	AUTO_TEXT : '自动计件',

	valueOf(enumCode: ProductionReportingMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductionReportingMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END