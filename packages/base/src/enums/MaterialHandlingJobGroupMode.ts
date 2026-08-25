/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 物料搬运作业组合模式
 * 
 * 0;NONE;-|1;START;开始|2;CONTINUE;继续|4;FINISH;完成
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum MaterialHandlingJobGroupMode{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	START = 'START',  //1 开始
	CONTINUE = 'CONTINUE',  //2 继续
	FINISH = 'FINISH',  //4 完成
	
}
export const MaterialHandlingJobGroupModeEnum = {
	NONE_VALUE : 0,
	START_VALUE : 1,
	CONTINUE_VALUE : 2,
	FINISH_VALUE : 4,
	
	NONE_TEXT : '-',
	START_TEXT : '开始',
	CONTINUE_TEXT : '继续',
	FINISH_TEXT : '完成',

	valueOf(enumCode: MaterialHandlingJobGroupMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialHandlingJobGroupMode): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

