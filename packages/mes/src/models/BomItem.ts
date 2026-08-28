/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { SourcingMode } from '@mmda/base/src/enums/SourcingMode';
import type { MaterialType } from '@mmda/base/src/enums/MaterialType';
import type { MaterialTracingMode } from '@mmda/base/src/enums/MaterialTracingMode';
import type { InspectMethod } from '../enums/InspectMethod';
import type { CuttingMode } from '@mmda/base/src/enums/CuttingMode';
import type { FormulaType } from '@mmda/base/src/enums/FormulaType';
import type { RoundMode } from '@mmda/base/src/enums/RoundMode';
import type { Material } from '@mmda/base/src/models/Material';
import { ChangeType } from '@mmda/base/src/enums/ChangeType';
import type { Bom } from './Bom';
import { type BomItemOperation, defineBomItemOperation } from './BomItemOperation';
/**
 * 物料清单项
 * 
 * @remarks 物料清单项。标准件指外购的零配件和原材料，工具类指工装器具、模具，虚拟件是一组无需生产的标准件集合，半成品需要生产。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:14:56.0
 * 
 */
export interface BomItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * BOM标识
	 */
	bomID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 组件编号
	 */
	partNo: string;
	/**
	 * 组件级别
	 */
	partLevel: number;
	/**
	 * 物料图片
	 */
	materialPic?: string;
	/**
	 * 物料类别
	 */
	materialCategory?: string;
	/**
	 * 物料标识，可以是不入库的外部物料，控制必须有组件编号
	 */
	materialID?: string;
	/**
	 * 物料编码
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
	 * 规格，通常标准尺寸格式为L*W*H(mm)
	 */
	specs?: string;
	/**
	 * 型号
	 */
	modelType?: string;
	/**
	 * 国标号
	 */
	gbNo?: string;
	/**
	 * 材质
	 */
	texture?: string;
	/**
	 * 用量
	 */
	quantity: number;
	/**
	 * 单位
	 */
	unit: string;
	/**
	 * 替代料策略：REF_ONE AlternativeStrategy(strategyID,strategyCode,strategyName)
	 */
	altStrategyID?: string;
	/**
	 * 重量(KG)
	 */
	weight?: number;
	/**
	 * 损耗率%
	 */
	scrapPercentage: number;
	/**
	 * 来源：0;INVENTORY;库存|1;DIRECT_PURCHASE;直采|2;MAKE;自制|3;OUTSOURCE;外协
	 */
	sourcingMode: SourcingMode;
	/**
	 * 链接
	 */
	sourcingUrl?: string;
	/**
	 * 变更类型：0;NONE;-|1;CHANGED;修改|2;ADDED;增项|4;REMOVED;减项
	 */
	amendType: ChangeType;
	/**
	 * 性质：0;LABOR;劳动力|1;RAW_MATERIAL;原材料|2;PART;零配件|4;SEMI_PRODUCT;半成品|8;PRODUCT;产成品|16;TOOLS;机具设备|32;PACKAGING;包材|64;CONSUMABLE;办公用品|128;OTHER;其他
	 */
	partType: MaterialType;
	/**
	 * 子件BOM：HAS_ONE Bom(bomID,bomNo) AS partBom
	 */
	partBomID?: string;
	/**
	 * 子件交期(天)
	 */
	partLeadTime?: number;
	/**
	 * 加工工序，如04 预表干，05 流涂，06 表干，多个工序用逗号隔开，第一个为上料工序，若无工序则纯配件只提供而已
	 */
	opCodes?: string;
	/**
	 * 图纸编号
	 */
	drawingNo?: string;
	/**
	 * 产出比率。0~1，指一件产品完成此道工序后的产值比，用于计算产值进度。
	 */
	outputRate: number;
	/**
	 * 追踪方式：0;NONE;-|1;LOT;批次|2;SN;序列号
	 */
	tracingMode: MaterialTracingMode;
	/**
	 * 检验方式：0;NONE;-|1;RANDOM;抽检|2;FULL;全检
	 */
	inspectMethod: InspectMethod;
	/**
	 * 切割方式：0;NONE;不切割|1;X;切段|3;XY;切块
	 */
	cuttingMode: CuttingMode;
	/**
	 * 切割规格，如型材1560mm，如玻璃416*847mm
	 */
	cuttingSpecs?: string;
	/**
	 * 算量类型：0;NONE;手工录入|1;FIXED;固定用量|2;TIMES;乘工程量|3;FORMULA;使用公式
	 */
	formulaType: FormulaType;
	/**
	 * 算量公式，默认为生产数量*用量/(1-损耗率%)，型材取长度，玻璃取面积
	 */
	formula?: string;
	/**
	 * 取整方式：0;NONE;不取整|1;ONE;逢一进位|3;THREE;二舍三入|5;FIVE;四舍五入
	 */
	roundMode: RoundMode;
	/**
	 * 虚拟件，是一组物料的组合
	 */
	phantom: boolean;
	/**
	 * 备件，设备BOM里面用于备品备件
	 */
	sparePart: boolean;
	/**
	 * 成本汇总
	 */
	costRollup: boolean;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 引用名称
	 */
	refName?: string;
	/**
	 * 引用单号，例如BomNo
	 */
	refNo?: string;
	/**
	 * 引用标识
	 */
	refID?: string;
	/**
	 * 引用序号
	 */
	refItemID?: number;
	/**
	 * 沟通结果集 用 ; 分割
	 */
	communicatePic?: string;
	/**
	 * 物料清单项工序
	 */
	operations?:  BomItemOperation[];
	/**
	 * 物料
	 */
	material?: Material;
	/**
	 * 子件BOM
	 */
	partBom?: Bom;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料清单项实体定义函数
 */
export const defineBomItem = (o: object) => {
	const e = defineEntity<BomItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.bomID},${this.itemID}` }
	});
	//物料清单项工序
	e.operations = defineEntityArray(defineBomItemOperation, e.operations);
	return e;
}
