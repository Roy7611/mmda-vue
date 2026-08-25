/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 任务关系
 * 
 * 0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;FINISH_TO_FINISH;完成-完成|3;START_TO_FINISH;开始-完成
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum TaskRelationship{
	//#region ~GENERATED PARTS BEGIN
	FINISH_TO_START = 'FINISH_TO_START',  //0 完成-开始
	START_TO_START = 'START_TO_START',  //1 开始-开始
	FINISH_TO_FINISH = 'FINISH_TO_FINISH',  //2 完成-完成
	START_TO_FINISH = 'START_TO_FINISH',  //3 开始-完成
	
}
export const TaskRelationshipEnum = {
	FINISH_TO_START_VALUE : 0,
	START_TO_START_VALUE : 1,
	FINISH_TO_FINISH_VALUE : 2,
	START_TO_FINISH_VALUE : 3,
	
	FINISH_TO_START_TEXT : '完成-开始',
	START_TO_START_TEXT : '开始-开始',
	FINISH_TO_FINISH_TEXT : '完成-完成',
	START_TO_FINISH_TEXT : '开始-完成',

	valueOf(enumCode: TaskRelationship): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: TaskRelationship): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END