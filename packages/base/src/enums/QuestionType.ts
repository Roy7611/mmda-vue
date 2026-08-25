/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 题型
 * 
 * 0;FILL_IN;填空|1;SINGLE_CHOICE;单选|2;MULTIPLE_CHOICES;多选|3;CHECK;判断|4;FILE;文件
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum QuestionType{
	//#region ~GENERATED PARTS BEGIN
	FILL_IN = 'FILL_IN',  //0 填空
	SINGLE_CHOICE = 'SINGLE_CHOICE',  //1 单选
	MULTIPLE_CHOICES = 'MULTIPLE_CHOICES',  //2 多选
	CHECK = 'CHECK',  //3 判断
	FILE = 'FILE',  //4 文件
	
}
export const QuestionTypeEnum = {
	FILL_IN_VALUE : 0,
	SINGLE_CHOICE_VALUE : 1,
	MULTIPLE_CHOICES_VALUE : 2,
	CHECK_VALUE : 3,
	FILE_VALUE : 4,
	
	FILL_IN_TEXT : '填空',
	SINGLE_CHOICE_TEXT : '单选',
	MULTIPLE_CHOICES_TEXT : '多选',
	CHECK_TEXT : '判断',
	FILE_TEXT : '文件',

	valueOf(enumCode: QuestionType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: QuestionType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
