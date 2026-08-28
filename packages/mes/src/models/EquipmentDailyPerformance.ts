/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 设备每日绩效
 * 
 * @remarks 设备每日绩效
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:27.0
 * 
 */
export interface EquipmentDailyPerformance extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 设备ID
	 */
	equipID: string;
	/**
	 * 运行日期
	 */
	runningDate: string;
	/**
	 * 负荷时间(min)，也叫计划工时
	 */
	plannedLoadingTime?: number;
	/**
	 * 开动时间(min)
	 */
	upTime?: number;
	/**
	 * 停机时间(min)
	 */
	downTime?: number;
	/**
	 * 时间稼动率%
	 * upTime / plannedLoadingTime
	 */
	availability?: number;
	/**
	 * 实际产量
	 */
	producedQuantity?: number;
	/**
	 * 理论生产节拍(min)
	 */
	cycleTime?: number;
	/**
	 * 性能稼动率%
	 * producedQuantity * cycleTime / (plannedLoadingTime - downTime)
	 */
	performance?: number;
	/**
	 * 合格数量
	 */
	qualifiedQuantity?: number;
	/**
	 * 合格品率%
	 * qualifiedQuantity / producedQuantity
	 */
	qualifiedRate?: number;
	/**
	 * 综合效率%
	 * availability * performance * qualifiedRate
	 */
	oee?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备每日绩效实体定义函数
 */
export const defineEquipmentDailyPerformance = (o: object) => {
	const e = defineEntity<EquipmentDailyPerformance>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.equipID},${this.runningDate}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
