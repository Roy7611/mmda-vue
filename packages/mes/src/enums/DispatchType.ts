/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 派工类型
 * 
 * 0;AFFAIRS;事务|1;ONSITE_WORK;生产装配|2;INSPECTION;巡检|4;RECTIFICATION;整改|8;SERVICE;保维修
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum DispatchType{
	//#region ~GENERATED PARTS BEGIN
	AFFAIRS = 'AFFAIRS',  //0 事务
	ONSITE_WORK = 'ONSITE_WORK',  //1 生产装配
	INSPECTION = 'INSPECTION',  //2 巡检
	RECTIFICATION = 'RECTIFICATION',  //4 整改
	SERVICE = 'SERVICE',  //8 保维修
	INSTALL = 'INSTALL',  //16 安装
	RETURN = 'RETURN',  //32 返厂
	
}
export const DispatchTypeEnum = {
	AFFAIRS_VALUE : 0,
	ONSITE_WORK_VALUE : 1,
	INSPECTION_VALUE : 2,
	RECTIFICATION_VALUE : 4,
	SERVICE_VALUE : 8,
	INSTALL_VALUE : 16,
	RETURN_VALUE : 32,
	
	AFFAIRS_TEXT : '事务',
	ONSITE_WORK_TEXT : '生产装配',
	INSPECTION_TEXT : '巡检',
	RECTIFICATION_TEXT : '整改',
	SERVICE_TEXT : '保维修',
	INSTALL_TEXT : '安装',
	RETURN_TEXT : '返厂',

	valueOf(enumCode: DispatchType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: DispatchType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END