/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { Worksite } from './Worksite';
import type { Project } from './Project';
import type { MaterialTransReason } from './MaterialTransReason';
import type { Partner } from '@mmda/base/src/models/Partner';
/**
 * 线边库存项
 *
 * @remarks 线边库存项
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:28.0
 *
 */
export interface LinesideInventoryItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 至站点：HAS_ONE Worksite(siteID,siteCode,siteName) AS toSite
	 */
	siteID?: string;
	/**
	 * 收料时间
	 */
	receivedTime?: string;
	/**
	 * 移料单ID
	 */
	transID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 组件号，根据物料信息哈希生成，如果有materialID则使用它来哈希，否则使用materialName,brand,specs,modelType,texture,other来计算
	 */
	partNo: string;
	/**
	 * 物料类别
	 */
	materialCategory?: string;
	/**
	 * 物料标识
	 */
	materialID?: string;
	/**
	 * 物料编码，如型材号
	 */
	materialCode?: string;
	/**
	 * 物料名称
	 */
	materialName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格，玻璃为厚度*W*H，型材为算量后定长L
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 材质
	 */
	texture?: string;
	/**
	 * 用途
	 */
	usage?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 客(供)货号
	 */
	partnerPartNo?: string;
	/**
	 * 数量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 剩余数量，quantity被转移后的剩余数量，根据refName,refID,refItemID反写
	 */
	leftOverQuantity?: number;
	/**
	 * 剩余状态
	 */
	leftOver?: boolean;
	/**
	 * 单价
	 */
	unitPrice?: number;
	/**
	 * 金额
	 */
	amount?: number;
	/**
	 * 质量状态：0;NI;待检品|1;OK;合格品|2;DG;瑕疵品|3;AUC;让步接受|4;NG;不良品|8;SCRAP;废品
	 */
	qaStatus?: QaStatus;
	/**
	 * 重量(kg)
	 */
	weight?: number;
	/**
	 * 包装尺寸，1200*1000*1500mm
	 */
	packSize?: string;
	/**
	 * 批次号
	 */
	lotNo?: string;
	/**
	 * 生产日期
	 */
	prodDate?: string;
	/**
	 * 有效日期
	 */
	expiryDate?: string;
	/**
	 * 制造厂家
	 */
	manufacturer?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 实到数量
	 */
	arrivedQuantity?: number;
	/**
	 * 退回数量
	 */
	returnQuantity?: number;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号
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
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 项目资源标识
	 */
	projectResID?: number;
	/**
	 * 移料日期
	 */
	transDate: string;
	/**
	 * 移料原因：HAS_ONE MaterialTransReason(reasonID,reasonCode,reasonName) AS reason
	 */
	transReasonID: string;
	/**
	 * 移料单号
	 */
	transNo: string;
	/**
	 * 提供者：HAS_ONE base.Partner(partnerID,partnerCodeName) AS supplier
	 */
	supplierID?: string;
	/**
	 * 至站点
	 */
	toSite?: Worksite;
	/**
	 * 工程项目
	 */
	project?: Project;
	/**
	 * 移料原因
	 */
	reason?: MaterialTransReason;
	/**
	 * 提供者
	 */
	supplier?: Partner;
	//#endregion ~GENERATED PARTS END
}
/**
 * 线边库存项实体定义函数
 */
export const defineLinesideInventoryItem = (o: object) => {
	const e = defineEntity<LinesideInventoryItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.siteID},${this.transID},${this.itemID},${this.partNo}` }
	});
	return e;
}
