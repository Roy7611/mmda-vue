/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { OpPhase } from '../enums/OpPhase';
import type { OpType } from '../enums/OpType';
import type { WipTransMode } from '../enums/WipTransMode';
import type { QcInProcessType } from '../enums/QcInProcessType';
import type { Doc } from './Doc';
import type { QualityControlStandard } from './QualityControlStandard';
import { type Process, defineProcess } from './Process';
import { type ProcessOperationResource, defineProcessOperationResource } from './ProcessOperationResource';
import { type ProcessOperationAlarm, defineProcessOperationAlarm } from './ProcessOperationAlarm';
import { type ProcessOperationParam, defineProcessOperationParam } from './ProcessOperationParam';
import { type ProcessOperationChart, defineProcessOperationChart } from './ProcessOperationChart';

/**
 * 制程工序
 * 
 * @remarks 制程工序。定义工序编码、名称、耗时、生产参数、报警、所需资源及成本计算。工序可以是一个子制程，子制程必然会产出半成品或原材料。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:04.0
 * 
 */
export interface ProcessOperation extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 制程标识
	 */
	processID: string;
	/**
	 * 工序编码
	 */
	opCode: string;
	/**
	 * 工序名称
	 */
	opName: string;
	/**
	 * 工序组
	 */
	opGroup?: string;
	/**
	 * 工序阶段：0;PREPARE;准备|1;START;启动|2;MID;中间|4;END;结束
	 */
	opPhase: OpPhase;
	/**
	 * 工序类型：0;MAKE;生产|1;TEST;测试|2;SPECIAL;特殊|4;STORAGE;缓存
	 */
	opType: OpType;
	/**
	 * 启动数
	 */
	startQty: number;
	/**
	 * 准备时间(秒)
	 */
	setupTime: number;
	/**
	 * 标准工时(秒)
	 */
	opTime: number;
	/**
	 * 生产周期(秒)，setupTime+opTime+outRoute.lag
	 */
	cycleTime: number;
	/**
	 * 工艺文档：HAS_ONE Doc(docID,docName) AS opDoc
	 */
	opDocID?: string;
	/**
	 * 工艺参数，定义默认的参数名称和值，例如冷却时间
	 */
	opParams?: string;
	/**
	 * 产出比率。0~1，指一件产品完成此道工序后的产值比，用于计算产值进度。
	 */
	outputRate: number;
	/**
	 * (半)制品报工
	 */
	outputProduct: boolean;
	/**
	 * 计量单位
	 */
	outputUnit?: string;
	/**
	 * 标准产出率，标准工时内的产量
	 */
	outputQtyPerCycle?: number;
	/**
	 * 在制品转移模式：0;SHIFT;每班次|1;EACH;每件|2;BATCH;批量|4;PERIODIC;定期
	 */
	wipTransMode: WipTransMode;
	/**
	 * 在制品转移批量，用于生产作业分批，提高排程并行度
	 */
	wipTransBatchQty?: number;
	/**
	 * 在制品定期转移时间，用于计算下道工序启动时间
	 */
	wipTransDuration?: string;
	/**
	 * 制程品控类型：0;NONE;无|1;FIRST_PIECE;首件检验|2;PATROL_INSPECTION;过程巡检|4;LAST_PIECE;末件终验
	 */
	qcInProcessTypes: QcInProcessType;
	/**
	 * 品控标准：HAS_ONE QualityControlStandard(qcsID,qcsNo) AS qcStandard
	 */
	qcsID?: string;
	/**
	 * 子制程：HAS_ONE Process(processID,processName) AS subProcess
	 */
	subProcessID?: string;
	/**
	 * 描述
	 */
	description?: string;
	/**
	 * X
	 */
	x?: number;
	/**
	 * Y
	 */
	y?: number;
	/**
	 * 宽
	 */
	width?: number;
	/**
	 * 高
	 */
	height?: number;
	/**
	 * 所需资源
	 */
	resources?: ProcessOperationResource[];
	/**
	 * 报警
	 */
	alarms?: ProcessOperationAlarm[];
	/**
	 * 参数
	 */
	params?: ProcessOperationParam[];
	/**
	 * 图表
	 */
	charts?: ProcessOperationChart[];
	/**
	 * 子制程
	 */
	subProcess?: Process;
	/**
	 * 工艺文档
	 */
	opDoc?: Doc;
	/**
	 * 品控标准
	 */
	qcStandard?: QualityControlStandard;
	//#endregion ~GENERATED PARTS END
}
/**
 * 制程工序实体定义函数
 */
export const defineProcessOperation = (o: object) => {
	const e = defineEntity<ProcessOperation>(o);

	// 测试/开发使用
	// if (import.meta.env.MODE === 'development') {
	// 	e.startQty = 10
	// 	e.setupTime = 10
	// 	e.opTime = 10
	// 	e.cycleTime = 10
	// 	e.outputRate = 0.25;
	// }

	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.processID},${this.opCode}` }
	});
	//所需资源
	e.resources = defineEntityArray(defineProcessOperationResource, e.resources);
	//报警
	e.alarms = defineEntityArray(defineProcessOperationAlarm, e.alarms);
	//参数
	e.params = defineEntityArray(defineProcessOperationParam, e.params);
	//图表
	e.charts = defineEntityArray(defineProcessOperationChart, e.charts);
	return e;
}
