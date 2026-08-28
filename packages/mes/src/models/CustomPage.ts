/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-12-02 17:21:19
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2024-12-02 17:22:49
 * @FilePath: /mmda-vue/packages/mes/src/models/CustomPage.ts
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
/**
 * 自定义页面
 *
 * @remarks 自定义页面
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:31.0
 *
 */
export interface CustomPage extends Entity {
}
/**
 * 项目实体定义函数
 */
export const defineCustomPage = (o: object) => {
	const e = defineEntity<CustomPage>(o);
	//定义id
	// Object.defineProperty(e, 'id', {
	// 	get: function () {
	// 		return this.CustomPageID;
	// 	},
	// });
	return e;
}
