/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 资金流向
 * 
 * 0;PROFIT;留存|1;REVENUE;流入|2;COST;流出
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum CapitalFlows{
	//#region ~GENERATED PARTS BEGIN
	PROFIT = 'PROFIT',  //0 留存
	REVENUE = 'REVENUE',  //1 流入
	COST = 'COST',  //2 流出
	
}
export const CapitalFlowsEnum = {
	PROFIT_VALUE : 0,
	REVENUE_VALUE : 1,
	COST_VALUE : 2,
	
	PROFIT_TEXT : '留存',
	REVENUE_TEXT : '流入',
	COST_TEXT : '流出',

	valueOf(enumCode: CapitalFlows): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: CapitalFlows): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END