/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { LifecycleMode } from '../enums/LifecycleMode';
import type { ToolStatus } from '../enums/ToolStatus';
import type { Station } from './Station';
import type { AlertingState } from '../enums/AlertingState';
import type { ToolCategory } from './ToolCategory';
import type { EquipmentChecklist } from './EquipmentChecklist';
import { type ToolUse, defineToolUse } from './ToolUse';
/**
 * 工装器具
 * 
 * @remarks 工装器具，例如模具、砂箱
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface Tool extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 器具标识
	 */
	toolID: string;
	/**
	 * 器具类别：HAS_ONE ToolCategory(categoryID,categoryCode,categoryName) AS category
	 */
	categoryID: string;
	/**
	 * 器具编号
	 */
	toolNo: string;
	/**
	 * 器具图片
	 */
	toolPic?: string;
	/**
	 * 序列号，例如集成RFID
	 */
	serialNo?: string;
	/**
	 * 器具名称
	 */
	toolName: string;
	/**
	 * 规格
	 */
	specs?: string;
	/**
	 * 用于产品，多种逗号隔开
	 */
	usedFor?: string;
	/**
	 * 图号
	 */
	drawingNo: string;
	/**
	 * 关联物料：REF_ONE base.Material(materialID,materialCode)
	 */
	materialID?: string;
	/**
	 * 寿命管理：0;NONE;-|1;TM;时间|2;FM;次数|4;CM;价值
	 */
	lifecycleModes: LifecycleMode;
	/**
	 * 最大寿命(次数)，不能延长
	 */
	maxLifeCycles?: number;
	/**
	 * 寿命(次数)，使用次数上限，检修后可延长寿命
	 */
	lifecycles?: number;
	/**
	 * 使用次数
	 */
	usedCycles?: number;
	/**
	 * 剩余次数
	 */
	remainingCycles?: number;
	/**
	 * 进厂日期
	 */
	startWorkDate?: string;
	/**
	 * 寿命(到期日)
	 */
	liveToDate?: string;
	/**
	 * 剩余天数
	 * to_days(liveToDate) - to_days(curdate()) + 1
	 */
	remainingLife?: number;
	/**
	 * 成本
	 */
	cost?: number;
	/**
	 * 剩余成本
	 */
	remainingCost?: number;
	/**
	 * 当前站点：REF_ONE Worksite(siteID,siteCode,siteName)
	 */
	siteID?: string;
	/**
	 * 当前位置
	 */
	currentLoc?: string;
	/**
	 * 状态：0;NONE;-|1;NORMAL;正常使用|2;ALERTED;谨慎使用|4;DISABLED;暂停使用|-1;SCAPPED;已报废|-2;TRANSFORMED;已改制|-3;EOL;寿命终结|-4;DISPOSED;已处置
	 */
	status: ToolStatus;
	/**
	 * 预警：0;NONE;-|1;WARNING;警告|4;FATAL;禁用
	 */
	alertingState: AlertingState;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 作为设备管理，包括点检、计划性维护
	 */
	asEquip: boolean;
	/**
	 * 点检表：HAS_ONE EquipmentChecklist(checklistID,checklistName) AS checklist
	 */
	checklistID?: string;
	/**
	 * 上次维护日期
	 */
	lastMaintained?: string;
	/**
	 * 检修周期(次)，使用多少次后必须检修，达到期限需提醒，设置alerting=1
	 */
	maintenanceCycles?: number;
	/**
	 * 维护计划：REF MaintenancePlan(planID,planName)
	 */
	maintenancePlanID?: string;
	/**
	 * 下次维护日期
	 */
	planToMaintain?: string;
	/**
	 * 制造厂商
	 */
	manufacturer?: string;
	/**
	 * 出厂编号
	 */
	manufacturingSN?: string;
	/**
	 * 联系人
	 */
	contact: string;
	/**
	 * 来源
	 */
	sourcingFrom?: string;
	/**
	 * 所属工具包：REF_ONE Toolkit(toolkitID,toolkitNo,toolkitName)
	 */
	toolkitID?: string;
	/**
	 * 工具包内顺序，如自动叫料需按顺序
	 */
	toolkitIndex?: number;
	/**
	 * 备注
	 */
	remark?: string;
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
	 * 使用记录
	 */
	uses?: ToolUse[];
	/**
	 * 器具类别
	 */
	category?: ToolCategory;
	/**
	 * 点检表
	 */
	checklist?: EquipmentChecklist;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工装器具实体定义函数
 */
export const defineTool = (o: object) => {
	const e = defineEntity<Tool>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.toolID }
	});
	//使用记录
	e.uses = defineEntityArray(defineToolUse, e.uses);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
