/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 区域类型
 * 
 * 0;EMPLOYEE;职员|1;CONTACTOR;联系人
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum PersonRelationType{
	//#region ~GENERATED PARTS BEGIN
	EMPLOYEE = 'EMPLOYEE',  //0 职员
	CONTACTOR = 'CONTACTOR',  //1 联系人
	
}
export const PersonRelationTypeEnum = {
	EMPLOYEE_VALUE : 0,
	CONTACTOR_VALUE : 1,
	
	EMPLOYEE_TEXT : '职员',
	CONTACTOR_TEXT : '联系人',

	valueOf(enumCode: PersonRelationType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: PersonRelationType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

