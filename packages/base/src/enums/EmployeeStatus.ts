/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 职员状态
 * 
 * 0;NEW;新员工|1;ON_BOARD;在岗|-1;LEAVE;离岗
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EmployeeStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新员工
	ON_BOARD = 'ON_BOARD',  //1 在岗
	LEAVE = 'LEAVE',  //-1 离岗
	
}
export const EmployeeStatusEnum = {
	NEW_VALUE : 0,
	ON_BOARD_VALUE : 1,
	LEAVE_VALUE : -1,
	
	NEW_TEXT : '新员工',
	ON_BOARD_TEXT : '在岗',
	LEAVE_TEXT : '离岗',

	valueOf(enumCode: EmployeeStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EmployeeStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END