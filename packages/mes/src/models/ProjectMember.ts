/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
/**
 * 项目成员
 * 
 * @remarks 项目成员
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-09-01 08:45:31.0
 * 
 */
export interface ProjectMember extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 成员：REF User(userID,userName,mobile)
	 */
	memberID: string;
	/**
	 * 担任职务
	 */
	memberTitle?: string;
	/**
	 * 在现场
	 */
	onsite: boolean;
	/**
	 * 加入时间
	 */
	joinTime: string;
	/**
	 * 领导标识
	 */
	leaderID?: string;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 
	 */
	lastModified: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目成员实体定义函数
 */
export const defineProjectMember = (o: object) => {
	const e = defineEntity<ProjectMember>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return `${this.projectID},${this.memberID}` }
	});
	return e;
}
