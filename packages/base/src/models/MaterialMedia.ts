/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { MaterialMediaType } from '../enums/MaterialMediaType';
/**
 * 物料附件
 * 
 * @remarks 物料附件。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface MaterialMedia extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 物料编号
	 */
	materialID: string;
	/**
	 * 序号
	 */
	itemID: number;
	/**
	 * 媒体类型：0;PICTURE;图片|1;BROCHURE;说明书|2;DRAWING;二维图纸|3;MODEL;三维模型|4;VIDEO;视频|9;OTHER;其他文档
	 */
	mediaType: MaterialMediaType;
	/**
	 * 媒体文件
	 */
	mediaFile: string;
	/**
	 * 描述
	 */
	description?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 物料附件实体定义函数
 */
export const defineMaterialMedia = (o: object) => {
	const e = defineEntity<MaterialMedia>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.materialID},${this.itemID}` }
	});
	return e;
}
