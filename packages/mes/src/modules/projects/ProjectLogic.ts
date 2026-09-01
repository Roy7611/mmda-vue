/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, type EntityAction, defaultPager, EntityState, ApiClient, daysBetween, isNullOrUndefined, MetaModel } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { primeVueFactory } from '@/compat/primevue_legacy'
import { type Project, defineProject } from '@/models/Project';
import { type ProjectMember, defineProjectMember } from '@/models/ProjectMember';
import { type ProjectMaterial, defineProjectMaterial } from '@/models/ProjectMaterial';

import { type Material, defineMaterial } from '@mmda/base/src/models/Material';

import { type ProjectTask, defineProjectTask } from '@/models/ProjectTask';
// import { type ProjectAmend, defineProjectAmend } from '@/models/ProjectAmend';
import { type ProjectDeliveryItem, defineProjectDeliveryItem } from '@/models/ProjectDeliveryItem';
import { type ProjectDeliveryItemAmend, defineProjectDeliveryItemAmend } from '@/models/ProjectDeliveryItemAmend';
import { type ProjectTaskRelation, defineProjectTaskRelation } from '@/models/ProjectTaskRelation';

import { type User, defineUser } from '@mmda/base/src/models/User';

import ChooseWbs from '@/components/ChooseWbs/ChooseWbs';
import { SourcingMode } from '@mmda/base/src/enums/SourcingMode';
import { log } from 'console';
import { defineComponent, h, inject, reactive, ref } from 'vue';
import { cpSync } from 'fs';
import { template } from 'lodash';
import { ProjectStatus } from '../../enums/ProjectStatus';
import type { UiBuildContext } from '@mmda/vui';
//时间对比
const compareTime = (time1: any, time2: any) => {
	const date1 = new Date(time1).getTime();
	const date2 = new Date(time2).getTime();
	if (date1 <= date2) {
		return -1;
	} else if (date1 > date2) {
		return 1;
	}
	return 1;
};

const wbsData = reactive({
	payload: {
		refID: '',
	},
});

const searchParam = reactive({
	//pager: {
	// pageSize: 10,
	// pageNo: 1
	//},
	searchWord: '',
	searchParams: {},
});

//选中的项目物料
const selectMetarlList = reactive({
	data: [],
});

const metarlData = ref([]);
const metarlcolumns = ref([]);
const metarlDataKEY = ref('id');

const getMetarlList = async (ctx: any, model?: any, filter?: any, value?: any) => {
	let modelMaterList = [];
	//筛选不自制的
	if (filter == 'noMAKE') {
		modelMaterList = model.materials.filter((item: any) => {
			if (item.sourcingMode != SourcingMode.MAKE) {
				return item;
			}
		});
	} else {
		modelMaterList = model.materials;
	}

	metarlData.value = modelMaterList.map((it: any) => {
		return { ...it, severity: it.customProperties.$severity };
	});
};

//请购
const beforeRequest = async (context: UiBuildContext<any>, model: Project, action: EntityAction) => {
	const { $ui: ui, $api, $router, $toast: toast, $t: t } = context.globalProps;
	const apiClient = $api as ApiClient;
	const metaUiService = context.logic!.metaUiService;
	if (model.action) {
		model.action = null;
	}
	//获取元数据
	const mUI = await metaUiService.get('ProjectMaterials', 'mes');
	metarlcolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
		return Number(prev.fieldIdx) - Number(curr.fieldIdx);
	});
	metarlDataKEY.value = 'itemID';
	await getMetarlList(context, model, 'noMAKE');
	return await context.uiBuilder.confirmDialog(
		context.uiBuilder.buildSearchForRelativeContent(
			metarlcolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
			{
				dataKey: metarlDataKEY.value,
				selectionMode: 'multiple',
				onSearch: async (params: any) => {
					const { searchParams, reload, pager } = params;
					await getMetarlList(context, model, 'noMAKE');
					return { list: metarlData.value };
				},
				onPage: ({ pageNo, pageSize }: any) => {
					// searchParam.pager.pageNo = pageNo;
					// searchParam.pager.pageSize = pageSize;
				},
				onSelect: (selection: any, row: any) => {
					selectMetarlList.data = selection;
				},
			}
		),
		context,
		{
			title: t('bom.selectMaterial'),
		}
	)
		.then((res: any) => console.log('res', res))
		.catch((err: any) => console.log('err', err));
};

//采购
const beforePurchase = async (context: UiBuildContext<any>, model: Project, action: EntityAction) => {
	const { $ui: ui, $api, $router, $toast: toast, $t: t } = context.globalProps;
	const apiClient = $api as ApiClient;
	const metaUiService = context.logic!.metaUiService;
	if (model.action) {
		model.action = null;
	}
	//获取元数据
	const mUI = await metaUiService.get('ProjectMaterials', 'mes');
	metarlcolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
		return Number(prev.fieldIdx) - Number(curr.fieldIdx);
	});

	console.log('metarlcolumns', metarlcolumns.value);
	metarlDataKEY.value = 'itemID';
	await getMetarlList(context, model, 'noMAKE');
	context.uiBuilder.confirmDialog(
		context.uiBuilder.buildSearchForRelativeContent(
			metarlcolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
			{
				dataKey: metarlDataKEY.value,
				selectionMode: 'multiple',
				onSearch: async (params: any) => {
					const { searchParams, reload, pager } = params;
					await getMetarlList(context, model, 'noMAKE');
					return { list: metarlData.value };
				},
				onPage: ({ pageNo, pageSize }: any) => {
					// searchParam.pager.pageNo = pageNo;
					// searchParam.pager.pageSize = pageSize;
				},
				onSelect: (selection: any, row: any) => {
					selectMetarlList.data = selection;
				},
			}
		),
		context,
		{
			title: t('bom.selectMaterial'),
			footer: defineComponent({
				name: 'DialogFooter',
				setup: () => {
					const dialogRef: any = inject('dialogRef');
					return () =>
						primeVueFactory.buttonGroup(() => [
							primeVueFactory.button({
								outlined: true,
								label: t('action.cancel'),
								class: 'mr-2',
								icon: 'pi pi-times',
								colorRole: 'info',
								severity: 'danger',
								id: 'dlg-cancel-button',
								role: 'dlg-cancel-pick-button',
								onAction: async () => {
									dialogRef.value.close();
								},
							}),
							//生成订单
							primeVueFactory.button({
								outlined: true,
								label: t('action.generatePurchaseOrder'),
								class: 'mr-2',
								id: 'dlg-confirm-button',
								role: 'dlg-confirm-pick-button',
								icon: 'pi pi-check',
								colorRole: 'info',
								onAction: async () => {
									if (selectMetarlList.data.length <= 0) {
										context.uiBuilder.toast(context, {
											severity: 'error',
											summary: t('invalid.requiredSelectAny'),
											group: 'br',
											life: 3000,
										});
										return false;
									} else {
										const submitData = {
											refName: 'Project',
											refID: <any>null,
											refItemKeys: <any>[],
										};
										const rItemKeys = selectMetarlList.data.map((item: any) => {
											const itemKeys = {
												refName: item.refName,
												refID: item.refID,
												refItemID: item.refItemID,
												tenantID: item.tenantID,
											};
											return itemKeys;
										});
										submitData.refItemKeys = rItemKeys;

										try {
											const resPackages = await apiClient.doAction(
												{
													action: 'create',
													repository: 'PurchaseOrders',
													service: 'srm',
												},
												submitData
											);
											if (resPackages) {
												context.uiBuilder.toast(context, {
													severity: 'success',
													summary: t('success.operationSuccessful'),
													life: 3000,
												});

												return true;
											}
										} catch (error: any) {
											context.uiBuilder.toast(context, {
												severity: 'error',
												title: t('dialog.title.error'),
												summary: error.detail ?? '',
												group: 'br',
												life: 3000,
											});
											return false;
										}
									}
								},
							}),
							//生成合同
							primeVueFactory.button({
								outlined: true,
								label: t('action.generatePurchaseContract'),
								class: 'mr-2',
								id: 'dlg-confirm-button',
								role: 'dlg-confirm-pick-button',
								icon: 'pi pi-check',
								colorRole: 'success',
								onAction: async () => {
									if (selectMetarlList.data.length <= 0) {
										context.uiBuilder.toast(context, {
											severity: 'error',
											summary: t('invalid.requiredSelectAny'),
											group: 'br',
											life: 3000,
										});
										return false;
									} else {
										const submitData = {
											refName: 'Project',
											refID: <any>null,
											refItemKeys: <any>[],
										};
										const rItemKeys = selectMetarlList.data.map((item: any) => {
											const itemKeys = {
												refName: item.refName,
												refID: item.refID,
												refItemID: item.refItemID,
												tenantID: item.tenantID,
											};
											return itemKeys;
										});
										submitData.refItemKeys = rItemKeys;

										try {
											const resPackages = await apiClient.doAction(
												{
													action: 'create',
													repository: 'SupplyContracts',
													service: 'srm',
												},
												submitData
											);
											if (resPackages) {
												context.uiBuilder.toast(context, {
													severity: 'success',
													summary: t('success.operationSuccessful'),
													life: 3000,
												});
												setTimeout(() => {
													context.reload();
												}, 2000);
											}
										} catch (error: any) {
											context.uiBuilder.toast(context, {
												severity: 'error',
												title: t('dialog.title.error'),
												summary: error.detail ?? '',
												group: 'br',
												life: 3000,
											});
											return false;
										}
									}

									// const callback = () => {
									// 	dialogRef.value.close();
									// 	resolve(true);
									// };
									// const handleFn = props.beforeConfirm || props.accept;

									// if (!isFunction(handleFn)) {
									// 	return callback();
									// } else {
									// 	const result = await handleFn();
									// 	if (isPromise<boolean>(result)) {
									// 		result.then(ok => {
									// 			if (ok) callback();
									// 		});
									// 	} else {
									// 		if (result) callback();
									// 	}
									// }
								},
							}),
						]);
				},
			}),
			// accept: async () => {
			// 	console.log('aaaaaa');
			// 	// if (selectionRows.value.length > 0) {
			// 	// 	//提交模型
			// 	// 	const payLoad = {
			// 	// 		payload: {
			// 	// 			refName: 'Proiect',
			// 	// 			refID: taskItem.projectID,
			// 	// 			refItemKeys: <any>[],
			// 	// 		},
			// 	// 	};
			// 	// 	const rItemKeys = selectionRows.value.map((item: any) => {
			// 	// 		const itemKeys = {
			// 	// 			refName: 'Project',
			// 	// 			refID: taskItem.projectID,
			// 	// 			refItemID: item.itemID,
			// 	// 		};
			// 	// 		return itemKeys;
			// 	// 	});
			// 	// 	payLoad.payload.refItemKeys = rItemKeys;
			// 	// 	//调用接口提交交付物，生成工作包
			// 	// 	const resPackages = await apiClient.doAction(
			// 	// 		{
			// 	// 			path: taskItem.taskID,
			// 	// 			action: 'addWorkPackage',
			// 	// 			repository: 'ProjectSchedule',
			// 	// 			service: 'mes',
			// 	// 		},
			// 	// 		payLoad
			// 	// 	);
			// 	// 	if (resPackages == true) {
			// 	// 		appContext.uiBuilder.toast(appContext, {
			// 	// 			severity: 'success',
			// 	// 			summary: t('success.operationSuccessful'),
			// 	// 			life: 3000,
			// 	// 		});
			// 	// 		setTimeout(() => {
			// 	// 			appContext.reload();
			// 	// 		}, 2000);
			// 	// 	}
			// 	// 	return;
			// 	// } else {
			// 	// 	appContext.uiBuilder.toast(appContext, {
			// 	// 		severity: 'error',
			// 	// 		summary: t('invalid.requiredSelectAny'),
			// 	// 		life: 3000,
			// 	// 	});
			// 	// 	// appContext.uiBuilder.toast(appContext, {
			// 	// 	// 	severity: 'error',
			// 	// 	// 	title: t('invalid.requiredSelectAny'),
			// 	// 	// 	summary: t('invalid.requiredSelectAny'),
			// 	// 	// 	life: 3000,
			// 	// 	// });
			// 	// 	return false;
			// 	// }
			// },
		}
	);

	return false;
};

//生产
const beforeProduction = async (context: UiBuildContext<any>, model: Project, action: EntityAction) => {
	return false;
};

const beforeStage = async (context: UiBuildContext<any>, model: Project, action: EntityAction) => {
	const { $toast: toast, $api, $t } = context.globalProps;
	const apiClient = $api as ApiClient;
	wbsData.payload.refID = '';
	try {
		// 生成弹窗
		await context.uiBuilder.confirmDialog(
			h(ChooseWbs, {
				context: context,
				onChangeData(val: any) {
					wbsData.payload.refID = val.refID ?? '';
				},
			}),
			context,
			{
				width: '30vw',
				height: '15vh',
				title: $t('project.selectWbs'),
				accept: async () => {
					if (!wbsData.payload.refID) {
						toast.add({
							severity: 'error',
							summary: $t('invalid.selectWbs'),
							group: 'br',
							life: 3000,
						});
						return false;
					} else {
						try {
							const res = await apiClient.doAction(
								{
									path: model.projectID,
									action: 'stage',
									repository: 'Projects',
									service: 'mes',
								},
								{
									payload: {
										refID: wbsData.payload.refID,
									},
								}
							);
							if (res) {
								context.uiBuilder.confirmDialog(
									h(
										'div',
										{
											class: 'confirmCenter',
										},
										[$t('success.opJumpProject')]
									),
									context,
									{
										width: '30vw',
										height: '10vh',
										title: '',
										accept: async () => {
											console.log('model.projectID', model.projectID);
											const { $router: router, $api: api } = context.globalProps;
											const burl = api.http.baseUrl.replace(/api/g, '');
											const url = `${burl}MES/ProjectSchedule?projectID=${model.projectID}`;
											window.open(url, '_blank');
										},
										reject: async () => {
											context.reload();
										},
									}
								);
								// setTimeout(() => {
								// 	context.reload();
								// }, 1000);
							}
							return true;
						} catch (error: any) {
							toast.add({
								severity: 'error',
								detail: error.message,
								summary: $t('dialog.title.error'),
								group: 'br',
								life: 3000,
							});
							return false;
						}
					}
				},
			}
		);
		return false;
	} catch (error: any) {
		return false;
	}
};

/**
 * 项目交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:31.0
 * @revision 2024-09-01 23:04:37.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目交互逻辑
 */

//计算两个天数之间的日期
const getDaysBetweenDates = (date1: any, date2: any) => {
	const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
	const time1 = new Date(date1).getTime();
	const time2 = new Date(date2).getTime();
	const diffDays = Math.round((time2 - time1) / oneDay);
	return diffDays + 1;
};

export class ProjectLogic extends UiLogic<Project> {
	constructor(init: UiLogicInit) {
		super(defineProject, init);

		this.addRelativeLogic<ProjectMember>('members', master => new ProjectMemberLogic(this, master));
		this.addRelativeLogic<ProjectDeliveryItem>('deliveryItems', master => new ProjectDeliveryItemLogic(this, master));

		this.beforeAction = async (context: UiBuildContext<any>, model: Project, action: EntityAction) => {
			try {
				let result: boolean | void;
				if (action.name == 'stage') result = await beforeStage(context, model, action);
				//采购
				else if (action.name == 'purchase') result = await beforePurchase(context, model, action);
				//请购
				else if (action.name == 'purchaseRequest') result = await beforeRequest(context, model, action);
				//生产

				else if (action.name == 'production') result = await beforeProduction(context, model, action);
				else return true;
				return result !== false;
			} catch (error: any) {
				return false;
			}
		};

		this.beforeSave = (context: UiBuildContext<any>, model: Project, action: EntityAction) => {
			const { $t: t } = context.globalProps;
			//同时有开始时间，结束时间
			if (model.expectedStart && model.expectedFinish) {
				if (compareTime(model.expectedStart, model.expectedFinish) == 1) {
					return Promise.reject(Error(t('invalid.planTimeToSmall')));
				}
			}

			if (model.members?.length) {
				const activeMemberIds = model.members
					.filter((m: ProjectMember) => !MetaModel.deleted(m))
					.map((m: ProjectMember) => m.memberID)
					.filter(Boolean);
				if (new Set(activeMemberIds).size !== activeMemberIds.length) {
					return Promise.reject(Error(t('project.duplicateTeamMember')));
				}
			}

			return Promise.resolve(true);
		};
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('contractID').searchable(true).setSearchParam((context, model) => ({
					originalContractID: 'IS NULL',
					status: 3
				})),
				this.field('importance').searchable(true),
				this.field('expectedStart').searchable(true),
				this.field('expectedFinish').searchable(true),
				this.field('status').searchable(true)
			);
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
				this.field('customerID').setSearchParam((ctx, model) => {
					//let filters = null;
					//filters = 'AND status>0';
					return {
						//filter: filters,
						status: '>0',
					};
				}),

				this.field('expectedStart').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedFinish) {
						const days = getDaysBetweenDates(newVal, model.expectedFinish);
						model.expectedDuration = Number(days);
					} else {
						model.expectedDuration = null;
					}
				}).lockIf(model => model.status != ProjectStatus.NEW),
				this.field('expectedFinish').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedStart) {
						const days = getDaysBetweenDates(model.expectedStart, newVal);

						model.expectedDuration = Number(days);
					} else {
						model.expectedDuration = null;
					}
				}).lockIf(model => model.status != ProjectStatus.NEW),
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
			//groups.push(this.group<ProjectMaterial>('materials').defaultAdder(this.newProjectMaterial));
			groups.push(
				this.group<ProjectMember>('members').defaultAdder(this.addProjectMember).field('memberTitle').inPlaceEdit().parent,
				this.group<ProjectDeliveryItemAmend>('a4').hideIf(model => model.amendIdx <= 0),
				this.group<ProjectDeliveryItem>('deliveryItems')
					.defaultAdder(this.addDeliveryItem)
					.addCustomAction({
						name: 'createDeliveryItems',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.createDeliveryItem,
						view: UiViewOne.Edit,
					})
					.hideIf(model => !model.deliveryItems && model.deliveryItems.length <= 0)
					// .defaultHandlerFile(() => ({
					// 	importFn: async (context: UiBuildContext<any>, file) => {
					// 		if (context.root.view === UiViewOne.Edit) {
					// 			// 添加前清空子表交付物
					// 			context.root.removeSubGroupItems('deliveryItems')
					// 			await context.uploadFiles(file, {
					// 				action: 'importItems',
					// 				queryParams: {
					// 					id: context.root.model.projectID ?? '',
					// 					templateID: context.currentTemplate?.templateID ?? '',
					// 					// 判断是否为详情（1：详情， 0：编辑）
					// 					isDetail: 0
					// 				},
					// 				repository: 'ProjectDeliveryItems',
					// 				service: 'mes'
					// 			})
					// 				.then((res: any) => {
					// 					console.log(res, 'data');
					// 					const { datas } = res.data
					// 					if (datas.length > 0) {
					// 						// 添加子项数据
					// 						context.root.addSubGroupItems({
					// 							target: context.root.model,
					// 							group: 'deliveryItems',
					// 							source: datas,
					// 							sequenceKey: 'itemID',
					// 							propsMapper: {
					// 								productID: () => null
					// 							}
					// 						})
					// 					}
					// 					// 成功提示
					// 					context.uiBuilder.toast(context, {
					// 						severity: 'success',
					// 						summary: context.t('dialog.success'),
					// 						detail: context.t("success.importSuccess"),
					// 						group: 'br',
					// 						life: 3000
					// 					})
					// 				})
					// 				.catch((error: any) => context.uiBuilder.toast(context, {
					// 					severity: "error",
					// 					summary: context.t("dialog.title.error"),
					// 					detail: error.message ?? context.t("failure.importFail"),
					// 					life: 3000,
					// 				}))
					// 		} else {
					// 			await context.uploadFiles(file, {
					// 				action: 'importItems',
					// 				queryParams: {
					// 					id: context.root.model.projectID ?? '',
					// 					templateID: context.currentTemplate?.templateID ?? '',
					// 					// 判断是否为详情（1：详情， 0：编辑）
					// 					isDetail: 1
					// 				},
					// 				repository: 'ProjectDeliveryItems',
					// 				service: 'mes'
					// 			})
					// 				.then(() => {
					// 					// 成功提示
					// 					context.uiBuilder.toast(context, {
					// 						severity: 'success',
					// 						summary: context.t('dialog.success'),
					// 						detail: context.t("success.importSuccess"),
					// 						group: 'br'
					// 						// life: 3000
					// 					})
					// 					// 刷新页面
					// 					setInterval(() => context.reload(), 2000)
					// 				})
					// 				.catch((error: any) => context.uiBuilder.toast(context, {
					// 					severity: "error",
					// 					summary: context.t("dialog.title.error"),
					// 					detail: error.message ?? context.t("failure.importFail"),
					// 					life: 3000,
					// 				}))
					// 		}

					// 	},
					// 	exportFn: async (context: UiBuildContext<any>, model) => {
					// 		await context.globalProps.$api.exportAll({
					// 			action: 'exportAll',
					// 			queryParams: {
					// 				contractID: context.root.model.contractID ?? '',
					// 				templateID: context.currentTemplate?.templateID ?? '',
					// 			},
					// 			repository: 'Projects',
					// 			service: 'mes'
					// 		}).catch((error: any) => {
					// 			context.uiBuilder.toast(context, {
					// 				severity: "error",
					// 				summary: context.globalProps.$t("dialog.title.error"),
					// 				detail: error.message ?? context.globalProps.$t("failure.importFail"),
					// 				life: 3000,
					// 			});
					// 		})
					// 	}
					// }))
					.field('amendType')
					.inPlaceEdit().parent
			);

			//groups.push(this.group<ProjectTask>('tasks').defaultAdder(this.newTasks));
			//groups.push(this.group<ProjectDeliveryItem>('deliveryItems').defaultAdder(this.newProjectDeliveryItem));
			//groups.push(this.group<ProjectTaskRelation>('taskRelations').defaultAdder(this.newProjectTaskRelation));
			//groups.push(this.group<ProjectDeliveryItemAmend>('deliveryItemAmends').defaultAdder(this.newProjectDeliveryItemAmend));
		}
		return { fields, groups, customActions };
	}

	// importDeliveryItems(context: UiBuildContext<any>, target: Project) {
	// 	const { $api, $router, $toast, $t } = context.globalProps;

	// 	context.uiBuilder.confirmDialog(
	// 		context.uiBuilder.buildFileUpload(context, {
	// 			url: `${context.apiClient.http.baseUrl}/mes/ProjectDeliveryItems/importAll?templateID=${context.model.id}`,
	// 			accept: '.xls,.xslx',
	// 			showUploadButton: true,
	// 			onUpload: (scope: any) => {
	// 				console.log('scope', scope);
	// 				if (!scope.files || scope.files.length == 0) {
	// 					$toast.add({
	// 						severity: 'warn',
	// 						summary: $t('dialog.title.warning'),
	// 						detail: $t('action.chooseFile'),
	// 						life: 3000,
	// 					});
	// 				} else {
	// 					if (scope.response?.data && scope.response?.data > 0) {
	// 						console.log('有数据');
	// 					}
	// 					$toast.add({
	// 						severity: 'info',
	// 						summary: $t('dialog.title.prompt'),
	// 						detail: $t('success.upLoadSuccess'),
	// 						life: 3000,
	// 					});
	// 				}
	// 			},
	// 			onDelete: () => {},
	// 		}),
	// 		context,
	// 		{
	// 			title: '上传文件',
	// 			accept: () => {
	// 				console.log('aaaaaa');

	// 				return true;
	// 			},
	// 			reject: () => {
	// 				console.log('取消上传');
	// 			},
	// 		}
	// 	);
	// 	// context.addSubGroupItems<ProjectMember>({
	// 	// 	target,
	// 	// 	group: 'members',
	// 	// 	source: selection,
	// 	// 	sequenceKey: 'itemID',
	// 	// 	propsMapper: {
	// 	// 		entityState: () => EntityState.CREATED,
	// 	// 		projectID: () => target.projectID,
	// 	// 		memberID: m => m,
	// 	// 	},
	// 	// });
	// }

	/**
	 * 添加交付物
	 * @param context 界面上下文
	 * @param target  采供合同
	 */
	addDeliveryItem(context: UiContext<Project>, target: Project) {
		context
			.select<Material>({
				repository: 'Materials',
				selectionMode: 'multiple',
				searchParam: {
					pager: defaultPager(),
					// queryParams:{
					// 	projectID: target.projectID ?? ''
					// }
				},
				service: 'base',
				ctor: defineMaterial,
			})
			.then((selection: any) => {
				if (selection) {
					context.addSubGroupItems<ProjectDeliveryItem>({
						target,
						group: 'deliveryItems',
						source: selection,
						propsMapper: {
							productID: () => null,
							projectID: () => target.projectID,
							productCategory: (t: any) => t?.category?.categoryName ?? null,
							productPic: (t: any) => t.materialPic ?? null,
							productName: (t: any) => t.materialName ?? null,
							productCode: (t: any) => t.materialCode ?? null,
							specs: (t: any) => t.specs ?? null,
							brand: (t: any) => t.brand ?? null,
							quantity: (t: any) => t.minQty ?? 1,
							unit: (t: any) => t.unit ?? null,
						},
					});
				}
			});
	}

	//采购员不规划部怀风月无涯
	createDeliveryItem(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectDeliveryItem>({
				group: 'deliveryItems',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					item.productID = null;
					if (!target.deliveryItems.includes(item)) target.deliveryItems.push(item);
				}
			});
	}
	/**
	 *
	 * @param context
	 * @param target
	 * 创建物料
	 */
	newProjectMaterial(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectMaterial>({
				group: 'materials',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.materials.includes(item)) target.materials.push(item);
				}
			});
	}

	/**
	 *
	 * @param context
	 * @param target
	 * 创建团队成员
	 */
	newProjectMember(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectMember>({
				group: 'members',
				sequenceKey: 'memberID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.members.includes(item)) target.members.push(item);
				}
			});
	}

	hasProjectMember(target: Project, userID?: string) {
		if (!userID || !target.members) {
			return false;
		}
		return target.members.some(
			(item: ProjectMember) => !MetaModel.deleted(item) && item.memberID === userID
		);
	}

	/** User 模型字段为 username，memberID 引用元数据展示字段为 userName */
	mapUserToProjectMemberRef(user: User) {
		return {
			...user,
			userName: user.username ?? user.customProperties?.$username ?? user.customProperties?.$userName ?? '',
		};
	}

	addProjectMember(context: UiContext<Project>, target: Project) {
		context
			.select<User>({
				service: 'base',
				repository: 'Users',
				ctor: defineUser,
				selectionMode: 'multiple',
				selectableFn: (user: User) => !this.hasProjectMember(target, user.userID),
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						filter: 't.status BETWEEN 1 AND 5',
						// status: ProductionJobStatus.NEW,
					},
				},
			})
			.then((selection: any) => {
				if (!selection || !Array.isArray(selection) || selection.length === 0) {
					return;
				}
				const seen = new Set<string>();
				const toAdd: User[] = [];
				let skipped = 0;
				for (const user of selection) {
					const userID = user?.userID;
					if (!userID) {
						continue;
					}
					if (seen.has(userID)) {
						skipped++;
						continue;
					}
					seen.add(userID);
					if (this.hasProjectMember(target, userID)) {
						skipped++;
						continue;
					}
					toAdd.push(user);
				}
				if (toAdd.length === 0) {
					if (skipped > 0) {
						context.uiBuilder.toast(context, {
							severity: 'warn',
							summary: context.globalProps.$t('dialog.title.prompt'),
							detail: context.t('project.allMembersAlreadyAdded'),
							group: 'br',
							life: 3000,
						});
					}
					return;
				}
				if (skipped > 0) {
					context.uiBuilder.toast(context, {
						severity: 'warn',
						summary: context.globalProps.$t('dialog.title.prompt'),
						detail: context.globalProps.$t('project.skippedExistingMembers', { count: skipped }),
						group: 'br',
						life: 3000,
					});
				}
				context.addSubGroupItems<ProjectMember>({
					target,
					group: 'members',
					source: toAdd,
					propsMapper: {
						entityState: () => EntityState.CREATED,
						projectID: () => target.projectID,
						memberID: (m: User) => this.mapUserToProjectMemberRef(m),
						joinTime: () => new Date().toFormat('yyyy-MM-dd HH:mm:ss'),
					},
				});
			});
	}

	/**
	 *
	 * @param context
	 * @param target
	 * 创建任务
	 */
	newTasks(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectTask>({
				group: 'tasks',
				sequenceKey: 'taskID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.tasks.includes(item)) target.tasks.push(item);
				}
			});
	}
	/**
	 * 创建交付物
	 * @param context
	 * @param target
	 */
	newProjectDeliveryItem(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectDeliveryItem>({
				group: 'deliveryItems',
				sequenceKey: 'taskID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.deliveryItems.includes(item)) target.deliveryItems.push(item);
				}
			});
	}
	/**
	 * 创建项目任务关系
	 * @param context
	 * @param target
	 */
	newProjectTaskRelation(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectTaskRelation>({
				group: 'taskRelations',
				sequenceKey: 'taskID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.taskRelations.includes(item)) target.taskRelations.push(item);
				}
			});
	}
	/**
	 * 创建交付物变更
	 * @param context
	 * @param target
	 */
	newProjectDeliveryItemAmend(context: UiContext<Project>, target: Project) {
		context
			.newSubGroupItem<ProjectDeliveryItemAmend>({
				group: 'deliveryItemAmends',
				sequenceKey: 'taskID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.deliveryItemAmends.includes(item)) target.deliveryItemAmends.push(item);
				}
			});
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(
				this.group<ProjectDeliveryItemAmend>('a4').hideIf(model => model.amendIdx <= 0)
				// this.group<ProjectDeliveryItem>('deliveryItems').defaultHandlerFile(() => ({
				// 	// importFn: async (context, file) => {
				// 	// 	if (context.root.view === UiViewOne.Edit) {
				// 	// 		// 添加前清空子表交付物
				// 	// 		context.root.removeSubGroupItems('deliveryItems')
				// 	// 		await context.uploadFiles(file, {
				// 	// 			action: 'importItems',
				// 	// 			queryParams: {
				// 	// 				id: context.root.model.projectID ?? '',
				// 	// 				templateID: context.currentTemplate?.templateID ?? '',
				// 	// 				// 判断是否为详情（1：详情， 0：编辑）
				// 	// 				isDetail: 0
				// 	// 			},
				// 	// 			repository: 'ProjectDeliveryItems',
				// 	// 			service: 'mes'
				// 	// 		})
				// 	// 			.then((res: any) => {
				// 	// 				const { datas } = res.data
				// 	// 				if (datas.length > 0) {
				// 	// 					// 添加子项数据
				// 	// 					context.root.addSubGroupItems({
				// 	// 						target: context.root.model,
				// 	// 						group: 'deliveryItems',
				// 	// 						source: datas,
				// 	// 						sequenceKey: 'itemID',
				// 	// 						propsMapper: {
				// 	// 							productID: (): void => null
				// 	// 						}
				// 	// 					})
				// 	// 				}
				// 	// 				// 成功提示
				// 	// 				context.uiBuilder.toast(context, {
				// 	// 					severity: 'success',
				// 	// 					summary: context.t('dialog.success'),
				// 	// 					detail: context.t("success.importSuccess"),
				// 	// 					group: 'br',
				// 	// 					life: 3000
				// 	// 				})
				// 	// 			})
				// 	// 			.catch((error: any) => context.uiBuilder.toast(context, {
				// 	// 				severity: "error",
				// 	// 				summary: context.t("dialog.title.error"),
				// 	// 				detail: error.message ?? context.t("failure.importFail"),
				// 	// 				life: 3000,
				// 	// 			}))
				// 	// 	} else {
				// 	// 		await context.uploadFiles(file, {
				// 	// 			action: 'importItems',
				// 	// 			queryParams: {
				// 	// 				id: context.root.model.projectID ?? '',
				// 	// 				templateID: context.currentTemplate?.templateID ?? '',
				// 	// 				// 判断是否为详情（1：详情， 0：编辑）
				// 	// 				isDetail: 1
				// 	// 			},
				// 	// 			repository: 'ProjectDeliveryItems',
				// 	// 			service: 'mes'
				// 	// 		})
				// 	// 			.then(() => {
				// 	// 				// 成功提示
				// 	// 				context.uiBuilder.toast(context, {
				// 	// 					severity: 'success',
				// 	// 					summary: context.t('dialog.success'),
				// 	// 					detail: context.t("success.importSuccess"),
				// 	// 					group: 'br'
				// 	// 					// life: 3000
				// 	// 				})
				// 	// 				// 刷新页面
				// 	// 				setInterval(() => context.reload(), 2000)
				// 	// 			})
				// 	// 			.catch((error: any) => context.uiBuilder.toast(context, {
				// 	// 				severity: "error",
				// 	// 				summary: context.t("dialog.title.error"),
				// 	// 				detail: error.message ?? context.t("failure.importFail"),
				// 	// 				life: 3000,
				// 	// 			}))
				// 	// 	}

				// 	// },
				// 	// exportFn: async (context, file) => {
				// 	// 	const { $api: apiBox } = context.globalProps
				// 	// 	try {
				// 	// 		await apiBox.exportAll({
				// 	// 			action: 'exportAll',
				// 	// 			queryParams: {
				// 	// 				projectID: context.root.model.projectID ?? '',
				// 	// 				templateID: context.currentTemplate?.templateID ?? '',
				// 	// 			},
				// 	// 			repository: 'ProjectDeliveryItems',
				// 	// 			service: 'mes'
				// 	// 		})
				// 	// 	} catch (error: any) {
				// 	// 		context.uiBuilder.toast(context, {
				// 	// 			severity: "error",
				// 	// 			summary: context.globalProps.$t("dialog.title.error"),
				// 	// 			detail: error.message ?? context.globalProps.$t("failure.importFail"),
				// 	// 			life: 3000,
				// 	// 		});
				// 	// 	}
				// 	// }
				// }))
				// 	// 导入（暂停、终止和维保隐藏）
				// 	.importIf(t => !(t.status === 'PAUSED' || t.status === 'MAITAINING' || t.status === 'TERMINATED'))
			);
		}
		// groups.push(
		// 	this.group<ProjectDeliveryItemAmend>('a4').hideIf(model => false)
		// );

		return { fields, groups, customActions };
	}
	/**
	 * 导入
	 */
	// async importFiles(context: UiBuildContext<any>) {
	// 	const { $toast, $t } = context.globalProps;
	// 	context.uiBuilder.buildFileUpload(context, {
	// 		url: '', //上传地址
	// 		onUpload: (scope: any) => {
	// 			console.log(scope.files);
	// 			if (!scope.files || scope.files.length == 0) {
	// 				$toast.add({
	// 					severity: 'warn',
	// 					summary: $t('dialog.title.warning'),
	// 					detail: $t('action.chooseFile'),
	// 					life: 3000,
	// 				});
	// 			} else {
	// 				$toast.add({
	// 					severity: 'info',
	// 					summary: $t('dialog.title.prompt'),
	// 					detail: $t('success.upLoadSuccess'),
	// 					life: 3000,
	// 				});
	// 			}
	// 		},
	// 	});
	// }
}

/**
 * 构造项目交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProjectLogic({
		metaUiService: metaUiService,
		repository: 'Projects',
		router,
		module: module || metaUiService.findModule('Project'),
	});
/**
 * 团队成员交互逻辑
 */
export class ProjectMemberLogic extends UiGroupLogic<ProjectMember, Project> {
	constructor(parent: ProjectLogic, master: Project) {
		super(defineProjectMember, parent, master, 'members');
	}
}
/**
 * 物料清单交互逻辑
 */
export class ProjectMaterialLogic extends UiGroupLogic<ProjectMaterial, Project> {
	constructor(parent: ProjectLogic, master: Project) {
		super(defineProjectMaterial, parent, master, 'materials');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();

		//console.log('fields.length',fields.length);
		if (fields.length == 0) {
			console.log('this.field(supplierID)', this.field('supplierID'));

			fields.push(
				this.field('supplierID').setSearchParam((ctx, model) => {
					//let filters = null;
					//filters = 'AND status>0';
					return {
						//filter: filters,
						status: '>0',
					};
				})
			);
		}

		return { fields, groups, customActions };
	}
}
/**
 * 交付物交互逻辑
 */
export class ProjectDeliveryItemLogic extends UiGroupLogic<ProjectDeliveryItem, Project> {
	constructor(parent: ProjectLogic, master: Project) {
		super(defineProjectDeliveryItem, parent, master, 'deliveryItems');
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();

		//console.log('fields.length',fields.length);
		if (fields.length == 0) {
			fields.push(
				this.field('specs').onChange((ctx, model, newVal, oldVal) => {
					MetaModel.modify(model);
				})
			);
		}

		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
