/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */

import {
	type MetaUiService,
	type PagedList,
	type Module,
	type UiContext,
	ApiClient,
	MetaModel,
	isRefNone,
	debounce,
	isObject,
	triggerEscKey,
	MetaUiFieldAlignmentEnum,
	MetaUiFieldAlignment,
	isFunction,
	EntityAction,
	type Pager,
} from '@mmda/core';
import { type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, UiSearchForm, UiLogicFnResult } from '@mmda/vui';
import { defaultSummaryMethod } from '@/compat/primevue_legacy'
import { type LinesideInventory, defineLinesideInventory } from '@/models/LinesideInventory';
import { type LinesideInventoryItem, defineLinesideInventoryItem } from '@/models/LinesideInventoryItem';
import { type Worksite, defineWorksite } from '@/models/Worksite';
import { inventoryDialogNode } from './component/InventoryDialog';
import { completeShipmentNode } from './component/CompleteShipment';
import { materialTransEditorNode } from '@/modules/material_transes/MaterialTransEditor';

/**
 * 线边库存交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:28.0
 * @revision 2024-09-01 10:00:42.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 线边库存交互逻辑
 */
const tableDataProject = { value: [] };
const tableDataKeyProject = { value: 'id' };
const searchParamProject = {
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
const tableDataOrder = { value: [] };
const tableDataKeyOrder = { value: 'id' };
const searchParamOrder= {
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
export class LinesideInventoryLogic extends UiLogic<LinesideInventory> {
	worksites = { value: [] };
	selectedWorksite = { value: null };
	quantityInStock = { value: 0 };

	constructor(init: UiLogicInit) {
		super(defineLinesideInventory, init);
		this.addRelativeLogic<LinesideInventoryItem>('items', master => new LinesideInventoryItemLogic(this, master));

		this.afterResetFilters = () => {
			this.selectedWorksite.value = null;
		};

		this.selectableList = {
			oneClickStorage: (item: LinesideInventory) => !!item.materialID,
			oneClickReturn: (item: LinesideInventory) => !!item.materialID,
			createPurchaseOrder: (item: LinesideInventory) => !!item.materialID,
			shipTrans: (item: LinesideInventory) => item.allowCheckIn,
		};

		this.beforeAction = (context: UiContext, model: LinesideInventory, action: EntityAction) => {
			try {
				if (action.name == 'oneClickStorage') return this.oneClickStorage(context);
				if (action.name == 'oneClickReturn') return this.oneClickReturn(context);
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		};
	}
	async getAll(params: any) {
		// todo: 1, 
		const res = await super.getAll(params);
		// 如果只有一项，自动选择站点
		if (res.list && res.list.length === 1) {
			this.selectedWorksite.value = res.list[0].toSite;
		}
		return res
	}

	async oneClickStorage(context: UiContext) {
		if (!this.selectedWorksite.value) {
			context.uiBuilder.toast(context, {
				severity: 'warning',
				title: context.translate('dialog.title.warning'),
				message: context.t('linesideInventory.selectWarehouseFirst'),
				life: 3000,
			});
			return false;
		}

		context.toSelectManyIndex('oneClickStorage', async () => {

			if (!context.selectedItems.length) {
				context.uiBuilder
					.toast(context, {
						severity: "error",
						title: context.translate("invalid.error"),
						message: context.translate("invalid.requiredSelectAny"),
						life: 3000,
					})
				return Promise.reject(false);
			}

			let materialTransCtx: UiBuildContext<any>;
			try {
				await this.apiClient.doAction(
					{
						action: 'oneClickStorage',
						repository: 'MaterialTranses',
					},
					Object.assign({}, ...context.selectedItems.map((item: any) => ({ [item.id]: item.leftOverQuantity })))
				)
				return await context.uiBuilder.dialog(
					materialTransEditorNode({
						name: 'WarehousingMaterialTrans',
						createFn: async (logic) => {
							// /api/mes/MaterialTranses/oneClickStorage
							return await this.apiClient.doAction(
								{
									action: 'oneClickStorage',
									repository: 'MaterialTranses',
								},
								Object.assign({}, ...context.selectedItems.map((item: any) => ({ [item.id]: item.leftOverQuantity })))
							).then((res: any) => {
								return logic.createEntity(res);
							})
						},
						onInit: (ctx: UiContext) => {
							materialTransCtx = ctx;
							materialTransCtx.isEditDialog = true;
						},
					}),
					context,
					{
						title: context.t('linesideInventory.oneClickStorage'),
						width: '80%',
						onAccept: async (button) => {
						  return await materialTransCtx.save().then(() => {
								const url = materialTransCtx.apiClient.http.baseUrl.replace('/api', '') + materialTransCtx.routeTo(materialTransCtx.model)
								window.open(url, '_blank');

								return true;
							});
						},
						// 取消
					}
				).then((res) => {
					if (res === 'ok') {
						context.refresh();
						return Promise.resolve(res);
					} else {
						return Promise.reject(res);
					}

				});
			} catch (error: any) {
				if (error.message) {
					// 增加异常捕获
					return context.uiBuilder.toast(context, {
						severity: 'error',
						title: context.t('dialog.title.error'),
						message: error.message ?? context.t('auth.operationFailed'),
						life: 3000
					})
				}
			}
		});
		return false;
	}
	async oneClickReturn(context: UiContext) {
		if (!this.selectedWorksite.value) {
			context.uiBuilder.toast(context, {
				severity: 'warning',
				title: context.translate('dialog.title.warning'),
				message: context.t('linesideInventory.selectWarehouseFirst'),
				life: 3000,
			});
			return false;
		}

		context.toSelectManyIndex('oneClickReturn', async () => {

			if (!context.selectedItems.length) {
				context.uiBuilder
					.toast(context, {
						severity: "error",
						title: context.translate("invalid.error"),
						message: context.translate("invalid.requiredSelectAny"),
						life: 3000,
					})
				return Promise.reject(false);
			}

			let materialTransCtx: UiBuildContext<any>;
			try {
				await this.apiClient.doAction(
					{
						action: 'oneClickReturn',
						repository: 'MaterialTranses',
					},
					Object.assign({}, ...context.selectedItems.map((item: any) => ({ [item.id]: item.leftOverQuantity })))
				)
				return await context.uiBuilder.dialog(
					materialTransEditorNode({
						name: 'WarehousingMaterialTrans',
						createFn: async (logic) => {
							// /api/mes/MaterialTranses/oneClickStorage
							return await this.apiClient.doAction(
								{
									action: 'oneClickReturn',
									repository: 'MaterialTranses',
								},
								Object.assign({}, ...context.selectedItems.map((item: any) => ({ [item.id]: item.leftOverQuantity })))
							).then((res: any) => {
								return logic.createEntity(res);
							});
						},
						onInit: (ctx: UiContext) => {
							materialTransCtx = ctx;
							materialTransCtx.isEditDialog = true;
						},
					}),
					context,
					{
						title: context.t('linesideInventory.oneClickReturn'),
						width: '80%',
						onAccept: async (button) => {
						  return await materialTransCtx.save().then(() => {
								const url = materialTransCtx.apiClient.http.baseUrl.replace('/api', '') + materialTransCtx.routeTo(materialTransCtx.model)
								window.open(url, '_blank');

								return true;
							});
						},
						// 取消
					}
				).then((res) => {
					if (res === 'ok') {
						context.refresh();
						return Promise.resolve(res);
					} else {
						return Promise.reject(res);
					}

				});
			} catch (error: any) {
				if (error.message) {
					// 增加异常捕获
					return context.uiBuilder.toast(context, {
						severity: 'error',
						title: context.t('dialog.title.error'),
						message: error.message ?? context.t('auth.operationFailed'),
						life: 3000
					})
				}
			}

		});

		return false;
	}

	/**
	 * 选择一个工作中心，设置当前的工作中心id到searchParam中
	 * @param worksite - 选择的工作中心
	 */
	selectWorksite(ctx: UiContext, worksite: Worksite) {
		if (ctx.loading.value) return; // 加载中不允许切换 后期进行用户体验优化
		this.selectedWorksite.value = worksite;
		const siteID = worksite ? worksite.siteID : '';
		ctx.searchParam.siteID = siteID;
		ctx.addQueryParam('siteID', siteID);
		ctx.refresh();
	}
	/**
	 * 获取所有有线边库存的工作中心
	 * @returns Promise<Worksite[]> - 工作中心列表
	 */
	async getWorksites() {
		this.apiClient
			.getAll({
				repository: 'Worksites',
				service: 'mes',
				queryParams: {
					hasLinesideInventory: true,
				},
			})
			.then((res: any) => {
				this.worksites.value = res.list;

				// 从路由参数恢复站点筛选状态
				const siteID = this.router?.currentRoute.value?.query?.siteID as string;
				this.router?.currentRoute.value?.query?.siteID as string;
				console.log('siteID', siteID);
				if (siteID) {
					const found = this.worksites.value.find((w: Worksite) => w.siteID === siteID);
					if (found) {
						this.selectedWorksite.value = found;
					}
				}
			});
	}

	/**
	 * 线边库存一键发货
	 * @returns
	 */
	async shipTrans(context: UiContext) {
		//当前选中项
		const { selectedItems, translate: t } = context;
		if (isRefNone(selectedItems))
			return context.uiBuilder.toast(context, {
				severity: 'error',
				title: t('dialog.title.error'),
				message: t('invalid.requiredSelectAny'),
				life: 3000,
			});
		// 获取参数
		const params = selectedItems.map((it: any) => ({
			siteID: it.siteID,
			partNo: it.partNo,
			qaStatus: it.qaStatus,
		}));
		const apiClient = this.apiClient;
		try {
			const res = await apiClient.doAction(
				{
					action: 'shipTrans',
					repository: 'MaterialTranses',
					service: 'mes',
				},
				params
			);
			// 获取跳转链接url
			const service = apiClient.config.service.toUpperCase();
			const routerURL = router.resolve({
				path: `/${service}/MaterialTranses/Create`,
				query: { id: res.transID },
			});
			// 跳转新窗口
			window.open(routerURL.href, '_blank');
		} catch (error: any) {
			context.uiBuilder.toast(context, {
				severity: 'error',
				title: t('dialog.title.error'),
				message: error.message ?? context.t('auth.operationFailed'),
				life: 3000,
			});
		}
	}
	/**
	 * 项目
	 * @param context
	 * @param value
	 */
	async getAllProject(context: UiContext, value?: any) {
		await this.getAllOf<Record<string, unknown>>('Projects', {
			queryParams: {
				pageSize: searchParamProject.pager.pageSize,
				pageNo: searchParamProject.pager.pageNo,
				sort: '',
				searchWord: value,
			},
		}, { service: 'mes' })
			.then((res: any) => {
				searchParamProject.pager = res.pagination;
				tableDataProject.value = res.list.map((it: any) => {
					return {
						...it,
						status: it.customProperties.$status,
						ownerID: it.customProperties.$ownerID,
						ownerDeptID: it.customProperties.$ownerDeptID,
						lastModifierID: it.customProperties.$lastModifierID,
						importance: it.customProperties.$importance,
						constraintType: it.customProperties.$constraintType,
					};
				});
			});
	}
		/**
	 * 生产订单
	 * @param context
	 * @param value
	 */
	async getAllOrders(context: UiContext, value?: any) {
		await this.getAllOf<Record<string, unknown>>('ProductionOrders', {
			queryParams: {
				pageSize: searchParamOrder.pager.pageSize,
				pageNo: searchParamOrder.pager.pageNo,
				sort: '',
				searchWord: value,
			},
		}, { service: 'mes' })
			.then((res: any) => {
				searchParamOrder.pager = res.pagination;
				tableDataOrder.value = res.list.map((it: any) => {
					return {
						...it,
						status: it.customProperties.$status,
						ownerID: it.customProperties.$ownerID,
						ownerDeptID: it.customProperties.$ownerDeptID,
						lastModifierID: it.customProperties.$lastModifierID,
						importance: it.customProperties.$importance,
						constraintType: it.customProperties.$constraintType,
					};
				});
			});
	}
	searchParam: Record<string, any> = {};
	beforeSearch(): UiSearchForm {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push({
				searchLabel: 'ganttLabel.sProject',
				searchParam: 'projectID',
				valueFn: (v: any) => (!isRefNone(v) ? v.projectID : ''),
				renderer: (ctx: UiContext & any, csf) => {
					if (!tableDataProject.value.length && isObject(csf.searchVal.value)) {
						tableDataProject.value.push(csf.searchVal.value);
					}
					return ctx.uiBuilder.factory.searchForRelative({
						modelValue: csf.searchVal.value,
						dataKey: 'projectID',
						optionLabel: (v: any) => v.projectName,
						class: 'w-full',
						// options: tableDataProject.value,
						options: tableDataProject.value,
						toSearch: async () => {
							const picked = await ctx.select({
								repository: 'Projects',
								service: 'mes',
								selectionMode: 'single',
							})
							if (!Array.isArray(picked) || !picked.length) return false
							const data = picked[0]
							csf.searchVal.value = csf.searchWord = data
							ctx.model.projectID = data.projectID ?? ctx.model.projectID
							ctx.model.projectNo = data.projectNo ?? ctx.model.projectNo
							this.searchParam.projectID = ctx.model.projectID
							ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)))
							return true
						},
						onUpdate: (value: any) => {
							csf.searchVal.value = value || null;
							ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, value);
						},
						onInput: (value: string) => {
							debounce(async () => {
								await this.getAllProject(ctx, value);
							}, 500)();
						},
					});
				},
			});
			customSearchFields.push({
				searchLabel: 'ganttLabel.sProductionOrder',
				searchParam: 'orderID',
				valueFn: (v: any) => (!isRefNone(v) ? v.orderID : ''),
				renderer: (ctx: UiContext & any, csf) => {
					if (!tableDataOrder.value.length && isObject(csf.searchVal.value)) {
						tableDataOrder.value.push(csf.searchVal.value);
					}
					return ctx.uiBuilder.factory.searchForRelative({
						modelValue: csf.searchVal.value,
						dataKey: 'orderID',
						optionLabel: (v: any) => v.orderNo,
						class: 'w-full',
						// options: tableDataProject.value,
						options: tableDataOrder.value,
						toSearch: async () => {
							const picked = await ctx.select({
								repository: 'ProductionOrders',
								service: 'mes',
								selectionMode: 'single',
							})
							if (!Array.isArray(picked) || !picked.length) return false
							const data = picked[0]
							csf.searchVal.value = csf.searchWord = data
							ctx.model.orderID = data.orderID ?? ctx.model.orderID
							ctx.model.orderNo = data.orderNo ?? ctx.model.orderNo
							this.searchParam.orderID = ctx.model.orderID
							ctx.app.localDb.put(`search/${ctx.logic.repository}/orderID`, JSON.parse(JSON.stringify(data)))
							return true
						},
						onUpdate: (value: any) => {
							csf.searchVal.value = value || null;
							ctx.app.localDb.put(`search/${ctx.logic.repository}/orderID`, value);
						},
						onInput: (value: string) => {
							debounce(async () => {
								await this.getAllOrders(ctx, value);
							}, 500)();
						},
					});
				},
			});
		}
		return { searchParam, searchFields, customSearchFields };
	}

	checkInventory(context: UiContext) {
		const { uiBuilder, globalProps } = context;
		const { $t } = globalProps;

		try {
			context.uiBuilder.dialog(inventoryDialogNode({ context }), context, {
				title: $t('linesideInventory.queryInventory'),
				width: '60vw',
			});
		} catch (error: any) {
			uiBuilder.toast(context, {
				severity: 'error',
				message: error.message,
				title: $t('invalid.error'),
				life: 3000,
			});
		}
	}

	completeShipment(context: UiContext) {
		const { uiBuilder, globalProps } = context;
		const { $t } = globalProps;

		try {
			context.uiBuilder.dialog(completeShipmentNode({ context }), context, {
				title: $t('linesideInventory.completeShipment'),
				width: '90vw',
				showFooter: false,
			});
		} catch (error: any) {
			uiBuilder.toast(context, {
				severity: 'error',
				message: error.message,
				title: $t('invalid.error'),
				life: 3000,
			});
		}
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('qaStatus'),
				// this.field('siteID'),
				// this.field('materialCode'),
				// this.field('materialName'),
				this.field('leftOverQuantity')
			);
		}
		if (customActions.length == 0) {
			customActions.push(
				{
					name: 'checkInventory',
					icon: 'pi pi-search',
					label: 'linesideInventory.queryInventory',
					role: 'success',
					onAction: this.checkInventory,
				},
				{
					name: 'completeShipment',
					icon: 'pi pi-car',
					label: 'linesideInventory.completeShipment',
					role: 'secondary',
					onAction: this.completeShipment,
				},
				{
					name: 'shipTrans',
					icon: 'pi pi-file-import',
					label: 'linesideInventory.oneClickShipment',
					group: 'selectMany',
					role: 'primary',
					onAction: (context: UiContext) => {
						// 切换到多选模式
						context.toSelectManyIndex('shipTrans', () => this.shipTrans(context));
					},
				}
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
			groups.push(this.group<LinesideInventoryItem>('items').defaultAdder(this.newLinesideInventoryItem));
		}
		return { fields, groups, customActions };
	}
	/**
	 *
	 * @param context
	 * @param target
	 * 创建线边库存明细项
	 */
	newLinesideInventoryItem(context: UiContext<LinesideInventory>, target: LinesideInventory) {
		context
			.newSubGroupItem<LinesideInventoryItem>({
				group: 'items',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					context.addSubGroupItem('items', item);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造线边库存交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const LinesideInventoryLogicCtor = (metaUiService: MetaUiService, router: UiLogicInit["router"], module?: Module) =>
	new LinesideInventoryLogic({
		metaUiService: metaUiService,
		repository: 'LinesideInventories',
		router,
		module: module || metaUiService.findModule('LinesideInventory'),
	});
/**
 * 明细项交互逻辑
 */
export class LinesideInventoryItemLogic extends UiGroupLogic<LinesideInventoryItem, LinesideInventory> {
	constructor(parent: LinesideInventoryLogic, master: LinesideInventory) {
		super(defineLinesideInventoryItem, parent, master, 'items');
	}
	beforeDetails(): UiLogicFnResult<LinesideInventoryItem> {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length === 0) {
			fields.push(
				this.field('transNo').setCustomRenderer((fld, ctx: UiContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return ctx.uiBuilder.factory.link({
						text: fldVal ?? '',
						href: ctx.model.transID ? `/MES/MaterialTranses/${ctx.model.transID}` : undefined,
						target: '_blank',
						style: { color: '#409eff', width: '100%', overflow: 'hidden' },
					});
				})
			)
		}

		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
