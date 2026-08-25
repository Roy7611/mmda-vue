/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Importance } from '../enums/Importance';
import type { Urgency } from '../enums/Urgency';
import type { FlowTokenStatus } from '../enums/FlowTokenStatus';
/**
 * 流程追踪
 * 
 * @remarks 流程追踪
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-11 22:39:57.0
 * 
 */
export interface FlowTrail extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 审计标识
	 */
	trailID: string;
	/**
	 * 对象名称
	 */
	objName: string;
	/**
	 * 对象标识
	 */
	objID: string;
	/**
	 * 行动时间
	 */
	actTime: string;
	/**
	 * 行动人：REF User(userID,userName)
	 */
	actorID: string;
	/**
	 * 操作状态转移，例如close(SUBMITTED=>CLOSED)
	 */
	asTransition?: string;
	/**
	 * 重要性：0;UNKNOWN;-|1;IMPORTANT;重要|2;VERY_IMPORTANT;非常重要
	 */
	importance: Importance;
	/**
	 * 紧急性：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	urgency: Urgency;
	/**
	 * 通知
	 */
	notification: string;
	/**
	 * 主办人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 办理状态：0;NEW;未办理|1;DONE;已办理|-1;CANCELLED;已取消|-2;TERMINATED;已终止
	 */
	status: FlowTokenStatus;
	/**
	 * 办理时间
	 */
	consumedTime?: string;
	/**
	 * 花费时间(min)
	 * timestampdiff(MINUTE,actTime,consumedTime)
	 */
	costTime?: number;
	//#endregion ~GENERATED PARTS END
}
/**
 * 流程追踪实体定义函数
 */
export const defineFlowTrail = (o: object) => {
	const e = defineEntity<FlowTrail>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.trailID }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
