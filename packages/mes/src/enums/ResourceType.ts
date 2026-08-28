/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 资源类型
 * 
 * 0;LABOR_SKILL;技能|16;EQUIP_TOOLS;机具设备
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ResourceType{
	//#region ~GENERATED PARTS BEGIN
	LABOR_SKILL = 'LABOR_SKILL',  //0 技能
	EQUIP_TOOLS = 'EQUIP_TOOLS',  //16 机具设备
	
}
export const ResourceTypeEnum = {
	LABOR_SKILL_VALUE : 0,
	EQUIP_TOOLS_VALUE : 16,
	
	LABOR_SKILL_TEXT : '技能',
	EQUIP_TOOLS_TEXT : '机具设备',

	valueOf(enumCode: ResourceType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ResourceType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END

