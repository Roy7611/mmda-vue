/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '../enums/UsageStatus';
import type { MaterialCat } from './MaterialCat';
import type { PartnerCat } from './PartnerCat';
import { type LabelTemplatePartner, defineLabelTemplatePartner } from './LabelTemplatePartner';
import { type LabelTemplateMaterial, defineLabelTemplateMaterial } from './LabelTemplateMaterial';
/**
 * 标签模板
 * 
 * @remarks 标签模板。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-13 09:51:11.0
 * 
 */
export interface LabelTemplate extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标签标识
	 */
	labelTmplID: string;
	/**
	 * 标签代码
	 */
	labelTmplCode: string;
	/**
	 * 标签图片
	 */
	labelTmplPic?: string;
	/**
	 * 标签名称
	 */
	labelTmplName: string;
	/**
	 * 标签文件，标签对应的报表文件
	 */
	labelTmplFile: string;
	/**
	 * 数据库名称
	 */
	dbName: string;
	/**
	 * 对象名称：REF metadata.MetaObject(objName,displayLabel)
	 * editor SearchBox
	 */
	objName: string;
	/**
	 * 宽度(cm)
	 */
	sizeWidth?: number;
	/**
	 * 高度(cm)
	 */
	sizeHeight?: number;
	/**
	 * 3C认证
	 */
	CCC: boolean;
	/**
	 * 质量标志
	 */
	qsMark: boolean;
	/**
	 * 环境标志
	 */
	envMark: boolean;
	/**
	 * 超市专供
	 */
	superMarketOnly: boolean;
	/**
	 * 专用于物料类别：HAS_ONE base.MaterialCat(categoryID,categoryName,parentCatID) AS materialCat
	 */
	materialCatID?: string;
	/**
	 * 专用于贸易通路：HAS_ONE base.PartnerCat(categoryID,categoryName,parentCatID) AS partnerCat
	 */
	partnerCatID?: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
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
	/**
	 * 专用于贸易伙伴
	 */
	partners?: LabelTemplatePartner[];
	/**
	 * 专用于物料
	 */
	materials?: LabelTemplateMaterial[];
	/**
	 * 专用于物料类别
	 */
	materialCat?: MaterialCat;
	/**
	 * 专用于贸易通路
	 */
	partnerCat?: PartnerCat;
	//#endregion ~GENERATED PARTS END
}
/**
 * 标签模板实体定义函数
 */
export const defineLabelTemplate = (o: object) => {
	const e = defineEntity<LabelTemplate>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.labelTmplID }
	});
	//专用于贸易伙伴
	e.partners = defineEntityArray(defineLabelTemplatePartner, e.partners);
	//专用于物料
	e.materials = defineEntityArray(defineLabelTemplateMaterial, e.materials);
	return e;
}
