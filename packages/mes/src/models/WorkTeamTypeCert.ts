/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { CertificateLevel } from '@mmda/base/src/enums/CertificateLevel';
import type { WorkingSkill } from './WorkingSkill';
/**
 * 班组类型认证
 * 
 * @remarks 班组类型认证
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-30 11:55:16.0
 * 
 */
export interface WorkTeamTypeCert extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 班组类型ID
	 */
	teamTypeID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 要求技能：HAS_ONE WorkingSkill(skillID,skillCode,skillName)
	 */
	skillID: string;
	/**
	 * 技能等级：0;NONE;-|1;APPRENTICE;学徒工(企业内设)|2;JUNIOR;初级工(国家5级)|3;INTERMEDIATE;中级工(国家4级)|4;SENIOR;高级工(国家3级)|5;TECHNICIAN;技师(国家2级)|6;SENIOR_TECHNICIAN;高级技师(国家1级)|7;MASTER_TECHNICIAN;特级技师|8;CHIEF_TECHNICIAN;首席技师
	 */
	certificateLevel?: CertificateLevel;
	/**
	 * 必须全员认证
	 */
	requiredAllCertified: boolean;
	/**
	 * 必须班组长认证
	 */
	requiredLeaderCertified: boolean;
	/**
	 * 必须认证人数
	 */
	requiredCertifiedCount: number;
	/**
	 * 要求技能
	 */
	workingSkill?: WorkingSkill;
	//#endregion ~GENERATED PARTS END
}
/**
 * 班组类型认证实体定义函数
 */
export const defineWorkTeamTypeCert = (o: object) => {
	const e = defineEntity<WorkTeamTypeCert>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.teamTypeID},${this.itemID}` }
	});
	return e;
}
