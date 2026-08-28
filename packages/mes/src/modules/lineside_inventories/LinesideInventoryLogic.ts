/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
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
	MetaUiFieldFrozen,
	MetaUiFieldAlignmentEnum,
	MetaUiFieldAlignment,
	isFunction,
	EntityAction,
	type Pager,
} from '@mmda/core';
import { type UiViewContext, type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, UiSearchForm, UiLogicFnResult } from '@mmda/vui';
import { defaultSummaryMethod } from '@/compat/primevue_legacy'
import { type LinesideInventory, defineLinesideInventory } from '@/models/LinesideInventory';
import { type LinesideInventoryItem, defineLinesideInventoryItem } from '@/models/LinesideInventoryItem';
import { type Worksite, defineWorksite } from '@/models/Worksite';
import { defineComponent, h, reactive, ref, onBeforeMount, toRefs } from 'vue';
import type { Ref } from 'vue';
import InventoryDialog from './component/InventoryDialog';
import CompleteShipment from './component/CompleteShipment';
import { MaterialTransEditor } from '@/modules/material_transes/MaterialTransEditor';

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
const tableDataProject = ref([]);
const tableDataKeyProject = ref('id');
const searchParamProject = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
const tableDataOrder = ref([]);
const tableDataKeyOrder = ref('id');
const searchParamOrder= reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
export class LinesideInventoryLogic extends UiLogic<LinesideInventory> {
	worksites: Ref<Worksite[]> = ref([]);
	selectedWorksite: Ref<Worksite | null> = ref(null);
	quantityInStock: Ref<number> = ref(0);

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

		this.beforeAction = (context: UiBuildContext<any>, model: LinesideInventory, action: EntityAction) => {
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

	async oneClickStorage(context: UiBuildContext<any>) {
		if (!this.selectedWorksite.value) {
			context.uiBuilder.toast(context, {
				severity: 'warn',
				summary: context.translate('dialog.title.warning'),
				detail: '请先选择线边库！',
				group: 'br',
				life: 3000,
			});
			return false;
		}

		context.toSelectManyIndex('oneClickStorage', async () => {

			if (!context.selectedItems.length) {
				context.uiBuilder
					.toast(context, {
						severity: "error",
						group: "br",
						summary: context.translate("invalid.error"),
						detail: context.translate("invalid.requiredSelectAny"),
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
				return await context.uiBuilder.confirmDialog(
					h(MaterialTransEditor, {
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
						onInit: (ctx: UiBuildContext<any>) => {
							materialTransCtx = ctx;
							materialTransCtx.isEditDialog = true;
						},
					}),
					context,
					{
						title: '一键入库',
						width: '80%',
						accept: async () => {
							return await materialTransCtx.save().then(() => {
								const url = materialTransCtx.apiClient.http.baseUrl.replace('/api', '') + materialTransCtx.routeTo(materialTransCtx.model)
								window.open(url, '_blank');

								return true;
							});
						},
						// 取消
						reject: () => {
							// 关闭弹窗
							return false;
						},
					}
				).then((res: boolean) => {
					if (res) {
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
						summary: context.t('dialog.title.error'),
						detail: error.message ?? '操作失败',
						group: 'br',
						life: 3000
					})
				}
			}
		});
		return false;
	}
	async oneClickReturn(context: UiBuildContext<any>) {
		if (!this.selectedWorksite.value) {
			context.uiBuilder.toast(context, {
				severity: 'warn',
				summary: context.translate('dialog.title.warning'),
				detail: '请先选择线边库！',
				group: 'br',
				life: 3000,
			});
			return false;
		}

		context.toSelectManyIndex('oneClickReturn', async () => {

			if (!context.selectedItems.length) {
				context.uiBuilder
					.toast(context, {
						severity: "error",
						group: "br",
						summary: context.translate("invalid.error"),
						detail: context.translate("invalid.requiredSelectAny"),
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
				return await context.uiBuilder.confirmDialog(
					h(MaterialTransEditor, {
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
						onInit: (ctx: UiBuildContext<any>) => {
							materialTransCtx = ctx;
							materialTransCtx.isEditDialog = true;
						},
					}),
					context,
					{
						title: '一键退料',
						width: '80%',
						accept: async () => {
							return await materialTransCtx.save().then(() => {
								const url = materialTransCtx.apiClient.http.baseUrl.replace('/api', '') + materialTransCtx.routeTo(materialTransCtx.model)
								window.open(url, '_blank');

								return true;
							});
						},
						// 取消
						reject: () => {
							// 关闭弹窗
							return false;
						},
					}
				).then((res: boolean) => {
					if (res) {
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
						summary: context.t('dialog.title.error'),
						detail: error.message ?? '操作失败',
						group: 'br',
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
	selectWorksite(ctx: UiBuildContext<any>, worksite: Worksite) {
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
	async shipTrans(context: UiBuildContext<any>) {
		//当前选中项
		const { selectedItems, translate: t } = context;
		if (isRefNone(selectedItems))
			return context.uiBuilder.toast(context, {
				severity: 'error',
				summary: t('dialog.title.error'),
				detail: t('invalid.requiredSelectAny'),
				group: 'br',
				life: 3000,
			});
		// 获取参数
		const params = selectedItems.map((it: any) => ({
			siteID: it.siteID,
			partNo: it.partNo,
			qaStatus: it.qaStatus,
		}));
		const { $api, $router: router } = context.globalProps;
		const apiClient = $api as ApiClient;
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
				summary: t('dialog.title.error'),
				detail: error.message ?? '操作失败',
				group: 'br',
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
		await context.globalProps.$api
			.getAll({
				repository: 'Projects',
				service: 'mes',
				queryParams: {
					pageSize: searchParamProject.pager.pageSize,
					pageNo: searchParamProject.pager.pageNo,
					sort: '',
					searchWord: value,
				},
			})
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
		await context.globalProps.$api
			.getAll({
				repository: 'ProductionOrders',
				service: 'mes',
				queryParams: {
					pageSize: searchParamOrder.pager.pageSize,
					pageNo: searchParamOrder.pager.pageNo,
					sort: '',
					searchWord: value,
				},
			})
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
				searchLabel: '项目',
				searchParam: 'projectID',
				valueFn: (v: any) => (!isRefNone(v) ? v.projectID : ''),
				renderer: (ctx: UiBuildContext<any> & any, csf) => {
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
						toSearch: async (event: Event) => {
							let data = [] as any;
							let getData = [] as any;
							// 获取元数据字段
							const { metaui } = await ctx.logic!.loadMetadata('Projects', 'mes', true);
							tableDataKeyProject.value = metaui.primaryKey;
							ctx.searchParam.pager = searchParamProject.pager = {
								pageNo: 1,
								pageSize: 10,
							};
							// 列表column
							const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
								isSearch: true,
								cacheKey: `payerID/SearchRelative/${metaui.primaryKey}`,
							});
							ctx.uiBuilder.confirmDialog(
								ctx.uiBuilder.buildSearchForRelativeContent(columns, {
									dataKey: tableDataKeyProject.value,
									onSearch: async (params: any) => {
										const { searchParams, reload, pager } = params;
										await this.getAllProject(ctx, searchParams.searchWord);
										return { list: tableDataProject.value, pager: searchParamProject.pager };
									},
									onPage: ({ pageNo, pageSize }: any) => {
										searchParamProject.pager.pageNo = pageNo;
										searchParamProject.pager.pageSize = pageSize;
										ctx.searchParam.pager = searchParamProject.pager;
									},
									onSelect: (selection: any, row: any) => {
										getData = [selection];
										data = row;
									},
									onRowDblclick: (row: any, index: number) => {
										csf.searchVal.value = csf.searchWord.value = row;
										ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(row)));
										triggerEscKey(); // 弹窗关闭(触发esc建)
									},
								}),
								ctx,
								{
									title: '项目',
									style: { width: '80vw', maxHeight: '95%' },
									accept: async () => {
										// //当前选中项
										if (!MetaModel.hasAny(getData)) {
											ctx.uiBuilder.toast(ctx, {
												severity: 'error',
												detail: ctx.t('invalid.requiredSelectAny'),
												summary: ctx.t('dialog.title.error'),
												group: 'br',
												// position: 'bottom-right',
												life: 3000,
											});
											return false;
										}
										csf.searchVal.value = csf.searchWord = data;
										ctx.model.projectID = data.projectID ?? ctx.model.projectID;
										ctx.model.projectNo = data.projectNo ?? ctx.model.projectNo;
										this.searchParam.projectID = ctx.model.projectID;
										ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)));
										return true;
									},
								}
							);
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
				searchLabel: '生产订单',
				searchParam: 'orderID',
				valueFn: (v: any) => (!isRefNone(v) ? v.orderID : ''),
				renderer: (ctx: UiBuildContext<any> & any, csf) => {
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
						toSearch: async (event: Event) => {
							let data = [] as any;
							let getData = [] as any;
							// 获取元数据字段
							const { metaui } = await ctx.logic!.loadMetadata('ProductionOrders', 'mes', true);
							tableDataKeyOrder.value = metaui.primaryKey;
							ctx.searchParam.pager = searchParamOrder.pager = {
								pageNo: 1,
								pageSize: 10,
							};
							// 列表column
							const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
								isSearch: true,
								cacheKey: `payerID/SearchRelative/${metaui.primaryKey}`,
							});
							ctx.uiBuilder.confirmDialog(
								ctx.uiBuilder.buildSearchForRelativeContent(columns, {
									dataKey: tableDataKeyOrder.value,
									onSearch: async (params: any) => {
										const { searchParams, reload, pager } = params;
										await this.getAllOrders(ctx, searchParams.searchWord);
										return { list: tableDataOrder.value, pager: searchParamOrder.pager };
									},
									onPage: ({ pageNo, pageSize }: any) => {
										searchParamOrder.pager.pageNo = pageNo;
										searchParamOrder.pager.pageSize = pageSize;
										ctx.searchParam.pager = searchParamOrder.pager;
									},
									onSelect: (selection: any, row: any) => {
										getData = [selection];
										data = row;
									},
									onRowDblclick: (row: any, index: number) => {
										csf.searchVal.value = csf.searchWord.value = row;
										ctx.app.localDb.put(`search/${ctx.logic.repository}/orderID`, JSON.parse(JSON.stringify(row)));
										triggerEscKey(); // 弹窗关闭(触发esc建)
									},
								}),
								ctx,
								{
									title: '生产订单',
									style: { width: '80vw', maxHeight: '95%' },
									accept: async () => {
										// //当前选中项
										if (!MetaModel.hasAny(getData)) {
											ctx.uiBuilder.toast(ctx, {
												severity: 'error',
												detail: ctx.t('invalid.requiredSelectAny'),
												summary: ctx.t('dialog.title.error'),
												group: 'br',
												// position: 'bottom-right',
												life: 3000,
											});
											return false;
										}
										csf.searchVal.value = csf.searchWord = data;
										ctx.model.orderID = data.orderID ?? ctx.model.orderID;
										ctx.model.orderNo = data.orderNo ?? ctx.model.orderNo;
										this.searchParam.orderID = ctx.model.orderID;
										ctx.app.localDb.put(`search/${ctx.logic.repository}/orderID`, JSON.parse(JSON.stringify(data)));
										return true;
									},
								}
							);
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

	checkInventory(context: UiBuildContext<any>) {
		const { uiBuilder, globalProps } = context;
		const { $t } = globalProps;

		try {
			context.uiBuilder.confirmDialog(h(InventoryDialog, { context }), context, {
				title: '查询库存',
				width: '60vw',
				accept: async () => { },
			});
		} catch (error: any) {
			uiBuilder.toast(context, {
				severity: 'error',
				detail: error.message,
				summary: $t('invalid.error'),
				group: 'br',
				life: 3000,
			});
		}
	}

	completeShipment(context: UiBuildContext<any>) {
		const { uiBuilder, globalProps } = context;
		const { $t } = globalProps;

		try {
			context.uiBuilder.confirmDialog(h(CompleteShipment, { context }), context, {
				title: '齐套发货',
				width: '90vw',
				showFooter: false,
			});
		} catch (error: any) {
			uiBuilder.toast(context, {
				severity: 'error',
				detail: error.message,
				summary: $t('invalid.error'),
				group: 'br',
				life: 3000,
			});
		}
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('qaStatus').searchable(true),
				// this.field('siteID').searchable(true),
				// this.field('materialCode').searchable(true),
				// this.field('materialName').searchable(true),
				this.field('leftOverQuantity').setFrozen(MetaUiFieldFrozen.Right)
			);
		}
		if (customActions.length == 0) {
			customActions.push(
				{
					name: 'checkInventory',
					icon: 'pi pi-search',
					label: '查库存',
					role: 'success',
					onAction: this.checkInventory,
				},
				{
					name: 'completeShipment',
					icon: 'pi pi-car',
					label: '齐套发货',
					role: 'secondary',
					onAction: this.completeShipment,
				},
				{
					name: 'shipTrans',
					icon: 'pi pi-file-import',
					label: '一键发货',
					group: 'selectMany',
					role: 'primary',
					onAction: (context: UiBuildContext<any>) => {
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
export const LinesideInventoryLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new LinesideInventoryLogic({
		service: metaUiService,
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
				this.field('transNo').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: {
									color: '#409eff',
								},
								href: 'javascript:;',
								onClick: async () => {
									const { $api: apiBox, $router: router } = ctx.globalProps;

									if (ctx.model.transID) {
										window.open(`/MES/MaterialTranses/${ctx.model.transID}`, '_blank');
									}
								},
							},
							fldVal ?? ''
						),
					]);
				})
			)
		}

		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
