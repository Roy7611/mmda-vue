/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, SortOrder } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ModuleBgTask, defineModuleBgTask } from '../../models/ModuleBgTask';
import { h } from 'vue';
/**
 * 后台任务交互逻辑
 * @author mmda codebot
 * @since 2026-01-07 14:52:36.0
 * @revision 2026-01-07 15:02:08.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 后台任务交互逻辑
 */
export class ModuleBgTaskLogic extends UiLogic<ModuleBgTask> {
	constructor(init: UiLogicInit) {
		super(defineModuleBgTask, init);
	}
	async getAll(params: any) {
		// todo: 1, 
		params.queryParams = Object.assign({ sort: `createDate ${SortOrder.DESC}`, }, params.queryParams);
		const res = await super.getAll(params);
		return res
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
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('taskResult').setCustomRenderer((fld, ctx, props) => {
					const { $t: t } = ctx.globalProps
					if (ctx.model.status == "SUCCESS") {
						return ctx.uiBuilder.factory.button({
							severity: 'success',
							style: {
								width: '4rem'
							},
							label: t('action.download'),
							onAction: async () => {
								window.open(`${ctx.model.taskResult}`, '_blank');
							}
						})
						//console.log('成功',ctx);
					} else if (ctx.model.status === 'RUNNING' || ctx.model.status === 'NEW' || ctx.model.status === 'SUSPENDED') {
						return ctx.uiBuilder.factory.button({
							severity: 'danger',
							label: ctx.globalProps.$t('action.cancel'),
							class: 'mr-2',
							onAction: async () => {
								try {
									const res = await ctx.globalProps.$api.doAction({
										path: `${ctx.model.taskID},${ctx.model.moduleCode}`,
										action: 'cancel',
										repository: 'ModuleBgTasks',
										service: 'base',
									}, {})
									if (res) {
										ctx.reload()
									}
								} catch (error: any) {
									ctx.uiBuilder.toast(ctx, {
										severity: 'error',
										summary: ctx.t('dialog.title.error'),
										detail: error.message ?? '操作失败',
										group: 'br',
										life: 3000
									})
								}
							}
						})
					}
					// else if (ctx.model.status === 'RUNNING' || ctx.model.status === 'NEW' || ctx.model.status === 'SUSPENDED') {
					// 		return ctx.uiBuilder.factory.button({
					// 			severity: 'danger',
					// 			label: ctx.globalProps.$t('action.cancel'),
					// 			class: 'mr-2',
					// 			onAction: async () => {
					// 				try {
					// 					const res = await buildCtx.globalProps.$api.doAction({
					// 						path: `${data.taskID},${data.moduleCode}`,
					// 						action: 'cancel',
					// 						repository: 'ModuleBgTasks',
					// 						service: 'base',
					// 					}, {})
					// 					if (res) {
					// 						buildCtx.reload()
					// 					}
					// 				} catch (error: any) {
					// 					buildCtx.uiBuilder.toast(buildCtx, {
					// 						severity: 'error',
					// 						summary: buildCtx.t('dialog.title.error'),
					// 						detail: error.message ?? '操作失败',
					// 						group: 'br',
					// 						life: 3000
					// 					})
					// 				}
					// 			}
					// 		}))
					// 	}
					else {
						if (ctx.model.taskResult) {
							return h('span', {}, `${ctx.model.taskResult}`);
						}
						else {
							return h('span', {}, '');
						}

					}



				})
			);

		}


		return { fields, groups, customActions };
	}
}

//设置详情逻辑
//beforeDetails(){}


//#endregion ~GENERATED PARTS END
/**
 * 构造后台任务交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ModuleBgTaskLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ModuleBgTaskLogic({
	service: metaUiService,
	repository: 'ModuleBgTasks',
	router,
	module: module || metaUiService.findModule('ModuleBgTask'),
})
//#endregion ~GENERATED PARTS END