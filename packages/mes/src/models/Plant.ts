/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
/**
 * 工厂
 *
 * @remarks 工厂
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-08-07 10:30:04.0
 *
 */
export interface Plant extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 站点标识
	 */
	plantID: string;
	/**
	 * 站点编码
	 */
	plantCode: string;
	/**
	 * 站点名称
	 */
	plantName: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 启用日期
	 */
	openDate?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工厂实体定义函数
 */
export const definePlant = (o: object) => {
	const e = defineEntity<Plant>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.plantID }
	});
	return e;
}
