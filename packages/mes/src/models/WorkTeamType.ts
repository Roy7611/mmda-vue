/*
 * @Author: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @Date: 2026-06-01 18:49:22
 * @LastEditors: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @LastEditTime: 2026-06-03 14:16:55
 * @FilePath: \mmda\packages\mes\src\models\WorkTeamType.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import { type WorkTeamTypeCert, defineWorkTeamTypeCert } from './WorkTeamTypeCert'

/**
 * 班组类型
 * 
 * @remarks 班组类型
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2026-03-30 11:55:03.0
 * 
 */
export interface WorkTeamType extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 班组类型ID
	 */
	teamTypeID: string;
	/**
	 * 班组类型编码
	 */
	teamTypeCode: string;
	/**
	 * 班组类型名称
	 */
	teamTypeName: string;
	/**
	 * 标配人数
	 */
	stdMemberCount?: number;
	/**
	 * 最低人数，最低几人能开工
	 */
	minMemberCount?: number;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 班组类型证
	 */
	workTeamTypeCerts?: WorkTeamTypeCert[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 班组类型实体定义函数
 */
export const defineWorkTeamType = (o: object) => {
	const e = defineEntity<WorkTeamType>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return this.teamTypeID }
	});

	e.workTeamTypeCerts = defineEntityArray(defineWorkTeamTypeCert, e.workTeamTypeCerts);
	return e;
}
