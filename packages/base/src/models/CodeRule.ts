/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 编码规则
 * 
 * @remarks 编码规则。对一个元对象的uniqueKey自定义编码规则rule
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-14 01:09:51.0
 * 
 */
export interface CodeRule extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 规则标识
	 */
	ruleID: string;
	/**
	 * 规则编号，001号编码样式
	 */
	ruleNo: string;
	/**
	 * 数据库名称
	 */
	dbName: string;
	/**
	 * 对象名称：REF metadata.MetaObject(objName,displayLabel)
	 */
	objName: string;
	/**
	 * 唯一编码表达式
	 */
	uniqueKeyExpression: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 编码规则实体定义函数
 */
export const defineCodeRule = (o: object) => {
	const e = defineEntity<CodeRule>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.ruleID }
	});
	return e;
}
