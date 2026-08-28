/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 状态
 * 
 * 0;INITIAL;未开始|1;INSPECTING;检验中|2;RECTIFYING;整改中|4;COMPLETED;已完成
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum ProjectInspectionStatus{
	//#region ~GENERATED PARTS BEGIN
	INITIAL = 'INITIAL',  //0 未开始
	INSPECTING = 'INSPECTING',  //1 检验中
	RECTIFYING = 'RECTIFYING',  //2 整改中
	COMPLETED = 'COMPLETED',  //4 已完成
	
}
export const ProjectInspectionStatusEnum = {
	INITIAL_VALUE : 0,
	INSPECTING_VALUE : 1,
	RECTIFYING_VALUE : 2,
	COMPLETED_VALUE : 4,
	
	INITIAL_TEXT : '未开始',
	INSPECTING_TEXT : '检验中',
	RECTIFYING_TEXT : '整改中',
	COMPLETED_TEXT : '已完成',

	valueOf(enumCode: ProjectInspectionStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: ProjectInspectionStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END