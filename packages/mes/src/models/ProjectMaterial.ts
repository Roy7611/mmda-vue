/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { SourcingMode } from '@mmda/base/src/enums/SourcingMode';
import type { InspectMethod } from '../enums/InspectMethod';
import type { MaterialTracingMode } from '@mmda/base/src/enums/MaterialTracingMode';
import type { Partner } from '@mmda/base/src/models/Partner';
import type { Bom } from './Bom';
/**
 * 项目材料
 * 
 * @remarks 项目材料
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 21:45:31.0
 * 
 */
export interface ProjectMaterial extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 组件号，根据物料信息哈希生成，如果有materialID则使用它来哈希，否则使用materialName,brand,specs,modelType,texture,other来计算
	 */
	partNo: string;
	/**
	 * 材料图片
	 */
	materialPic?: string;
	/**
	 * 物料类别，如机械类、电气类、IT类
	 */
	materialCategory?: string;
	/**
	 * 材料标识
	 */
	materialID?: string;
	/**
	 * 材料编码
	 */
	materialCode: string;
	/**
	 * 材料名称
	 */
	materialName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格型号
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 国标号
	 */
	gbNo?: string;
	/**
	 * 材质/颜色
	 */
	texture?: string;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 计划数量
	 */
	budgetQuantity: number;
	/**
	 * 变更数量
	 */
	amendQuantity?: number;
	/**
	 * 含进项税否
	 */
	includeTax?: boolean;
	/**
	 * 成本单价
	 */
	costPrice?: number;
	/**
	 * 计划成本
	 * (budgetQuantity + ifnull(amendQuantity,0)) * costPrice
	 */
	budgetCost?: number;
	/**
	 * 待定
	 */
	undetermined: boolean;
	/**
	 * 标签，如标准件、大宗、外加工
	 */
	tags?: string;
	/**
	 * 需求日期
	 */
	requiredDate?: string;
	/**
	 * 采购员：REF User(userID,userName)
	 */
	purchaserID?: string;
	/**
	 * 来源：0;INVENTORY;库存|1;DIRECT_PURCHASE;直采|2;MAKE;自制|3;OUTSOURCE;外协
	 */
	sourcingMode: SourcingMode;
	/**
	 * 供应商：HAS_ONE base.Partner(partnerID,partnerName) AS supplier
	 */
	supplierID?: string;
	/**
	 * 寻源链接
	 */
	sourcingUrl?: string;
	/**
	 * 已询价格
	 */
	inquiryPrice?: number;
	/**
	 * 订货提前期(天)
	 */
	preorderDays?: number;
	/**
	 * 制造配方：HAS_ONE Bom(bomID,bomNo) AS bom
	 */
	bomID?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 现场装配
	 */
	onSiteAssembly: boolean;
	/**
	 * 检验方式：0;NONE;-|1;RANDOM;抽检|2;FULL;全检
	 */
	inspectMethod: InspectMethod;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	tracingMode: MaterialTracingMode;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 缺料数量，在项目排程中统一计算，暂停的项目不考虑
	 */
	shortageQuantity?: number;
	/**
	 * 已申请量
	 */
	requestedQuantity?: number;
	/**
	 * 已下单量
	 */
	orderedQuantity?: number;
	/**
	 * 已到货量
	 */
	arrivedQuantity?: number;
	/**
	 * 已退数量
	 */
	returnQuantity?: number;
	/**
	 * 已供应量
	 */
	suppliedQuantity?: number;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如备料单号
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
	 * 沟通结果集 用 ; 分割
	 */
	communicatePic?: string;
	/**
	 * 供应商
	 */
	supplier?: Partner;
	/**
	 * BOM
	 */
	bom?: Bom;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目材料实体定义函数
 */
export const defineProjectMaterial = (o: object) => {
	const e = defineEntity<ProjectMaterial>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.projectID},${this.itemID}` }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
