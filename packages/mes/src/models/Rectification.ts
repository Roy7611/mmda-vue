/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { RectificationStatus } from '../enums/RectificationStatus';
import { type RectificationItem, defineRectificationItem } from './RectificationItem';
/**
 * 整改单
 * 
 * @remarks 整改单
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface Rectification extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 整改单ID
	 */
	rectificationID: string;
	/**
	 * 整改单号
	 */
	rectificationNo: string;
	/**
	 * 整改概要
	 */
	rectificationSummary: string;
	/**
	 * 发出时间
	 */
	sentDate: string;
	/**
	 * 待整改总数
	 */
	totalRectifiableQuantity?: number;
	/**
	 * 产生原因
	 */
	causedReason?: string;
	/**
	 * 整改人
	 */
	rectifierID?: string;
	/**
	 * 期望整改完成
	 */
	expectedToComplete?: string;
	/**
	 * 整改工时
	 */
	expectedDuration?: number;
	/**
	 * 状态：0;NEW;新|1;SENT;已发出|2;APPROVED;已批准|3;STARTED;已开始|4;COMPLETED;已完成|-1;CANCELLED;已取消
	 */
	status: RectificationStatus;
	/**
	 * 实际完成
	 */
	actualCompleted?: string;
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
	 * 整改项
	 */
	items:  RectificationItem[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 整改单实体定义函数
 */
export const defineRectification = (o: object) => {
	const e = defineEntity<Rectification>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.rectificationID }
	});
	//整改项
	e.items = defineEntityArray(defineRectificationItem, e.items);
	return e;
}
