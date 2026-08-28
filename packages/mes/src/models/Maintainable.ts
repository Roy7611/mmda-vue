/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 可维护物
 * 
 * @remarks 可维护物。例如生产设备、工具
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-09-28 05:32:05.0
 * 
 */
export interface Maintainable extends Entity {
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
	 * 序列号
	 */
	serialNo?: string;
	/**
	 * 设备类型
	 */
	equipType: number;
	/**
	 * 类别
	 */
	category?: string;
	/**
	 * 投产日期
	 */
	startWorkDate?: string;
	/**
	 * 点检表
	 */
	checkListID?: string;
	/**
	 * 维护计划
	 */
	maintenancePlanID?: string;
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 可维护物实体定义函数
 */
export const defineMaintainable = (o: object) => {
	const e = defineEntity<Maintainable>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.equipID }
	});
	return e;
}
