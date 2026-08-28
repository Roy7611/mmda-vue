/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { CertificateLevel } from '@mmda/base/src/enums/CertificateLevel';
/**
 * 工人技能
 * 
 * @remarks 工人技能
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface WorkerSkill extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工人标识
	 */
	workerID: string;
	/**
	 * 技能：REF WorkingSkill(skillID,skillCode,skillName)
	 */
	skillID: string;
	/**
	 * 自从，用于计算经验
	 */
	workFrom?: string;
	/**
	 * 证书
	 */
	certificate?: string;
	/**
	 * 证书编号
	 */
	certificateNo?: string;
	/**
	 * 技能等级：0;NONE;-|1;APPRENTICE;学徒工(企业内设)|2;JUNIOR;初级工(国家5级)|3;INTERMEDIATE;中级工(国家4级)|4;SENIOR;高级工(国家3级)|5;TECHNICIAN;技师(国家2级)|6;SENIOR_TECHNICIAN;高级技师(国家1级)|7;MASTER_TECHNICIAN;特级技师|8;CHIEF_TECHNICIAN;首席技师
	 */
	certificateLevel?: CertificateLevel;
	/**
	 * 有效期
	 */
	validTo?: string;
	/**
	 * 备注
	 */
	remark?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工人技能实体定义函数
 */
export const defineWorkerSkill = (o: object) => {
	const e = defineEntity<WorkerSkill>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.workerID},${this.skillID}` }
	});
	return e;
}
