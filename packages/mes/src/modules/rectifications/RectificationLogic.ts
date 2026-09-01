/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, isNullOrUndefined, debounce, isObject } from '@mmda/core';
import { QaStatus, QaStatusEnum } from '@mmda/base/src/enums/QaStatus';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type Rectification, defineRectification } from '@/models/Rectification';
import { type RectificationItem, defineRectificationItem } from '@/models/RectificationItem';
import { RectifiableProduct, defineRectifiableProduct } from '@/models/RectifiableProduct';
import { RectificationMethod } from '@/enums/RectificationMethod';
import { h, ref, reactive } from 'vue';
import { UserStatus } from '@mmda/base/src/enums/UserStatus';

/**
 * 质量异常整改单交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:41.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 质量异常整改单交互逻辑
 */
const tableData = ref([])
const tableColumns = ref([])
const tableDataKey = ref('id')
const searchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1
	},
	searchWord: '',
	searchParams: {}
})


const defectTableData = ref([])
const defectTableColumns = ref([])
const defectTableDataKey = ref('id')
const defectSearchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1
	},
	searchWord: '',
	searchParams: {}
})
const qcResultValueOf = (value: any) =>
	QaStatusEnum.valueOf(isObject(value) ? value.value : value);
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
export class RectificationLogic extends UiLogic<Rectification> {
	constructor(init: UiLogicInit) {
		super(defineRectification, init);
		this.addRelativeLogic<RectificationItem>('items', (master) => new RectificationItemLogic(this, master));
		this.beforeSave = (context: UiContext, model: Rectification, action: EntityAction) => {
			const { $t: t } = context.globalProps;
			//同时有开始时间，结束时间
			if (model.sentDate && model.expectedToComplete) {
				if (compareTime(model.sentDate, model.expectedToComplete) == 1) {
					return Promise.reject(Error(t('invalid.RectificationtTimeToSmall')));
				}
			}
			// 防止子项的entityState 大于4从而无法删除
			model.items.forEach((value: any) => {
				if (value.entityState > 4) {
					value.entityState = 4
				}
			})
			return Promise.resolve(true);

		};
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('sentDate').searchable(true), this.field('status').searchable(true));
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
				this.field('sentDate').onChange((ctx, model, newVal, oldVal) => {
					if (!isNullOrUndefined(model.expectedDuration) && !isNullOrUndefined(newVal)) {
						model.expectedDuration = Math.round((new Date(model.expectedToComplete).getTime() - new Date(model.sentDate).getTime()) / 1000 / 60 / 60)
					}
				}),
				this.field('expectedToComplete').onChange((ctx, model, newVal, oldVal) => {
					if (!isNullOrUndefined(model.sentDate) && !isNullOrUndefined(newVal)) {
						model.expectedDuration = Math.round((new Date(model.expectedToComplete).getTime() - new Date(model.sentDate).getTime()) / 1000 / 60 / 60)
					}
				}),
				this.field('rectifierID').setSearchParam((context, model) => {
					return {
						status: `IN ${UserStatus.ACTIVATED}`
					}
				})
			)
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
			groups.push(
				this.group<RectificationItem>('items')
					// .defaultAdder(this.newRectificationItem)
					.addCustomAction({
						name: 'createContractItem',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newRectificationItem,
						view: UiViewOne.Edit,
					})
					.addCustomAction({
						name: 'createRectifiableproduct',
						label: 'rectification.selectPendingProducts',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newRectifiableproduct,
						view: UiViewOne.Edit,
					})
					.onChange((ctx, model) => {
						if (!model || !model.items) return;
						model.totalRectifiableQuantity = MetaModel.sum(model.items, item => item.rectifiableQuantity)
						MetaModel.modify(model);
					})
			)
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
	newRectificationItem(context: UiContext<Rectification>, target: Rectification) {
		context
			.newSubGroupItem<RectificationItem>({
				group: 'items',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					// target.items.push(item);
					// context.addSubGroupItems<RectificationItem>({
					// 	target,
					// 	group: 'items',
					// 	sequenceKey: 'itemID',
					// 	source: item,
					// 	propsMapper: {
					// 	},
					// });
					context.addSubGroupItem('items', item);
				}
			});
	}
	newRectifiableproduct(context: UiContext<Rectification>, target: Rectification) {
		context.select<RectifiableProduct>({
			repository: 'RectifiableProducts',
			searchParam: {
				pager: defaultPager(),
				queryParams: {},
			},
			service: 'mes',
			ctor: defineRectifiableProduct,
			selectionMode: 'multiple',
		})
			.then((selection: any) => {
				// 去重
				const items = selection.filter((item: any) => MetaModel.hasAnyLike(target.items, { productCode: item.productCode }));
				if (items.length > 0) {
					return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.t('dialog.title.error'),
						detail: context.t('rectification.duplicatePendingProduct'),
						group: 'br',
						life: 3000
					})
				}
				if (selection) {
					context.addSubGroupItems<RectificationItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							// materialID: m => m
						},
					});
				}
			})
			.catch((error: any) => {
				console.log(error)
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造质量异常整改单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const RectificationLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new RectificationLogic({
	metaUiService: metaUiService,
	repository: 'Rectifications',
	router,
	module: module || metaUiService.findModule('Rectification'),
})
/**
 * 整改项交互逻辑
 */
export class RectificationItemLogic extends UiGroupLogic<RectificationItem, Rectification> {
	constructor(parent: RectificationLogic, master: Rectification) {
		super(defineRectificationItem, parent, master, 'items')
	}
	async getData(ctx: any, id: any, value?: any) {
		const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
		const res = await apiBox.getAll({
			repository: 'ProductionTasks',
			path: `${id}/getAllAncestorProductionTask`,
			queryParams: {
				pageSize: searchParam.pager.pageSize,
				pageNo: searchParam.pager.pageNo,
				sort: '',
				searchWord: value,
				// rework: ctx.model.rectificationMethod === RectificationMethod.REWORK ? true : false
			},
			service: 'mes',
		})
		searchParam.pager = res.pagination
		tableData.value = res.list.map((it: any) => {
			return {
				...it,
				status: it.customProperties.$status,
				processType: it.customProperties.$processType,
				priority: it.customProperties.$priority,
				ownerID: it.customProperties.$ownerID,
				ownerDeptID: it.customProperties.$ownerDeptID,
				constraintType: it.customProperties.$constraintType,
			}
		})
	}
	async getDefectData(ctx: any, value?: any) {
		const { $api: apiBox } = ctx.globalProps;
		const res = await apiBox.getAll({
			repository: 'QualityDefects',
			queryParams: {
				pageSize: defectSearchParam.pager.pageSize,
				pageNo: defectSearchParam.pager.pageNo,
				sort: '',
				searchWord: value,
			},
			service: 'mes',
		});
		defectSearchParam.pager = res.pagination;
		defectTableData.value = res.list.map((it: any) => {
			return { ...it, severity: it.customProperties.$severity };
		});
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 制品编码
				this.field('productCode').lockIf(t => !isRefNone(t.refID)),
				this.field('productName').lockIf(t => !isRefNone(t.refID)),
				this.field('producedQuantity').lockIf(t => !isRefNone(t.refID)),
				this.field('unit').lockIf(t => !isRefNone(t.refID)),
				this.field('reworkTaskID').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
					const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
					const { model } = ctx; const metaUiService = ctx.logic!.metaUiService
					const id = !isRefNone(model.refTaskID) ? model.refTaskID : 0
					return ui.factory.searchForRelative({
						role: `reworkTaskID-search-for-relative`,
						name: 'reworkTaskID-search-for-relative',
						id: 'reworkTaskID-search-for-relative',
						modelValue: !isNullOrUndefined(model.reworkTask) ? model.reworkTask.productName : model.reworkTaskID,
						dataKey: 'taskID',
						optionLabel: (v: any) => v.productName,
						options: tableData.value,
						placeholder: t('action.select'),
						toSearch: async (event: Event) => {
							let data = [] as any
							// 获取元数据字段
							const { metaui } = await ctx.logic!.loadMetadata('ProductionTasks', 'mes', true);
							ctx.searchParam.pager = searchParam.pager = {
								pageNo: 1,
								pageSize: 10
							}
							// 列表column
							tableColumns.value = await ctx.uiBuilder.buildColumns(metaui, ctx, {
								isSearch: true,
								cacheKey: `payerID/SearchRelative/${metaui.primaryKey}`,
							});
							tableDataKey.value = metaui.primaryKey
							ctx.uiBuilder.confirmDialog(
								ctx.uiBuilder.buildSearchForRelativeContent(
									tableColumns.value,
									{
										dataKey: tableDataKey.value,
										onSearch: async (params: any) => {
											const { searchParams, reload, pager } = params
											await this.getData(ctx, id, searchParams.searchWord)
											return { list: tableData.value, pager: searchParam.pager }
										},
										onPage: ({ pageNo, pageSize }: any) => {
											searchParam.pager.pageNo = pageNo;
											searchParam.pager.pageSize = pageSize;
											ctx.searchParam.pager = searchParam.pager
										},
										onSelect: (selection: any, row: any) => {
											data = row
										}
									}
								), ctx, {
								title: fld.displayLabel,
								width: '80%',
								// height: '30%',
								accept: async () => {
									ctx.model.reworkTaskID = data.taskID
									ctx.model.reworkTask = data
									// // 制品编码
									// ctx.model.productCode = data.productCode
									// // 制品名称及规格
									// ctx.model.productName = `${data.productName} ${data.specs}`
									// // 生产数量
									// ctx.model.producedQuantity = data.producedQuantity
									// // 单位
									// ctx.model.unit = data.unit
									MetaModel.modify(ctx.model)
									return true
								}
							}
							)
						},
						onUpdate: (value: any) => {
							ctx.model.reworkTaskID = value || null
							ctx.model.reworkTask = value || null
						},
					})
				}).lockIf(t => t.rectificationMethod !== RectificationMethod.REWORK),
				this.field('rectifiableQuantity').onChange((ctx, model) => {
					if (!this.master || !this.master.items) return;
					this.master.totalRectifiableQuantity = MetaModel.sum(this.master.items, item => item.rectifiableQuantity)
					MetaModel.modify(this.master);
				}),
				this.field('defectiveDesc')
					.setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
						const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
						const { model } = ctx; const metaUiService = ctx.logic!.metaUiService;
						return ui.factory.searchForRelative({
							role: `defectiveDesc-search-for-relative`,
							name: 'defectiveDesc-search-for-relative',
							id: 'defectiveDesc-search-for-relative',
							modelValue: model.defectiveDesc,
							dataKey: 'defectID',
							optionLabel: 'defectDesc',
							options: defectTableData.value,
							placeholder: t('action.select'),
							toSearch: async (event: Event) => {
								let data = [] as any;
								const metaUi = await metaUiService.get('QualityDefects', 'mes');
								defectTableColumns.value = metaUi.getListedFields().sort((prev: any, curr: any) => {
									return Number(prev.fieldIdx) - Number(curr.fieldIdx);
								});
								defectTableDataKey.value = metaUi.primaryKey;
								await this.getDefectData(ctx, '');
								ctx.uiBuilder.confirmDialog(
									ctx.uiBuilder.buildSearchForRelativeContent(
										defectTableColumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
										{
											dataKey: defectTableDataKey.value,
											onSearch: async (params: any) => {
												const { searchParams, reload, pager } = params;
												await this.getDefectData(ctx, searchParams.searchWord);
												return { list: defectTableData.value, pager: defectSearchParam.pager };
											},
											onPage: ({ pageNo, pageSize }: any) => {
												defectSearchParam.pager.pageNo = pageNo;
												defectSearchParam.pager.pageSize = pageSize;
											},
											onSelect: (selection: any, row: any) => {
												data = row;
											},
										}
									),
									ctx,
									{
										title: fld.displayLabel,
										width: '80%',
										accept: async () => {
											ctx.model.defectiveDesc = data.defectDesc ?? ctx.model.defectiveDesc;
											ctx.model.defectID = data.defectID ?? ctx.model.defectID;
											MetaModel.modify(ctx.model);
											return true;
										},
									}
								);
							},
							onInput: async (value: string) => {
								model.defectiveDesc = value;
								model.defectID = null;
							},
							onUpdate: async (value: any) => {
								if (!isRefNone(value)) {
									ctx.model.defectiveDesc = value.defectDesc;
									ctx.model.defectID = value.defectID;
								} else {
									ctx.model.defectiveDesc = null;
									ctx.model.defectID = null;
								}
							},
						});
					})
					.lockIf(model =>
						qcResultValueOf(model.qcResult) === QaStatusEnum.valueOf(QaStatus.OK)
					)
			)
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
}
//#endregion ~GENERATED PARTS END
