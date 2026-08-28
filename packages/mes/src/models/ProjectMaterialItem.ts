/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 项目材料项
 * 
 * @remarks 项目材料项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-26 01:16:14.0
 * 
 */
export interface ProjectMaterialItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 材料项次
	 */
	itemID: number;
	/**
	 * 任务标识
	 */
	taskID: string;
	/**
	 * 交付物项次
	 */
	deliveryItemID: number;
	/**
	 * 计划数量
	 */
	budgetQuantity: number;
	/**
	 * 变更数量
	 */
	amendQuantity?: number;
	/**
	 * 成本单价
	 */
	costPrice?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目材料项实体定义函数
 */
export const defineProjectMaterialItem = (o: object) => {
	const e = defineEntity<ProjectMaterialItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.projectID},${this.itemID},${this.taskID}` }
	});
	return e;
}
