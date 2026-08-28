/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, isString, isNullOrUndefined } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProjectTask, defineProjectTask } from '@/models/ProjectTask';
import { watch, toRaw, h, ref } from 'vue'
import { stringify } from 'querystring';
//计算两个天数之间的日期
const getDaysBetweenDates = (date1: any, date2: any) => {
	const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
	const time1 = new Date(date1).getTime();
	const time2 = new Date(date2).getTime();
	const diffDays = Math.round((time2 - time1) / oneDay);
	return diffDays + 1;
};

let context = null as any
const sTime = ref(null);
const edTime = ref(null);
/**
 * 项目任务交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:31.0
 * @revision 2024-09-01 23:04:38.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目任务交互逻辑
 */
export class ProjectTaskLogic extends UiLogic<ProjectTask> {
	constructor(init: UiLogicInit) {
		super(defineProjectTask, init);
	}
	async getChangeData(value: any) {
		context = value;
		watch(value.model, (newVal) => {
			context.model = newVal
		})
	}

	async getSave() {
		try {
			const errNum = await context.validate(context.model, context.$v)
			if (errNum === 0) {
				const isSave = await context.logic.save(toRaw(context.model))
				if (isSave === 1) {
					context.uiBuilder.toast(context, {
						severity: 'success',
						group: 'br',
						summary: context.globalProps.$t('dialog.success'),
						detail: context.globalProps.$t('success.beforeSave'),
						life: 3000,
					});
					return true
				} else {
					return false
				}
			}
		} catch (e: any) {
			if (e.message || (isString(e) && !!e)) {
				context.error.value = e.message || (e as string);
			}
			if (e.validationErrors) {
				let errorMessage = '';
				e.validationErrors.forEach(({ field, error }: any) => {
					if (field && field.indexOf('/') != -1) {
						const [grpName, rowNum, fldName] = field.split('/');
						const rowValidation = context.getGroupItemValidation(grpName, 1 + +rowNum);
						rowValidation[fldName] = { touched: true, message: error };
						(rowValidation.summary ??= { errorNum: 0 }).errorNum++;
					} else {
						context.$v[field] = { touched: true, message: error };
					}
					errorMessage = errorMessage ? errorMessage + ';' + error : error;
				});
				context.error.value = errorMessage;
			}
			return false
		}
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {

			fields.push(
				this.field('taskNo').lockIf(model => model.ganttLevel),
				this.field('taskLevel').lockIf(model => model.ganttLevel),
				this.field('taskPhase').lockIf(model => model.ganttLevel),

				this.field('expectedStart').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
					const { $ui: ui, $t: t } = ctx.globalProps;

					// console.log("ctx.model.mStart", ctx.model.mStart);
					// console.log("sTime", sTime.value);
					// console.log("edTime", edTime.value);

					return ui.factory.datePicker({
						minDate: new Date(ctx.model.mStart) ?? '',
						maxDate: new Date(ctx.model.mEnd) ?? '',
						modelValue: ctx.model.expectedStart ?? '',
						onUpdatePicker: (value: any) => {
							if (!isNullOrUndefined(value)) {
								ctx.model.expectedStart = value.toFormat('yyyy-MM-dd');
								if (ctx.model.expectedStart && ctx.model.expectedFinish) {
									const days = getDaysBetweenDates(ctx.model.expectedStart, ctx.model.expectedFinish);
									ctx.model.expectedDuration = Number(days);
								} else {
									ctx.model.expectedDuration = null;
								}
							} else {
								delete ctx.model.expectedStart
							}

						}
					})


				}),

				this.field('expectedFinish').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
					const { $ui: ui, $t: t } = ctx.globalProps;


					if (ctx.model.mStart) {
						sTime.value = new Date(JSON.parse(JSON.stringify(ctx.model.mStart)));
					}
					if (ctx.model.mEnd) {
						edTime.value = new Date(JSON.parse(JSON.stringify(ctx.model.mEnd)));
					}


					return ui.factory.datePicker({
						minDate: new Date(ctx.model.mStart) ?? '',
						maxDate: new Date(ctx.model.mEnd) ?? '',
						modelValue: ctx.model.expectedFinish ?? '',
						onUpdatePicker: (value: any) => {
							if (!isNullOrUndefined(value)) {
								ctx.model.expectedFinish = value.toFormat('yyyy-MM-dd');
								if (ctx.model.expectedFinish && ctx.model.expectedFinish) {
									const days = getDaysBetweenDates(ctx.model.expectedStart, ctx.model.expectedFinish);
									ctx.model.expectedDuration = Number(days);
								} else {
									ctx.model.expectedDuration = null;
								}
							} else {
								delete ctx.model.expectedFinish
							}

						}
					})


				}),



				// this.field('expectedStart').onChange((ctx, model, newVal, oldVal) => {

				// }),






				// this.field('expectedFinish').onChange((ctx, model, newVal, oldVal) => {
				// 	if (newVal && model.expectedStart) {
				// 		const days = getDaysBetweenDates(model.expectedStart, newVal);

				// 		model.expectedDuration = Number(days);
				// 	} else {
				// 		model.expectedDuration = null;
				// 	}
				// }),
			);

		}
		// if (groups.length == 0) {
		// 	groups.push(this.group('attachments').hideIf(()=>true));

		// }
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造项目任务交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ProjectTaskLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ProjectTaskLogic({
	service: metaUiService,
	repository: 'ProjectTasks',
	router,
	module: module || metaUiService.findModule('ProjectTask'),
})
//#endregion ~GENERATED PARTS END
