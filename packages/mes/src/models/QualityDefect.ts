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
 * 质量缺陷
 *
 * @remarks 质量缺陷
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:05.0
 *
 */
export interface QualityDefect extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 缺陷标识
	 */
	defectID: string;
	/**
	 * 缺陷分类
	 */
	category: string;
	/**
	 * 缺陷编码
	 */
	defectCode: string;
	/**
	 * 缺陷描述
	 */
	defectDesc: string;
	/**
	 * 严重等级：0;UNDEFINED;-|1;MINOR;轻微|2;MEDIUM;中等|3;CRITICAL;严重|4;FATAL;致命
	 */
	severity: Severity;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 建议措施
	 */
	solution?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量缺陷实体定义函数
 */
export const defineQualityDefect = (o: object) => {
	const e = defineEntity<QualityDefect>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.defectID }
	});
	return e;
}
