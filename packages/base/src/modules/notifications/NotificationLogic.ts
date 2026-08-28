/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, EntityAction, ApiClient } from '@mmda/core';
import { SortOrder, defaultSearchOps, pluralize, type UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Notification, defineNotification } from '../../models/Notification';
import { UrgencyEnum, Urgency, urgencyLevel, urgencyIcon, urgencyList } from "../../enums/Urgency";
import { ImportanceEnum, Importance, importanceLevel, importanceList } from "../../enums/Importance";
import { notificationStatusList, NotificationStatus, NotificationStatusEnum } from "../../enums/NotificationStatus";

/**
 * 通知交互逻辑
 * @author mmda codebot
 * @since 2024-12-23 20:54:04.0
 * @revision 2024-12-23 21:04:39.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 通知交互逻辑
 */
export class NotificationLogic extends UiLogic<Notification> {
	constructor(init: UiLogicInit) {
		super(defineNotification, init);

		this.selectableList = {
			// 一键已读：仅未读消息可选（过滤已读/已办）
			readAll: (model) => model.status === NotificationStatus.SENT || model.status === NotificationStatus.NEW,
		}
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
	async readAll(context: UiContext<Notification>) {
		const { $toast: toast, $t: t } = context.globalProps
		// 过滤掉已读/已办，仅提交未读消息
		const unreadItems = (context.selectedItems ?? []).filter(
			(item: Notification) => item.status === NotificationStatus.SENT || item.status === NotificationStatus.NEW,
		);
		if (!unreadItems.length) {
			toast.add({
				severity: "warn",
				summary: t("dialog.title.warning"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000
			});
			return Promise.reject(false);
		} else {
			const data = unreadItems.map((item: Notification) => ({
				"noticeID": item.noticeID,
				"moduleCode": item.moduleCode
			}));
			return context.apiClient.http.postJson(`${context.apiClient.config.service}/Notifications/readAll`, data);
		}

	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('todo').searchable(true),
				this.field('noticeContent').setCustomRenderer((fld, ctx: UiContext<Notification>) => {
					const content = ctx.model.noticeContent ?? '';
					return ctx.uiBuilder.factory.textSpan(content || '-', {
						title: content || undefined,
						tooltipPosition: 'top',
						style: {
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							wordBreak: 'break-all',
							width: '100%',
							cursor: content ? 'help' : undefined,
						},
					});
				}),
				this.field('emergency').setCustomRenderer((fld, ctx: UiContext<Notification>,) => {
					const { model } = ctx
					const { factory } = ctx.uiBuilder;
					// urgencyIcon(model[fld.fieldName])
					return factory.icon('pi pi-exclamation-circle', { severity: urgencyLevel(model[fld.fieldName]), size: 'xlarge' })
				}),
				this.field('importance').setCustomRenderer((fld, ctx: UiContext<Notification>,) => {
					const { model } = ctx
					const { factory } = ctx.uiBuilder;

					return factory.rating(ImportanceEnum.valueOf(model[fld.fieldName]), {
						readonly: true,
						stars: 2,
						// tooltip: ImportanceEnum.textOf(model[fld.fieldName]),
						// tooltipPosition: 'bottom',
						pt: {
							onIcon: () => ({
								class: '!text-yellow-500'
							}),
						},
					})
				})
			);

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

		if (customActions.length == 0) {
			customActions.push({
				name: 'readAll',
				icon: 'pi pi-check-circle',
				label: '一键已读',
				group: 'selectMany',
				role: 'primary',
				onAction: async (context: UiContext<Notification>) => {
					context.toSelectManyIndex('readAll', async () => await this.readAll(context));
				},
			});
		}
		return { fields, groups, customActions };
	}

	async getAll(params: any) {
		// todo: 1, 
		params.queryParams = Object.assign({ sort: `noticeTime ${SortOrder.DESC}`, }, params.queryParams);
		const res = await super.getAll(params);
		return res
	}

	async knownFn(notice: any, refresh: boolean = true) {
		await this.apiClient.http.post(`${this.apiClient.config.service}/Notifications/${notice.id}/read`, {})
		refresh && await this, this.router.go(0)
	}

	async toHandleFn(notice: any, system: any, toHandleAction: EntityAction) {
		// if (NotificationStatusEnum.valueOf(notice.status) < NotificationStatusEnum.valueOf(NotificationStatus.READ)) {
		// 	await this.knownFn(notice, false)
		// }
		// 校验目标数据是否存在
		const redirectRepository = pluralize(notice.refName);
		try {
			await this.apiClient.getOne(notice.refID, {
				repository: redirectRepository,
				service: system?.service,
			});
		} catch {
			return false;
		}
		console.log('toHandleAction 完整数据:', JSON.stringify(toHandleAction))
		if (toHandleAction) {
			const {
				param: {
					value
				},
			} = toHandleAction;
			const { deepLink, objName, action } = value.to ?? value;

			window.location.href = this.apiClient.http.baseUrl.replace('/api', deepLink);
		} else {
			if (system.service !== this.apiClient.config.service) {
				window.location.href = `${system.href}/${redirectRepository}/${notice.refID}`;
			} else {
				this.router.push(`/${redirectRepository}/${notice.refID}`);
			}
		}
		return true;
	}
	beforeSearch() {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push(
				{
					searchLabel: '状态',
					searchParam: 'status',
					renderer: (ctx: UiContext<Notification>, csf) => {
						const { factory } = ctx.uiBuilder;
						return factory.tagSelector(csf.searchVal.value, notificationStatusList, {
							// selectMode: 'moultiple',
							onChange: async (val: any) => {
								csf.searchVal.value = val
								ctx.addQueryParam('status', val ?? '');
								// ctx.addQueryParam('status', defaultSearchOps.EnumFieldSearchOps[0].toSQL(val));
								ctx.refresh(false)
								// console.log(csf.searchVal.value, ctx.model)
							}
						})
					}
				},
				{
					searchLabel: '紧急程度',
					searchParam: 'emergency',
					renderer: (ctx: UiContext<Notification>, csf) => {
						const { factory } = ctx.uiBuilder;
						return factory.tagSelector(csf.searchVal.value, urgencyList, {
							onChange: async (val: any) => {
								csf.searchVal.value = val
								ctx.addQueryParam('emergency', val ?? '');
								ctx.refresh(false)
								// console.log(csf.searchVal.value, ctx.model)
							}
						})
					}
				},
				{
					searchLabel: '重要性',
					searchParam: 'importance',
					renderer: (ctx: UiContext<Notification>, csf) => {
						const { factory } = ctx.uiBuilder;
						return factory.tagSelector(csf.searchVal.value, importanceList, {
							onChange: async (val: any) => {
								csf.searchVal.value = val
								ctx.addQueryParam('importance', val ?? '');
								ctx.refresh(false)
								// console.log(csf.searchVal.value, ctx.model)
							}
						})
					}
				},
			)
		}
		return { searchFields, customSearchFields }

	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造通知交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const NotificationLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new NotificationLogic({
	service: metaUiService,
	repository: 'Notifications',
	router,
	module: module || metaUiService.findModule('Notification'),
})
//#endregion ~GENERATED PARTS END
