/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { EquipmentTallyStatus } from '../enums/EquipmentTallyStatus';
import type { Equipment } from './Equipment';
import { type EquipmentTallyRecord, defineEquipmentTallyRecord } from './EquipmentTallyRecord';
/**
 * 设备点检计分表
 * 
 * @remarks 设备点检计分表。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:03.0
 * 
 */
export interface EquipmentTally extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 计分表标识
	 */
	tallyID: string;
	/**
	 * 计分表编号
	 */
	tallyNo: string;
	/**
	 * 点检日期
	 */
	checkDate: string;
	/**
	 * 班次：REF Shift(shiftID,shiftName)
	 */
	shiftID: string;
	/**
	 * 设备：HAS_ONE Equipment(equipID,equipNo,equipName)
	 */
	equipID: string;
	/**
	 * 状态：0;NEW;新|10;APPROVED;已审核
	 */
	status: EquipmentTallyStatus;
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
	 * 点检记录
	 */
	records:  EquipmentTallyRecord[];
	/**
	 * 设备
	 */
	equipment?: Equipment;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备点检计分表实体定义函数
 */
export const defineEquipmentTally = (o: object) => {
	const e = defineEntity<EquipmentTally>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.tallyID }
	});
	//点检记录
	e.records = defineEntityArray(defineEquipmentTallyRecord, e.records);
	return e;
}
