/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '../enums/UsageStatus';
import type { Material } from './Material';
import type { LabelTemplate } from './LabelTemplate';
/**
 * 物料包装
 * 
 * @remarks 物料包装
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface MaterialPackage extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 包装标识
	 */
	packID: string;
	/**
	 * 物料：HAS_ONE Material(materialID,materialFulllName)
	 */
	materialID: string;
	/**
	 * 包装码
	 */
	packCode: string;
	/**
	 * 包装层级
	 */
	packLevel: number;
	/**
	 * 包装名称，例如桶/5L
	 */
	packFullName: string;
	/**
	 * 包装单位，例如桶
	 */
	packUnit: string;
	/**
	 * 包含数量，包含多少基本单位
	 */
	packQuantity: number;
	/**
	 * 包装重量
	 */
	packWeight?: number;
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
	 * 物料
	 */
	material?: Material;
	/**
	 * 标签格式
	 */
	labelTemplate?: LabelTemplate;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料包装实体定义函数
 */
export const defineMaterialPackage = (o: object) => {
	const e = defineEntity<MaterialPackage>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.packID }
	});
	return e;
}
