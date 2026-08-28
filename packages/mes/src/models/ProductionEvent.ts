/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MessageLevel } from '@mmda/base/src/enums/MessageLevel';
import type { ProductionEventCause } from '../enums/ProductionEventCause';
import type { ProductionEventStatus } from '../enums/ProductionEventStatus';
import type { Worksite } from './Worksite';
import type { ProductionTask } from './ProductionTask';
import { type ProductionEventPhoto, defineProductionEventPhoto } from './ProductionEventPhoto';
/**
 * 生产事件
 *
 * @remarks 生产事件
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface ProductionEvent extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 事件标识
	 */
	eventID: string;
	/**
	 * 事件编号
	 */
	eventNo: string;
	/**
	 * 事件类型：0;INFO;信息|1;SUCCESS;成功|2;WARNING;警告|4;DANGER;危险
	 */
	eventType: MessageLevel;
	/**
	 * 事件标题
	 */
	eventTitle: string;
	/**
	 * 事件原因：0;NONE;-|1;MAN;人|2;EQUIP;设备|4;MATERIAL;材料|8;DESIGN;设计|16;PROCESS;工艺|32;QC;质量|128;OTHER;其他
	 */
	eventCauses: ProductionEventCause;
	/**
	 * 工作站点：HAS_ONE Worksite(siteID,siteCode,siteName)
	 */
	siteID?: string;
	/**
	 * 生产任务：HAS_ONE ProductionTask(taskID,taskNo) AS task
	 */
	taskID?: string;
	/**
	 * 状态：0;NEW;新|1;REPORTED;已上报|2;ARRANGED;已安排|3;HANDLED;已处理|4;CLOSED;已关闭
	 */
	status: ProductionEventStatus;
	/**
	 * 处理结果
	 */
	handledResult?: string;
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
	 * 所有人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 所有部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如销售订单号
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
	 * 照片
	 */
	photos?: ProductionEventPhoto[];
	/**
	 * 工作站点
	 */
	Worksite?: Worksite;
	/**
	 * 生产任务
	 */
	productionTask?: ProductionTask;
	//#endregion ~GENERATED PARTS END
}
/**
 * 生产事件实体定义函数
 */
export const defineProductionEvent = (o: object) => {
	const e = defineEntity<ProductionEvent>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.eventID }
	});
	//照片
	e.photos = defineEntityArray(defineProductionEventPhoto, e.photos);
	return e;
}
