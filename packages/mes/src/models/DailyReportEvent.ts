/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { MessageLevel } from '@mmda/base/src/enums/MessageLevel';
import type { ProductionEventCause } from '../enums/ProductionEventCause';
import type { Importance } from '@mmda/base/src/enums/Importance';
import type { Urgency } from '@mmda/base/src/enums/Urgency';
import type { QualityDefect } from './QualityDefect';
/**
 * 日报事件
 * 
 * @remarks 日报事件
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-01-10 08:57:52.0
 * 
 */
export interface DailyReportEvent extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 日报ID
	 */
	reportID: string;
	/**
	 * 项次
	 */
	itemID: number;
	/**
	 * 事件类型：0;INFO;信息|1;SUCCESS;成功|2;WARNING;警告|4;DANGER;危险
	 */
	eventType: MessageLevel;
	/**
	 * 事件内容
	 */
	eventTitle: string;
	/**
	 * 事件原因：0;NONE;-|1;MAN;人|2;EQUIP;设备|4;MATERIAL;材料|8;DESIGN;设计|16;PROCESS;工艺|32;QC;质量|128;OTHER;其他
	 */
	eventCauses: ProductionEventCause;
	/**
	 * 关联任务，选择DailyReportTask
	 */
	taskID?: string;
	/**
	 * 质量缺陷：HAS_ONE QualityDefect(defectID,defectCode,defectDesc,severity)
	 */
	defectID?: string;
	/**
	 * 照片，采用#1, #2引用上传的DailyReportPhoto
	 */
	refPhotos?: string;
	/**
	 * 要求响应
	 */
	requiredResponse: boolean;
	/**
	 * 重要性：0;UNKNOWN;-|1;IMPORTANT;重要|2;VERY_IMPORTANT;非常重要
	 */
	importance: Importance;
	/**
	 * 紧急性：0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
	 */
	emergency: Urgency;
	/**
	 * 事件标识，若要求响应，需要设计和生产部门解决，自动生成ProductionEvent
	 */
	eventID?: string;
	/**
	 * 整改措施建议，交付总监可给主意
	 */
	rectificationProposal?: string;
	/**
	 * 质量缺陷
	 */
	qualityDefect?: QualityDefect;
	//#endregion ~GENERATED PARTS END
}
/**
 * 日报事件实体定义函数
 */
export const defineDailyReportEvent = (o: object) => {
	const e = defineEntity<DailyReportEvent>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.reportID},${this.itemID}` }
	});
	return e;
}
