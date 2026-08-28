/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 项目验收类型
 * 
 * 0;PRELIMINARY;初验|1;FINAL;终验
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProjectCheckType{
	//#region ~GENERATED PARTS BEGIN
	PRELIMINARY = 'PRELIMINARY',  //0 初验
	FINAL = 'FINAL',  //1 终验
	
}
export const ProjectCheckTypeEnum = {
	PRELIMINARY_VALUE : 0,
	FINAL_VALUE : 1,
	
	PRELIMINARY_TEXT : '初验',
	FINAL_TEXT : '终验',

	valueOf(enumCode: ProjectCheckType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProjectCheckType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
