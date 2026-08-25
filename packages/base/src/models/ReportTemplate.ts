/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 报表模板
 * 
 * @remarks 报表模板
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-26 23:51:57.0
 * 
 */
export interface ReportTemplate extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 模板标识
	 */
	templateID: string;
	/**
	 * 对象名称
	 */
	objName: string;
	/**
	 * 模板名称
	 */
	templateName: string;
	/**
	 * 模板文件，Excel报表模板
	 */
	templateFile: string;
	/**
	 * 上传人
	 */
	uploader?: string;
	/**
	 * 上传时间
	 */
	uploadTime?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 报表模板实体定义函数
 */
export const defineReportTemplate = (o: object) => {
	const e = defineEntity<ReportTemplate>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.templateID }
	});
	return e;
}
