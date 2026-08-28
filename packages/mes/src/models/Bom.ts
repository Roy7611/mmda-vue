/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { BomType } from '../enums/BomType';
import type { BomUsage } from '../enums/BomUsage';
import type { MaterialTracingMode } from '@mmda/base/src/enums/MaterialTracingMode';
import type { BomStatus } from '../enums/BomStatus';
import type { Project } from './Project';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
import type { Doc } from './Doc';
import type { Process } from './Process';
import { type BomItem, defineBomItem } from './BomItem';
/**
 * 物料清单
 * 
 * @remarks 物料清单。定义生产产品所需的组件。 这些组件可以是原材料、半成品或成分。 要考虑component variations, substitute components
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:14:55.0
 * 
 */
export interface Bom extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * BOM标识
	 */
	bomID: string;
	/**
	 * BOM类型：0;PRIMARY;主配方|1;ALTERNATE;替代配方|2;VARIANT;变种配方
	 */
	bomType: BomType;
	/**
	 * 配方组，变种和替代配方都属于同一组BOM
	 */
	bomGroup: string;
	/**
	 * BOM编号
	 */
	bomNo: string;
	/**
	 * 替代配方名，主配方为空，一个产品可有多种替代配方
	 */
	alternate?: string;
	/**
	 * 用途：0;GENERAL;通用|1;DESIGN;设计|2;PRODUCTION;生产|4;MAINTENANCE;保养|8;SALES;销售
	 */
	bomUsage: BomUsage;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 制品标识，定制产品一开始为空，审核后自动生成关联的materialID
	 */
	productID?: string;
	/**
	 * 制品类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	productCategoryID?: string;
	/**
	 * 制品图片
	 */
	productPic?: string;
	/**
	 * 制品编码
	 */
	productCode?: string;
	/**
	 * 制品名称，物料全称
	 */
	productName: string;
	/**
	 * 规格，如尺寸
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 材质，型材颜色、玻璃颜色
	 */
	texture?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	tracingMode: MaterialTracingMode;
	/**
	 * 基数
	 */
	baseQuantity: number;
	/**
	 * 总数
	 */
	totalQuantity?: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 保质期（天）
	 */
	expirationDays?: number;
	/**
	 * 工艺文档：HAS_ONE Doc(docID,docNo)
	 */
	docID?: string;
	/**
	 * 生效日期
	 */
	validFrom: string;
	/**
	 * 限用工厂：REF Plant(plantID,plantName)
	 */
	plantID?: string;
	/**
	 * 制程：HAS_ONE Process(processID,processName)
	 */
	processID?: string;
	/**
	 * 状态：0;NEW;新|1;DRAFTED;已起草|2;CERTIFIED;已审核|4;APPROVED;已批准|5;REVISING;变更中|-1;ABANDONED;已弃用
	 */
	status: BomStatus;
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
	 * 修订说明
	 */
	revisedDesc?: string;
	/**
	 * 修订版本
	 */
	revision?: number;
	/**
	 * 修改日志标识，引用ChangeLog.logID
	 */
	changeLogID?: string;
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
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 基于BOM
	 */
	refBomID?: string;
	/**
	 * 引用名称，例如工作包
	 */
	refName?: string;
	/**
	 * 引用单号，例如工作包任务号
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	/**
	 * 物料清单
	 */
	items:  BomItem[];
	/**
	 * 工程项目
	 */
	project?: Project;
	/**
	 * 制品类别
	 */
	productCategory?: MaterialCat;
	/**
	 * 工艺文档
	 */
	doc?: Doc;
	/**
	 * 制程
	 */
	process?: Process;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料清单实体定义函数
 */
export const defineBom = (o: object) => {
	const e = defineEntity<Bom>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.bomID }
	});
	//物料清单
	e.items = defineEntityArray(defineBomItem, e.items);
	return e;
}
