/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { type AlternativeStrategyItem, defineAlternativeStrategyItem } from './AlternativeStrategyItem';
/**
 * 替代料策略
 * 
 * @remarks 替代料策略
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-09-28 05:32:04.0
 * 
 */
export interface AlternativeStrategy extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 策略标识
	 */
	strategyID: string;
	/**
	 * 策略编号
	 */
	strategyCode: string;
	/**
	 * 策略名称
	 */
	strategyName: string;
	/**
	 * 允许混用
	 */
	allowMixed: boolean;
	/**
	 * 混用优先，一旦找到组合就使用，否则单种优先
	 */
	mixedFirst: boolean;
	/**
	 * 按使用概率组合，设为true子表必须填写使用概率，否则按优先级和可用量搭配
	 */
	mixedByProbability: boolean;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 替代料清单
	 */
	items:  AlternativeStrategyItem[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 替代料策略实体定义函数
 */
export const defineAlternativeStrategy = (o: object) => {
	const e = defineEntity<AlternativeStrategy>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.strategyID }
	});
	//替代料清单
	e.items = defineEntityArray(defineAlternativeStrategyItem, e.items);
	return e;
}
