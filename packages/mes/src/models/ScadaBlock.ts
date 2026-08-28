/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Endianness } from '@mmda/base/src/enums/Endianness';
import { type ScadaCell, defineScadaCell } from './ScadaCell';
/**
 * 数控块
 * 
 * @remarks 数控块
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-10-21 14:46:20.0
 * 
 */
export interface ScadaBlock extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 数控块ID
	 */
	blockID: string;
	/**
	 * 数控块编号
	 */
	blockNo: string;
	/**
	 * 数控块名称
	 */
	blockName: string;
	/**
	 * 信道，例如：Modbus://192.168.0.1:30000?transport=UDP
	 */
	endpointUrl?: string;
	/**
	 * 存储区域
	 */
	memoryArea?: string;
	/**
	 * 存储序号
	 */
	memoryNo?: number;
	/**
	 * 字节序：0;LITTLE;小端|1;BIG;大端
	 */
	byteOrder: Endianness;
	/**
	 * 字节数
	 */
	byteLength: number;
	/**
	 * 连续的，连续的块可批量采集数据
	 */
	continuous: boolean;
	/**
	 * 采集间隔(s)
	 */
	collectInterval: number;
	/**
	 * 接收超时(ms)
	 */
	receiveTimeout?: number;
	/**
	 * 发送超时(ms)
	 */
	sendTimeout?: number;
	/**
	 * 长连接
	 */
	keepAlive: boolean;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF base.User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF base.Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF base.User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 数控单元
	 */
	cells:  ScadaCell[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 数控块实体定义函数
 */
export const defineScadaBlock = (o: object) => {
	const e = defineEntity<ScadaBlock>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.blockID }
	});
	//数控单元
	e.cells = defineEntityArray(defineScadaCell, e.cells);
	return e;
}
