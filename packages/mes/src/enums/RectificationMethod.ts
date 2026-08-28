/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 整改措施
 * 
 * 0;NONE;-|1;REWORK;返工|2;TRANSFORM;改作它用|4;SCRAP_MAKEUP;报废补产
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum RectificationMethod{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	REWORK = 'REWORK',  //1 返工
	TRANSFORM = 'TRANSFORM',  //2 改作它用
	SCRAP_MAKEUP = 'SCRAP_MAKEUP',  //4 报废补产
	
}
export const RectificationMethodEnum = {
	NONE_VALUE : 0,
	REWORK_VALUE : 1,
	TRANSFORM_VALUE : 2,
	SCRAP_MAKEUP_VALUE : 4,
	
	NONE_TEXT : '-',
	REWORK_TEXT : '返工',
	TRANSFORM_TEXT : '改作它用',
	SCRAP_MAKEUP_TEXT : '报废补产',

	valueOf(enumCode: RectificationMethod): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RectificationMethod): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END