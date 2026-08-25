/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 垃圾
 * 
 * @remarks 垃圾。删除的数据。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface Trash extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标识
	 */
	trashID: string;
	/**
	 * 名称
	 */
	objName: string;
	/**
	 * 键值
	 */
	objID: string;
	/**
	 * 内容
	 */
	objContent: string;
	/**
	 * 删除人
	 */
	ashmanID: string;
	/**
	 * 删除时间
	 */
	erasedTime: string;
	/**
	 * IP地址
	 */
	ipAddr?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 垃圾实体定义函数
 */
export const defineTrash = (o: object) => {
	const e = defineEntity<Trash>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.trashID }
	});
	return e;
}
