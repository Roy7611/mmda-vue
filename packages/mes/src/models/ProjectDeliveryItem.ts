/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { SourcingMode } from '@mmda/base/src/enums/SourcingMode';
import type { TaskPhase } from '@mmda/base/src/enums/TaskPhase';
import type { ChangeType } from '@mmda/base/src/enums/ChangeType';
/**
 * 项目交付物
 *
 * @remarks 项目交付物
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 23:03:29.0
 *
 */
export interface ProjectDeliveryItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 *
	 */
	projectID: string;
	/**
	 *
	 */
	itemID: number;
	/**
	 * 变更类型：0;NONE;-|1;MODIFIED;内容修改|2;ADDED;增项|4;REMOVED;减项
	 */
	amendType: ChangeType;
	/**
	 * 商品分类
	 */
	productCategory?: string;
	/**
	 * 产品图片
	 */
	productPic?: string;
	/**
	 * 产品标识
	 */
	productID?: string;
	/**
	 * 产品编码
	 */
	productCode?: string;
	/**
	 * 产品名称
	 */
	productName: string;
	/**
	 * 规格型号
	 */
	specs?: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 数量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 供应方式：0;INVENTORY;库存|1;DIRECT_PURCHASE;直采|2;MAKE;自制|3;OUTSOURCE;外协
	 */
	sourcingMode: SourcingMode;
	/**
	 * 验收标准
	 */
	acceptCriteria?: string;
	/**
	 * 当前阶段：0;STAGE;筹划|1;DESIGN;设计|2;MAKE;生产|3;INSTALL;安装|4;TEST;测试|5;ACCEPT;验收
	 */
	taskPhase: TaskPhase;
	/**
	 * 备注
	 */
	remark?: string;
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目交付物实体定义函数
 */
export const defineProjectDeliveryItem = (o: object) => {
	const e = defineEntity<ProjectDeliveryItem>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.projectID},${this.itemID}` }
	});
	return e;
}
