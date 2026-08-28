/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 修改日志
 * 
 * @remarks 修改日志。记录一个操作导致数据的变更，用于取消操作、审计和变更等。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-19 03:43:02.0
 * 
 */
export interface ChangeLog extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 日志标识
	 */
	logID: string;
	/**
	 * 数据差异
	 */
	difference: string;
	/**
	 * 引用名称，对象名
	 */
	refName: string;
	/**
	 * 引用键值，对象唯一主键
	 */
	refKey: string;
	/**
	 * 引用失效否，引用的对象是否已删除，true代表日志可清理
	 */
	refDeleted: boolean;
	/**
	 * 撤消否，true代表已执行了undo
	 */
	undone: boolean;
	/**
	 * 前一个日志ID
	 */
	prevLogID?: string;
	/**
	 * 标签
	 */
	tags?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 修改日志实体定义函数
 */
export const defineChangeLog = (o: object) => {
	const e = defineEntity<ChangeLog>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.logID }
	});
	return e;
}
