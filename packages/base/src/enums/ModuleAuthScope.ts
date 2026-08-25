/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 模块权限范围
 * 
 * 0;SELF;本人|1;GROUP;组|2;DEPARTMENT;部门|4;DIVISION;子公司|8;ALL;全局
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ModuleAuthScope{
	//#region ~GENERATED PARTS BEGIN
	SELF = 'SELF',  //0 本人
	GROUP = 'GROUP',  //1 组
	DEPARTMENT = 'DEPARTMENT',  //2 部门
	DIVISION = 'DIVISION',  //4 子公司
	ALL = 'ALL',  //8 全局
	
}
export const ModuleAuthScopeEnum = {
	SELF_VALUE : 0,
	GROUP_VALUE : 1,
	DEPARTMENT_VALUE : 2,
	DIVISION_VALUE : 4,
	ALL_VALUE : 8,
	
	SELF_TEXT : '本人',
	GROUP_TEXT : '组',
	DEPARTMENT_TEXT : '部门',
	DIVISION_TEXT : '子公司',
	ALL_TEXT : '全局',

	valueOf(enumCode: ModuleAuthScope): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ModuleAuthScope): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END