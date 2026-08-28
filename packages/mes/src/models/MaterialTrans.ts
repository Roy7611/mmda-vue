/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaterialTransStatus } from '../enums/MaterialTransStatus';
import type { MaterialTransReason } from './MaterialTransReason';
import type { Partner } from '@mmda/base/src/models/Partner';
import type { Project } from './Project';
import type { Worksite } from './Worksite';
import type { ProductionOrder } from './ProductionOrder';
import { type MaterialTransItem, defineMaterialTransItem } from './MaterialTransItem';
import { type MaterialTransTool, defineMaterialTransTool } from './MaterialTransTool';
/**
 * 移料单
 *
 * @remarks 移料单。现场之间的物料移动，包括供应商直发工地现场或者生产现场、生产现场内部转移、生产车间直发工地现场以及工地现场之间转移。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:28.0
 *
 */
export interface MaterialTrans extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 移料单ID
	 */
	transID: string;
	/**
	 * 移料日期
	 */
	transDate: string;
	/**
	 * 移料单号
	 */
	transNo: string;
	/**
	 * 移料原因：HAS_ONE MaterialTransReason(reasonID,reasonCode,reasonName) AS reason
	 */
	transReasonID: string;
	/**
	 * 移料概要
	 */
	transSummary?: string;
	/**
	 * 提供者：HAS_ONE base.Partner(partnerID,partnerCodeName) AS supplier
	 */
	supplierID?: string;
	/**
	 * 工程项目：HAS_ONE Project(projectID,projectNo,projectName)
	 */
	projectID?: string;
	/**
	 * 从站点：HAS_ONE Worksite(siteID,siteCode,siteName) AS fromSite
	 */
	fromSiteID?: string;
	/**
	 * 至站点：HAS_ONE Worksite(siteID,siteCode,siteName) AS toSite
	 */
	toSiteID?: string;
	/**
	 * 消费者：HAS_ONE base.Partner(partnerID,partnerCodeName) AS consumer
	 */
	consumerID?: string;
	/**
	 * 生产订单：HAS_ONE ProductionOrder(orderID,orderNo) AS order
	 */
	orderID?: string;
	/**
	 * 状态：0;NEW;新|1;PREPARED;已准备|2;QC_APPLIED;已申请检验|3;QC_RELEASED;已放行|4;SHIPPED;已发货|5;RECEIVED;已收货|-1;CANCELED;已取消|-2;REPEALED;已作废
	 */
	status: MaterialTransStatus;
	/**
	 * 总数量
	 */
	totalQuantity?: number;
	/**
	 * 总重量(kg)
	 */
	totalWeight?: number;
	/**
	 * 总体积(m3)
	 */
	totalVolume?: number;
	/**
	 * 总金额
	 */
	totalAmount?: number;
	/**
	 * 收料时间
	 */
	receivedTime?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义
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
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 所有人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如退料单号
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 移料清单
	 */
	items:  MaterialTransItem[];
	/**
	 * 器具清单
	 */
	tools:  MaterialTransTool[];
	/**
	 * 移料原因
	 */
	reason?: MaterialTransReason;
	/**
	 * 提供者
	 */
	supplier?: Partner;
	/**
	 * 工程项目
	 */
	project?: Project;
	/**
	 * 从站点
	 */
	fromSite?: Worksite;
	/**
	 * 至站点
	 */
	toSite?: Worksite;
	/**
	 * 消费者
	 */
	consumer?: Partner;
	/**
	 * 生产订单
	 */
	order?: ProductionOrder;
	//#endregion ~GENERATED PARTS END
}
/**
 * 移料单实体定义函数
 */
export const defineMaterialTrans = (o: object) => {
	const e = defineEntity<MaterialTrans>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.transID }
	});
	//移料清单
	e.items = defineEntityArray(defineMaterialTransItem, e.items);
	//器具清单
	e.tools = defineEntityArray(defineMaterialTransTool, e.tools);
	return e;
}
