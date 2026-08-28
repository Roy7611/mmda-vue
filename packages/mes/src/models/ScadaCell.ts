/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ScadaCellType } from '../enums/ScadaCellType';
import type { DeviceDataType } from '@mmda/base/src/enums/DeviceDataType';
import type { ReadWriteMode } from '@/compat/iot/ReadWriteMode';
import type { DeviceDataJournalizability } from '@mmda/base/src/enums/DeviceDataJournalizability';
/**
 * 数控单元
 * 
 * @remarks 数控单元。dataType为中间映射类型，例如UINT8映射为C# byte, Java short，字符串等可变类型需加上byteLength。 而设备数据类型隐藏在startAddress中，例如DB20.DBW12表示这是一个WORD类型，怎么寻址取决于不同的设备控制器，例如西门子和A/B就完全不一样。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-10-21 14:46:20.0
 * 
 */
export interface ScadaCell extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 数控块ID
	 */
	blockID: string;
	/**
	 * 单元ID
	 */
	cellID: number;
	/**
	 * 分组，例如同一设备划分一组
	 */
	cellGroup?: string;
	/**
	 * 单元名称，比如TEMP.NPV
	 */
	cellName: string;
	/**
	 * 单元标签，比如当前温度PV
	 */
	cellLabel?: string;
	/**
	 * 单元类型：0;DATA;数据|1;IO;信号|4;ALARM;报警
	 */
	cellType: ScadaCellType;
	/**
	 * 数据类型
	 */
	dataType: string;
	/**
	 * 字节长度，字符串等可变长度型手动填写
	 */
	bitLength?: number;
	/**
	 * 单位，例如℃
	 */
	unit?: string;
	/**
	 * 小数，如0.01表示采集数据*0.01
	 */
	multiplier?: number;
	/**
	 * 读写控制：0;NA;不可用|1;RO;只读|2;WO;只写|3;RW;读写
	 */
	readWriteMode: ReadWriteMode;
	/**
	 * 信号确认次数
	 */
	confirmTimes?: number;
	/**
	 * 日志化：0;NEVER;从不|1;ALWAYS;总是|2;ON_CHANGE;变化时
	 */
	journalizable: DeviceDataJournalizability;
	/**
	 * 起始地址，例如MW4000, DBW21
	 */
	startAddress?: string;
	/**
	 * 枚举设置，形如 b0;START;启动 表示0位是启动位，而0;START;启动表示值0是启动
	 */
	enumSet?: string;
	/**
	 * 预设值/理想值
	 */
	preferValue?: number;
	/**
	 * 最小值
	 */
	minValue?: number;
	/**
	 * 最大值
	 */
	maxValue?: number;
	/**
	 * 校验规则，使用Min(m),Max(n),Range(m,n),After(d)等设置多个校验规则
	 */
	validationRules?: string;
	/**
	 * 报警消息
	 */
	alarmMessage?: string;
	/**
	 * 颜色
	 */
	cellColor?: string;
	/**
	 * 描述
	 */
	description?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 数控单元实体定义函数
 */
export const defineScadaCell = (o: object) => {
	const e = defineEntity<ScadaCell>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.blockID},${this.cellID}` }
	});
	return e;
}
