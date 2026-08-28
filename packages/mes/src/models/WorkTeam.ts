/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { WorkTeamStatus } from '../enums/WorkTeamStatus';
import type { WorkTeamType } from './WorkTeamType';
import { type Worker, defineWorker } from './Worker';
import { type WorkTeamShift, defineWorkTeamShift } from './WorkTeamShift';
/**
 * 班组
 * 
 * @remarks 班组
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-30 11:54:31.0
 * 
 */
export interface WorkTeam extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 班组ID
	 */
	teamID: string;
	/**
	 * 班组编号
	 */
	teamNo: string;
	/**
	 * 班组名称
	 */
	teamName: string;
	/**
	 * 班组类型：HAS_ONE WorkTeamType(teamTypeID,teamTypeCode,teamTypeName)
	 */
	teamTypeID: string;
	/**
	 * 班组长：HAS_ONE Worker(workerID,workerNo,workerName) AS leader
	 */
	leaderID?: string;
	/**
	 * 成员人数
	 */
	memberCount?: number;
	/**
	 * 合格否，不符合班组类型的资质认证无法开工
	 */
	qualified?: boolean;
	/**
	 * 状态：0;NEW;新|1;ACTIVE;可用|4;OFF_DUTY;不可用|-1;DISBANDED;解散
	 */
	status: WorkTeamStatus;
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
	 * 出勤班次
	 */
	shifts?: WorkTeamShift[];
	/**
	 * 工人
	 */
	members?: Worker[];
	/**
	 * 班组类型
	 */
	workTeamType?: WorkTeamType;
	/**
	 * 班组长
	 */
	leader?: Worker;
	//#endregion ~GENERATED PARTS END
}
/**
 * 班组实体定义函数
 */
export const defineWorkTeam = (o: object) => {
	const e = defineEntity<WorkTeam>(o);
	// 定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.teamID }
	});
	// 出勤班次
	e.shifts = defineEntityArray(defineWorkTeamShift, e.shifts);
	// 工人
	e.members = defineEntityArray(defineWorker, e.members);
	return e;
}
