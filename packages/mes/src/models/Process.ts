/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ProcessType } from '../enums/ProcessType';
import type { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import type { MaterialCat } from '@mmda/base/src/models/MaterialCat';
import { type ProcessOperation, defineProcessOperation } from './ProcessOperation';
import { type ProcessRoute, defineProcessRoute } from './ProcessRoute';
import { type ProcessLine, defineProcessLine } from './ProcessLine';
/**
 * 制程
 * 
 * @remarks 制程。即工艺路线，定义了生产一种产品（或变种）所需的工序顺序，即生产流程的结构，同时定义了每道工序所需资源、安装和执行所需时间以及生产成本如何计算。在工艺路线中将为每道工序分配工序编号和后续工序。 工序顺序形成工艺路线网络，而工艺路线网络可通过带有方向且有一个或多个起点，但是只有一个终点的图表表示。工艺路线有两种，即简单工艺路线和工艺路线网络。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:04.0
 * 
 */
export interface Process extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 制程编码
	 */
	processCode: string;
	/**
	 * 制程名称
	 */
	processName: string;
	/**
	 * 制程类型：0;PROCESS;流程制造|1;DISCRETE;离散制造
	 */
	processType: ProcessType;
	/**
	 * 终结工序
	 */
	endOpCode: string;
	/**
	 * 制品类别：HAS_ONE base.MaterialCat(categoryID,categoryName) AS productCategory
	 */
	productCategoryID: string;
	/**
	 * 生产周期(min)，所有工序的Cycle Time总和
	 */
	leadTime?: number;
	/**
	 * 生产节拍(min)，瓶颈工序的Cycle Time/60
	 */
	cycleMinutes?: number;
	/**
	 * 节拍产量
	 */
	cycleOutputQty?: number;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
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
	 * 用于存储BPMN流程图的XML
	 */
	xmlJson?: string;
	/**
	 * 工序
	 */
	operations: ProcessOperation[];
	/**
	 * 路线
	 */
	routes: ProcessRoute[];
	/**
	 * 产线
	 */
	lines?: ProcessLine[];
	/**
	 * 制品类别
	 */
	productCategory?: MaterialCat;
	//#endregion ~GENERATED PARTS END
}
/**
 * 制程实体定义函数
 */
export const defineProcess = (o: object) => {
	const e = defineEntity<Process>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.processID }
	});
	//工序
	e.operations = defineEntityArray(defineProcessOperation, e.operations);
	//路线
	e.routes = defineEntityArray(defineProcessRoute, e.routes);
	//产线
	e.lines = defineEntityArray(defineProcessLine, e.lines);
	return e;
}
