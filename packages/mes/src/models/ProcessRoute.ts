/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { TaskRelationship } from '@mmda/base/src/enums/TaskRelationship';
/**
 * 制程路线
 *
 * @remarks 制程路线。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:04.0
 * 
 */
export interface ProcessRoute extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 路线编码
	 */
	routeCode: string;
	/**
	 * 路线名称
	 */
	routeName: string;
	/**
	 * 前工序
	 */
	prevOpCode: string;
	/**
	 * 后工序
	 */
	nextOpCode: string;
	/**
	 * 至子工序，当后工序是子制程时，这里指向其内部工序编码
	 */
	toSubOpCode?: string;
	/**
	 * 时间延搁(min)
	 */
	lag: number;
	/**
	 * 关系类型：0;FINISH_TO_START;完成-开始|1;START_TO_START;开始-开始|2;START_TO_FINISH;开始-完成|3;FINISH_TO_FINISH;完成-完成
	 */
	relationType: TaskRelationship;
	/**
	 * X1
	 */
	x1?: number;
	/**
	 * Y1
	 */
	y1?: number;
	/**
	 * X2
	 */
	x2?: number;
	/**
	 * Y2
	 */
	y2?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 制程路线实体定义函数
 */
export const defineProcessRoute = (o: object) => {
	const e = defineEntity<ProcessRoute>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.processID},${this.routeCode}` }
	});
	return e;
}
