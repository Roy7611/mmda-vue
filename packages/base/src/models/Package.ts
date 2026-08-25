/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '../enums/UsageStatus';
import type { LabelTemplate } from './LabelTemplate';
/**
 * 包装
 * 
 * @remarks 包装
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-12-25 19:23:19.0
 * 
 */
export interface Package extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 
	 */
	packageID: string;
	/**
	 * 包装码
	 */
	packageCode: string;
	/**
	 * 包装单位，例如桶
	 */
	packageName: string;
	/**
	 * 包装重量
	 */
	packageWeight?: number;
	/**
	 * 标签格式：HAS_ONE LabelTemplate(labelTmplID,labelTmplCode,labelTmplName)
	 */
	labelTmplID?: string;
	/**
	 * 长度(mm)
	 */
	sizeLength?: number;
	/**
	 * 宽度(mm)
	 */
	sizeWidth?: number;
	/**
	 * 高度(mm)
	 */
	sizeHeight?: number;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
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
	/**
	 * 标签格式
	 */
	labelTemplate?: LabelTemplate;
	//#endregion ~GENERATED PARTS END
}
/**
 * 包装实体定义函数
 */
export const definePackage = (o: object) => {
	const e = defineEntity<Package>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.packageID }
	});
	return e;
}
