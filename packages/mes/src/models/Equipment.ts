/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { EquipmentStatus } from '../enums/EquipmentStatus';
import type { EquipmentChecklist } from './EquipmentChecklist';
import type { Bom } from './Bom';
import type { Device } from '@/compat/iot/Device';
import type { ScadaBlock } from './ScadaBlock';
import { type EquipmentStation, defineEquipmentStation } from './EquipmentStation';
/**
 * 设备
 * 
 * @remarks 设备。指生产设备，保存的是具体的一台设备，作为资产来管理。工具类放Tools表，没有设备维护功能。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:03.0
 * 
 */
export interface Equipment extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 设备标识
	 */
	equipID: string;
	/**
	 * 设备编号
	 */
	equipNo: string;
	/**
	 * 设备名称
	 */
	equipName: string;
	/**
	 * 设备类别
	 */
	equipCategory?: string;
	/**
	 * 序列号
	 */
	serialNo?: string;
	/**
	 * 工位：REF Station(stationID,stationNo,stationName)
	 */
	stationID?: string;
	/**
	 * 产线：REF ProductionLine(lineID,lineName)
	 */
	lineID?: string;
	/**
	 * 可移动
	 */
	movable: boolean;
	/**
	 * 生产节拍(min)
	 */
	cycleTime?: number;
	/**
	 * 投产日期
	 */
	startWorkDate?: string;
	/**
	 * 点检表：HAS_ONE EquipmentChecklist(checklistID,checklistName) AS checklist
	 */
	checklistID?: string;
	/**
	 * 维护计划：REF MaintenancePlan(planID,planName)
	 */
	maintenancePlanID?: string;
	/**
	 * 设备配件清单：HAS_ONE Bom(bomID,bomNo)
	 */
	bomID?: string;
	/**
	 * 关联物料：REF_ONE base.Material(materialID,materialCode)
	 */
	materialID?: string;
	/**
	 * 上次维护日期
	 */
	lastMaintained?: string;
	/**
	 * 下次维护日期
	 */
	planToMaintain?: string;
	/**
	 * 联系人
	 */
	contact: string;
	/**
	 * 制造厂家
	 */
	vendor?: string;
	/**
	 * 物联设备：HAS_ONE iot.Device(deviceID,deviceNo,deviceName)
	 */
	deviceID?: string;
	/**
	 * 数控块：HAS_ONE ScadaBlock(blockID,blockNo,blockName) AS scadaBlock
	 */
	scadaBlockID?: string;
	/**
	 * 数控组
	 */
	scadaGroup?: string;
	/**
	 * 数控代理，1代表有多设备共用数控块
	 */
	scadaProxy: boolean;
	/**
	 * 状态：0;NONE;-|1;NORMAL;正常使用|2;ALERTED;谨慎使用|4;DISABLED;暂停使用|-1;SCRAPPED;已报废|-2;TRANSFORMED;已改制|-3;EOL;寿命终结|-4;DISPOSED;已处置
	 */
	status: EquipmentStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
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
	 * 工位
	 */
	stations:  EquipmentStation[];
	/**
	 * 点检表
	 */
	checklist?: EquipmentChecklist;
	/**
	 * 设备配件清单
	 */
	bom?: Bom;
	/**
	 * 物联设备
	 */
	device?: Device;
	/**
	 * 数控块
	 */
	scadaBlock?: ScadaBlock;
	//#endregion ~GENERATED PARTS END
}
/**
 * 设备实体定义函数
 */
export const defineEquipment = (o: object) => {
	const e = defineEntity<Equipment>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.equipID }
	});
	//工位
	e.stations = defineEntityArray(defineEquipmentStation, e.stations);
	return e;
}
