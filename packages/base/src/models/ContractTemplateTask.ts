/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { TaskLevel } from '../enums/TaskLevel';
import type { TaskPhase } from '../enums/TaskPhase';
import type { WorkLane } from '../enums/WorkLane';
/**
 * 合同模板任务
 * 
 * @remarks 合同模板任务
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface ContractTemplateTask extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模板标识
	 */
	templateID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 任务编号，多级编号如1, 1.1,1.2
	 */
	taskNo: string;
	/**
	 * 任务名称
	 */
	taskName: string;
	/**
	 * 里程碑
	 */
	milestone: boolean;
	/**
	 * 级别，从0开始编号中有几个.
	 */
	taskLevel: TaskLevel;
	/**
	 * 所属阶段：0;STAGE;筹划|1;DESIGN;设计|2;MAKE;生产|3;INSTALL;安装|4;TEST;测试|5;ACCEPT;验收
	 */
	taskPhase: TaskPhase;
	/**
	 * 业务条线：0;GENERAL;总|1;MARKETING;市场|2;SALES;销售|4;SERVICE;服务|8;DESIGN;方案设计|16;OPERATION;运营|32;RESEARCHING;技研|64;PURCHASING;采购|128;PRODUCTION;生产|256;LOGISTICS;物流512;DELIVERING;交付|1024;RMA;售后|2048;HR;人力资源|4096;FINANCIAL;财务|8192;IT;信息|16384;OTHER;其他
	 */
	workLane?: WorkLane;
	/**
	 * 子任务数
	 */
	subtaskNum: number;
	/**
	 * 标准工期(天)
	 */
	duration: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 合同模板任务实体定义函数
 */
export const defineContractTemplateTask = (o: object) => {
	const e = defineEntity<ContractTemplateTask>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.templateID},${this.itemID}` }
	});
	return e;
}
