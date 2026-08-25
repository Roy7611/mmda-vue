/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 重要性
 * 
 * 0;UNKNOWN;-|1;IMPORTANT;重要|2;VERY_IMPORTANT;非常重要
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum Importance {
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	IMPORTANT = 'IMPORTANT',  //1 重要
	VERY_IMPORTANT = 'VERY_IMPORTANT',  //2 非常重要

}
export const ImportanceEnum = {
	UNKNOWN_VALUE: 0,
	IMPORTANT_VALUE: 1,
	VERY_IMPORTANT_VALUE: 2,

	UNKNOWN_TEXT: '-',
	IMPORTANT_TEXT: '重要',
	VERY_IMPORTANT_TEXT: '非常重要',

	valueOf(enumCode: Importance): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Importance): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;

export const importanceList = [
	{
		label: '全部',
		value: null,
	},
	{
		label: ImportanceEnum.textOf(Importance.UNKNOWN),
		value: ImportanceEnum.valueOf(Importance.UNKNOWN),
	},
	{
		label: ImportanceEnum.textOf(Importance.IMPORTANT),
		value: ImportanceEnum.valueOf(Importance.IMPORTANT),
	},
	{
		label: ImportanceEnum.textOf(Importance.VERY_IMPORTANT),
		value: ImportanceEnum.valueOf(Importance.VERY_IMPORTANT),
	},
]

export const importanceLevel = (importance: Importance) => {
	let level = 'info'
	switch (ImportanceEnum.valueOf(importance)) {
		case 0:
			level = 'info'
			break;
		case 1:
			level = 'warn'
			break;
		case 2:
			level = 'error'
			break;

		default:
			break;
	}
	return level
}

//#endregion ~GENERATED PARTS END