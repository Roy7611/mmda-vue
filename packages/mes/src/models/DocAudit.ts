/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Doc } from './Doc';
/**
 * 文档稽核
 * 
 * @remarks 文档稽核。捕捉非法的访问访问记录。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:27.0
 * 
 */
export interface DocAudit extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 稽核标识
	 */
	auditID: string;
	/**
	 * 文档：HAS_ONE Doc(docID,docTitle)
	 */
	docID: string;
	/**
	 * 访问人：REF User(userID,userName)
	 */
	openerID: string;
	/**
	 * 访问时间
	 */
	openTime: string;
	/**
	 * IP地址
	 */
	ipAddr: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 分享标识，有值说明是通过分享访问的
	 */
	shareID?: string;
	/**
	 * 文档
	 */
	doc?: Doc;
	//#endregion ~GENERATED PARTS END
}
/**
 * 文档稽核实体定义函数
 */
export const defineDocAudit = (o: object) => {
	const e = defineEntity<DocAudit>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.auditID }
	});
	return e;
}
