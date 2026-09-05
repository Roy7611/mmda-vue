/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, Module, MetaUiField, MetaModel, type UiContext, EntityAction, isRefNone, EntityUrlParam, EntitySearchParam, PagedList, getSqlOperator, inFilter, MetaUiFieldAlignmentEnum, MetaUiFieldAlignment, ApiClient, isNullOrUndefined } from '@mmda/core';
import { type UiBuildContext, type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, type UiDialogPropsType, UiLogicAfterFn, UiViewMany, type Rx, rx } from '@mmda/vui';
import { type Tool, defineTool } from '@/models/Tool';
import { type ToolUse, defineToolUse } from '@/models/ToolUse';
import { type MaintenancePlan } from '@/models/MaintenancePlan';
import { MaintainingFrequency } from '@/enums/MaintainingFrequency';
import { ToolStatus } from '@/enums/ToolStatus'
import { LifecycleModeEnum } from '@/enums/LifecycleMode'
import { h, reactive, type Ref, ref, VNode } from 'vue';
import { ToolsLend } from '@/components/ToolsLend';
import { ToolsMove } from '@/components/ToolsMove';
import { ToolsPicking } from '@/components/ToolsPicking';
import { ToolCategory } from "@/models/ToolCategory";
import { ToolCategoryEditor } from "@/modules/ToolCategories/ToolCategoryEditor";
import { MaterialType } from '@mmda/base/src/enums/MaterialType';


/**
 * 工装器具交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:07:59.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 工装器具交互逻辑
 */

// 借出参数
const lendData = reactive({
	data: {
		ownerID: '',
	},
});
// 移动参数
const moveData = reactive({
	data: {} as any,
});
// 维修参数
const repairData = reactive({
	data: {
		ownerID: '',
	},
});
// 归还参数
const returnData = reactive({
	data: {} as any,
});

// 批量检修接口参数
const Overhaulparams = reactive({
	// 检修参数
	batchOverhaul: {
		refName: "Tool|batchOverhaul",
		refItemKeys: []
	},
})

// 批量改制接口参数
const Retrofitparams = reactive({
	// 改制参数
	batchRetrofit: {
		refName: "Tool|batchRetrofit",
		refItemKeys: []
	},
})

// 批量维修接口参数
const Repairparams = reactive({
	// 维修参数
	batchRepair: {
		refName: "Tool|batchRepair",
		refItemKeys: []
	},
})

const propsData = reactive({
	// 检修参数
	batchOverhaul: {
		action: 'create',
		repository: 'Maintenances',
		queryParams: {
			cache: true
		},
		service: 'mes',
	},
})
/**
 * 获取create标识
 */
const getCreateData = async (params: any, propData: any, context: UiBuildContext<any>) => {
	let data = {} as any
	try {
		const res = await context.globalProps.$api.doAction(propData, params)
		if (res) {
			data = res
		}
	} catch (error: any) {
		context.uiBuilder.toast(
			context,
			{
				severity: 'error',
				summary: context.t('dialog.title.error'),
				detail: error.message ?? context.t('invalid.requestFailed'),
				group: 'br',
				life: 3000
			}
		)
	}
	return data
}
// 借出
const beforeToolsLend = async (context: UiBuildContext<any>, model: Tool, action: EntityAction) => {
	const { $toast: toast, $api: apiBox, $t: t } = context.globalProps;
	try {
		await context.uiBuilder.confirmDialog(
			h(ToolsLend, {
				class: 'w-full',
				ctx: context,
				onGetUserID: (value: string) => {
					lendData.data.ownerID = value;
				},
			}),
			context,
			{
				id: 'ToolsLend',
				name: 'ToolsLend',
				title: t('auth.Lend'),
				style: {
					width: '20%',
					height: '30vh',
				},
				showCancelButton: true,
				closeOnClickModal: false,
				accept: async () => {
					console.log('lendData.data.ownerID', lendData.data.ownerID);
					if (isRefNone(lendData.data.ownerID)) {
						toast.add({
							severity: 'error',
							detail: t('auth.selectASuperintendent'),
							summary: context.t('dialog.title.error'),
							group: 'br',
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}

					try {
						const res = await apiBox.doAction(
							{
								path: model.toolID ?? '',
								action: 'lend',
								repository: 'Tools',
								service: 'mes',
							},
							{
								ownerID: lendData.data.ownerID,
							}
						);
						if (res) {
							toast.add({
								severity: 'success',
								detail: t('auth.LendSuccess'),
								summary: t('dialog.success'),
								// position: 'bottom-right',
								life: 3000,
							});
							setTimeout(() => {
								context.reload();
							}, 1000);
						}
						return true;
					} catch (error: any) {
						return false;
					}
				},
				// reject: () => {
				// 	return false;
				// }
			}
		);
	} catch (error: any) {
		return false;
	}
};

// 移动
const beforeToolsMove = async (context: UiBuildContext<any>, model: Tool, action: EntityAction) => {
	const { $toast: toast, $api: apiBox, $t: t } = context.globalProps;
	try {
		await context.uiBuilder.confirmDialog(
			h(ToolsMove, {
				class: 'w-full',
				ctx: context,
				onGetMoveData: (value: Object) => (moveData.data = value),
			}),
			context,
			{
				id: 'ToolsMove',
				name: 'ToolsMove',
				title: t('auth.Move'),

				style: {
					width: '30%',
					height: '45vh',
				},
				showCancelButton: true,
				closeOnClickModal: false,
				accept: async () => {
					if (isRefNone(moveData.data.moveTo)) {
						toast.add({
							severity: 'error',
							detail: t('auth.writetMoveTo'),
							summary: context.t('dialog.title.error'),
							group: 'br',
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}
					try {
						const res = await apiBox.doAction(
							{
								path: model.toolID ?? '',
								action: 'move',
								repository: 'Tools',
								service: 'mes',
							},
							{
								payload: {
									loc: moveData.data.moveTo,
									remark: moveData.data.remark,
								},
							}
						);
						if (res) {
							toast.add({
								severity: 'success',
								detail: t('auth.MoveSuccess'),
								summary: t('dialog.success'),
								// position: 'bottom-right',
								life: 3000,
							});
							setTimeout(() => {
								context.reload();
							}, 1000);
						}
						return true;
					} catch (error: any) {
						return false;
					}
				},
			}
		);
	} catch (error: any) {
		return false;
	}
};

// 维修
const beforeToolsRepair = async (context: UiBuildContext<any>, model: Tool, action: EntityAction) => {
	const { $toast: toast, $api: apiBox, $t: t } = context.globalProps;
	try {
		await context.uiBuilder.confirmDialog(
			h(ToolsLend, {
				class: 'w-full',
				ctx: context,
				onGetUserID: (value: string) => (repairData.data.ownerID = value),
			}),
			context,
			{
				id: 'ToolsLend',
				name: 'ToolsLend',
				title: t('auth.Repair'),

				style: {
					width: '20%',
					height: '30vh',
				},
				showCancelButton: true,
				closeOnClickModal: false,
				accept: async () => {
					if (isRefNone(repairData.data.ownerID)) {
						toast.add({
							severity: 'error',
							detail: t('auth.selectASuperintendent'),
							summary: context.t('dialog.title.error'),
							group: 'br',
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}
					try {
						const res = await apiBox.doAction(
							{
								path: model.toolID ?? '',
								action: 'repair',
								repository: 'Tools',
								service: 'mes',
							},
							{
								ownerID: repairData.data.ownerID,
							}
						);
						if (res) {
							toast.add({
								severity: 'success',
								detail: t('auth.RepairSuccess'),
								summary: t('dialog.success'),
								// position: 'bottom-right',
								life: 3000,
							});
							setTimeout(() => {
								context.reload();
							}, 1000);
						}
						return true;
					} catch (error: any) {
						return false;
					}
				},
			}
		);
	} catch (error: any) {
		return false;
	}
};

// 归还
const beforeToolsReturn = async (context: UiBuildContext<any>, model: Tool, action: EntityAction) => {
	const { $toast: toast, $api: apiBox, $t: t } = context.globalProps;
	try {
		await context.uiBuilder.confirmDialog(
			h(ToolsMove, {
				ctx: context,
				onGetMoveData: (value: Object) => (returnData.data = value),
			}),
			context,
			{
				id: 'ToolsReturn',
				name: 'ToolsReturn',
				title: t('auth.Return'),
				style: {
					width: '30%',
					height: '45vh',
				},
				showCancelButton: true,
				closeOnClickModal: false,
				accept: async () => {
					if (isRefNone(returnData.data.moveTo)) {
						toast.add({
							severity: 'error',
							detail: t('auth.writetMoveTo'),
							summary: context.t('dialog.title.error'),
							group: 'br',
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}
					try {
						const res = await apiBox.doAction(
							{
								path: model.toolID ?? '',
								action: 'return',
								repository: 'Tools',
								service: 'mes',
							},
							{
								payload: {
									loc: returnData.data.moveTo,
									remark: returnData.data.remark,
								},
							}
						);
						if (res) {
							toast.add({
								severity: 'success',
								detail: t('auth.ReturnSuccess'),
								summary: t('dialog.success'),
								// position: 'bottom-right',
								life: 3000,
							});
							setTimeout(() => {
								context.reload();
							}, 1000);
						}
						return true;
					} catch (error: any) {
						return false;
					}
				},
			}
		);
	} catch (error: any) {
		return false;
	}
};

// 操作的业务action-name 为子表提供判断条件
const actionName = ref('');
const refToolUseActions = ['store', 'lend', 'return', 'move', 'batchStore', 'batchLend', 'batchMove']; // 关联toolUse的field-logic

export class ToolLogic extends UiLogic<Tool> {
	constructor(init: UiLogicInit) {
		super(defineTool, init);
		this.addRelativeLogic<ToolUse>('uses', master => new ToolUseLogic(this, master));
		this.beforeAction = (context: UiBuildContext<any>, model: Tool, action: EntityAction) => {


			actionName.value = action.name;
			try {
				return this.handlerBeforeActionFn(context, action);
			} catch (error: any) {
				throw new Error(error);
			}
		};

		this.afterLoad = async (context: UiBuildContext<any>, model: Tool): Promise<void> => {
			actionName.value = '';
			if (context.view === UiViewMany.Index) return;
			if (model?.category?.materialX) {
				await context.initMetadata(false, {
					redirection: model?.category?.materialX,
					queryParams: {
						xMetaObject: model?.category?.materialX,
					},
				});
				if (model.category.materialX === 'ToolFlask' && isNullOrUndefined((model as any).hasBelt)) {
					(model as any).hasBelt = false;
				}
			}
		}

		// 设置批量选择的可选逻辑
		this.selectableList = {
			batchStore: (model, ctx) => model.status === ToolStatus.NONE && !model.siteID,
			// 批量启用：状态为"－"且当前站点不为空
			batchStartUsing: (model, ctx) => model.status === ToolStatus.NONE && !!model.siteID,

			// 批量借出：（状态为"－"且当前站点不为空 或 正常使用 或 谨慎使用）且 无使用记录或已归还（以 allowLend 为准）
			batchLend: (model, ctx) => {
				const validStatus = (model.status === ToolStatus.NONE && !!model.siteID)
					|| model.status === ToolStatus.NORMAL
					|| model.status === ToolStatus.ALERTED;
				return validStatus && model.allowLend === true;
			},

			// 批量归还：（状态为"－"且当前站点不为空 或 正常使用 或 谨慎使用）且 存在借出未归还记录（以 allowReturn 为准）
			batchReturn: (model, ctx) => {
				const validStatus = (model.status === ToolStatus.NONE && !!model.siteID)
					|| model.status === ToolStatus.NORMAL
					|| model.status === ToolStatus.ALERTED;
				return validStatus && model.allowReturn === true;
			},

			// 批量移动：（状态为"－"）或（状态为正常使用）或（状态为谨慎使用）且当前站点不为空且关联了物料
			batchMove: (model, ctx) => {
				const validStatus = model.status === ToolStatus.NONE
					|| model.status === ToolStatus.NORMAL
					|| model.status === ToolStatus.ALERTED;
				return validStatus && !!model.siteID && !!model.materialID;
			},

			// 批量检修/改制/维修：作为设备管理，且状态为正常使用或谨慎使用
			batchOverhaul: (model, ctx) => {
				return model.asEquip === true
					&& (model.status === ToolStatus.NORMAL || model.status === ToolStatus.ALERTED);
			},
			batchRetrofit: (model, ctx) => {
				return model.asEquip === true
					&& (model.status === ToolStatus.NORMAL || model.status === ToolStatus.ALERTED);
			},
			batchRepair: (model, ctx) => {
				return model.asEquip === true
					&& (model.status === ToolStatus.NORMAL || model.status === ToolStatus.ALERTED);
			},

			// 批量报废：状态为正常使用/谨慎使用/暂停使用
			batchScrap: (model, ctx) => {
				return model.status === ToolStatus.NORMAL
					|| model.status === ToolStatus.ALERTED
					|| model.status === ToolStatus.DISABLED;
			},

			// 批量处置：状态为已报废/寿命终结
			batchDispose: (model, ctx) => {
				return model.status === ToolStatus.SCRAPPED
					|| model.status === ToolStatus.EOL;
			}
		}
	}

	handlerBeforeActionFn(context: UiContext<Tool> & UiBuildContext<any>, action: EntityAction): Promise<boolean> {
		// 关联操作的逻辑在 beforeRefToolUseAction 中处理
		if (action.name == 'store' || action.name == 'return' || action.name == 'lend' || action.name == 'move') return this.beforeRefToolUseAction(context, context.model, action);
		if (action.name == 'batchStore') context.toSelectManyIndex('batchStore', () => this.batchStoreFn(context));
		if (action.name == 'batchLend') context.toSelectManyIndex('batchLend', () => this.batchLendFn(context));
		if (action.name == 'batchMove') context.toSelectManyIndex('batchMove', () => this.batchMoveFn(context));
		if (action.name == 'batchReturn') context.toSelectManyIndex('batchReturn', () => this.batchReturnFn(context));
		if (action.name == 'batchOverhaul') context.toSelectManyIndex('batchOverhaul', () => this.batchOverhaulFn(context));
		if (action.name == 'batchRetrofit') context.toSelectManyIndex('batchRetrofit', () => this.batchRetrofitFn(context));
		if (action.name == 'batchRepair') context.toSelectManyIndex('batchRepair', () => this.batchRepairFn(context));
		if (action.name == 'batchScrap') context.toSelectManyIndex('batchScrap', () => this.batchScrapFn(context));
		if (action.name == 'batchDispose') context.toSelectManyIndex('batchDispose', () => this.batchDisposeFn(context));
		if (action.name == 'batchStartUsing') context.toSelectManyIndex('batchStartUsing', () => this.batchStartUsingFn(context));

		if (['batchStore', 'batchLend', 'batchMove', 'batchReturn', 'batchOverhaul', 'batchRetrofit', 'batchRepair', 'batchScrap', 'batchDispose', 'batchStartUsing'].includes(action.name)) {
			return Promise.resolve(false)
		} else {
			return Promise.resolve(true)
		}
	}

	async createToolUseForm(context: UiContext<Tool>, model: Tool,) {
		const { userId, username } = context.app.user;
		const toolUse = rx(defineToolUse({
			toolID: model.toolID,
			itemID: (model.uses ? model.uses.length : 0) + 1,
			transDate: new Date().toFormat('yyyy-MM-dd'),
		}));
		if ((actionName.value === 'store' || actionName.value === 'batchStore') && userId) {
			toolUse.ownerID = userId;
			MetaModel.setRefProp(toolUse, 'ownerID', decodeURIComponent(username || ''));
		}

		const toolUseGroup = context.metaui.getGroup('uses');

		return await context.subGroupItem<ToolUse>(toolUseGroup, toolUse, { groupMode: 'create', height: '30vh' });
	}


	beforeRefToolUseAction(context: UiContext<Tool>, model: Tool, action: EntityAction): Promise<boolean> {
		return this.createToolUseForm(context, model).then((res: any) => {
			if (!res) return Promise.resolve(false);
			action.param.value = {
				payload: res,
			};
			return Promise.resolve(true);
		})
	}

	async getAll(param: EntitySearchParam, context?: UiBuildContext<any>): Promise<PagedList<Tool>> {
		if (!this.currentCategory) {
			await context.initMetadata(false, {
				repository: this.repository,
			});
		} else if (this.currentCategory?.materialX) {
			// 初始化扩展对象元数据，使列表能正确渲染扩展字段列
			await context.initMetadata(false, {
				redirection: this.currentCategory.materialX,
				queryParams: { xMetaObject: this.currentCategory.materialX },
			});
		}
		param.queryParams = Object.assign({}, param.queryParams, {
			categoryID: this.currentCategory?.categoryID ?? '',
			xMetaObject: this.currentCategory?.materialX ?? '',
		});
		return super.getAll(param, context);
	}

	async create(param: any = {}, entityUrlParam?: EntityUrlParam): Promise<Tool> {
		return super.create(Object.assign({}, param, {
			refID: this.currentCategory?.categoryID ?? '',
			refName: this.currentCategory?.materialX ?? '',
		}));
	}

	beforeIndex() {
		this.currentCategory = null;
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				//当前没有器具类别模块，先以普通文本形式显示
				this.field('categoryID').setCustomCellRenderer((fld, ctx) => {
					return ctx.uiBuilder.factory.textSpan(ctx.model.category ? ctx.model.category.categoryName : '-', {});
				}),
				// 根据工位过滤
				this.field('siteID'),
				// 根据状态过滤
				this.field('status'),
				this.field('asEquip'),
				this.field('lifecycleModes'),
				this.field('alertingState'),
			);
		}
		if (customActions.length == 0) {
			customActions.push({
				name: 'toolsPicking',
				icon: 'pi pi-box',
				label: 'action.assignTools',
				group: 'selectMany',
				role: 'primary',
				onAction: this.beforeToolsPicking,
			});
		}

		return { fields, groups, customActions };
	}

	// 批量入库
	async batchStoreFn(context: UiBuildContext<any>) {
		actionName.value = 'batchStore';
		//当前选中项
		const { selectedItems } = context; const t = context.t.bind(context);
		if (!MetaModel.hasAny(selectedItems)) {
			await context.uiBuilder
				.toast(context, {
					severity: "error",
					group: "br",
					summary: t("invalid.error"),
					detail: t("invalid.requiredSelectAny"),
					life: 3000,
				})
				.then(() => {
					throw new Error(t('invalid.requiredSelectAny'));
				});
		}


		return await this.createToolUseForm(context, context.model).then(async (res: any) => {
			if (!res) return Promise.reject(false);
			else {
				try {
					await this.apiClient.doAction({
						action: 'batchStore',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
						toSiteID: res.toSiteID,
						remark: res.remark,
						ownerID: res.ownerID,
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						summary: t('dialog.success'),
						detail: t('success.toolsStored'),
						group: 'br',
						life: 3000,
					});
					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: error.message ?? t('invalid.requestFailed'),
						group: 'br',
						life: 3000
					})
				}
			}
		});

	}

	// 批量启用
	async batchStartUsingFn(context: UiBuildContext<any>): Promise<boolean> {
		actionName.value = 'batchStartUsing';
		const { selectedItems } = context; const t = context.t.bind(context);

		// if (!MetaModel.hasAny(selectedItems)) {
		// 	await context.uiBuilder.toast(context, {
		// 		severity: "error",
		// 		group: "br",
		// 		summary: t("invalid.error"),
		// 		detail: t("invalid.requiredSelectAny"),
		// 		life: 3000,
		// 	});
		// 	return Promise.reject(new Error("没有选择数据"));
		// }
		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchEnable', { count: selectedItems.length }),
			header: t('tool.batchEnable'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					await this.apiClient.doAction({
						action: 'batchStartUsing',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});

					context.uiBuilder.toast(context, {
						severity: 'success',
						summary: t('dialog.success'),
						detail: t('success.toolsEnabled'),
						group: 'br',
						life: 3000,
					});

					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: error.message ?? t('invalid.requestFailed'),
						group: 'br',
						life: 3000,
					});
					return false;
				}
			},
			reject: () => false,
		});
	}

	// 批量借出
	async batchLendFn(context: UiBuildContext<any>) {
		actionName.value = 'batchLend';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t('invalid.error'),
				detail: t('invalid.requiredSelectAny'),
				life: 3000,
			});
			throw new Error(t('invalid.requiredSelectAny'));
		}

		const res = await this.createToolUseForm(context, context.model);
		if (!res) throw new Error(t('failure.canceloperation'));

		return await this.apiClient.doAction({
			action: 'batchLend',
			repository: 'Tools',
		}, {
			toolIDs: selectedItems.map((item: any) => item.toolID),
			toSiteID: res.toSiteID,
			remark: res.remark,
			ownerID: res.ownerID,
		}).then(() => {
			context.uiBuilder.toast(context, {
				severity: 'success',
				summary: t('dialog.success'),
				detail: t('success.toolsLent'),
				group: 'br',
				life: 3000,
			});
			return true;
		}).catch((error: any) => {
			context.uiBuilder.toast(context, {
				severity: 'error',
				summary: t('dialog.title.error'),
				detail: error.message ?? t('invalid.requestFailed'),
				group: 'br',
				life: 3000,
			});
			return false;
		});
	}

	// 批量移动
	async batchMoveFn(context: UiBuildContext<any>) {
		actionName.value = 'batchMove';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			await context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		const res = await this.createToolUseForm(context, context.model);
		if (!res) throw new Error(t('failure.canceloperation'));

		return await this.apiClient.doAction({
			action: 'batchMove',
			repository: 'Tools',
		}, {
			toolIDs: selectedItems.map((item: any) => item.toolID),
			toSiteID: res.toSiteID,
			remark: res.remark,
			ownerID: res.ownerID,
		}).then(() => {
			context.uiBuilder.toast(context, {
				severity: 'success',
				summary: t('dialog.success'),
				detail: t('success.toolsMoved'),
				group: 'br',
				life: 3000,
			});
			return true;
		}).catch((error: any) => {
			context.uiBuilder.toast(context, {
				severity: 'error',
				summary: t('dialog.title.error'),
				detail: error.message ?? t('invalid.requestFailed'),
				group: 'br',
				life: 3000,
			});
			return false;
		});
	}

	// 批量归还
	async batchReturnFn(context: UiBuildContext<any>) {
		actionName.value = 'batchReturn';
		const { selectedItems, uiBuilder } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		// todo 记录当前选中项的使用次数，供批量归还接口使用
		const returnParmas = ref<Record<string, any>>(null);
		if (selectedItems.length) returnParmas.value = Object.assign({}, ...selectedItems.map((item: any) => ({ [item.toolID]: 0 })));

		// new logic 
		const showFields = [].concat(this.meta.metaui.getListedFields().filter(f => ['toolNo', 'toolName', 'toolPic', 'remainingCycles'].includes(f.fieldName)), this.meta.metaui.getGroup('uses').getListedFields().filter(f => ['usedCycles'].includes(f.fieldName)));
		const columns = [].concat(
			uiBuilder.factory.column(
				{
					field: 'rowNum',
					header: '',
					exportable: false,
					alignFrozen: 'left',
					frozen: true,
					style: {
						width: `50px`,
						'text-align': 'center',
						'z-index': 99
					},
					pt: {
						headerCell: (o: any) => {
							const { attrs, props, context: ctx } = o

							return {
								class: `${props.field}`,
								style: {
									background: 'var(--mmda-content-background)',
									'text-align': 'center',
								}
							}
						},
						bodyCell: (o: any) => {
							const { attrs, parent, props, context: ctx } = o

							return {
								class: `${props.field}`
							}
						}
					}
				},
				{
					header: () =>
						uiBuilder.factory.textSpan('#', {
							style: {
								width: '100%',
								textAlign: 'center'
							}
						}),
					body: ({ data, index }: any) => {

						return uiBuilder.factory.textSpan(
							`${index + 1}`,
							{
								// 统一使用索引来做行号
								style: {
									width: '100%',
									textAlign: 'center'
								}
							}
						)
					}
				}
			),
			showFields
				.map((f: MetaUiField) => {
					if (['toolNo', 'toolName', 'toolPic', 'remainingCycles'].includes(f.fieldName)) {
						return uiBuilder.factory.column(
							{
								header: f.displayLabel,
								field: f.fieldName,
								columnKey: f.fieldName,
								key: f.fieldName,
								sortable: f.sortable ?? true,
								style: {
									width: `200px`,
									maxWidth: `400px`,
									'text-align': MetaUiFieldAlignmentEnum.valueOf(f.align ?? MetaUiFieldAlignment.LEFT)
								},
								pt: {
									columnHeaderContent: (o: any) => {
										return {
											style: {
												justifyContent: MetaUiFieldAlignmentEnum.valueOf(
													f.align ?? MetaUiFieldAlignment.LEFT
												)
											}
										}
									},
									headerCell: (o: any) => {
										const { attrs, props, context: ctx } = o

										return {
											class: `${props.field}`,
											style: {
												background: 'var(--mmda-treetable-header-cell-background)',
											}
										}
									},
									bodyCell: (o: any) => {
										const { attrs, parent, props, context: ctx } = o

										return {
											class: `${props.field}`,
											style: {
												width: `200px`,
												maxWidth: `400px`
											}
										}
									}
								}
							},
							{
								body: (slotProps: any) => {
									return f.fieldName === 'toolPic' ? uiBuilder.factory.image(slotProps.data[f.fieldName], {
									imageStyle: { height: '60px', width: 'auto', objectFit: 'contain' },
									preview: true,
								}) : uiBuilder.factory.textSpan(f.reference ? f.reference.labelFn(slotProps.data[f.fieldName]) : slotProps.data[f.fieldName],)
								},
							}
						)

					} else if (f.fieldName === 'usedCycles') {
						return uiBuilder.factory.column(
							{
								header: f.displayLabel,
								field: f.fieldName,
								frozen: true,
								alignFrozen: 'right',
								columnKey: f.fieldName,
								key: f.fieldName,
								sortable: f.sortable ?? true,
								style: {
									width: `200px`,
									maxWidth: `400px`,
									'text-align': MetaUiFieldAlignmentEnum.valueOf(f.align ?? MetaUiFieldAlignment.LEFT)
								},
								pt: {
									columnHeaderContent: (o: any) => {
										return {
											style: {
												justifyContent: MetaUiFieldAlignmentEnum.valueOf(
													f.align ?? MetaUiFieldAlignment.LEFT
												)
											}
										}
									},
									headerCell: (o: any) => {
										const { attrs, props, context: ctx } = o

										return {
											class: `${props.field}`,
											style: {
												background: 'var(--mmda-treetable-header-cell-background)',
											}
										}
									},
									bodyCell: (o: any) => {
										const { attrs, parent, props, context: ctx } = o

										return {
											class: `${props.field}`,
											style: {
												width: `200px`,
												maxWidth: `400px`
											}
										}
									}
								}
							},
							{
								body: (slotProps: any) => {
									const data = slotProps.data;
									const inputVal = returnParmas.value[data.toolID] || 0;
									const isExceeded = ((data.lifecycleModes as any) & 2) == 2 && (inputVal + data.usedCycles) > data.maxLifeCycles;
									return h('div', { class: 'flex flex-col' }, [
										uiBuilder.factory.numberInput({
											modelValue: inputVal,
											invalid: isExceeded || undefined,
											onUpdate: (value: number) => returnParmas.value[data.toolID] = value,
										}),
										isExceeded ? h('small', { style: { color: 'red' } }, t('tool.overMaxUseCount')) : null,
									]);
								},
							}
						)
					}
				}

				)
		)
		return await context.uiBuilder.confirmDialog(
			uiBuilder.factory.primeVueTable(
				selectedItems,
				columns,
				{
					tableId: `batch-return-table`,
					// scrollable: true,
					scrollHeight: '400px',
				},
			),
			context,
			{
				id: 'BatchReturnDialog',
				name: 'BatchReturnDialog',
				title: t('tool.batchReturnConfirm'),
				style: {
					width: '60%',
					height: '70vh',
				},
				showCancelButton: true,
				closeOnClickModal: false,
				acceptLabel: t('tool.confirmReturn'),
				rejectLabel: t('action.cancel'),
				accept: async () => {
					// 检查使用次数是否超限
					const exceededTools = selectedItems.filter((item: any) => {
						const inputCycles = returnParmas.value?.[item.toolID] || 0;
						return ((item.lifecycleModes as any) & 2) == 2 && (inputCycles + item.usedCycles) > item.maxLifeCycles;
					});
					if (exceededTools.length > 0) {
						const toolNos = exceededTools.map((item: any) => item.toolNo).join('、');
						context.uiBuilder.toast(context, {
							severity: 'error',
							summary: t('dialog.title.prompt'),
							detail: t('tool.toolsOverMaxUseCount', { it: toolNos }),
							group: 'br',
							life: 3000,
						});
						return false;
					}
					try {
						await this.apiClient.doAction({
							action: 'batchReturn',
							repository: 'Tools',
						}, {
							toolIDs: selectedItems.map((item: any) => item.toolID),
							toolUsedCycles: returnParmas.value,
						});
						context.uiBuilder.toast(context, {
							severity: 'success',
							summary: t('dialog.success'),
							detail: t('success.toolsReturned'),
							group: 'br',
							life: 3000,
						});

						return true;
					} catch (error: any) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							summary: t('dialog.title.error'),
							detail: error.message ?? t('invalid.requestFailed'),
							group: 'br',
							life: 3000,
						});
						return false;
					}
				},
				reject: () => false,
			}
		);

		// old logic 
		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchReturn', { count: selectedItems.length }),
			header: t('tool.batchReturn'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					await this.apiClient.doAction({
						action: 'batchReturn',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						summary: t('dialog.success'),
						detail: t('success.toolsReturned'),
						group: 'br',
						life: 3000,
					});

					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: error.message ?? t('invalid.requestFailed'),
						group: 'br',
						life: 3000,
					});
					return false;
				}
			},
			reject: () => false,
		});
	}

	// 批量检修
	async batchOverhaulFn(context: UiBuildContext<any>) {
		const { $api, $router: router } = context.globalProps;
		actionName.value = 'batchOverhaul';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchRepair', { count: selectedItems.length }),
			header: t('tool.batchRepair'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				Overhaulparams.batchOverhaul.refItemKeys = selectedItems.map((v: any) => (Object.assign({}, {
					refID: v.toolID
				})))
				const data = await getCreateData(Overhaulparams.batchOverhaul, propsData.batchOverhaul, context)
				context.uiBuilder.toast(context, {
					severity: 'success',
					summary: t('dialog.success'),
					detail: t('success.toolsRepaired'),
					group: 'br',
					life: 3000,
				});
				if (isNullOrUndefined(data.maintenanceID)) return
				const service = $api.config.service.toUpperCase();
				const routerURL = router.resolve({
					path: `/${service}/Maintenances/Create`,
					query: { id: data.maintenanceID },
				})
				window.open(routerURL.href, '_blank')
			},
			reject: () => false,
		});
	}

	// 批量改制
	async batchRetrofitFn(context: UiBuildContext<any>) {
		const { $api, $router: router } = context.globalProps;
		actionName.value = 'batchRetrofit';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchRemake', { count: selectedItems.length }),
			header: t('tool.batchRemake'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				Retrofitparams.batchRetrofit.refItemKeys = selectedItems.map((v: any) => (Object.assign({}, {
					refID: v.toolID
				})))
				const data = await getCreateData(Retrofitparams.batchRetrofit, propsData.batchOverhaul, context)
				context.uiBuilder.toast(context, {
					severity: 'success',
					summary: t('dialog.success'),
					detail: t('success.toolsRemade'),
					group: 'br',
					life: 3000,
				});
				if (isNullOrUndefined(data.maintenanceID)) return
				const service = $api.config.service.toUpperCase();
				const routerURL = router.resolve({
					path: `/${service}/Maintenances/Create`,
					query: { id: data.maintenanceID },
				})
				window.open(routerURL.href, '_blank')
			},
			reject: () => false,
		});
	}

	// 批量维修
	async batchRepairFn(context: UiBuildContext<any>) {
		const { $api, $router: router } = context.globalProps;
		actionName.value = 'batchRepair';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchMaintain', { count: selectedItems.length }),
			header: t('tool.batchMaintain'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				Repairparams.batchRepair.refItemKeys = selectedItems.map((v: any) => (Object.assign({}, {
					refID: v.toolID
				})))
				const data = await getCreateData(Repairparams.batchRepair, propsData.batchOverhaul, context)
				context.uiBuilder.toast(context, {
					severity: 'success',
					summary: t('dialog.success'),
					detail: t('success.toolsMaintained'),
					group: 'br',
					life: 3000,
				});
				if (isNullOrUndefined(data.maintenanceID)) return
				const service = $api.config.service.toUpperCase();
				const routerURL = router.resolve({
					path: `/${service}/Maintenances/Create`,
					query: { id: data.maintenanceID },
				})
				window.open(routerURL.href, '_blank')
			},
			reject: () => false,
		});
	}

	// 批量报废
	async batchScrapFn(context: UiBuildContext<any>) {
		actionName.value = 'batchScrap';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchScrap', { count: selectedItems.length }),
			header: t('tool.batchScrap'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					await this.apiClient.doAction({
						action: 'batchScrap',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						summary: t('dialog.success'),
						detail: t('success.toolsScrapped'),
						group: 'br',
						life: 3000,
					});

					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: error.message ?? t('invalid.requestFailed'),
						group: 'br',
						life: 3000,
					});
					return false;
				}
			},
			reject: () => false,
		});
	}

	// 批量处置
	async batchDisposeFn(context: UiBuildContext<any>) {
		actionName.value = 'batchDispose';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				group: "br",
				summary: t("invalid.error"),
				detail: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		return await context.uiBuilder.confirmMessage(context, {
			message: t('tool.confirmBatchDispose', { count: selectedItems.length }),
			header: t('tool.batchDispose'),
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					await this.apiClient.doAction({
						action: 'batchDispose',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						summary: t('dialog.success'),
						detail: t('success.toolsDisposed'),
						group: 'br',
						life: 3000,
					});
					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: error.message ?? t('invalid.requestFailed'),
						group: 'br',
						life: 3000,
					});
					return false;
				}
			},
			reject: () => false,
		});
	}

	// 领料
	async beforeToolsPicking(context: UiBuildContext<any>): Promise<boolean> {
		const { $t: t } = context.globalProps;
		const submitFn = ref<(() => Promise<boolean>) | null>(null);

		try {
			return await context.uiBuilder.confirmDialog(
				h(ToolsPicking, {
					class: 'w-full h-full',
					ctx: context,
					onReady: (fn: () => Promise<boolean>) => {
						submitFn.value = fn;
					},
				}),
				context,
				{
					id: 'ToolsPicking',
					name: 'ToolsPicking',
					title: context.t('action.assignTools'),
					style: {
						width: '80%',
						height: '80vh',
					},
					showCancelButton: true,
					closeOnClickModal: false,
					accept: async () => {
						if (submitFn.value) {
							const result = await submitFn.value();
							if (result) {
								setTimeout(() => {
									context.reload();
								}, 1000);
							}
							return result;
						}
						return false;
					},
					reject: () => false,
				}
			);
		} catch (error: any) {
			return false;
		}
	}

	// 计算下次维护日期
	calculateNextMaintainDate(context: UiBuildContext<any>, maintenancePlan: MaintenancePlan): string {
		let start: string | Date; // 维护开始计算日期 如 本周第一天 本月第一天等
		let nextDate: string;
		switch (maintenancePlan.frequency) {
			case MaintainingFrequency.DAILY:
				nextDate = new Date().plus({ day: 1 }).toSQLDate();
				break;
			case MaintainingFrequency.WEEKLY:
				start = new Date().weekStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ week: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;
			case MaintainingFrequency.MONTHLY:
				start = new Date().monthStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ month: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;
			case MaintainingFrequency.QUARTERLY:
				start = new Date().quarterStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ quarter: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;
			case MaintainingFrequency.YEARLY:
				start = new Date().monthStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ year: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;

			default:
				break;
		}

		return nextDate ?? '';
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 当前分类不为空时，锁定分类字段，且只能选择当前分类
				this.field('categoryID')
					// .lockIf((model: Tool) => this.currentCategory?.categoryID && this.currentCategory?.categoryID === model.categoryID)
					.onChange(async (ctx: UiBuildContext<any>, model, newVal, oldVal) => {
						if (ctx.loading.value || newVal === oldVal) return;
						ctx.loading.value = true
						try {
							// 切换器具类别时，清空已选的关联物料（物料可能不属于新类别）
							if (newVal !== oldVal) {
								const materialOption = ctx.getFieldCurrentOption('materialID');
								if (materialOption?.categoryID !== newVal) {
									model.materialID = null;
								}
							}
							const categoryOption = this.currentCategory = ctx.getFieldCurrentOption('categoryID');
							if (categoryOption?.materialX) {
								console.log('categoryOption.materialX', categoryOption.materialX)
								await ctx.initMetadata(true, {
									redirection: categoryOption.materialX,
									queryParams: {
										xMetaObject: categoryOption.materialX,
									},
								})
								if (categoryOption.materialX === 'ToolFlask' && isNullOrUndefined((model as any).hasBelt)) {
									(model as any).hasBelt = false;
								}
							} else {
								await ctx.initMetadata(false, {
									repository: this.repository,
								});
								model.length = model.width = model.height = model.innerHeight = model.weight = 0
							}
						} finally {
							ctx.loading.value = false
						}
					}),
				this.field('asEquip').lockIf((model: Tool) => !!(model.checklistID || model.maintenancePlanID)),
				// 设备管理相关字段 - 只有当 asEquip 为 true 时才显示
				this.field('checklistID').hideIf((model: Tool) => !model.asEquip).refFilter((model, ctx) => {
					const __p = ((context: UiContext<Tool>,
					model: Tool,
					field: MetaUiField) => {
					return {
						status: getSqlOperator('IN').toSQL('USED'), // 只能选择启用的物料
					};
				})(ctx as any, model as any, undefined as any);
					if (!__p) return "";
					return Object.entries(__p)
						.filter(([, v]) => v !== "" && v != null)
						.map(([k, v]) => {
							const s = String(v);
							if (/^(IS |NOT |IN |LIKE )/i.test(s.trim())) return `${k} ${s}`;
							if (/^[><=]/.test(s)) return `${k}${s}`;
							return typeof v === "number" || typeof v === "boolean" ? `${k}=${v}` : `${k}='${s}'`;
						})
						.join(" AND ");
				}),
				this.field('maxLifeCycles')
					.lockIf((model: Tool) => model.status !== ToolStatus.NONE)
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0)
					.onValidate((value, model, ctx) => {
						if (value < model.lifecycles) {
							return ctx?.t('tool.maxLifeBelowCurrent');
						}
					}),
				this.field('lifecycles')
					.lockIf((model: Tool) => model.status !== ToolStatus.NONE)
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0)
					.onValidate((value, model, ctx) => {
						if (value > model.maxLifeCycles) {
							return ctx?.t('tool.currentLifeAboveMax');
						}
					}),
				this.field('usedCycles')
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCycles')
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('cost').lockIf((model: Tool) => model.status !== ToolStatus.NONE),
				this.field('maintenancePlanID').hideIf((model: Tool) => !model.asEquip).onChange((ctx: UiBuildContext<any>, model, newVal) => {
					if (isRefNone(newVal)) {
						ctx.setFieldValue('planToMaintain', '');
					} else {
						const currentOption = ctx.getFieldCurrentOption('maintenancePlanID')
						ctx.setFieldValue('planToMaintain', this.calculateNextMaintainDate(ctx, currentOption));
					}
				}),
				this.field('lastMaintained').hideIf((model: Tool) => !model.maintenancePlanID || model.status === ToolStatus.NONE),
				this.field('planToMaintain').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('remainingLife').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1)),
				this.field('remainingCost').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 4) == 4)),
				this.field('materialID')
					.refFilter((model, ctx) => {
					const __p = ((context: UiContext<Tool>,
						model: Tool,
						field: MetaUiField) => {
						const params: any = {
							materialType: getSqlOperator('IN').toSQL(MaterialType.TOOLS), // 只能选择机具设备用途的物料
							status: getSqlOperator('IN').toSQL('USED'), // 只能选择启用的物料
						};
						if (!isRefNone(model.categoryID)) {
							params.categoryID = getSqlOperator('EQ').toSQL(model.categoryID);
						}
						return params;
					})(ctx as any, model as any, undefined as any);
					if (!__p) return "";
					return Object.entries(__p)
						.filter(([, v]) => v !== "" && v != null)
						.map(([k, v]) => {
							const s = String(v);
							if (/^(IS |NOT |IN |LIKE )/i.test(s.trim())) return `${k} ${s}`;
							if (/^[><=]/.test(s)) return `${k}${s}`;
							return typeof v === "number" || typeof v === "boolean" ? `${k}=${v}` : `${k}='${s}'`;
						})
						.join(" AND ");
				})
					.onChange((ctx: UiBuildContext<any>, model, newVal) => {
						if (isRefNone(newVal)) {
							// 清空物料时不清空类别、器具名称
							return;
						}

						const materialOption = ctx.getFieldCurrentOption('materialID');
						if (!model.toolName && materialOption?.materialName) {
							ctx.setFieldValue('toolName', materialOption.materialName);
						}
						// 选择关联物料后，同步回填物料规格。
						ctx.setFieldValue('specs', materialOption?.specs ?? '');
						if (!materialOption?.categoryID) return;

						ctx.setFieldValue('categoryID', materialOption.category);
					}),
				this.field('liveToDate')
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1))
					.lockIf((model: Tool) => model.status !== ToolStatus.NONE)
					.onChange((ctx: UiBuildContext<any>, model, newVal, oldVal) =>
						ctx.setFieldValue('remainingLife', new Date().calculateDiff(new Date(), new Date(newVal), 'd'))
					)
					.onValidate((value, model, ctx) => {
						if (!value) return;
						if (+new Date(value) <= +new Date(model.startWorkDate)) {
							return ctx?.t('tool.scrapDateBeforeStart');
						} else if (+new Date(value) <= +new Date()) {
							return ctx?.t('tool.scrapDateBeforeNow');
						}
					})
			);

			if (this.currentCategory?.materialX === 'ToolFlask') {
				fields.push(
					this.field('length').onValidate((value, model, ctx) => {
						if (value != null && value <= 0) {
							return ctx?.t('tool.lengthPositive');
						}
					}),
					this.field('width').onValidate((value, model, ctx) => {
						if (value != null && value <= 0) {
							return ctx?.t('tool.widthPositive');
						}
					}),
					this.field('height').onValidate((value, model, ctx) => {
						if (value != null && value <= 0) {
							return ctx?.t('tool.heightPositive');
						}
					})
				)
			} else if (this.currentCategory?.materialX === 'ToolMeasure') {
				fields.push(
					this.field('scaleInterval').onValidate((value, model, ctx) => {
						if (value != null && value <= 0) {
							return ctx?.t('tool.scaleIntervalPositive');
						}
					})
				)
			} else if (this.currentCategory?.materialX === 'ToolPattern') {
				console.log('ToolPattern');
				fields.push(
					this.field('customerID').hideIf((model: Tool) => !model.status).refFilter((model, ctx) => {
					const __p = ((context: UiContext<Tool>,
						model: Tool,
						field: MetaUiField) => {
						return {
							status: getSqlOperator('IN').toSQL('USED'), // 只能选择启用的客户
						};
					})(ctx as any, model as any, undefined as any);
					if (!__p) return "";
					return Object.entries(__p)
						.filter(([, v]) => v !== "" && v != null)
						.map(([k, v]) => {
							const s = String(v);
							if (/^(IS |NOT |IN |LIKE )/i.test(s.trim())) return `${k} ${s}`;
							if (/^[><=]/.test(s)) return `${k}${s}`;
							return typeof v === "number" || typeof v === "boolean" ? `${k}=${v}` : `${k}='${s}'`;
						})
						.join(" AND ");
				}),
					this.field('length').onValidate((value, model, ctx) => {
						if (value != null && value < 0) {
							return ctx?.t('tool.lengthPositive');
						}
					}),
					this.field('width').onValidate((value, model, ctx) => {
						if (value != null && value < 0) {
							return ctx?.t('tool.widthPositive');
						}
					}),
					this.field('coreBoxNum').onValidate((value, model, ctx) => {
						if (value != null && value < 0) {
							return ctx?.t('tool.coreBoxCountPositive');
						}
					}),
					this.field('movableBlockNum').onValidate((value, model, ctx) => {
						if (value != null && value < 0) {
							return ctx?.t('tool.movableBlockCountPositive');
						}
					})
				)
			}

		}
		if (groups.length == 0) {
			// groups.push(this.group('a2').hideIf(model => !model.asEquip));
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();

		if (fields.length == 0) {
			fields.push(
				//当前没有器具类别模块，先以普通文本形式显示
				this.field('categoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					return ctx.uiBuilder.factory.textSpan(ctx.model.category ? ctx.model.category.categoryName : '-', {});
				}),
				this.field('lifecycleModes').setCustomRenderer((fld, ctx: UiViewContext<any>) => {
					const m = Number(ctx.model.lifecycleModes) || 0;
					const text = [m & 1 && LifecycleModeEnum.TM_TEXT, m & 2 && LifecycleModeEnum.FM_TEXT, m & 4 && LifecycleModeEnum.CM_TEXT].filter(Boolean).join(',') || LifecycleModeEnum.NONE_TEXT;
					return ctx.uiBuilder.factory.textSpan(text, {});
				}),
				// 设备管理相关字段 - 只有当 asEquip 为 true 时才显示
				this.field('checklistID').hideIf((model: Tool) => !model.asEquip),
				this.field('maintenancePlanID').hideIf((model: Tool) => !model.asEquip),
				this.field('lastMaintained').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('planToMaintain').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('liveToDate')
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1)),
				this.field('remainingLife').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1)),
				this.field('maxLifeCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('lifecycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('usedCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCost').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 4) == 4)),
				this.field('materialID').setCustomRenderer((fld, ctx: UiViewContext<any>) => {
					if (isRefNone(ctx.model.materialID)) return h('div');
					const fldText = MetaModel.displayField(ctx.model, fld) || ctx.model.materialID;
					const baseUrl = ctx.globalProps.$api.http.baseUrl.replace(/api/g, '');
					return h('div', {}, [
						h(
							'a',
							{
								style: { color: '#409eff' },
								href: 'javascript:;',
								onClick: () => {
									window.open(`${baseUrl}BASE/Materials/${ctx.model.materialID}`, '_blank');
								},
							},
							fldText
						),
					]);
				}),
				this.field('toolkitID').setCustomRenderer((fld, ctx: UiViewContext<any>) => {
					if (isRefNone(ctx.model.toolkitID)) return h('div');
					const fldText = MetaModel.displayField(ctx.model, fld) || ctx.model.toolkitID;
					const baseUrl = ctx.globalProps.$api.http.baseUrl.replace(/api/g, '');
					return h('div', {}, [
						h(
							'a',
							{
								style: { color: '#409eff' },
								href: 'javascript:;',
								onClick: () => {
									window.open(`${baseUrl}MES/Toolkits/${ctx.model.toolkitID}`, '_blank');
								},
							},
							fldText
						),
					]);
				})
			)
		}

		if (groups.length == 0) {
			// groups.push(this.group('a2').hideIf(model => !model.asEquip));
		}

		return { fields, groups, customActions };
	}

	//#region 树形列表逻辑
	private treeProps = {
		repository: 'MaterialCats',//判断类型
		childrenUrlParams: {
			repository: 'MaterialCats',
			service: 'base',
			path: `categoryID/children`,
			queryParams: {},
		},
		createUrl: 'base/MaterialCats/create',
		saveUrl: 'base/MaterialCats/save',
		deleteAllUrlParams: {
			repository: 'MaterialCats',
			service: 'base',
			path: `deleteAll`,
		},
		deleteJsonUrl: 'base/MaterialCats',
	};
	categoryName: Ref<string> = ref('');
	treeData: Ref<ToolCategory[]> = ref([]);
	treeLoading: Ref<boolean> = ref(false);

	/**
	 * 搜索物料分类
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {string} [searchWord=''] - 搜索关键词,默认为空字符串
	 * @returns {Promise<boolean>} - 搜索成功返回true,否则返回false
	 */
	async searchFn(ctx: UiBuildContext<any>, searchWord: string = '') {
		this.treeLoading.value = true;
		return await new Promise((resolve, reject) => {
			resolve(this.apiClient.searchAll({
				searchWord,
				filterModel: {
					materialType: inFilter(MaterialType.TOOLS),
				},
				pager: { pageSize: 20, pageNo: 1 },
			}, {
				repository: 'MaterialCats',
				service: 'base',
				queryParams: { depth: 0 },
			}));
		}).then((res: any) => {
			this.treeData.value = res.list
			Promise.resolve(true);
		}).finally(() => {
			this.treeLoading.value = false;
		});
	};

	/**
	 * 器具类别编辑对话框
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {UiDialogPropsType & {toolCategory?: ToolCategory,}} props - 对话框props
	 * @returns {Promise<boolean>} - 保存成功返回true,否则返回false
	 */
	async categoryConfirmDialog(ctx: UiBuildContext<any>, content: VNode, props: UiDialogPropsType & {
		toolCategory?: ToolCategory,
	}): Promise<boolean> {

		return ctx.uiBuilder.confirmDialog(
			content
			, ctx, {
			width: '75%',
			height: '40%',
			...props
		})
	}

	/**
	 * 添加目录
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {string} key - 添加目录的类型,addRoot, addSibling, addChild
	 * @param {ToolCategory} [node] - 父目录
	 */
	async addHandle(ctx: UiBuildContext<any>, key: string, node?: ToolCategory) {
		let title: string;
		let depth: number = node?.depth ?? 0;
		let parentCatID: string | number = '';
		let toolCategory: ToolCategory;

		switch (key) {
			case 'addRoot':
				title = ctx.t('tool.addRootDirectory');
				break;
			case 'addSibling':
				title = ctx.t('tool.addSiblingDirectory');
				parentCatID = node?.parentCatID;
				break;
			case 'addChild':
				title = ctx.t('tool.addSubdirectory');
				depth = depth + 1;
				parentCatID = node?.categoryID;
				break;
			default:
				break;
		}
		console.log(node, 'node');
		
		return this.categoryConfirmDialog(ctx, h(ToolCategoryEditor, {
			depth,
			parentCatID,
			materialX: node?.materialX,
			onFormChange: (model: ToolCategory) => {
				toolCategory = model;
				console.log(model);
			}
		}), {
			title: title,
			name: 'addDirectory',
			accept: async () => {
				await this.saveFn(ctx, toolCategory);
				return true
			},
			reject: async () => {
				return false
			}
		})
	}

	/**
	 * 删除器具类别
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {ToolCategory} node - 需具类别对象
	 */
	async delHandle(ctx: UiBuildContext<any>, node: ToolCategory) {
		const { categoryName, categoryID, categoryCode, childrenCount, children } = node;
		let params: any = {};
		if (childrenCount) {
			params = [
				...children.map((children: any) => {
					return children.categoryID;
				}),
				categoryID,
			];
		} else {
			params = {
				categoryID,
			};
		}
		await this.deleteFn(ctx, childrenCount, params);
	}

	/**
	 * 编辑器具类别名称
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {ToolCategory} node - 需具类别对象
	 * @returns {Promise<boolean>} - 是否成功保存
	 */
	async editHandle(ctx: UiBuildContext<any>, node: ToolCategory) {
		this.categoryName.value = node.categoryName
		try {
			ctx.uiBuilder.confirmDialog(ctx.uiBuilder.factory.formItem(
				{
					label: ctx.t('tool.categoryName'),
					name: 'categoryName',
					class: `flex_item_center`, // mr-rem-1
					isEdit: true,
					required: true,
					modelValue: this.categoryName.value,
					invalidMessage: ctx.t('invalid.required'),
					onUpdate: (val: string) => this.categoryName.value = val,
				},
			), ctx, {
				title: ctx.t('tool.editCategoryName'),
				width: '30%',
				height: '30%',
				name: 'editDirectory',
				showFooter: true,
				accept: async () => {
					MetaModel.modify(node)
					await this.saveFn(ctx, { ...node, categoryName: this.categoryName.value });
					return ctx.refresh(false)
				},
				reject: async () => {
					return false
				}
			}).finally(() => this.categoryName.value = '')

		} catch (error: any) {
			ctx.uiBuilder.toast(ctx, {
				severity: 'error',
				summary: ctx.t('dialog.title.error'),
				detail: error.message ?? ctx.t('auth.operationFailed'),
				group: 'br',
				life: 3000
			})
		}
	}

	/**
	 * 保存器具类别
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {any} params - 保存参数
	 * @returns {Promise<void>} - 是否成功保存
	 */
	saveFn(ctx: UiBuildContext<any>, params: any) {
		const res: any = ctx.apiClient.http.postJson(this.treeProps.saveUrl, params);
		res
			.then((res: any) => {
				this.searchFn(ctx);
				ctx.uiBuilder.toast(ctx, {
					severity: 'success',
					summary: ctx.t('dialog.success'),
					detail: ctx.t('success.operationSuccessful'),
					life: 3000
				})
			})
			.catch((err: any) => {
				const errmsg = err.validationErrors[0]?.error
				ctx.uiBuilder.toast(ctx, {
					severity: 'error',
					summary: ctx.t('dialog.title.error'),
					detail: errmsg ?? ctx.t('auth.operationFailed'),
					group: 'br',
					life: 3000
				})
			});
	};

	/**
	 * 删除器具类别
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {number} childrenCount - 需具类别的子节点数量
	 * @param {any} params - 删除参数
	 */
	deleteFn(ctx: UiBuildContext<any>, childrenCount: number, params: any) {
		try {
			ctx.uiBuilder.confirmMessage(ctx, {
				message: ctx.t('tool.deleteCategoryConfirm'),
				header: ctx.t('tool.category'),
				icon: "pi pi-exclamation-triangle",
				rejectProps: {
					id: "delete_no",
					label: ctx.t("dialog.cancel"),
					severity: "secondary",
					outlined: true,
				},
				acceptProps: {
					id: "delete_yes",
					label: ctx.t("dialog.ok"),
				},
				accept: async () => {
					if (childrenCount) {
						return await ctx.apiClient.deleteAll(params, this.treeProps.deleteAllUrlParams).then((res: any) => {
							this.searchFn(ctx);
							ctx.uiBuilder.toast(ctx, {
								severity: 'success',
								summary: ctx.t('dialog.success'),
								detail: ctx.t('success.operationSuccessful'),
								life: 3000
							})
						})
							.catch((err: any) => {
								ctx.uiBuilder.toast(ctx, {
									severity: 'error',
									summary: ctx.t('dialog.title.error'),
									detail: err.message ?? ctx.t('auth.operationFailed'),
									group: 'br',
									life: 3000
								})
							});
					} else {
						const res: any = ctx.apiClient.http.deleteJson(`${this.treeProps.deleteJsonUrl}/${params.categoryID}`, params.categoryID);
						res
							.then((res: any) => {
								this.searchFn(ctx);
								ctx.uiBuilder.toast(ctx, {
									severity: 'success',
									summary: ctx.t('dialog.success'),
									detail: ctx.t('success.operationSuccessful'),
									life: 3000
								})
							})
							.catch((err: any) => {
								ctx.uiBuilder.toast(ctx, {
									severity: 'error',
									summary: ctx.t('dialog.title.error'),
									detail: err.message ?? ctx.t('auth.operationFailed'),
									group: 'br',
									life: 3000
								})
							});
					}

				},
			});
		} catch (error: any) {
			ctx.uiBuilder.toast(ctx, {
				severity: 'error',
				summary: ctx.t('dialog.title.error'),
				detail: error.message ?? ctx.t('auth.operationFailed'),
				group: 'br',
				life: 3000
			})
		}
	};

	/**
	 * 目录编辑操作方法,对应 addRoot, addSibling, addChild, delete, rename 等操作
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {string} type - 操作类型
	 * @param {ToolCategory} [node] - 父目录
	 */
	directoryEditFn(ctx: UiBuildContext<any>, type: string, node?: ToolCategory) {
		switch (type) {
			case 'addRoot':
				this.addHandle(ctx, type);
				break;
			case 'addSibling':
				this.addHandle(ctx, type, node);
				break;
			case 'addChild':
				this.addHandle(ctx, type, node);
				break;
			case 'delete':
				this.delHandle(ctx, node);
				break;
			case 'rename':
				this.editHandle(ctx, node);
				break;
			default:
				break;
		}
	}


	currentCategory: ToolCategory
	get selectionItem() {
		return this.currentCategory ? {
			[this.currentCategory.key]: true
		} : {}
	}
	/**
	 * 节点点击事件处理
	 * @param {UiBuildContext<any>} ctx - 上下文对象
	 * @param {ToolCategory} data - 节点数据
	 */
	async onNodeSelectFn(ctx: UiBuildContext<any>, data: ToolCategory) {
		this.currentCategory = data;
		if (this.currentCategory?.materialX) {
			await ctx.initMetadata(false, {
				redirection: data.materialX,
				queryParams: {
					xMetaObject: data.materialX,
				},
			});
		} else {
			await ctx.initMetadata(false, {
				repository: this.repository,
			});
		}
		ctx.refresh(false);

	}
	//#endregion
}

/**
 * 构造工装器具交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ToolLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ToolLogic({
		metaUiService: metaUiService,
		repository: 'Tools',
		router,
		module: module || metaUiService.findModule('Tool'),
	});
/**
 * 使用记录交互逻辑
 */
export class ToolUseLogic extends UiGroupLogic<ToolUse, Tool> {
	constructor(parent: ToolLogic, master: Tool) {
		super(defineToolUse, parent, master, 'uses');
	}

	beforeEdit(): UiLogicFnResult<ToolUse> {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('toSiteID').hideIf(() => actionName.value === 'return').onValidate((val, model, ctx: UiViewContext<any>) => {
					if ((actionName.value === 'move' || actionName.value === 'lend' || actionName.value === 'store' || actionName.value === 'batchStore' || actionName.value === 'batchLend' || actionName.value === 'batchMove') && !val) {
						return ctx.t('tool.destinationRequired');
					}
				}),
				// 批量入库，仅隐藏「变动至」
				this.field('newLoc').hideIf(() => actionName.value === 'batchStore'),
				this.field('transReasonID').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}).onValidate(() => {
					return refToolUseActions.includes(actionName.value) && '';
				}),
				this.field('transDate').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('usedCost').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('remainedCost').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('extendedCycles').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('usedCycles')
					.hideIf(() => {
						return actionName.value !== 'return' && refToolUseActions.includes(actionName.value);
					})
					.onValidate((val, model, ctx: UiViewContext<any>) => {  // 👈 改为 onValidate
						const toolModel = ctx.root.model as Tool;
						if (((toolModel.lifecycleModes as any) & 2) == 2 && (val + toolModel.usedCycles) > toolModel.maxLifeCycles) {
							return ctx.t('tool.overMaxUseCount');  // 阻止提交
						}
					}),
				this.field('remainedCycles').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('toStatus').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('creatorID').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('ownerDeptID').hideIf(() => {
					return refToolUseActions.includes(actionName.value);
				}),
				this.field('ownerID')
					.refFilter((model, ctx) => {
					const __p = ((ctx, model) => {
						return {
							status: getSqlOperator('IN').toSQL('ACTIVATED'), // 只能选择激活的用户
						};
					})(ctx as any, model as any, undefined as any);
					if (!__p) return "";
					return Object.entries(__p)
						.filter(([, v]) => v !== "" && v != null)
						.map(([k, v]) => {
							const s = String(v);
							if (/^(IS |NOT |IN |LIKE )/i.test(s.trim())) return `${k} ${s}`;
							if (/^[><=]/.test(s)) return `${k}${s}`;
							return typeof v === "number" || typeof v === "boolean" ? `${k}=${v}` : `${k}='${s}'`;
						})
						.join(" AND ");
				})
					.onValidate((val, model, ctx: UiViewContext<any>) => {
						if (actionName.value === 'batchLend' && !val) {
							return ctx.t('tool.borrowerRequired');
						}
					})
					.onChange((ctx: UiBuildContext<any>, model, newVal) => {
						ctx.setFieldValue('ownerDeptID', newVal ? ctx.getFieldCurrentOption('ownerID')?.deptID : '');
					}),
			)
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			// fields.push(this.field('userID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
			fields.push(this.field('ownerID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
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
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
