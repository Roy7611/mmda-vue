/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, isNullOrUndefined } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type WorkCalendar, defineWorkCalendar } from '@/models/WorkCalendar';
import { type WorkCalendarDay, defineWorkCalendarDay } from '@/models/WorkCalendarDay';
import { type WorkShift, defineWorkShift } from '@/models/WorkShift';
import { ShiftSystem, ShiftSystemEnum } from '@mmda/base/src/enums/ShiftSystem';
/**
 * 工作日历交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:47.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 工作日历交互逻辑
 */
export class WorkCalendarLogic extends UiLogic<WorkCalendar> {
	constructor(init: UiLogicInit) {
		super(defineWorkCalendar, init);
		this.addRelativeLogic<WorkCalendarDay>('days', master => new WorkCalendarDayLogic(this, master));
		this.addRelativeLogic<WorkShift>('shifts', master => new WorkShiftLogic(this, master));
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			/**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
		}
		if (groups.length == 0) {
			groups.push(
				this.group<WorkCalendarDay>('days')
					// .beforeAdd(this.beforeCreateWorkCalendar)
					.addCustomAction({
						name: 'createWorkCalendar',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.addWorkCalendarDay,
						view: UiViewOne.Edit,
					}),
				this.group<WorkShift>('shifts')
					.addCustomAction({
						name: 'createWorkShift',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.creatWorkShift,
						view: UiViewOne.Edit,
					}),
			);

		}
		return { fields, groups, customActions };
	}

	beforeCreateWorkCalendar(
		context: UiContext<WorkCalendar>,
		entity: WorkCalendarDay,
		items: WorkCalendarDay[]
	) {
		const { uiBuilder } = context
		const group = context.metaui.getGroup('days')
		const groupUi = context.metaui.getGroupUi('days')
		const field = groupUi.getField('workDay')
		console.log(field);
		// entity.workDay = `2025-02-2${items.length}`
		return uiBuilder.confirmDialog(
			uiBuilder.factory.datePicker({
				name: field.fieldName,
				id: field.fieldName,
				// numberOfMonths: 2,
				manualInput: false,
				format: 'yy-mm-dd',
				modelValue: entity.calendarDay,
				onUpdatePicker: (value: Date) => {
					entity.calendarDay = value.toFormat('yyyy-MM-dd')
				},
			})
			,
			context, {
			name: field.fieldName,
			title: field.displayLabel,
			height: "62vh",
			width: "80vw",
			accept: () => {
				console.log(group);

				return Promise.resolve(true)
			},
		}
		)
			.then((res: boolean) => {
				return res;
			}).catch(() => {
				return false
			})
	}
	/**
	 * 创建节假调休日子表
	 * @param context 
	 * @param target 
	 */
	addWorkCalendarDay(context: UiContext<WorkCalendar>, target: WorkCalendar) {
		context
			.createSubGroupItems<WorkCalendarDay>({
				group: 'days',
				// sequenceKey: 'calendarDay',
				target,
				propsMapper: {
					calendarDay: (m) => {
						const dataLength = m['days'].length
						const date = dataLength ? new Date(m['days'][m['days'].length - 1].calendarDay) : new Date();
						if (dataLength) {
							date.setDate(date.getDate() + 1); // 时间自增
						}
						if (m['days'].length > 0 && m['days'].findIndex((day: WorkCalendarDay) =>
							day.calendarDay === date.toFormat('yyyy-MM-dd')
						) !== -1) {
							date.setDate(date.getDate() + 1); // 时间自增
							if (m['days'].length > 0 && m['days'].findIndex((day: WorkCalendarDay) =>
								day.calendarDay === date.toFormat('yyyy-MM-dd')
							) !== -1) {
								date.setDate(date.getDate() + 1); // 时间自增
							}
						}
						return date.toFormat('yyyy-MM-dd')
					},

				},
				creator: defineWorkCalendarDay,
			})
			.then(item => {
				if (item) {
					// 逻辑判断
					context.addSubGroupItem('days', item);
				}
			});
	}
	/**
	 * 创建轮班
	 * @param context 
	 * @param target 
	 */
	creatWorkShift(context: UiContext<WorkCalendar>, target: WorkCalendar) {
		context
			.newSubGroupItem<WorkShift>({
				group: 'shifts',
				target,
				// sequenceKey: 'startDate',
				propsMapper: {
					startDate: (m) => {
						const dataLength = m['shifts'].length
						const date = dataLength ? new Date(m['shifts'][m['shifts'].length - 1].startDate) : new Date();
						if (dataLength) {
							date.setDate(date.getDate() + 1); // 时间自增
						}
						if (m['shifts'].length > 0 && m['shifts'].findIndex((day: WorkCalendarDay) =>
							day.startDate === date.toFormat('yyyy-MM-dd')
						) !== -1) {
							date.setDate(date.getDate() + 1); // 时间自增
							if (m['shifts'].length > 0 && m['shifts'].findIndex((day: WorkCalendarDay) =>
								day.startDate === date.toFormat('yyyy-MM-dd')
							) !== -1) {
								date.setDate(date.getDate() + 1); // 时间自增
							}
						}
						return date.toFormat('yyyy-MM-dd')
					}
				},

				creator: defineWorkShift,
			})
			.then(item => {
				if (item) {
					context.addSubGroupItem('shifts', item);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造工作日历交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const WorkCalendarLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new WorkCalendarLogic({
		service: metaUiService,
		repository: 'WorkCalendars',
		router,
		module: module || metaUiService.findModule('WorkCalendar'),
	});
/**
 * 节假调休日交互逻辑
 */
export class WorkCalendarDayLogic extends UiGroupLogic<WorkCalendarDay, WorkCalendar> {
	constructor(parent: WorkCalendarLogic, master: WorkCalendar) {
		super(defineWorkCalendarDay, parent, master, 'days');
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('calendarDay').onValidate<string>(value => {
					if (!value?.trim()) {
						return '工作日不能为空';
					}
					return null;
				}),
				this.field('shiftSystem').lockIf(t => !isNullOrUndefined(t.specificShiftID)),
				this.field('specificShiftID').setSearchParam((content, model, fld) => ({
					shiftSystem: model.shiftSystem
				})).onChange((context: UiContext<WorkCalendarDay>, model: WorkCalendarDay, newVal) => {
					if (!isNullOrUndefined(newVal)) {
						const shiftObj = context.getFieldCurrentOption('specificShiftID')
						context.setFieldValue('shiftSystem', {
							value: shiftObj.shiftSystem,
							text: ShiftSystemEnum.textOf(shiftObj.shiftSystem)
						})
					} else {
						context.setFieldValue('shiftSystem', {
							value: ShiftSystem.NONE,
							text: ShiftSystemEnum.textOf(ShiftSystem.NONE)
						})
					}
				})
			);
		}
		return { fields, groups, customActions };
	}
}
/**
 * 轮班调整交互逻辑
 */
export class WorkShiftLogic extends UiGroupLogic<WorkShift, WorkCalendar> {
	constructor(parent: WorkCalendarLogic, master: WorkCalendar) {
		super(defineWorkShift, parent, master, 'shifts');
	}
}
//#endregion ~GENERATED PARTS END
