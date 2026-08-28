/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { SampleValueType } from '@mmda/base/src/enums/SampleValueType';
/**
 * 工序参数
 *
 * @remarks 工序参数。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProcessOperationParam extends Entity {
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
	 * 参数代码
	 */
	paramCode: string;
	/**
	 * 参数名称
	 */
	paramName: string;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 参数序号
	 */
	paramIndex: number;
	/**
	 * 上限
	 */
	highThreshold?: number;
	/**
	 * 下限
	 */
	lowThreshold?: number;
	/**
	 * 采样值类型：0;NEVER;-|1;MIN;最小值|2;MAX;最大值|3;MIN_MAX;最小最大值|4;ALL;所有
	 */
	sampleValueType: SampleValueType;
	/**
	 * 采样间隔(s)
	 */
	sampleInterval: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工序参数实体定义函数
 */
export const defineProcessOperationParam = (o: object) => {
	const e = defineEntity<ProcessOperationParam>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.processID},${this.opCode},${this.paramCode}` }
	});
	return e;
}
