/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 工序图表
 * 
 * @remarks 工序图表。定义工序可展示的图表，参考echarts和参数名称。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:04.0
 * 
 */
export interface ProcessOperationChart extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 工序编码
	 */
	opCode: string;
	/**
	 * 图表名称
	 */
	chartName: string;
	/**
	 * 图表标题
	 */
	chartTitle: string;
	/**
	 * 图表选项
	 */
	chartOptions: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工序图表实体定义函数
 */
export const defineProcessOperationChart = (o: object) => {
	const e = defineEntity<ProcessOperationChart>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.processID},${this.opCode},${this.chartName}` }
	});
	return e;
}
