/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { AddOrExceptional } from '../enums/AddOrExceptional';
/**
 * 标签模板限用客户
 * 
 * @remarks 标签模板限用客户。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-13 09:51:12.0
 * 
 */
export interface LabelTemplatePartner extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标签标识
	 */
	labelTmplID: string;
	/**
	 * 客户：REF base.Partner(partnerID,partnerCodeName)
	 */
	partnerID: string;
	/**
	 * 额外/除外：0;DEFAULT;默认|1;ADDITIONAL;额外|4;EXCEPTIONAL;除外
	 */
	addOrExcept: AddOrExceptional;
	//#endregion ~GENERATED PARTS END
}
/**
 * 标签模板限用客户实体定义函数
 */
export const defineLabelTemplatePartner = (o: object) => {
	const e = defineEntity<LabelTemplatePartner>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.labelTmplID},${this.partnerID}` }
	});
	return e;
}
