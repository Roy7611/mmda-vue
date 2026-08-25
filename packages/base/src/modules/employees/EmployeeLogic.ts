/* eslint-disable no-useless-escape */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Employee, defineEmployee } from '../../models/Employee';
import { EmployeeStatus } from '../../enums/EmployeeStatus';
import { reactive } from 'vue';

/**
 * 职员交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 职员交互逻辑
 */
export class EmployeeLogic extends UiLogic<Employee> {
	constructor(init: UiLogicInit) {
		super(defineEmployee, init);
		this.beforeSave = (context: UiContext, model: Employee, action: EntityAction) => {
			const { mobile, email, qq } = model
			const { $t: t } = context.globalProps
			// 手机号验证
			const regPhone = /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/
			// 邮箱验证
			const regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			// qq号验证
			const regQQ = /^[1-9][0-9]{4,10}$/
			if (!regPhone.test(mobile) && !isRefNone(mobile)) return Promise.reject(Error(t('invalid.regPhoneFormat')));
			if (!regEmail.test(email) && !isRefNone(email)) return Promise.reject(Error(t('invalid.regEmailFormat')));
			if (!regQQ.test(qq) && !isRefNone(qq)) return Promise.reject(Error(t('invalid.regQQFormat')));
			return Promise.resolve(true);
		};
		this.selectableList = {
			batchCreateEmployeeAccounts: (item: Employee) => item.status !== EmployeeStatus.LEAVE && !item.hasUserAccount,
		};
	}
	async batchCreateEmployeeAccounts(context: UiContext) {
		//当前选中项
		const { selectedItems, translate: t } = context;
		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(this, {
				severity: 'warn',
				summary: t('dialog.title.warning'),
				detail: t('invalid.requiredSelectAny'),
				life: 3000
			})
			throw new Error('未选数据');
		}
		const rawSelection = reactive({
			list: <any>[],
		});
		if (selectedItems) {
			//toRaw 返回原始数据
			rawSelection.list = selectedItems.map(it => {
				return it.empID;
			});
		}
		//调用接口
		const { $api, $router } = context.globalProps;
		const apiClient = $api as ApiClient;
		try {
			const res = await apiClient.doAction(
				{
					action: 'batchCreateEmployeeAccounts',
					repository: 'Employees',
					service: 'base',
				},
				rawSelection.list
			);
			//关闭窗口
			if (res) {
				context.uiBuilder.toast(context, {
                    severity: 'success',
                    summary: '成功',
                    detail: '用户已批量生成，请配置角色并激活后使用',
                    group: 'br',
                    life: 3000
                })
				context.reload()
			}
		} catch (errorC: any) {
			context.uiBuilder.toast(context, { severity: 'error', summary: '失败', group: 'br', detail: errorC.message, life: 3000 });
			return false;
		}

	}
	beforeIndex(): UiLogicFnResult<Employee> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('status').searchable(true),
				this.field('gender').searchable(true),
				this.field('workDeptID').searchable(true),
			)
		}
		if (customActions.length == 0) {
			customActions.push({
				name: 'importEmployeeWorkers',
				icon: 'pi pi-file-import',
				label: '批量创建',
				group: 'selectMany',
				role: 'primary',
				onAction: async (context: UiContext) => {
					const t = context.translate.bind(context)
					const toast = (props: Record<string, unknown>) =>
						context.uiBuilder?.toast(context, props)
					try {
						await context.app?.meta.getPack({
							service: 'mes',
							repository: 'Workers',
						})
					} catch (error: any) {
						toast({
							severity: 'error',
							summary: t('dialog.title.error'),
							detail: error?.message ?? String(error),
							life: 3000,
						})
						return false
					}
					const selection = await context.select({
						service: 'mes',
						repository: 'Workers',
						searchParam: {
							pager: defaultPager(),
							queryParams: {
								empID: 'IS NULL',
								status: `NOT IN ${EmployeeStatus.LEAVE}`,
							},
						},
						selectionMode: 'multiple',
					})
					if (!Array.isArray(selection) || selection.length === 0) return
					const submitBody = selection.map(
						(item: { workerID?: string; id?: string }) =>
							item.workerID ?? item.id,
					)
					try {
						const res = await context.app?.api.doAction(
							{
								action: 'batchSave',
								repository: 'Employees',
								service: 'base',
							},
							submitBody,
						)
						if (res) {
							toast({
								severity: 'success',
								detail: t('success.operationSuccessful'),
								summary: t('dialog.success'),
								life: 3000,
							})
							await (context as { reload?: () => Promise<unknown> }).reload?.()
						}
					} catch (error: any) {
						toast({
							severity: 'error',
							summary: t('dialog.title.error'),
							detail: error?.message ?? String(error),
							life: 3000,
						})
					}
				},
			}, {
				name: 'batchCreateEmployeeAccounts',
				icon: 'pi pi-file-import',
				label: '批量生成账号',
				group: 'selectMany',
				role: 'primary',
				onAction: async (context: UiContext) => {
					context.toSelectManyIndex('batchCreateEmployeeAccounts', async () => await this.batchCreateEmployeeAccounts(context));
				},
			});
		}
		return { fields, groups, customActions }
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
	//beforeDetails(){}
}

/**
 * 构造职员交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const EmployeeLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new EmployeeLogic({
	service: metaUiService,
	repository: 'Employees',
	router,
	module: module || metaUiService.findModule('Employee'),
})
//#endregion ~GENERATED PARTS END
