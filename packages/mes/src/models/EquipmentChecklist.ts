/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { EquipmentCheckCycle } from '../enums/EquipmentCheckCycle';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { type EquipmentChecklistItem, defineEquipmentChecklistItem } from './EquipmentChecklistItem';
/**
 * 设备点检表
 *
 * @remarks 设备点检表。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:03.0
 *
 */
export interface EquipmentChecklist extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 点检表标识
	 */
	checklistID: string;
	/**
	 * 点检表编号
	 */
	checklistNo: string;
	/**
	 * 点检表名称
	 */
	checklistName: string;
	/**
	 * 点检周期：0;SHIFT;每班次|1;DAY;天|2;WEEK;周
	 */
	checkCycle: EquipmentCheckCycle;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
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
	 * 点检项
	 */
	items: EquipmentChecklistItem[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备点检表实体定义函数
 */
export const defineEquipmentChecklist = (o: object) => {
	const e = defineEntity<EquipmentChecklist>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.checklistID }
	});
	//点检项
	e.items = defineEntityArray(defineEquipmentChecklistItem, e.items);
	return e;
}
