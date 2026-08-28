/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, isRefNone, type UiContext, EntityAction, isNullOrUndefined } from '@mmda/core';
import { type UiViewContext, type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiSearchForm } from '@mmda/vui';
import { type ProductionOrder, defineProductionOrder } from '@/models/ProductionOrder';
import { reactive, ref, h } from 'vue';
import { type ProductionOrderMaterial, defineProductionOrderMaterial } from '@/models/ProductionOrderMaterial';
import { ProductionOrderStatusEnum } from '@/enums/ProductionOrderStatus';
import { BomStatus } from '@/enums/BomStatus';
import { type Bom } from '@/models/Bom';
import { TaskConstraintType } from '@mmda/base/src/enums/TaskConstraintType';
import { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
// 是否更新制品数据
const isUpdate = ref(false)
//订单简介
const summary = ref('');
const userPageInfo = reactive({
	pageSize: 10,
	pageNo: 1,
});
//生成订单概要
const getOrderSummary = (model: any, context: UiContext) => {
	const { $t: t } = context.globalProps;
	const rNo = model.refNo; //销售单号
	const pCode = model.productCode ?? ''; //制品编码
	const pName = model.productName ?? ''; //制品名称
	const unit = model.unit ?? ''; //单位
	const orderQuantity = model.orderQuantity ?? 0; // 数量
	const plusQuantity = model.plusQuantity ?? 0; // 加产数量
	// $t('success.operationSuccessful')
	if (rNo) {
		summary.value = `${t('model.SalesOrderNumber')}:[${rNo}],${t('model.ProductCode')}:${pCode},${t('model.ProductName')}:${pName},${t('model.OrderQuantity')}:${orderQuantity},${t('model.PlusQuantity')}:${plusQuantity},${t('model.Unit')}:${unit} `;
	} else if (isNullOrUndefined(model.productCode)) {
		summary.value = null
	}
	else {
		summary.value = `${t('model.ProductCode')}:${pCode},${t('model.ProductName')}:${pName},${t('model.OrderQuantity')}:${orderQuantity},${t('model.PlusQuantity')}:${plusQuantity},${t('model.Unit')}:${unit}`;
	}
	model.orderSummary = summary.value;
};

// 旧逻辑保留：输入制品编码后自动查找 BOM 并回填相关字段，当前已停用。
// const getBoms = async (ctx: any, model: any, newVal: any) => {
// 	if (newVal) {
// 		const { $api, $toast, $t } = ctx.globalProps;
// 		const bomFilters = 'alternate IS NULL';
// 		const queryInfo: any = {
// 			status: 4,
// 		};
// 		if (model.productCode) {
// 			queryInfo.productCode = model.productCode;
// 			queryInfo.filter = bomFilters;
// 		} else {
// 			queryInfo.filter = bomFilters;
// 		}
// 		try {
// 			const res = await $api.getAll({
// 				repository: 'Boms',
// 				service: 'mes',
// 				queryParams: queryInfo,
// 			});
// 			if (res.list && res?.list.length > 0) {
// 				model.bom = res.list[0];
// 				if (model.bom) {
// 					model.productCode = model.bom.productCode ?? null;
// 					model.productName = model.bom.productName ?? null;
// 					model.productID = model.bom.productID ?? null;
// 					model.unit = model.bom.unit ?? null;
// 					model.projectID = model.bom.projectID ?? null;
// 					model.project = model.bom.project ?? null;
// 					ctx.setFieldValue('bomID', {
// 						bomID: model.bom.bomID ?? null,
// 						bomNo: model.bom.bomNo ?? null,
// 						productName: model.bom.productName ?? null
// 					});
// 					model.bom = res.list[0];
// 					getOrderSummary(model, ctx);
// 				}
// 				return;
// 			}
// 		} catch (error: any) {
// 			$toast.add({
// 				severity: 'error',
// 				title: $t('dialog.title.error'),
// 				summary: error.detail ?? '',
// 				group: 'br',
// 				life: 3000,
// 			});
// 			return false;
// 		}
// 		return;
// 	} else {
// 		model.productCode = null;
// 		model.productName = null;
// 		model.bomID = null;
// 		model.projectID = null;
// 		model.orderSummary = null;
// 		getOrderSummary(model, ctx);
// 	}
// };
// const debouncedGetBoms = debounce(getBoms, 1000);

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
//计算两个天数之间的日期
const getDaysBetweenDates = (date1: any, date2: any) => {
	const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
	const time1 = new Date(date1).getTime();
	const time2 = new Date(date2).getTime();
	const diffDays = Math.round((time2 - time1) / oneDay);
	return diffDays + 1;
};
//应隐藏约束日期的条件
const shouldHideConstraintDate = (constraintType: TaskConstraintType | null | undefined) =>
	[
		TaskConstraintType.NONE,
		TaskConstraintType.AS_SOON_AS_POSSIBLE,
		TaskConstraintType.AS_LATE_AS_POSSIBLE,
	].includes(constraintType as TaskConstraintType);
// 根据计划开工和完工时间同步计划工期
const updateExpectedPeriod = (model: ProductionOrder, startDate: any, finishDate: any) => {
	if (startDate && finishDate) {
		model.expectedPeriod = Number(getDaysBetweenDates(startDate, finishDate));
	} else {
		model.expectedPeriod = null;
	}
};

// 计划产值 = 单位产值 * (订单数量 + 加产数量)
const calcExpectedOutput = (model: any) => {
	const unitOutput = Number(model.unitOutput ?? 0);
	const orderQuantity = Number(model.orderQuantity ?? 0);
	const plusQuantity = Number(model.plusQuantity ?? 0);
	model.expectedOutput = Math.round(unitOutput * (orderQuantity + plusQuantity) * 100) / 100;
};

// Bom 请求参数
const bomSearchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
});
const bomList = ref<Bom[]>()

/**
 * 获取BOM
 * @param context
 * @param value
 */
const getBom = async (context: UiContext, model: ProductionOrder, value?: any) => {
	console.log(model, "生产订单")
	if (!model.productCode) {
		bomList.value = [];
		return;
	}

	await context.globalProps.$api
		.getAll({
			repository: 'Boms',
			service: 'mes',
			queryParams: {
				pageSize: bomSearchParam.pager.pageSize,
				pageNo: bomSearchParam.pager.pageNo,
				sort: '',
				searchWord: value,
				status: 'IN+APPROVED',
				productCode: model.productCode,
			},
		})
		.then((res: any) => {
			bomSearchParam.pager = res.pagination;
			bomList.value = res.list.map((it: any) => {
				return {
					...it,
					status: it.customProperties.$status,
					taskLevel: it.customProperties.$taskLevel,
					taskPhase: it.customProperties.$taskPhase,
					riskLevel: it.customProperties.$riskLevel,
					constraintType: it.customProperties.$constraintType,
					critical: it.critical == false ? '否' : '是',
					milestone: it.milestone == false ? '否' : '是',
				};
			});
		});
};

// 关联配方
const beforeLinkBom = async (context: UiBuildContext<any>, model: ProductionOrder, action: EntityAction) => {
	const { uiBuilder, apiClient } = context
	const metaUiService = context.logic.metaUiService;
	if (!model.productCode) {
		uiBuilder.toast(context, {
			severity: 'info',
			summary: context.t('dialog.title.prompt'),
			group: 'br',
			detail: '请先选择制品编码',
			life: 3000,
		});
		return false;
	}

	bomSearchParam.pager.pageNo = 1;
	await getBom(context, model, '');
	if (!bomList.value?.length) {
		uiBuilder.toast(context, {
			severity: 'warn',
			summary: context.t('dialog.title.warning'),
			group: 'br',
			detail: '未找到可关联的配方(BOM)',
			life: 3000,
		});
		return false;
	}

	const metaUi = await metaUiService.get('Boms', 'mes');
	const columns = await uiBuilder.buildColumns(metaUi, context, {
		isSearch: true,
		cacheKey: `bomID/SearchRelative/${metaUi.primaryKey}`,
		fieldName: 'bomID'
	})

	const selectBom = ref<Bom>();
	await uiBuilder.confirmDialog(
		uiBuilder.buildSearchForRelativeContent(columns, {
			dataKey: metaUi.primaryKey,
			selectionMode: 'single',
			selectableFn: (row: Bom) => model.bomID !== row?.bomID,
			onSearch: async (params: any) => {
				const { searchParams } = params;
				if (!searchParams.searchWord && bomSearchParam.pager.pageNo === 1) {
					return { list: bomList.value, pager: bomSearchParam.pager };
				}
				await getBom(context, model, searchParams.searchWord);
				return { list: bomList.value, pager: bomSearchParam.pager };
			},
			onPage: ({ pageNo, pageSize }: any) => {
				bomSearchParam.pager.pageNo = pageNo;
				bomSearchParam.pager.pageSize = pageSize;
			},
			onSelect: (selection: any, row: any) => {
				// console.log(selection, '选择')
				selectBom.value = selection;
			},

		}),
		context,
		{
			name: 'searchForRelative',
			title: context.t('dialog.title.selection') + metaUi.displayLabel,
			style: { width: '80vw', maxHeight: '95%', },
			modal: true,
			accept: async () => {
				if (!selectBom.value || !selectBom.value?.bomID) {
					uiBuilder.toast(context, {
						severity: 'error',
						summary: context.t('dialog.title.error'),
						group: 'br',
						detail: context.t('invalid.requiredSelectAny'),
						life: 3000,
					});
					return false;
				}
				return await apiClient
					.doAction(
						{
							path: model.orderID,
							service: 'mes',
							repository: 'ProductionOrders',
							action: 'linkBom',
						},
						{ payload: { refID: selectBom.value.bomID } }
					)
					.then((res: any) => {
						if (res) {
							context.reload();
							return true;
						}
					})
					.catch((err: any) => {
						uiBuilder.toast(context, {
							severity: 'error',
							summary: context.t('dialog.title.error'),
							group: 'br',
							detail: err.message,
							life: 3000,
						});
						return true;
					});
			},
		}
	)

	return false
};
// 显示子订单
const showChildOrders = ref([
	{
		name: '是',
		value: true
	},
	{
		name: '否',
		value: false
	}
])

const isClick = ref(false)

/**
 * 恢复生产
 */
const beforeResume = async (context: UiContext, model: ProductionOrder, action: EntityAction) => {
	const { $router, $api } = context.globalProps;
	try {
		const res = await $api.getOne(model.orderID, {
			repository: 'ProductionOrders',
			action: 'checkMaterialShortage'
		})
		if (res) {
			// 给提示并跳转齐料检查
			context.uiBuilder.confirmMessage(context, {
				header: context.t('action.confirm'),
				message: context.t('检测到当前订单已缺料，是否去领料？'),
				type: 'warn',
				accept: () => {
					const route = {
						path: '/MES/ComputeKitting',
						query: {
							projectID: '',
							type: 'CompleteMaterial',
							moduleCode: "M.03.002",
							orderNo: model.orderNo
						},
					};
					// 在新标签页打开
					const routeUrl = $router.resolve(route);
					window.open(routeUrl.href, '_blank');

				}
			})
		} else {
			// 继续执行
			return true
		}
	} catch (error: any) {
		context.uiBuilder.toast(context, {
			severity: 'error',
			summary: context.t('dialog.title.error'),
			detail: error.message ?? '操作失败',
			group: 'br',
			life: 3000
		})
	}
}

/**
 * 生产订单交互逻辑
 */
export class ProductionOrderLogic extends UiLogic<ProductionOrder> {
	constructor(init: UiLogicInit) {
		super(defineProductionOrder, init);
		this.addRelativeLogic<ProductionOrderMaterial>('materials', master => new ProductionOrderMaterialLogic(this, master));
		this.beforeAction = (context: UiBuildContext<any>, model: ProductionOrder, action: EntityAction) => {
			try {
				if (action.name == 'linkBom') return beforeLinkBom(context, model, action);
				if (action.name == 'resume') return beforeResume(context, model, action)
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		};

		this.beforeSave = async (context: UiContext, model: ProductionOrder, action: EntityAction) => {
			console.log(model, "生产订单")
			const { $t: t } = context.globalProps;
			//同时有开始时间，结束时间
			if (model.expectedStart && model.expectedFinish) {
				if (compareTime(model.expectedStart, model.expectedFinish) == 1) {
					return Promise.reject(Error(t('invalid.planTimeToSmall')));
				}
			}
			// 存在多个制品需要提示用户，如果确定=>保存，取消 => 重新编辑 => 保存
			if (!isUpdate.value) {
				isUpdate.value = true
				const result = await context.globalProps.$api.getAll({
					repository: 'Boms',
					service: context.globalProps.$api.config.service,
					queryParams: { ...userPageInfo, status: `IN ${BomStatus.APPROVED}`, productCode: model.productCode },
				})
				if (result.list.length > 1) {
					const isComfirm = await context.uiBuilder.confirmMessage(context, {
						header: t('action.confirm'),
						message: t('该制品存在多个BOM版本，请确定是否继续保存？'),
						type: 'warn',
						accept: () => {
							return true;
						}
					})
					return Promise.resolve(isComfirm);
				} else {
					return Promise.resolve(true);
				}
			} else {
				return Promise.resolve(true);
			}

		};
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('projectID').searchable(true),
				this.field('priority').searchable(true),
				this.field('constraintType').searchable(true),
				this.field('productCategoryID').searchable(true),
				this.field('deliveryDate').searchable(true),
				this.field('status').searchable(true)
			);
		}
		return { fields, groups, customActions };
	}
	async getAll(param: any) {
		const res = await super.getAll({
			...param, queryParams:
			{
				...this.searchParams.queryParams,
				showSubOrders: isNullOrUndefined(this.searchParams.showSubOrders) && !isClick.value ? true : this.searchParams.showSubOrders
				// pageSize: 100
			}
		});
		return res;
	}
	beforeSearch(): UiSearchForm {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push({
				searchLabel: '显示子订单',
				searchParam: 'showSubOrders',
				renderer: (ctx: UiBuildContext<any> & any, csf) => {
					isClick.value = false
					const { factory } = ctx.uiBuilder;
					return factory.selectButton(showChildOrders.value[0].value, {
						optionLabel: 'name',
						optionValue: 'value',
						options: showChildOrders.value,
						onUpdate: (val: any) => {
							isClick.value = true
							csf.searchVal.value = val ?? ''
							ctx.refresh(false)
						}
					})
				}
			})
		}
		return { searchFields, customSearchFields }
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 交货日期
				this.field('deliveryDate').onValidate((value, model, context) => {
					if (new Date(value).isBefore(new Date())) {
						return '交货日期必须大于当前日期';
					}
				}),
				this.field('expectedStart').onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
					updateExpectedPeriod(model, newVal, model.expectedFinish);
				}),
				this.field('expectedFinish')
					.onValidate((value, model, context) => {
						if (value && new Date(value).isBefore(new Date())) {
							return '计划完工日期不能早于当前日期';
						} else if (value && new Date(value).isAfter(new Date(model.deliveryDate))) {
							return '计划完工日期不能晚于交货日期';
						}
					})
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						updateExpectedPeriod(model, model.expectedStart, newVal);
					}),
				this.field('superOrderID').setSearchParam((ctx) => {
					return {
						status: `NOT IN ${ProductionOrderStatusEnum.CANCELED_VALUE},${ProductionOrderStatusEnum.PAUSED_VALUE}`
					}
				}),
				this.field('constraintType').onChange((ctx: UiViewContext<any>, model, newVal) => {
					if (shouldHideConstraintDate(newVal)) {
						ctx.setFieldValue('constraintDate', null);
					}
				}),
				//限制日期
				this.field('constraintDate').hideIf(model => shouldHideConstraintDate(model.constraintType)).onValidate((value, model) => {
					if (!shouldHideConstraintDate(model.constraintType) && isNullOrUndefined(value)) {
						return '请输入限制日期'
					}
				}),
				// 外协
				this.field('outsourced').onChange((context: UiViewContext<any>, model, newVal) => {
					if (!newVal) {
						context.clearFieldValue('outsourcingManufacturerID', null)
					}
				}),

				//外协厂商
				this.field('outsourcingManufacturerID')
					.setSearchParam((ctx, model) => {
						return {
							status: '>0',
						};
					})
					.hideIf(model => model.outsourced == false),

				//this.field('vendorID').hideIf(model => model.outsourced == false),

				/**
				 * 输入制品编码后，不自动带出 BOM，只把制品编码作为主配方 bomID 的搜索过滤条件。
				 * 用户明确选择 BOM 后，再回填制品名称、单位、项目等相关字段。
				 */
				this.field('productCode').onChange<string>(async (ctx: UiViewContext<any>, model, newVal, oldVal) => {
					ctx.getFieldOptions('bomID').searchParam.searchWord = newVal?.trim() || '';
					// 旧逻辑保留：debouncedGetBoms(ctx, model, newVal);
					getOrderSummary(model, ctx);
				}),

				//制品名称
				this.field('productName').onChange<string>(async (ctx, model, newVal, oldVal) => {
					getOrderSummary(model, ctx);
				}),
				//单位
				this.field('unit').onChange<string>(async (ctx, model, newVal, oldVal) => {
					getOrderSummary(model, ctx);
				}),
				// 订单数量
				this.field('orderQuantity').onChange<string>(async (ctx, model, newVal, oldVal) => {
					getOrderSummary(model, ctx);
					calcExpectedOutput(model);
					return newVal;
				}),
				// 加产数量
				this.field('plusQuantity').onChange<string>(async (ctx, model, newVal, oldVal) => {
					getOrderSummary(model, ctx);
					calcExpectedOutput(model);
					return newVal;
				}),
				//单位产值
				this.field('unitOutput').onChange<string>((ctx, model, newVal, oldVal) => {
					calcExpectedOutput(model);
					return newVal;
				}),

				//选中制程，赋值Bom
				this.field('bomID')
					.setSelectable((ctx, field, row) => ctx.model?.bomID !== row?.bomID)
					.setSearchParam((ctx, model) => {
						const queryInfo: any = {
							status: `IN ${BomStatus.APPROVED}`
						};
						if (model.productCode) {
							queryInfo.productCode = model.productCode;
						}
						return queryInfo;
					})
					.onChange<string>((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (isNullOrUndefined(newVal)) {
							// 手动创建订单bom清除后制品信息可以清除，反之不能清除
							if (isNullOrUndefined(model.refName)) {
								model.productCode = null;
								model.productName = null;
								model.unit = null;
								model.bom = null;
								model.productID = null;
								model.packID = null;
								model.productCategory = null;
								model.projectID = null;
								model.project = null;
								ctx.clearFieldValue('productCategoryID');
								ctx.clearFieldValue('projectID');
								getOrderSummary(model, ctx);
							}
							return;
						} else {
							const bom = model.bom;
							// 设置制品信息
							if (bom) {
								ctx.batchSetFieldValue({
									productCode: bom.productCode ?? null,
									productName: bom.productName ?? null,
									productID: bom.productID ?? null,
									unit: bom.unit ?? null,
									productCategoryID: bom.productCategory ?? null,
									projectID: bom.projectID ?? null,
									project: bom.project ?? null,
								})
								getOrderSummary(model, ctx);
							}
							return;
						}
					}),

				/**
				 * 手动创建生产工单，首先选择制品Bom后自动填入productCode,productName（拼接specs,modelType,texture这些字段在生产过程中显示）,unit,projectID,tracingMode等产品相关字段并锁定，确定产品型号，然后填入数量、交期、包装规格、优先级和单位产值。
				 */
				this.field('unit').lockIf(model => !isRefNone(model.bomID) || !isNullOrUndefined(model.refName)),
				this.field('projectID').lockIf(model => !isRefNone(model.bomID) && !isRefNone(model.projectID)),
				this.field('packID').lockIf(model => isRefNone(model.bomID)),

				// 制品配方存在时锁
				this.field('productName').lockIf(model => !isRefNone(model.bomID) || !isNullOrUndefined(model.refName)),
				this.field('productCode').lockIf(model => !isRefNone(model.bomID) || !isNullOrUndefined(model.refName)),
				//当前没有制品类别模块，先以普通文本形式显示
				this.field('productCategoryID')
					.lockIf(model => !isRefNone(model.bomID) || !isNullOrUndefined(model.refName))
					.setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, !isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
				}),


				/**
				 * 选择包装规格时，需确保MaterialPackage是属于Bom中定义的productID的。若没有productID，则不能选择，等有了才能更改。
				 */
				this.field('packID')
					//选择包装规格时，需确保productID选中，MaterialPackage是属于Bom中定义的productID的。若没有productID，则不能选择，等有了才能更改。
					.lockIf(model => isNullOrUndefined(model.bom?.productID ?? null) || model.bom.product.supportPackage)
					.setSearchParam((ctx, model) => {
						if (model.bom?.productID ?? null) {
							return {
								filter: 'materialID=' + model.bom?.productID,
								status: `NOT IN ${UsageStatus.DEPRECATED},${UsageStatus.NEW}`,
							};
						} else {
							return {
								status: `NOT IN ${UsageStatus.DEPRECATED},${UsageStatus.NEW}`,
							};
						}
					})
					.onChange<string>((ctx, model, newVal, oldVal) => {
						if (isRefNone(newVal)) return;
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
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx: UiViewContext<any>,model,items)=>{ })
			);
			 */

			fields.push(
				//this.field('materials')

				// .lockIf(model=>model.prop1)
				// .hideIf(model=>model.prop2)
				// .onChange((ctx: UiViewContext<any>,model,items)=>{ })
			);
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('constraintDate').hideIf(model => shouldHideConstraintDate(model.constraintType)),
				// 以下字段没有值时隐藏
				this.field('superOrderID').hideIf((t: ProductionOrder) => isNullOrUndefined(t.superOrderID)),
				this.field('subTaskCount').hideIf((t: ProductionOrder) => isNullOrUndefined(t.subTaskCount) || t.subTaskCount === 0),
				this.field('outsourcingManufacturerID').hideIf((t: ProductionOrder) => isNullOrUndefined(t.outsourcingManufacturerID)),
				this.field('subOrderCount').hideIf((t: ProductionOrder) => isNullOrUndefined(t.subOrderCount) || t.subOrderCount === 0),
				this.field('plusQuantity').hideIf((t: ProductionOrder) => isNullOrUndefined(t.plusQuantity) || t.plusQuantity === 0),
				//当前没有制品类别模块，先以普通文本形式显示
				this.field('productCategoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, !isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
				})
			);
		}
		if (groups.length === 0) {
			groups.push(
				// 原材料无数据时隐藏
				this.group<ProductionOrderMaterial>('materials').hideIf((t: ProductionOrder) => t.materials.length === 0)
			)
		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造生产订单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionOrderLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionOrderLogic({
		service: metaUiService,
		repository: 'ProductionOrders',
		router,
		module: module || metaUiService.findModule('ProductionOrder'),
	});
/**
 * 原材料交互逻辑
 */
export class ProductionOrderMaterialLogic extends UiGroupLogic<ProductionOrderMaterial, ProductionOrder> {
	constructor(parent: ProductionOrderLogic, master: ProductionOrder) {
		super(defineProductionOrderMaterial, parent, master, 'materials');
	}
}
//#endregion ~GENERATED PARTS END
