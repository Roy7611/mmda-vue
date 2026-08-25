/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 部门类型
 * 
 * 0;DEPARTMENT;内设部门|1;DIVISION;子公司|2;AFFILIATED;关联公司|3;FRANCHISED;加盟公司
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum DepartmentType{
	//#region ~GENERATED PARTS BEGIN
	DEPARTMENT = 'DEPARTMENT',  //0 内设部门
	DIVISION = 'DIVISION',  //1 子公司
	AFFILIATED = 'AFFILIATED',  //2 关联公司
	FRANCHISED = 'FRANCHISED',  //3 加盟公司
	
}
export const DepartmentTypeEnum = {
	DEPARTMENT_VALUE : 0,
	DIVISION_VALUE : 1,
	AFFILIATED_VALUE : 2,
	FRANCHISED_VALUE : 3,
	
	DEPARTMENT_TEXT : '内设部门',
	DIVISION_TEXT : '子公司',
	AFFILIATED_TEXT : '关联公司',
	FRANCHISED_TEXT : '加盟公司',

	valueOf(enumCode: DepartmentType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DepartmentType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END