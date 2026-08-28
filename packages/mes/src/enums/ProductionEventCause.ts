/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 生产事件原因
 * 
 * 0;NONE;-|1;MAN;人|2;EQUIP;设备|4;MATERIAL;材料|8;DESIGN;设计|16;PROCESS;工艺|32;QC;质量|128;OTHER;其他
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum ProductionEventCause{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	MAN = 'MAN',  //1 人
	EQUIP = 'EQUIP',  //2 设备
	MATERIAL = 'MATERIAL',  //4 材料
	DESIGN = 'DESIGN',  //8 设计
	PROCESS = 'PROCESS',  //16 工艺
	QC = 'QC',  //32 质量
	OTHER = 'OTHER',  //128 其他
	
}
export const ProductionEventCauseEnum = {
	NONE_VALUE : 0,
	MAN_VALUE : 1,
	EQUIP_VALUE : 2,
	MATERIAL_VALUE : 4,
	DESIGN_VALUE : 8,
	PROCESS_VALUE : 16,
	QC_VALUE : 32,
	OTHER_VALUE : 128,
	
	NONE_TEXT : '-',
	MAN_TEXT : '人',
	EQUIP_TEXT : '设备',
	MATERIAL_TEXT : '材料',
	DESIGN_TEXT : '设计',
	PROCESS_TEXT : '工艺',
	QC_TEXT : '质量',
	OTHER_TEXT : '其他',

	valueOf(enumCode: ProductionEventCause): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProductionEventCause): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END