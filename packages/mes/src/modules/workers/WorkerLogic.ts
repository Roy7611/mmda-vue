/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { MetaUiService, Module, MetaUiField, type UiContext, MetaModel, ApiClient, EntityAction, defaultPager, getSearchOp } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Worker, defineWorker } from '@/models/Worker';
import { type WorkerSkill, defineWorkerSkill } from '@/models/WorkerSkill';
import { h, reactive } from 'vue';
import { WorkingSkill, defineWorkingSkill } from '@/models/WorkingSkill';
import { EmployeeStatus, EmployeeStatusEnum } from '@mmda/base/src/enums/EmployeeStatus';
import { type Employee, defineEmployee } from '@mmda/base/src/models/Employee';
import { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { WorkTeamStatus } from '@/enums/WorkTeamStatus'
/**
 * 工人交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:47.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 工人交互逻辑
 */
export class WorkerLogic extends UiLogic<Worker> {
	constructor(init: UiLogicInit) {
		super(defineWorker, init);
		this.addRelativeLogic<WorkerSkill>('skills', master => new WorkerSkillLogic(this, master));
		this.beforeSave = (context: UiContext, model: Worker, action: EntityAction) => {
			const { mobile } = model;
			if (mobile) {
				const { $t: t } = context.globalProps;
				const regPhone = /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/;
				if (!regPhone.test(mobile)) return Promise.reject(Error(t('invalid.regPhoneFormat')));
				return Promise.resolve(true);
			} else {
				return Promise.resolve(true);
			}
		};
		this.selectableList = {
			importWorkerEmployees: (item: Worker) => item.status != EmployeeStatus.LEAVE && !item.empID,
		};
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();

		if (fields.length == 0) {
			fields.push(
				this.field('laborType').searchable(true),
				this.field('captain').searchable(true),
				this.field('teamID').searchable(true),
				this.field('status').searchable(true),
				this.field('workDeptID').searchable(true),
			);
		}

		if (customActions.length == 0) {
			customActions.push({
				name: 'importWorkerEmployees',
				icon: 'pi pi-file-import',
				label: 'worker.batchCreate',
				group: 'selectMany',
				role: 'primary',
				onAction: async (context: UiContext<Worker>) => {
					//多选职员变成工人
					// context.toSelectManyIndex('importWorkerEmployees', () => this.importWorkerEmployees(context));
					const { $toast, $api, $t } = context.globalProps;
					const apiClient = $api as ApiClient;
					return context
						.select<Employee>({
							service: 'base',
							repository: 'Employees',
							ctor: defineEmployee,
							selectionMode: 'multiple',
							searchParam: {
								pager: defaultPager(),
								queryParams: {
									viewEmployee: 1,
									// status: `IN ${EmployeeStatus.ON_BOARD},${EmployeeStatus.NEW}`
									status: `>${EmployeeStatusEnum.LEAVE_VALUE}`
								}
							}
						})
						.then(async selection => {
							if (Array.isArray(selection)) {
								const submitBody = selection.map(it => it.empID);
								await apiClient.doAction(
									{
										action: 'batchSave',
										repository: 'Workers',
										// queryParams: linePageInfo,
										service: 'mes',
									},
									submitBody
								).then(() => {
									$toast.add({ severity: "success", summary: $t('dialog.title.prompt'), group: 'br', detail: $t('success.operationSuccessful'), life: 3000 });
									context.reload();
								}).catch((error: any) => {
									$toast.add({ severity: 'error', summary: $t('dialog.title.warning'), group: 'br', detail: error.message, life: 3000 });
								})
							} else {
								// $toast.add({ severity: 'warn', summary: $t('dialog.title.warning'), detail: $t('view.selectOne'), life: 3000 });
								// return false;
							}
						});
				},
			});
		}
		if (fields.length == 0) {
			fields.push(this.field('laborType').searchable(true), this.field('captain').searchable(true));
		}

		return { fields, groups, customActions };
	}
	/**
	 * 多选导入职员
	 * @param context
	 * @returns
	 */
	async importWorkerEmployees(context: UiContext<Worker>) {
		//当前选中项
		const { selectedItems, translate: t } = context;
		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(this, {
				severity: 'warn',
				summary: t('dialog.title.warning'),
				detail: t('invalid.requiredSelectAny'),
				life: 3000
			})
			throw new Error(t('invalid.requiredSelectAny'));
		}
		const rawSelection = reactive({
			list: <any>[],
		});
		if (selectedItems) {
			//toRaw 返回原始数据
			rawSelection.list = selectedItems.map(it => {
				return it.workerID;
			});
		}

		//调用接口
		const { $api, $router } = context.globalProps;
		const apiClient = $api as ApiClient;
		try {
			const res = await apiClient.doAction(
				{
					action: 'batchSave',
					repository: 'Employees',
					// queryParams: linePageInfo,
					service: 'base',
				},
				rawSelection.list
			);
			//关闭窗口
			if (res.code == 'success') {
				if (res.data.errors <= 0) {
					context.uiBuilder.toast({ severity: 'success', summary: t('dialog.title.success'), detail: context.t({ message: 'worker.batchResult', param: { success: res.data.success, failed: res.data.failed } }), life: 3000 });
				} else {
					context.uiBuilder.toast({ severity: 'error', summary: t('failure.failed'), group: 'br', detail: context.t({ message: 'worker.batchFailure', param: { it: res.data.errors[0].workerNo, message: res.data.errors[0].errors[0].error } }), life: 3000 });
				}
			}
		} catch (errorC: any) {
			context.uiBuilder.toast({ severity: 'error', summary: t('failure.failed'), group: 'br', detail: errorC.message, life: 3000 });

			return false;
		}
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				/**
				 * 在岗的锁定工号
				 */
				this.field('workerNo')
					.lockIf(model => model.status == 'ON_BOARD'),
				this.field('teamID').setSearchParam((ctx, model) => {
					return {
						 status: `IN ${WorkTeamStatus.NEW},${WorkTeamStatus.ACTIVE}`,
						qualified: true
					};
				}),
			);
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
			groups.push(this.group<WorkerSkill>('skills').defaultAdder(this.addSkill));
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
	/**
	 * 添加技能
	 * @param context
	 * @returns
	 */

	addSkill(context: UiContext<Worker>, target: Worker) {
		context
			.select<WorkingSkill>({
				repository: 'WorkingSkills',
				ctor: defineWorkingSkill,
				selectionMode: 'multiple',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						status: getSearchOp('IN').toSQL([UsageStatus.USED]),
					}
				},
			})
			.then((selection: any) => {
				if (selection) {
					// 显示重复提示
					const items = selection.filter((item: any) => MetaModel.hasAnyLike(target.skills, { skillID: item.skillID }));
					if (items.length > 0) return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						group: 'br',
						detail: context.globalProps.$t('invalid.requiredWorkerSkill'),
						life: 3000
					})
					context.addSubGroupItems({
						target,
						group: 'skills',
						source: selection,
						propsMapper: {
							workFrom: () => new Date().toSQLDate(),
							skillID: s => s,
						},
					});

					// context.addSubGroupItems({
					// 	metaui: context.metaui,
					// 	groupName: 'skills',
					// 	srcItems: selection,
					// 	toModel: model,
					// 	creator: defineWorkerSkill,
					// })
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造工人交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const WorkerLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new WorkerLogic({
		metaUiService: metaUiService,
		repository: 'Workers',
		router,
		module: module || metaUiService.findModule('Worker'),
	});
/**
 * 技能交互逻辑
 */
export class WorkerSkillLogic extends UiGroupLogic<WorkerSkill, Worker> {
	constructor(parent: WorkerLogic, master: Worker) {
		super(defineWorkerSkill, parent, master, 'skills');
	}
}
//#endregion ~GENERATED PARTS END
