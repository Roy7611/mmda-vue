/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */

import { type MetaUiService, Module, MetaUiField, MetaModel, type UiBuilder, type UiContext, EntityAction, MetaUiBuilder, isRefNone, EntityUrlParam, EntitySearchParam, PagedList, getSqlOperator, ApiClient, isNullOrUndefined, FieldFilter, DateUtils } from '@mmda/core';
import {type EntityLogicInit, EntityLogic, SubEntityLogic, type UiLogicFnResult, type UiDialogProps, UiLogicAfterFn, UiViewMany} from '@mmda/core'
import { type Tool, defineTool } from '@/models/Tool';
import { type ToolUse, defineToolUse } from '@/models/ToolUse';
import { type MaintenancePlan } from '@/models/MaintenancePlan';
import { MaintainingFrequency } from '@/enums/MaintainingFrequency';
import { ToolStatus } from '@/enums/ToolStatus'
import { LifecycleModeEnum } from '@/enums/LifecycleMode'
import { toolsLendNode } from '@/components/ToolsLend';
import { toolsMoveNode } from '@/components/ToolsMove';
import { toolsPickingNode } from '@/components/ToolsPicking';
import { ToolCategory } from "@/models/ToolCategory";
import { MaterialType } from '@mmda/base/src/enums/MaterialType';
import { editorPlaceholder } from '@/components/editor_placeholder';


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
const lendData = {
	data: {
		ownerID: '',
	},
};
// 移动参数
const moveData = {
	data: {} as any,
};
// 维修参数
const repairData = {
	data: {
		ownerID: '',
	},
};
// 归还参数
const returnData = {
	data: {} as any,
};

// 批量检修接口参数
const Overhaulparams = {
	// 检修参数
	batchOverhaul: {
		refName: "Tool|batchOverhaul",
		refItemKeys: []
	},
};

// 批量改制接口参数
const Retrofitparams = {
	// 改制参数
	batchRetrofit: {
		refName: "Tool|batchRetrofit",
		refItemKeys: []
	},
};

// 批量维修接口参数
const Repairparams = {
	// 维修参数
	batchRepair: {
		refName: "Tool|batchRepair",
		refItemKeys: []
	},
};

const propsData = {
	// 检修参数
	batchOverhaul: {
		action: 'create',
		repository: 'Maintenances',
		queryParams: {
			cache: true
		},
		service: 'mes',
	},
};
/**
 * 获取create标识
 */
const getCreateData = async (params: any, propData: any, context: UiContext) => {
	let data = {} as any
	try {
		const res = await context.apiClient.doAction(propData, params)
		if (res) {
			data = res
		}
	} catch (error: any) {
		context.uiBuilder.toast(
			context,
			{
				severity: 'error',
				title: context.t('dialog.title.error'),
				message: error.message ?? context.t('invalid.requestFailed'),
				life: 3000
			}
		)
	}
	return data
}
// 借出
const beforeToolsLend = async (context: UiContext, model: Tool, action: EntityAction) => {
	const t = context.t.bind(context);
	try {
		await context.uiBuilder.dialog(
			toolsLendNode({
				class: 'w-full',
				ctx: context,
				onGetUserID: (value: string) => {
					lendData.data.ownerID = value;
				},
			}),
			context,
			{
				title: t('auth.Lend'),
				width: '20%',
				height: '30vh',
				closeOnOverlay: false,
				onAccept: async (button) => {
				  console.log('lendData.data.ownerID', lendData.data.ownerID);
					if (isRefNone(lendData.data.ownerID)) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							message: t('auth.selectASuperintendent'),
							title: context.t('dialog.title.error'),
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}

					try {
						const res = await context.apiClient.doAction(
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
							context.uiBuilder.toast(context, {
								severity: 'success',
								message: t('auth.LendSuccess'),
								title: t('dialog.success'),
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
const beforeToolsMove = async (context: UiContext, model: Tool, action: EntityAction) => {
	const t = context.t.bind(context);
	try {
		await context.uiBuilder.dialog(
			toolsMoveNode({
				class: 'w-full',
				ctx: context,
				onGetMoveData: (value: Object) => (moveData.data = value),
			}),
			context,
			{
				title: t('auth.Move'),

				width: '30%',
				height: '45vh',
				closeOnOverlay: false,
				onAccept: async (button) => {
				  if (isRefNone(moveData.data.moveTo)) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							message: t('auth.writetMoveTo'),
							title: context.t('dialog.title.error'),
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}
					try {
						const res = await context.apiClient.doAction(
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
							context.uiBuilder.toast(context, {
								severity: 'success',
								message: t('auth.MoveSuccess'),
								title: t('dialog.success'),
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
const beforeToolsRepair = async (context: UiContext, model: Tool, action: EntityAction) => {
	const t = context.t.bind(context);
	try {
		await context.uiBuilder.dialog(
			toolsLendNode({
				class: 'w-full',
				ctx: context,
				onGetUserID: (value: string) => (repairData.data.ownerID = value),
			}),
			context,
			{
				title: t('auth.Repair'),

				width: '20%',
				height: '30vh',
				closeOnOverlay: false,
				onAccept: async (button) => {
				  if (isRefNone(repairData.data.ownerID)) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							message: t('auth.selectASuperintendent'),
							title: context.t('dialog.title.error'),
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}
					try {
						const res = await context.apiClient.doAction(
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
							context.uiBuilder.toast(context, {
								severity: 'success',
								message: t('auth.RepairSuccess'),
								title: t('dialog.success'),
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
const beforeToolsReturn = async (context: UiContext, model: Tool, action: EntityAction) => {
	const t = context.t.bind(context);
	try {
		await context.uiBuilder.dialog(
			toolsMoveNode({
				ctx: context,
				onGetMoveData: (value: Object) => (returnData.data = value),
			}),
			context,
			{
				title: t('auth.Return'),
				width: '30%',
				height: '45vh',
				closeOnOverlay: false,
				onAccept: async (button) => {
				  if (isRefNone(returnData.data.moveTo)) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							message: t('auth.writetMoveTo'),
							title: context.t('dialog.title.error'),
							// position: 'bottom-right',
							life: 3000,
						});
						return false;
					}
					try {
						const res = await context.apiClient.doAction(
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
							context.uiBuilder.toast(context, {
								severity: 'success',
								message: t('auth.ReturnSuccess'),
								title: t('dialog.success'),
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
const actionName = { value: '' };
const refToolUseActions = ['store', 'lend', 'return', 'move', 'batchStore', 'batchLend', 'batchMove']; // 关联toolUse的field-logic

export class ToolLogic extends EntityLogic<Tool> {
	constructor(init: EntityLogicInit) {
		super(defineTool, init);
		this.addRelativeLogic<ToolUse>('uses', master => new ToolUseLogic(this, master));
		this.beforeAction = (context: UiContext, model: Tool, action: EntityAction) => {


			actionName.value = action.name;
			try {
				return this.handlerBeforeActionFn(context as UiContext<Tool>, action);
			} catch (error: any) {
				throw new Error(error);
			}
		};

		this.afterLoad = async (context: UiContext, model: Tool): Promise<void> => {
			actionName.value = '';
			if (context.view === UiViewMany.Index) return;
			if (model?.category?.materialX) {
				await this.initMetadata(false, {
					redirection: model?.category?.materialX,
					queryParams: {
						xMetaObject: model?.category?.materialX,
					},
				});
				;(context as { metaUi: typeof this.metaUi }).metaUi = this.metaUi
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

	handlerBeforeActionFn(context: UiContext<Tool>, action: EntityAction): Promise<boolean> {
		// 关联操作的逻辑在 beforeRefToolUseAction 中处理
		if (action.name == 'store' || action.name == 'return' || action.name == 'lend' || action.name == 'move') return this.beforeRefToolUseAction(context, context.model as Tool, action);
		if (action.name == 'batchStore') context.selectMany('batchStore', () => this.batchStoreFn(context));
		if (action.name == 'batchLend') context.selectMany('batchLend', () => this.batchLendFn(context));
		if (action.name == 'batchMove') context.selectMany('batchMove', () => this.batchMoveFn(context));
		if (action.name == 'batchReturn') context.selectMany('batchReturn', () => this.batchReturnFn(context));
		if (action.name == 'batchOverhaul') context.selectMany('batchOverhaul', () => this.batchOverhaulFn(context));
		if (action.name == 'batchRetrofit') context.selectMany('batchRetrofit', () => this.batchRetrofitFn(context));
		if (action.name == 'batchRepair') context.selectMany('batchRepair', () => this.batchRepairFn(context));
		if (action.name == 'batchScrap') context.selectMany('batchScrap', () => this.batchScrapFn(context));
		if (action.name == 'batchDispose') context.selectMany('batchDispose', () => this.batchDisposeFn(context));
		if (action.name == 'batchStartUsing') context.selectMany('batchStartUsing', () => this.batchStartUsingFn(context));

		if (['batchStore', 'batchLend', 'batchMove', 'batchReturn', 'batchOverhaul', 'batchRetrofit', 'batchRepair', 'batchScrap', 'batchDispose', 'batchStartUsing'].includes(action.name)) {
			return Promise.resolve(false)
		} else {
			return Promise.resolve(true)
		}
	}

	async createToolUseForm(context: UiContext<Tool>, model: Tool,) {
		const { userId, username } = context.app.user;
		const toolUse = defineToolUse({
			toolID: model.toolID,
			itemID: (model.uses ? model.uses.length : 0) + 1,
			transDate: DateUtils.toFormat(new Date(), 'yyyy-MM-dd'),
		});
		if ((actionName.value === 'store' || actionName.value === 'batchStore') && userId) {
			toolUse.ownerID = userId;
			MetaModel.setRefProp(toolUse, 'ownerID', decodeURIComponent(username || ''));
		}

		const toolUseGroup = context.metaUi.getGroup('uses');

		return await context.subGroupItem<ToolUse>(toolUseGroup, toolUse, { groupMode: 'create', height: '30vh' });
	}


	beforeRefToolUseAction(context: UiContext<Tool>, model: Tool, action: EntityAction): Promise<boolean> {
		return this.createToolUseForm(context, model).then((res: any) => {
			if (!res) return Promise.resolve(false);
			action.param = { ...(action.param as object | undefined), value: {
				payload: res,
			} };
			return Promise.resolve(true);
		})
	}

	async getAll(param: EntitySearchParam, context?: UiContext): Promise<PagedList<Tool>> {
		if (!this.currentCategory) {
			await this.initMetadata(false, {
				repository: this.repository,
			});
		} else if (this.currentCategory?.materialX) {
			// 初始化扩展对象元数据，使列表能正确渲染扩展字段列
			await this.initMetadata(false, {
				redirection: this.currentCategory.materialX,
				queryParams: { xMetaObject: this.currentCategory.materialX },
			});
		}
		if (context) (context as { metaUi: typeof this.metaUi }).metaUi = this.metaUi
		param.queryParams = Object.assign({}, param.queryParams, {
			categoryID: this.currentCategory?.categoryID ?? '',
			xMetaObject: this.currentCategory?.materialX ?? '',
		});
		return super.getAll(param);
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
					return ctx.uiBuilder.factory.textSpan({ text: (ctx.model as Tool).category ? (ctx.model as Tool).category.categoryName : '-' });
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
	async batchStoreFn(context: UiContext) {
		actionName.value = 'batchStore';
		//当前选中项
		const { selectedItems } = context; const t = context.t.bind(context);
		if (!MetaModel.hasAny(selectedItems)) {
			await context.uiBuilder
				.toast(context, {
					severity: "error",
					title: t("invalid.error"),
					message: t("invalid.requiredSelectAny"),
					life: 3000,
				});
			throw new Error(t('invalid.requiredSelectAny'));
		}


		return await this.createToolUseForm(context as UiContext<Tool>, context.model as Tool).then(async (res: any) => {
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
						title: t('dialog.success'),
						message: t('success.toolsStored'),
						life: 3000,
					});
					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						title: t('dialog.title.error'),
						message: error.message ?? t('invalid.requestFailed'),
						life: 3000
					})
				}
			}
		});

	}

	// 批量启用
	async batchStartUsingFn(context: UiContext): Promise<boolean> {
		actionName.value = 'batchStartUsing';
		const { selectedItems } = context; const t = context.t.bind(context);

		// if (!MetaModel.hasAny(selectedItems)) {
		// 	await context.uiBuilder.toast(context, {
		// 		severity: "error",
		//,
		// 		title: t("invalid.error"),
		// 		message: t("invalid.requiredSelectAny"),
		// 		life: 3000,
		// 	});
		// 	return Promise.reject(new Error("没有选择数据"));
		// }
		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchEnable', { count: selectedItems.length }),
			title: t('tool.batchEnable')
		})) {
try {
					await this.apiClient.doAction({
						action: 'batchStartUsing',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});

					context.uiBuilder.toast(context, {
						severity: 'success',
						title: t('dialog.success'),
						message: t('success.toolsEnabled'),
						life: 3000,
					});

					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						title: t('dialog.title.error'),
						message: error.message ?? t('invalid.requestFailed'),
						life: 3000,
					});
					return false;
				}
};
	}

	// 批量借出
	async batchLendFn(context: UiContext) {
		actionName.value = 'batchLend';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t('invalid.error'),
				message: t('invalid.requiredSelectAny'),
				life: 3000,
			});
			throw new Error(t('invalid.requiredSelectAny'));
		}

		const res = await this.createToolUseForm(context as UiContext<Tool>, context.model as Tool);
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
				title: t('dialog.success'),
				message: t('success.toolsLent'),
				life: 3000,
			});
			return true;
		}).catch((error: any) => {
			context.uiBuilder.toast(context, {
				severity: 'error',
				title: t('dialog.title.error'),
				message: error.message ?? t('invalid.requestFailed'),
				life: 3000,
			});
			return false;
		});
	}

	// 批量移动
	async batchMoveFn(context: UiContext) {
		actionName.value = 'batchMove';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			await context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		const res = await this.createToolUseForm(context as UiContext<Tool>, context.model as Tool);
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
				title: t('dialog.success'),
				message: t('success.toolsMoved'),
				life: 3000,
			});
			return true;
		}).catch((error: any) => {
			context.uiBuilder.toast(context, {
				severity: 'error',
				title: t('dialog.title.error'),
				message: error.message ?? t('invalid.requestFailed'),
				life: 3000,
			});
			return false;
		});
	}

	// 批量归还
	async batchReturnFn(context: UiContext) {
		actionName.value = 'batchReturn';
		const { selectedItems, uiBuilder } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		// todo 记录当前选中项的使用次数，供批量归还接口使用
		const returnParmas = { value: null as Record<string, any> | null };
		if (selectedItems.length) returnParmas.value = Object.assign({}, ...selectedItems.map((item: any) => ({ [item.toolID]: 0 })));

		// new logic 
		const showFields = [].concat(this.metaUi.getListedFields().filter(f => ['toolNo', 'toolName', 'toolPic', 'remainingCycles'].includes(f.fieldName)), this.metaUi.getGroup('uses').getListedFields().filter(f => ['usedCycles'].includes(f.fieldName)));
		const metaUi = MetaUiBuilder.create('BatchReturn').fields(showFields).build()
		return await context.uiBuilder.dialog(
			uiBuilder.table(
				metaUi,
				{
					rows: selectedItems,
					height: '400px',
				},
			),
			context,
			{
				title: t('tool.batchReturnConfirm'),
				width: '60%',
				height: '70vh',
				closeOnOverlay: false,
				acceptLabel: t('tool.confirmReturn'),
				rejectLabel: t('action.cancel'),
				onAccept: async (button) => {
				  // 检查使用次数是否超限
					const exceededTools = selectedItems.filter((item: any) => {
						const inputCycles = returnParmas.value?.[item.toolID] || 0;
						return ((item.lifecycleModes as any) & 2) == 2 && (inputCycles + item.usedCycles) > item.maxLifeCycles;
					});
					if (exceededTools.length > 0) {
						const toolNos = exceededTools.map((item: any) => item.toolNo).join('、');
						context.uiBuilder.toast(context, {
							severity: 'error',
							title: t('dialog.title.prompt'),
							message: t('tool.toolsOverMaxUseCount', { it: toolNos }),
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
							title: t('dialog.success'),
							message: t('success.toolsReturned'),
							life: 3000,
						});

						return true;
					} catch (error: any) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							title: t('dialog.title.error'),
							message: error.message ?? t('invalid.requestFailed'),
							life: 3000,
						});
						return false;
					}
				}
			}
		);

		// old logic 
		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchReturn', { count: selectedItems.length }),
			title: t('tool.batchReturn')
		})) {
try {
					await this.apiClient.doAction({
						action: 'batchReturn',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						title: t('dialog.success'),
						message: t('success.toolsReturned'),
						life: 3000,
					});

					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						title: t('dialog.title.error'),
						message: error.message ?? t('invalid.requestFailed'),
						life: 3000,
					});
					return false;
				}
};
	}

	// 批量检修
	async batchOverhaulFn(context: UiContext) {
		actionName.value = 'batchOverhaul';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchRepair', { count: selectedItems.length }),
			title: t('tool.batchRepair')
		})) {
Overhaulparams.batchOverhaul.refItemKeys = selectedItems.map((v: any) => (Object.assign({}, {
					refID: v.toolID
				})))
				const data = await getCreateData(Overhaulparams.batchOverhaul, propsData.batchOverhaul, context)
				context.uiBuilder.toast(context, {
					severity: 'success',
					title: t('dialog.success'),
					message: t('success.toolsRepaired'),
					life: 3000,
				});
				if (isNullOrUndefined(data.maintenanceID)) return
				const service = this.apiClient.config.service.toUpperCase();
				window.open(`/${service}/Maintenances/Create?id=${data.maintenanceID}`, '_blank')
};
	}

	// 批量改制
	async batchRetrofitFn(context: UiContext) {
		actionName.value = 'batchRetrofit';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchRemake', { count: selectedItems.length }),
			title: t('tool.batchRemake')
		})) {
Retrofitparams.batchRetrofit.refItemKeys = selectedItems.map((v: any) => (Object.assign({}, {
					refID: v.toolID
				})))
				const data = await getCreateData(Retrofitparams.batchRetrofit, propsData.batchOverhaul, context)
				context.uiBuilder.toast(context, {
					severity: 'success',
					title: t('dialog.success'),
					message: t('success.toolsRemade'),
					life: 3000,
				});
				if (isNullOrUndefined(data.maintenanceID)) return
				const service = this.apiClient.config.service.toUpperCase();
				window.open(`/${service}/Maintenances/Create?id=${data.maintenanceID}`, '_blank')
};
	}

	// 批量维修
	async batchRepairFn(context: UiContext) {
		actionName.value = 'batchRepair';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchMaintain', { count: selectedItems.length }),
			title: t('tool.batchMaintain')
		})) {
Repairparams.batchRepair.refItemKeys = selectedItems.map((v: any) => (Object.assign({}, {
					refID: v.toolID
				})))
				const data = await getCreateData(Repairparams.batchRepair, propsData.batchOverhaul, context)
				context.uiBuilder.toast(context, {
					severity: 'success',
					title: t('dialog.success'),
					message: t('success.toolsMaintained'),
					life: 3000,
				});
				if (isNullOrUndefined(data.maintenanceID)) return
				const service = this.apiClient.config.service.toUpperCase();
				window.open(`/${service}/Maintenances/Create?id=${data.maintenanceID}`, '_blank')
};
	}

	// 批量报废
	async batchScrapFn(context: UiContext) {
		actionName.value = 'batchScrap';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchScrap', { count: selectedItems.length }),
			title: t('tool.batchScrap')
		})) {
try {
					await this.apiClient.doAction({
						action: 'batchScrap',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						title: t('dialog.success'),
						message: t('success.toolsScrapped'),
						life: 3000,
					});

					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						title: t('dialog.title.error'),
						message: error.message ?? t('invalid.requestFailed'),
						life: 3000,
					});
					return false;
				}
};
	}

	// 批量处置
	async batchDisposeFn(context: UiContext) {
		actionName.value = 'batchDispose';
		const { selectedItems } = context; const t = context.t.bind(context);

		if (!MetaModel.hasAny(selectedItems)) {
			context.uiBuilder.toast(context, {
				severity: "error",
				title: t("invalid.error"),
				message: t("invalid.requiredSelectAny"),
				life: 3000,
			});
			return;
		}

		if (await context.uiBuilder.confirm(context, {
			message: t('tool.confirmBatchDispose', { count: selectedItems.length }),
			title: t('tool.batchDispose')
		})) {
try {
					await this.apiClient.doAction({
						action: 'batchDispose',
						repository: 'Tools',
					}, {
						toolIDs: selectedItems.map((item: any) => item.toolID),
					});
					context.uiBuilder.toast(context, {
						severity: 'success',
						title: t('dialog.success'),
						message: t('success.toolsDisposed'),
						life: 3000,
					});
					return true;
				} catch (error: any) {
					context.uiBuilder.toast(context, {
						severity: 'error',
						title: t('dialog.title.error'),
						message: error.message ?? t('invalid.requestFailed'),
						life: 3000,
					});
					return false;
				}
};
	}

	// 领料
	async beforeToolsPicking(context: UiContext): Promise<boolean> {
		const t = context.t.bind(context);
		const submitFn = { value: null as (() => Promise<boolean>) | null };

		try {
			const result = await context.uiBuilder.dialog(
				toolsPickingNode({
					class: 'w-full h-full',
					ctx: context,
					onReady: (fn: () => Promise<boolean>) => {
						submitFn.value = fn;
					},
				}),
				context,
				{
					title: context.t('action.assignTools'),
					width: '80%',
					height: '80vh',
						closeOnOverlay: false,
					onAccept: async (button) => {
					  if (submitFn.value) {
							const ok = await submitFn.value();
							if (ok) {
								setTimeout(() => {
									context.reload();
								}, 1000);
							}
							return ok;
						}
						return false;
					}
				}
			);
			return result === 'ok';
		} catch (error: any) {
			return false;
		}
	}

	// 计算下次维护日期
	calculateNextMaintainDate(context: UiContext, maintenancePlan: MaintenancePlan): string {
		let start: Date; // 维护开始计算日期 如 本周第一天 本月第一天等
		let nextDate: string;
		switch (maintenancePlan.frequency) {
			case MaintainingFrequency.DAILY:
				nextDate = DateUtils.toSQLDate(DateUtils.plus(new Date(), { day: 1 }));
				break;
			case MaintainingFrequency.WEEKLY:
				start = DateUtils.weekStart(new Date());
				if (DateUtils.isAfter(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }), new Date())) {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }));
				} else {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(DateUtils.plus(start, { week: 1 }), { day: maintenancePlan.onDay - 1 }));
				}
				break;
			case MaintainingFrequency.MONTHLY:
				start = DateUtils.monthStart(new Date());
				if (DateUtils.isAfter(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }), new Date())) {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }));
				} else {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(DateUtils.plus(start, { month: 1 }), { day: maintenancePlan.onDay - 1 }));
				}
				break;
			case MaintainingFrequency.QUARTERLY:
				start = DateUtils.quarterStart(new Date());
				if (DateUtils.isAfter(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }), new Date())) {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }));
				} else {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(DateUtils.plus(start, { quarter: 1 }), { day: maintenancePlan.onDay - 1 }));
				}
				break;
			case MaintainingFrequency.YEARLY:
				start = DateUtils.monthStart(new Date());
				if (DateUtils.isAfter(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }), new Date())) {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(start, { day: maintenancePlan.onDay - 1 }));
				} else {
					nextDate = DateUtils.toSQLDate(DateUtils.plus(DateUtils.plus(start, { year: 1 }), { day: maintenancePlan.onDay - 1 }));
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
					.onChange(async (ctx: UiContext, model, newVal, oldVal) => {
						const loading = (ctx as UiContext & { loading: { value: boolean } }).loading
						if (loading.value || newVal === oldVal) return;
						loading.value = true
						try {
							// 切换器具类别时，清空已选的关联物料（物料可能不属于新类别）
							if (newVal !== oldVal) {
								const materialOption = ctx.getFieldSelectedOption('materialID');
								if (materialOption?.categoryID !== newVal) {
									model.materialID = null;
								}
							}
							const categoryOption = this.currentCategory = ctx.getFieldSelectedOption('categoryID');
							if (categoryOption?.materialX) {
								console.log('categoryOption.materialX', categoryOption.materialX)
								await this.initMetadata(true, {
									redirection: categoryOption.materialX,
									queryParams: {
										xMetaObject: categoryOption.materialX,
									},
								})
								if (categoryOption.materialX === 'ToolFlask' && isNullOrUndefined((model as any).hasBelt)) {
									(model as any).hasBelt = false;
								}
							} else {
								await this.initMetadata(false, {
									repository: this.repository,
								});
								model.length = model.width = model.height = model.innerHeight = model.weight = 0
							}
							;(ctx as { metaUi: typeof this.metaUi }).metaUi = this.metaUi
						} finally {
							loading.value = false
						}
					}),
				this.field('asEquip').lockIf((model: Tool) => !!(model.checklistID || model.maintenancePlanID)),
				// 设备管理相关字段 - 只有当 asEquip 为 true 时才显示
				this.field('checklistID').hideIf((model: Tool) => !model.asEquip).refWhere((model, ctx) => {
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
						if ((value as number) < model.lifecycles) {
							return ctx?.t('tool.maxLifeBelowCurrent');
						}
					}),
				this.field('lifecycles')
					.lockIf((model: Tool) => model.status !== ToolStatus.NONE)
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0)
					.onValidate((value, model, ctx) => {
						if ((value as number) > model.maxLifeCycles) {
							return ctx?.t('tool.currentLifeAboveMax');
						}
					}),
				this.field('usedCycles')
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCycles')
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('cost').lockIf((model: Tool) => model.status !== ToolStatus.NONE),
				this.field('maintenancePlanID').hideIf((model: Tool) => !model.asEquip).onChange((ctx: UiContext, model, newVal) => {
					if (isRefNone(newVal)) {
						ctx.setFieldValue('planToMaintain', '');
					} else {
						const currentOption = ctx.getFieldSelectedOption('maintenancePlanID')
						ctx.setFieldValue('planToMaintain', this.calculateNextMaintainDate(ctx, currentOption));
					}
				}),
				this.field('lastMaintained').hideIf((model: Tool) => !model.maintenancePlanID || model.status === ToolStatus.NONE),
				this.field('planToMaintain').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('remainingLife').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1)),
				this.field('remainingCost').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 4) == 4)),
				this.field('materialID')
					.refWhere((model, ctx) => {
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
					.onChange((ctx: UiContext, model, newVal) => {
						if (isRefNone(newVal)) {
							// 清空物料时不清空类别、器具名称
							return;
						}

						const materialOption = ctx.getFieldSelectedOption('materialID');
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
					.onChange((ctx: UiContext, model, newVal, oldVal) =>
						ctx.setFieldValue('remainingLife', DateUtils.calculateDiff(new Date(), new Date(newVal as string), 'd'))
					)
					.onValidate((value, model, ctx) => {
						if (!value) return;
						if (+new Date(value as string) <= +new Date(model.startWorkDate as string)) {
							return ctx?.t('tool.scrapDateBeforeStart');
						} else if (+new Date(value as string) <= +new Date()) {
							return ctx?.t('tool.scrapDateBeforeNow');
						}
					})
			);

			if (this.currentCategory?.materialX === 'ToolFlask') {
				fields.push(
					this.field('length').onValidate((value, model, ctx) => {
						if (value != null && (value as number) <= 0) {
							return ctx?.t('tool.lengthPositive');
						}
					}),
					this.field('width').onValidate((value, model, ctx) => {
						if (value != null && (value as number) <= 0) {
							return ctx?.t('tool.widthPositive');
						}
					}),
					this.field('height').onValidate((value, model, ctx) => {
						if (value != null && (value as number) <= 0) {
							return ctx?.t('tool.heightPositive');
						}
					})
				)
			} else if (this.currentCategory?.materialX === 'ToolMeasure') {
				fields.push(
					this.field('scaleInterval').onValidate((value, model, ctx) => {
						if (value != null && (value as number) <= 0) {
							return ctx?.t('tool.scaleIntervalPositive');
						}
					})
				)
			} else if (this.currentCategory?.materialX === 'ToolPattern') {
				console.log('ToolPattern');
				fields.push(
					this.field('customerID').hideIf((model: Tool) => !model.status).refWhere((model, ctx) => {
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
						if (value != null && (value as number) < 0) {
							return ctx?.t('tool.lengthPositive');
						}
					}),
					this.field('width').onValidate((value, model, ctx) => {
						if (value != null && (value as number) < 0) {
							return ctx?.t('tool.widthPositive');
						}
					}),
					this.field('coreBoxNum').onValidate((value, model, ctx) => {
						if (value != null && (value as number) < 0) {
							return ctx?.t('tool.coreBoxCountPositive');
						}
					}),
					this.field('movableBlockNum').onValidate((value, model, ctx) => {
						if (value != null && (value as number) < 0) {
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
				this.field('categoryID').setCustomRenderer((fld, ctx: UiContext<any>, props) => {
					return ctx.uiBuilder.factory.textSpan({ text: (ctx.model as Tool).category ? (ctx.model as Tool).category.categoryName : '-' });
				}),
				this.field('lifecycleModes').setCustomRenderer((fld, ctx: UiContext<any>) => {
					const m = Number(ctx.model.lifecycleModes) || 0;
					const text = [m & 1 && LifecycleModeEnum.TM_TEXT, m & 2 && LifecycleModeEnum.FM_TEXT, m & 4 && LifecycleModeEnum.CM_TEXT].filter(Boolean).join(',') || LifecycleModeEnum.NONE_TEXT;
					return ctx.uiBuilder.factory.textSpan({ text });
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
				this.field('materialID').setCustomRenderer((fld, ctx: UiContext<any>) => {
					if (isRefNone(ctx.model.materialID)) return ctx.uiBuilder.factory.textSpan({ text: '' });
					const fldText = MetaModel.displayField(ctx.model, fld) || ctx.model.materialID;
					return ctx.uiBuilder.factory.link({
						text: fldText,
						href: `/BASE/Materials/${ctx.model.materialID}`,
						target: '_blank',
						style: { color: '#409eff' },
					});
				}),
				this.field('toolkitID').setCustomRenderer((fld, ctx: UiContext<any>) => {
					if (isRefNone(ctx.model.toolkitID)) return ctx.uiBuilder.factory.textSpan({ text: '' });
					const fldText = MetaModel.displayField(ctx.model, fld) || ctx.model.toolkitID;
					return ctx.uiBuilder.factory.link({
						text: fldText,
						href: `/MES/Toolkits/${ctx.model.toolkitID}`,
						target: '_blank',
						style: { color: '#409eff' },
					});
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
	categoryName = { value: '' };
	treeData = { value: [] };
	treeLoading = { value: false };

	/**
	 * 搜索物料分类
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {string} [searchWord=''] - 搜索关键词,默认为空字符串
	 * @returns {Promise<boolean>} - 搜索成功返回true,否则返回false
	 */
	async searchFn(ctx: UiContext, searchWord: string = '') {
		this.treeLoading.value = true;
		return await new Promise((resolve, reject) => {
			resolve(this.apiClient.searchAll({
				searchWord,
				filterModel: {
					materialType: FieldFilter.in(MaterialType.TOOLS),
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
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {UiDialogProps & {toolCategory?: ToolCategory,}} props - 对话框props
	 * @returns dialog 按钮名
	 */
	async categoryConfirmDialog(ctx: UiContext, content: Parameters<UiBuilder['dialog']>[0], props: UiDialogProps & {
		toolCategory?: ToolCategory,
	}) {

		return ctx.uiBuilder.dialog(
			content
			, ctx, {
			width: '75%',
			height: '40%',
			...props
		})
	}

	/**
	 * 添加目录
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {string} key - 添加目录的类型,addRoot, addSibling, addChild
	 * @param {ToolCategory} [node] - 父目录
	 */
	async addHandle(ctx: UiContext, key: string, node?: ToolCategory) {
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
		
		return this.categoryConfirmDialog(ctx, editorPlaceholder(ctx, 'view.toolCategoryEditorHint'), {
			title: title,
			onAccept: async (button) => {
			  await this.saveFn(ctx, toolCategory);
				return true
			}
		})
	}

	/**
	 * 删除器具类别
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {ToolCategory} node - 需具类别对象
	 */
	async delHandle(ctx: UiContext, node: ToolCategory) {
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
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {ToolCategory} node - 需具类别对象
	 * @returns {Promise<boolean>} - 是否成功保存
	 */
	async editHandle(ctx: UiContext, node: ToolCategory) {
		this.categoryName.value = node.categoryName
		try {
			ctx.uiBuilder.dialog(ctx.uiBuilder.factory.formField(
				{
					label: ctx.t('tool.categoryName'),
					class: `flex_item_center`, // mr-rem-1
					required: true,
					value: this.categoryName.value,
					onChange: (val: string) => this.categoryName.value = val,
				},
			), ctx, {
				title: ctx.t('tool.editCategoryName'),
				width: '30%',
				height: '30%',
					showFooter: true,
				onAccept: async (button) => {
				  MetaModel.modify(node)
					await this.saveFn(ctx, { ...node, categoryName: this.categoryName.value });
					await ctx.refresh(false)
					return true
				}
			}).finally(() => this.categoryName.value = '')

		} catch (error: any) {
			ctx.uiBuilder.toast(ctx, {
				severity: 'error',
				title: ctx.t('dialog.title.error'),
				message: error.message ?? ctx.t('auth.operationFailed'),
				life: 3000
			})
		}
	}

	/**
	 * 保存器具类别
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {any} params - 保存参数
	 * @returns {Promise<void>} - 是否成功保存
	 */
	saveFn(ctx: UiContext, params: any) {
		const res: any = this.apiClient.http.postJson(this.treeProps.saveUrl, params);
		res
			.then((res: any) => {
				this.searchFn(ctx);
				ctx.uiBuilder.toast(ctx, {
					severity: 'success',
					title: ctx.t('dialog.success'),
					message: ctx.t('success.operationSuccessful'),
					life: 3000
				})
			})
			.catch((err: any) => {
				const errmsg = err.validationErrors[0]?.error
				ctx.uiBuilder.toast(ctx, {
					severity: 'error',
					title: ctx.t('dialog.title.error'),
					message: errmsg ?? ctx.t('auth.operationFailed'),
					life: 3000
				})
			});
	};

	/**
	 * 删除器具类别
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {number} childrenCount - 需具类别的子节点数量
	 * @param {any} params - 删除参数
	 */
	async deleteFn(ctx: UiContext, childrenCount: number, params: any) {
		try {
			if (await ctx.uiBuilder.confirm(ctx, {
				message: ctx.t('tool.deleteCategoryConfirm'),
				title: ctx.t('tool.category')
			})) {
				if (childrenCount) {
					return await this.apiClient.deleteAll(params, this.treeProps.deleteAllUrlParams).then((res: any) => {
						this.searchFn(ctx);
						ctx.uiBuilder.toast(ctx, {
							severity: 'success',
							title: ctx.t('dialog.success'),
							message: ctx.t('success.operationSuccessful'),
							life: 3000
						})
					})
						.catch((err: any) => {
							ctx.uiBuilder.toast(ctx, {
								severity: 'error',
								title: ctx.t('dialog.title.error'),
								message: err.message ?? ctx.t('auth.operationFailed'),
								life: 3000
							})
						});
				} else {
					const res: any = this.apiClient.http.deleteJson(`${this.treeProps.deleteJsonUrl}/${params.categoryID}`, params.categoryID);
					res
						.then((res: any) => {
							this.searchFn(ctx);
							ctx.uiBuilder.toast(ctx, {
								severity: 'success',
								title: ctx.t('dialog.success'),
								message: ctx.t('success.operationSuccessful'),
								life: 3000
							})
						})
						.catch((err: any) => {
							ctx.uiBuilder.toast(ctx, {
								severity: 'error',
								title: ctx.t('dialog.title.error'),
								message: err.message ?? ctx.t('auth.operationFailed'),
								life: 3000
							})
						});
				}
			}
		} catch (error: any) {
			ctx.uiBuilder.toast(ctx, {
				severity: 'error',
				title: ctx.t('dialog.title.error'),
				message: error.message ?? ctx.t('auth.operationFailed'),
				life: 3000
			})
		}
	};

	/**
	 * 目录编辑操作方法,对应 addRoot, addSibling, addChild, delete, rename 等操作
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {string} type - 操作类型
	 * @param {ToolCategory} [node] - 父目录
	 */
	directoryEditFn(ctx: UiContext, type: string, node?: ToolCategory) {
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
	 * @param {UiContext<any>} ctx - 上下文对象
	 * @param {ToolCategory} data - 节点数据
	 */
	async onNodeSelectFn(ctx: UiContext, data: ToolCategory) {
		this.currentCategory = data;
		if (this.currentCategory?.materialX) {
			await this.initMetadata(false, {
				redirection: data.materialX,
				queryParams: {
					xMetaObject: data.materialX,
				},
			});
		} else {
			await this.initMetadata(false, {
				repository: this.repository,
			});
		}
		;(ctx as { metaUi: typeof this.metaUi }).metaUi = this.metaUi
		await ctx.refresh?.(false);

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
export const ToolLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) =>
	new ToolLogic({
		metaUiService: metaUiService,
		repository: 'Tools',
		
		module: module || metaUiService.findModule('Tool'),
	});
/**
 * 使用记录交互逻辑
 */
export class ToolUseLogic extends SubEntityLogic<ToolUse, Tool> {
	constructor(parent: ToolLogic, master: Tool) {
		super(defineToolUse, parent, master, 'uses');
	}

	beforeEdit(): UiLogicFnResult<ToolUse> {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('toSiteID').hideIf(() => actionName.value === 'return').onValidate((val, model, ctx: UiContext<any>) => {
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
					.onValidate((val, model, ctx: UiContext<any>) => {  // 👈 改为 onValidate
						const toolModel = ctx.root.model as Tool;
						if (((toolModel.lifecycleModes as any) & 2) == 2 && ((val as number) + toolModel.usedCycles) > toolModel.maxLifeCycles) {
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
					.refWhere((model, ctx) => {
					const __p = ((ctx, model) => {
						return {
							status: getSqlOperator('IN').toSQL('ACTIVATED'), // 只能选择激活的用户
						};
					})(ctx as any, model as any);
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
					.onValidate((val, model, ctx: UiContext<any>) => {
						if (actionName.value === 'batchLend' && !val) {
							return ctx.t('tool.borrowerRequired');
						}
					})
					.onChange((ctx: UiContext, model, newVal) => {
						ctx.setFieldValue('ownerDeptID', newVal ? ctx.getFieldSelectedOption('ownerID')?.deptID : '');
					}),
			)
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			// fields.push(this.field('userID').setCustomRenderer((fld, ctx: UiContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
			fields.push(this.field('ownerID').setCustomRenderer((fld, ctx: UiContext<any>, props) => ctx.uiBuilder.factory.textSpan({ text: ctx.model.customProperties[`$${fld.fieldName}`] })));
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
