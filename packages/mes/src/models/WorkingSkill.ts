/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
/**
 * 工作技能
 * 
 * @remarks 工作技能
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface WorkingSkill extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料标识
	 */
	skillID: string;
	/**
	 * 物料编码
	 */
	skillCode: string;
	/**
	 * 物料名称
	 */
	skillName: string;
	/**
	 * 单位，计价单位引用Unit(unit,unit)
	 */
	unit: string;
	/**
	 * 成本单价，指采购价或出厂价
	 */
	costPrice?: number;
	/**
	 * 销售单价，用于工程项目或批发价
	 */
	salesPrice?: number;
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 工作技能实体定义函数
 */
export const defineWorkingSkill = (o: object) => {
	const e = defineEntity<WorkingSkill>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.skillID }
	});
	return e;
}
