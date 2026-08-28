/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 设备状态
 * 
 * 0;NEW;新|10;NORMAL;正常|40;DISABLED;有故障|-10;SCAPPED;已报废|-40;DISPOSED;已处置
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum EquipmentStatus{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	NORMAL = 'NORMAL',  //1 正常使用
	ALERTED = 'ALERTED',  //2 谨慎使用
	DISABLED = 'DISABLED',  //4 暂停使用
	SCRAPPED = 'SCRAPPED',  //-1 已报废
	TRANSFORMED = 'TRANSFORMED',  //-2 已改制
	EOL = 'EOL',  //-3 寿命终结
	DISPOSED = 'DISPOSED',  //-4 已处置
	
}
export const EquipmentStatusEnum = {
	NONE_VALUE : 0,
	NORMAL_VALUE : 1,
	ALERTED_VALUE : 2,
	DISABLED_VALUE : 4,
	SCRAPPED_VALUE : -1,
	TRANSFORMED_VALUE : -2,
	EOL_VALUE : -3,
	DISPOSED_VALUE : -4,
	
	NONE_TEXT : '-',
	NORMAL_TEXT : '正常使用',
	ALERTED_TEXT : '谨慎使用',
	DISABLED_TEXT : '暂停使用',
	SCRAPPED_TEXT : '已报废',
	TRANSFORMED_TEXT : '已改制',
	EOL_TEXT : '寿命终结',
	DISPOSED_TEXT : '已处置',

	valueOf(enumCode: EquipmentStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: EquipmentStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END