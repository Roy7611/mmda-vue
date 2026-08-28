/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 工序阶段
 * 
 * 0;PREPARE;准备|1;START;启动|2;MID;中间|4;END;结束
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum OpPhase{
	//#region ~GENERATED PARTS BEGIN
	PREPARE = 'PREPARE',  //0 准备
	START = 'START',  //1 启动
	MID = 'MID',  //2 中间
	END = 'END',  //4 结束
	
}
export const OpPhaseEnum = {
	PREPARE_VALUE : 0,
	START_VALUE : 1,
	MID_VALUE : 2,
	END_VALUE : 4,
	
	PREPARE_TEXT : '准备',
	START_TEXT : '启动',
	MID_TEXT : '中间',
	END_TEXT : '结束',

	valueOf(enumCode: OpPhase): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: OpPhase): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END