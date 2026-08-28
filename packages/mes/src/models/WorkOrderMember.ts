/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Worker } from './Worker';
/**
 * 派工人员
 * 
 * @remarks 派工人员
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-12-07 03:41:04.0
 * 
 */
export interface WorkOrderMember extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 派工单ID
	 */
	orderID: string;
	/**
	 * 人员：HAS_ONE Worker(workerID,workerNo,workerName)
	 */
	workerID: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 人员
	 */
	worker?: Worker;
	//#endregion ~GENERATED PARTS END
}
/**
 * 派工人员实体定义函数
 */
export const defineWorkOrderMember = (o: object) => {
	const e = defineEntity<WorkOrderMember>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.orderID},${this.workerID}` }
	});
	return e;
}
