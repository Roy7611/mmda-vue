/**
 * Copyright (c) 2006, 2020, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
// import type { MaterialType } from '../enums/MaterialType';
// import type { TrackingMode } from '../enums/TrackingMode';
// import type { TurnoverFrequency } from '../enums/TurnoverFrequency';
// import type { UsageStatus } from '../enums/UsageStatus';
/**
 * 任务看板
 *
 * @remarks 任务看板
 *
 * @author mmda codebot
 * @version 3.0.0
 * @since 2023-05-15 12:52:40.0
 *
 */
export interface ProductionSchedule extends Entity {
	//#region ~GENERATED PARTS BEGIN
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料实体定义函数
 */
export const defineProductionSchedule = (o: object) => {
	const e = defineEntity<ProductionSchedule>(o);
	//定义id
	// Object.defineProperty(e,'id',{
	// 	get: function(){ return this.materialID }
	// });

	return e;
};
