/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-12-26 09:33:42
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-04-15 13:56:41
 * @FilePath: /mmda-vue/packages/mes/src/models/ToolMeasure.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import { type Tool } from "./Tool";

/**
 * 量具
 * 
 * @remarks 量具
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 11:16:16.0
 * 
 */
export interface ToolMeasure extends Tool {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 量具ID
	 */
	toolID: string;
	/**
	 * 计量编号
	 */
	measurementNo?: string;
	/**
	 * 分度值
	 */
	scaleInterval: number;
	/**
	 * 校验周期(月)
	 */
	verificationPeriod?: number;
	/**
	 * 校准单位
	 */
	verificator?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 量具实体定义函数
 */
export const defineToolMeasure = (o: object) => {
	const e = defineEntity<ToolMeasure>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.toolID }
	});
	return e;
}
