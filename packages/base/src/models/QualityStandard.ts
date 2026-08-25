/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { OpenStandardType } from '../enums/OpenStandardType';
import type { UsageStatus } from '../enums/UsageStatus';
/**
 * 质量标准
 * 
 * @remarks 质量标准，例如国标GB-1234
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface QualityStandard extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 标准编码
	 */
	qsCode: string;
	/**
	 * 标准类型：0;ISO;国际标准|1;GB;国家标准|2;IS;行业标准|3;EB;企业标准
	 */
	qsType: OpenStandardType;
	/**
	 * 标准名称
	 */
	qsName: string;
	/**
	 * 状态：0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用
	 */
	status: UsageStatus;
	/**
	 * 最后修改
	 */
	lastModified: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 质量标准实体定义函数
 */
export const defineQualityStandard = (o: object) => {
	const e = defineEntity<QualityStandard>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.qsCode }
	});
	return e;
}
