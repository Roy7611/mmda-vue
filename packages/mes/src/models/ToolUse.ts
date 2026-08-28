/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
/**
 * 器具使用
 * 
 * @remarks 器具使用
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:05.0
 * 
 */
export interface ToolUse extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 器具标识
	 */
	toolID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 发生日期
	 */
	transDate: string;
	/**
	 * 事务原因：REF_ONE MaterialTransReason(reasonID,reasonCode,reasonName)
	 */
	transReasonID: string;
	/**
	 * 变动至站点：REF_ONE Worksite(siteID,siteCode,siteName)
	 */
	toSiteID?: string;
	/**
	 * 变动至
	 */
	newLoc?: string;
	/**
	 * 折旧成本
	 */
	usedCost?: number;
	/**
	 * 剩余价值
	 */
	remainedCost?: number;
	/**
	 * 增加数量
	 */
	extendedCycles?: number;
	/**
	 * 使用次数
	 */
	usedCycles?: number;
	/**
	 * 剩余次数
	 */
	remainedCycles?: number;
	/**
	 * 状态变为：0;NONE;-|1;NORMAL;正常使用|2;ALERTED;谨慎使用|4;DISABLED;暂停使用|-1;SCAPPED;已报废|-2;TRANSFORMED;已改制|-3;EOL;寿命终结|-4;DISPOSED;已处置 
	 */
	toStatus?: number;
	/**
	 * 经办人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 责任人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 责任部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
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
 * 器具使用实体定义函数
 */
export const defineToolUse = (o: object) => {
	const e = defineEntity<ToolUse>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.toolID},${this.itemID}` }
	});
	return e;
}
