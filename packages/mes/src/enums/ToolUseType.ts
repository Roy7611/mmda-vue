/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 工具使用类型
 * 
 * 0;MOVE;移动|1;LEND;借出|2;RETURN;归还|3;REPAIR;维修|4;SCRAP;报废|5;DISPOSE;处置
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ToolUseType{
	//#region ~GENERATED PARTS BEGIN
	MOVE = 'MOVE',  //0 移动
	LEND = 'LEND',  //1 借出
	RETURN = 'RETURN',  //2 归还
	REPAIR = 'REPAIR',  //3 维修
	SCRAP = 'SCRAP',  //4 报废
	DISPOSE = 'DISPOSE',  //5 处置
	
}
export const ToolUseTypeEnum = {
	MOVE_VALUE : 0,
	LEND_VALUE : 1,
	RETURN_VALUE : 2,
	REPAIR_VALUE : 3,
	SCRAP_VALUE : 4,
	DISPOSE_VALUE : 5,
	
	MOVE_TEXT : '移动',
	LEND_TEXT : '借出',
	RETURN_TEXT : '归还',
	REPAIR_TEXT : '维修',
	SCRAP_TEXT : '报废',
	DISPOSE_TEXT : '处置',

	valueOf(enumCode: ToolUseType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ToolUseType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END