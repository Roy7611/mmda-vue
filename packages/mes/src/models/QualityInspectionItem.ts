/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 质量检验项
 * 
 * @remarks 质量检验项
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 10:30:05.0
 * 
 */
export interface QualityInspectionItem extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 质检标识
	 */
	inspectionID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 品控标准标识，NULL表示临时增项
	 */
	qcsID?: string;
	/**
	 * 类别
	 */
	category: string;
	/**
	 * 检查内容
	 */
	itemName: string;
	/**
	 * 判定基准
	 */
	criterion?: string;
	/**
	 * 合格否
	 */
	qualified?: boolean;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量检验项实体定义函数
 */
export const defineQualityInspectionItem = (o: object) => {
	const e = defineEntity<QualityInspectionItem>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.inspectionID},${this.itemID}` }
	});
	return e;
}
