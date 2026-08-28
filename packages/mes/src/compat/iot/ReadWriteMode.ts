/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 读写控制
 * 
 * 0;NA;不可用|1;RO;只读|2;WO;只写|3;RW;读写
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ReadWriteMode{
	//#region ~GENERATED PARTS BEGIN
	NA = 'NA',  //0 不可用
	RO = 'RO',  //1 只读
	WO = 'WO',  //2 只写
	RW = 'RW',  //3 读写
	
}
export const ReadWriteModeEnum = {
	NA_VALUE : 0,
	RO_VALUE : 1,
	WO_VALUE : 2,
	RW_VALUE : 3,
	
	NA_TEXT : '不可用',
	RO_TEXT : '只读',
	WO_TEXT : '只写',
	RW_TEXT : '读写',

	valueOf(enumCode: ReadWriteMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ReadWriteMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
