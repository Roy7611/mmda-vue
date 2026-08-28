/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 项目验收项
 * 
 * @remarks 项目验收项。可以是交付物清单作为设备移交备案，可以是验收项内容和遗留问题记录。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-15 09:10:08.0
 * 
 */
export interface ProjectAcceptanceItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 验收标识
	 */
	acceptID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 验收内容
	 */
	itemName: string;
	/**
	 * 验收标准
	 */
	acceptCriteria?: string;
	/**
	 * 验收通过
	 */
	accepted: boolean;
	/**
	 * 遗留问题
	 */
	remainingIssue?: string;
	/**
	 * 期望解决日期
	 */
	expectedToResolve?: string;
	/**
	 * 整改次数
	 */
	rectifiedTimes?: number;
	/**
	 * 复验日期
	 */
	recheckedDate?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称，如ProjectDeliveryItem
	 */
	refName?: string;
	/**
	 * 引用单号
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目验收项实体定义函数
 */
export const defineProjectAcceptanceItem = (o: object) => {
	const e = defineEntity<ProjectAcceptanceItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.acceptID},${this.itemID}` }
	});
	return e;
}
