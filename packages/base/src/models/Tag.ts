/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 标签
 * 
 * @remarks 标签。支持所有实体对象打标签，实体中设置tags字段，逗号隔开多个标签。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface Tag extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标签ID
	 */
	tagID: string;
	/**
	 * 标签名
	 */
	tagName: string;
	/**
	 * 标签对象，引用metaobject.objName
	 */
	tagFor: string;
	/**
	 * 创建时间
	 */
	createDate: string;
	/**
	 * 最后修改
	 */
	lastModified: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 标签实体定义函数
 */
export const defineTag = (o: object) => {
	const e = defineEntity<Tag>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.tagID }
	});
	return e;
}
