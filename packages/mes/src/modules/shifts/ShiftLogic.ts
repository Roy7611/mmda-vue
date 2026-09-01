/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import {
	type MetaUiService,
	type Module,
	type MetaUiField,
	type EntityAction,
	type ApiClient,
	type EntitySearchParam,
	toQueryParams,
	defineEntityArray,
	PagedList,
	MetaModel,
} from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Shift, defineShift } from '@/models/Shift';
/**
 * 班次交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:42.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 班次交互逻辑
 */
/**
 * 两个时间相减，返回 小时（小数）
 * @param {string} start 开始时间 HH:mm
 * @param {string} end 结束时间 HH:mm
 * @returns {number} 小时，如 1.3333 代表1小时20分
 */
// 解析 HH:mm 为当天 Date
const parseTime = (timeStr: string): number => {
	const [h, m, s] = timeStr.split(':').map(Number);

	const d = new Date();
	const hours = d.setHours(h, m, s, 0);
	return hours;
}
const diffHour = (start: string, end: string): number => {
	const s = parseTime(start);
	let e = parseTime(end);
	// 跨夜：结束时间早于开始时间（如 22:00→00:00），按次日计算
	if (e < s) {
		e += 24 * 60 * 60 * 1000;
	}
	// 毫秒差 → 小时
	return (e - s) / (1000 * 60 * 60);
}

/**
 * 小时小数转成 时分格式（1.5 → 1:30）
 */
const hourToHm = (hour: number): string => {
	const totalMin = hour * 60;
	const h = Math.floor(Math.abs(totalMin) / 60);
	const m = Math.floor(Math.abs(totalMin) % 60);
	const sign = hour < 0 ? '-' : hour < 10 ? '0' : '';
	return `${sign}${h}:${String(m).padStart(2, '0')}:00`;
}
export class ShiftLogic extends UiLogic<Shift> {
	static getAll() {
		throw new Error('Method not implemented.');
	}
	constructor(init: UiLogicInit) {
		super(defineShift, init);
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('shiftSystem').searchable(true));
		}
		return { fields, groups, customActions };
	}
	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('restTimeSpan').lockIf(() => true).onChange((context, model, newVal) => {
					if (model && model.shiftTimeSpan) {
						// 工作时长
						model.workTimeSpan =  hourToHm(diffHour(newVal, model.shiftTimeSpan))
					} else {
						model.workTimeSpan = null
					}
				}),
				this.field('restFrom').onChange((context, model, newVal) => {
					if (newVal && model.restTo) {
						model.restTimeSpan = hourToHm(diffHour(newVal, model.restTo))
					} else {
						model.restTimeSpan = null
					}
				}),
				this.field('restTo').onChange((context, model, newVal) => {
					if (newVal && model.restFrom) {
						model.restTimeSpan = hourToHm(diffHour(model.restFrom, newVal))
					} else {
						model.restTimeSpan = null
					}
				}),
				this.field('clockOutTime').onChange((context, model, newVal) => {
					if (newVal && model.clockInTime) {
						// 班次时长
						model.shiftTimeSpan = hourToHm(diffHour(model.clockInTime, newVal))
					} else {
						model.shiftTimeSpan = null
					}
				}),
				this.field('clockInTime').onChange((context, model, newVal) => {
					if (newVal && model.clockOutTime) {
						// 班次时长
						model.shiftTimeSpan = hourToHm(diffHour(newVal, model.clockOutTime))
					} else {
						model.shiftTimeSpan = null
					}
				}),
				this.field('shiftTimeSpan').onChange((context, model, newVal) => {
					if (model && model.restTimeSpan) {
						// 工作时长
						model.workTimeSpan =  hourToHm(diffHour(model.restTimeSpan, newVal))
					} else {
						model.workTimeSpan = null
					}
				})
			)
			/**
			fields.push(,
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
		}
		if (groups.length == 0) {
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造班次交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ShiftLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ShiftLogic({
		metaUiService: metaUiService,
		repository: 'Shifts',
		router,
		module: module || metaUiService.findModule('Shift'),
	});
//#endregion ~GENERATED PARTS END
