/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Severity } from '@mmda/base/src/enums/Severity';
/**
 * 工序报警
 *
 * @remarks 工序报警。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProcessOperationAlarm extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 工序代码
	 */
	opCode: string;
	/**
	 * 报警代码
	 */
	alarmCode: string;
	/**
	 * 严重等级：0;UNDEFINED;-|1;MINOR;轻微|2;MEDIUM;中等|3;CRITICAL;严重|4;FATAL;致命
	 */
	severity: Severity;
	/**
	 * 报警消息
	 */
	alarmMessage: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工序报警实体定义函数
 */
export const defineProcessOperationAlarm = (o: object) => {
	const e = defineEntity<ProcessOperationAlarm>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.processID},${this.opCode},${this.alarmCode}` }
	});
	return e;
}
