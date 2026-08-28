/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 维护方式
 * 
 * 0;BREAKDOWN;故障后维修|1;PREVENTIVE;定期预防维护|2;CORRECTIVE;改善维护|4;PREDICTIVE;预测性维护|5;PRODCTIVE;生产维护
 * 
 * @author mmda code robot 
 * @version 4.0.0 
 * 
 */
export const enum MaintainingMethod{
	//#region ~GENERATED PARTS BEGIN
	BREAKDOWN = 'BREAKDOWN',  //0 故障后维修
	PREVENTIVE = 'PREVENTIVE',  //1 定期预防维护
	CORRECTIVE = 'CORRECTIVE',  //2 改善维护
	PREDICTIVE = 'PREDICTIVE',  //4 预测性维护
	PRODCTIVE = 'PRODCTIVE',  //5 生产维护
	
}
export const MaintainingMethodEnum = {
	BREAKDOWN_VALUE : 0,
	PREVENTIVE_VALUE : 1,
	CORRECTIVE_VALUE : 2,
	PREDICTIVE_VALUE : 4,
	PRODCTIVE_VALUE : 5,
	
	BREAKDOWN_TEXT : '故障后维修',
	PREVENTIVE_TEXT : '定期预防维护',
	CORRECTIVE_TEXT : '改善维护',
	PREDICTIVE_TEXT : '预测性维护',
	PRODCTIVE_TEXT : '生产维护',

	valueOf(enumCode: MaintainingMethod): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaintainingMethod): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END