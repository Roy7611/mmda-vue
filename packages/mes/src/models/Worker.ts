/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { Gender } from '@mmda/base/src/enums/Gender';
import type { LaborType } from '@mmda/base/src/enums/LaborType';
import type { IcType } from '@mmda/base/src/enums/IcType';
import type { MarriageStatus } from '@mmda/base/src/enums/MarriageStatus';
import type { EmployeeStatus } from '@mmda/base/src/enums/EmployeeStatus';
import type { Material } from '@mmda/base/src/models/Material';
import type { WorkTeam } from './WorkTeam';
import type { Department } from '@mmda/base/src/models/Department';
import { type WorkerSkill, defineWorkerSkill } from './WorkerSkill';
/**
 * 工人
 * 
 * @remarks 工人。劳动力资源，类似设备，作为生产资源的一种，属于物料中特殊类型（LABOR）的一种。这里保存的是具体的某个工人的资料，在排程中要考虑在时间维度上的冲突。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-07 23:30:05.0
 * 
 */
export interface Worker extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 工人标识
	 */
	workerID: string;
	/**
	 * 头像
	 */
	avatar?: string;
	/**
	 * 工号
	 */
	workerNo?: string;
	/**
	 * 姓名
	 */
	workerName: string;
	/**
	 * 性别：0;UNKNOWN;-|1;MALE;男|2;FEMALE;女
	 */
	gender: Gender;
	/**
	 * 劳工类型：0;EMPLOYED;职工|1;OUTSOURCED;劳务工|2;TEMPORARY;临时工
	 */
	laborType: LaborType;
	/**
	 * 关联物料：HAS_ONE base.Material(materialID,materialCode,materialFullName) AS part
	 */
	materialID?: string;
	/**
	 * 班长否
	 */
	captain: boolean;
	/**
	 * 所属班组：HAS_ONE WorkTeam(teamID,teamNo,teamName) AS workTeam
	 */
	teamID?: string;
	/**
	 * 证件类型：0;ID_CARD;身份证|1;PASSPORT;护照|2;MILITARY_CARD;军人证|3;SAR_ID_CARD;港澳台身份证|9;OTHER;其他证件
	 */
	icType?: IcType;
	/**
	 * 证件号
	 */
	icNo?: string;
	/**
	 * 证件照(正面)
	 */
	icPicA?: string;
	/**
	 * 证件照(背面)
	 */
	icPicB?: string;
	/**
	 * 生日
	 */
	birthday?: string;
	/**
	 * 婚姻状况：0;UNKNOWN;-|1;SINGLE;未婚|2;MARRIED;已婚|3;SEPERATED;分居|4;DIVOICED;离异|5;WIDOWED;丧偶
	 */
	marriage: MarriageStatus;
	/**
	 * 手机
	 */
	mobile?: string;
	/**
	 * 电子邮箱
	 */
	email?: string;
	/**
	 * 微信号
	 */
	wechat?: string;
	/**
	 * 钉钉号，可不同于mobile
	 */
	dingtalk?: string;
	/**
	 * 工作部门：HAS_ONE Department(deptID,deptName,parentDeptID) AS workDepartment WHERE(status>0)
	 */
	workDeptID: string;
	/**
	 * 职员标识，当laborType=EMPLOYED，工人为正式员工
	 */
	empID?: string;
	/**
	 * 状态：0;NEW;新员工|1;ON_BOARD;在岗|-1;LEAVE;离岗
	 */
	status: EmployeeStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName,parentDeptID)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 技能
	 */
	skills?: WorkerSkill[];
	/**
	 * 关联物料
	 */
	material?: Material;
	/**
	 * 所属班组
	 */
	workTeam?: WorkTeam;
	/**
	 * 工作部门
	 */
	workDepartment?: Department;
	//#endregion ~GENERATED PARTS END
}
/**
 * 工人实体定义函数
 */
export const defineWorker = (o: object) => {
	const e = defineEntity<Worker>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.workerID }
	});
	//技能
	e.skills = defineEntityArray(defineWorkerSkill, e.skills);
	return e;
}

export const defineSelectWorker = (o: object) => {
	const e = defineEntity<Worker>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.workerID }
	});
	return e;
}
