/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-07-01 15:29:21
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-05-29 09:28:43
 * @FilePath: /mmda-vue/packages/mes/src/models/LinesideInventory.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { QaStatus } from '@mmda/base/src/enums/QaStatus';
import type { Worksite } from './Worksite';
import { type LinesideInventoryItem, defineLinesideInventoryItem } from './LinesideInventoryItem';
/**
 * 线边库存
 *
 * @remarks 线边库存
 *
 * @author mmda codebot
 * @version 4.0.0
 * @since 2024-09-01 08:45:28.0
 *
 */
export interface LinesideInventory extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 当前站点（至站点）：HAS_ONE Worksite(siteID,siteCode,siteName) AS toSite
	 */
	siteID: string;
	/**
	 * 组件号，根据物料信息哈希生成，如果有materialID则使用它来哈希，否则使用materialName,brand,specs,modelType,texture,other来计算
	 */
	partNo: string;
	/**
	 * 物料标识
	 */
	materialID?: string;
	/**
	 * 物料编码，如型材号
	 */
	materialCode?: string;
	/**
	 * 物料名称
	 */
	materialName: string;
	/**
	 * 品牌
	 */
	brand?: string;
	/**
	 * 规格，玻璃为厚度*W*H，型材为算量后定长L
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 材质
	 */
	texture?: string;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 质量状态：* 0;UNKNOWN;-|1;NI;待检品|2;OK;合格品|4;AUC;让步接受|8;DG;瑕疵品|16;NG;不良品|32;SCRAP;废品  
	 */
	qaStatus?: QaStatus;
	/**
	 *
	 */
	leftOverQuantity?: number;
	/**
	 *
	 */
	totalAmount?: number;
	/**
	 * 明细项
	 */
	items?: LinesideInventoryItem[];
	/**
	 * 至站点
	 */
	toSite?: Worksite;
	//#endregion ~GENERATED PARTS END
}
/**
 * 线边库存实体定义函数
 */
export const defineLinesideInventory = (o: object) => {
	const e = defineEntity<LinesideInventory>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.siteID},${this.partNo},${this.qaStatus}` }
	});
	//明细项
	e.items = defineEntityArray(defineLinesideInventoryItem, e.items);
	return e;
}
