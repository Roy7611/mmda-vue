/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 部门状态
 * 
 * 0;BUILDING;组建中|1;RUNNING;运作中|-1;CLOSED;已关闭
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum DepartmentStatus{
	//#region ~GENERATED PARTS BEGIN
	BUILDING = 'BUILDING',  //0 组建中
	RUNNING = 'RUNNING',  //1 运作中
	CLOSED = 'CLOSED',  //-1 已关闭
	
}
export const DepartmentStatusEnum = {
	BUILDING_VALUE : 0,
	RUNNING_VALUE : 1,
	CLOSED_VALUE : -1,
	
	BUILDING_TEXT : '组建中',
	RUNNING_TEXT : '运作中',
	CLOSED_TEXT : '已关闭',

	valueOf(enumCode: DepartmentStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DepartmentStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END