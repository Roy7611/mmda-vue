/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MaintainingMethod } from '../enums/MaintainingMethod';
import type { Urgency } from '@mmda/base/src/enums/Urgency';
import type { MaintenanceStatus } from '../enums/MaintenanceStatus';
import { type MaintenanceItem, defineMaintenanceItem } from './MaintenanceItem';
import { type MaintenancePart, defineMaintenancePart } from './MaintenancePart';
/**
 * 设备维护工单
 *
 * @remarks 设备维护工单。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:03.0
 *
 */
export interface Maintenance extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工单标识
	 */
	maintenanceID: string;
	/**
	 * 维护单号
	 */
	maintenanceNo: string;
	/**
	 * 报工日期
	 */
	requestedDate: string;
	/**
	 * 维护方式：0;BREAKDOWN;故障后维修|1;PREVENTIVE;定期预防维护|2;CORRECTIVE;改善维护|4;PREDICTIVE;预测性维护|5;PRODCTIVE;生产维护
	 */
	maintainingMethod: MaintainingMethod;
	/**
	 * 问题概要
	 */
	maintenanceSummary?: string;
	/**
	 * 使用备件
	 */
	useParts: boolean;
	/**
	 * 期望完成
	 */
	expectToFinish?: string;
	/**
	 * 优先级：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	priority: Urgency;
	/**
	 * 状态：0;NEW;新|1;DISPATCHED;已派单|2;COMPLETED;已完成|-1;CANCELLED;已取消
	 */
	status: MaintenanceStatus;
	/**
	 * 完成时间
	 */
	finishedTime?: string;
	/**
	 * 总成本
	 */
	totalCost?: number;
	/**
	 * 总工时
	 */
	totalHours?: number;
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
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 设备清单
	 */
	items?:  MaintenanceItem[];
	/**
	 * 配件清单
	 */
	parts?:  MaintenancePart[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备维护工单实体定义函数
 */
export const defineMaintenance = (o: object) => {
	const e = defineEntity<Maintenance>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.maintenanceID }
	});
	//设备清单
	e.items = defineEntityArray(defineMaintenanceItem, e.items);
	//配件清单
	e.parts = defineEntityArray(defineMaintenancePart, e.parts);
	return e;
}
