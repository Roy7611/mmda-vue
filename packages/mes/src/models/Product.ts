/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaterialTracingMode } from '@mmda/base/src/enums/MaterialTracingMode';
import type { Project } from './Project';
/**
 * 制品
 *
 * @remarks 制品
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface Product extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制品标识，定制产品一开始为空，审核后自动生成关联的materialID
	 */
	productID?: string;
	/**
	 *
	 */
	categoryID?: string;
	/**
	 *
	 */
	productPic?: string;
	/**
	 * 物料编码
	 */
	productCode?: string;
	/**
	 * 物料全称
	 */
	productName: string;
	/**
	 *
	 */
	specs?: string;
	/**
	 *
	 */
	modelType?: string;
	/**
	 *
	 */
	texture?: string;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	tracingMode: MaterialTracingMode;
	/**
	 * 基数
	 */
	baseQuantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 生效日期
	 */
	validFrom: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 限用工厂：REF Plant(plantID,plantName)
	 */
	plantID?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义，如见光尺寸
	 */
	customJson?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
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
	 * 工程项目
	 */
	project?: Project;
	//#endregion ~GENERATED PARTS END
}
/**
 * 制品实体定义函数
 */
export const defineProduct = (o: object) => {
	const e = defineEntity<Product>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.productID }
	});
	return e;
}
