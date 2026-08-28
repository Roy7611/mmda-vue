/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 数控单元类型
 * 
 * 0;DATA;数据|1;IO;信号|4;ALARM;报警
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ScadaCellType{
	//#region ~GENERATED PARTS BEGIN
	DATA = 'DATA',  //0 数据
	IO = 'IO',  //1 信号
	ALARM = 'ALARM',  //4 报警
	
}
export const ScadaCellTypeEnum = {
	DATA_VALUE : 0,
	IO_VALUE : 1,
	ALARM_VALUE : 4,
	
	DATA_TEXT : '数据',
	IO_TEXT : '信号',
	ALARM_TEXT : '报警',

	valueOf(enumCode: ScadaCellType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ScadaCellType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

