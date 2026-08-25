/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { CapitalFlows } from '../enums/CapitalFlows';
/**
 * 资金
 * 
 * @remarks 资金
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Capital extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 资金标识
	 */
	capitalID: string;
	/**
	 * 资金代码
	 */
	capitalCode: string;
	/**
	 * 资金名称
	 */
	capitalName: string;
	/**
	 * 资金别名
	 */
	capitalAliasName?: string;
	/**
	 * 资金流向：0;PROFIT;留存|1;REVENUE;流入|2;COST;流出
	 */
	capitalFlows: CapitalFlows;
	//#endregion ~GENERATED PARTS END
}
/**
 * 资金实体定义函数
 */
export const defineCapital = (o: object) => {
	const e = defineEntity<Capital>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.capitalID }
	});
	return e;
}
