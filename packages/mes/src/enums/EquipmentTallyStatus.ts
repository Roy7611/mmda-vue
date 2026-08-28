/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备点检状态
 * 
 * 0;NEW;新|10;APPROVED;已审核
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EquipmentTallyStatus{
	//#region ~GENERATED PARTS BEGIN
	NEW = 'NEW',  //0 新
	APPROVED = 'APPROVED',  //10 已审核
	
}
export const EquipmentTallyStatusEnum = {
	NEW_VALUE : 0,
	APPROVED_VALUE : 10,
	
	NEW_TEXT : '新',
	APPROVED_TEXT : '已审核',

	valueOf(enumCode: EquipmentTallyStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EquipmentTallyStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END