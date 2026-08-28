/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { WorksiteType } from '../enums/WorksiteType';
// import type { WorksiteType } from '../enums/WorksiteType';
import type { RequiredQc } from '../enums/RequiredQc';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
/**
 * 移料原因
 *
 * @remarks 移料原因。定义移料单业务类型，包括是否必须填写什么内容。
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:29.0
 *
 */
export interface MaterialTransReason extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 原因ID
	 */
	reasonID: string;
	/**
	 * 原因编码
	 */
	reasonCode: string;
	/**
	 * 原因名称
	 */
	reasonName: string;
	/**
	 * 提供者必填
	 */
	requiredSupplierID: boolean;
	/**
	 * 消费者必填
	 */
	requiredConsumerID: boolean;
	/**
	 * 源站点必填
	 */
	requiredFromSiteID: boolean;
	/**
	 * 源站点类型：0;WAREHOUSE;仓库|1;PRODUCTION_LINE;产线|2;STATION;工位|4;PROJECT_SITE;项目工地
	 */
	requiredFromSiteTypes: WorksiteType;
	/**
	 * 至站点必填
	 */
	requiredToSiteID: boolean;
	/**
	 * 至站点类型：0;WAREHOUSE;仓库|1;PRODUCTION_LINE;产线|2;STATION;工位|4;PROJECT_SITE;项目工地
	 */
	requiredToSiteTypes: WorksiteType;
	/**
	 * 子项来源，定义能从哪些数据源添加子项，+表示可新增
	 */
	itemSources?: string;
	/**
	 * 物权转移，表示需结算
	 */
	propertyTransit: boolean;
	/**
	 * 内部的，无需走预先通知步骤，异地需双方确认
	 */
	internalMovement: boolean;
	/**
	 * 追踪器具
	 */
	traceTools: boolean;
	/**
	 * 需质量控制：0;NONE;-|1;TRANS_BEFORE;转移前|2;TRANS_AFTER;转移后
	 */
	requiredQc: RequiredQc;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
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
	 * 外部编码，例如SAP的事务码
	 */
	extKey?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 移料原因实体定义函数
 */
export const defineMaterialTransReason = (o: object) => {
	const e = defineEntity<MaterialTransReason>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.reasonID }
	});
	return e;
}
