/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
/**
 * 国家
 *
 * @remarks 国家，根据语言和国家代码建立，支持多语言
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-07-17 07:38:57.0
 *
 */
export interface Country extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 语言区域编码，如zh-Hans
	 */
	localeCode: string;
	/**
	 * GEC代码，如CN,US,TW
	 */
	countryCode: string;
	/**
	 * 简称
	 */
	briefName: string;
	/**
	 * 全称
	 */
	fullName: string;
	/**
	 * 电话区号
	 */
	telPrefix: string;
	/**
	 * 时差
	 */
	timeDiff: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 国家实体定义函数
 */
export const defineCountry = (o: object) => {
	const e = defineEntity<Country>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () {
			return `${this.localeCode},${this.countryCode}`;
		},
	});
	return e;
};
