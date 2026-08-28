/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { CapitalFlows } from '@mmda/base/src/enums/CapitalFlows';
/**
 * 项目资金项
 *
 * @remarks 项目资金项
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:31.0
 *
 */
export interface ProjectCapitalItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 资金代码
	 */
	capitalCode: string;
	/**
	 * 资金名称
	 */
	capitalName: string;
	/**
	 * 资金流向：0;PROFIT;利润|1;REVENUE;收入|-1;COST;成本费用
	 */
	capitalFlows: CapitalFlows;
	/**
	 * 计划额
	 */
	expectedValue?: number;
	/**
	 * 发生额
	 */
	realizedValue?: number;
	/**
	 * 确认额，指财务确认例如发票额
	 */
	confimedValue?: number;
	/**
	 * 支付额
	 */
	payedValue?: number;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目资金项实体定义函数
 */
export const defineProjectCapitalItem = (o: object) => {
	const e = defineEntity<ProjectCapitalItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.projectID},${this.itemID}` }
	});
	return e;
}
