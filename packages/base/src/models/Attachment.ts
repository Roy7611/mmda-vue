/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 附件
 * 
 * @remarks 附件
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Attachment extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 对象名称
	 */
	objName: string;
	/**
	 * 对象标识
	 */
	objID: string;
	/**
	 * 附件名称
	 */
	fileName: string;
	/**
	 * 文件大小
	 */
	fileSize: string;
	/**
	 * 上传人
	 */
	uploader?: string;
	/**
	 * 上传时间
	 */
	uploadTime: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 附件实体定义函数
 */
export const defineAttachment = (o: object) => {
	const e = defineEntity<Attachment>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.objName},${this.objID},${this.fileName}` }
	});
	return e;
}
