/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 任务阶段
 * 
 * 0;STAGE;筹划|1;DESIGN;设计|2;MAKE;生产|3;INSTALL;安装|4;TEST;测试|5;ACCEPT;验收
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum TaskPhase{
	//#region ~GENERATED PARTS BEGIN
	STAGE = 'STAGE',  //0 筹划
	DESIGN = 'DESIGN',  //1 设计
	MAKE = 'MAKE',  //2 生产
	INSTALL = 'INSTALL',  //3 安装
	TEST = 'TEST',  //4 测试
	ACCEPT = 'ACCEPT',  //5 验收
	
}
export const TaskPhaseEnum = {
	STAGE_VALUE : 0,
	DESIGN_VALUE : 1,
	MAKE_VALUE : 2,
	INSTALL_VALUE : 3,
	TEST_VALUE : 4,
	ACCEPT_VALUE : 5,
	
	STAGE_TEXT : '筹划',
	DESIGN_TEXT : '设计',
	MAKE_TEXT : '生产',
	INSTALL_TEXT : '安装',
	TEST_TEXT : '测试',
	ACCEPT_TEXT : '验收',

	valueOf(enumCode: TaskPhase): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: TaskPhase): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END