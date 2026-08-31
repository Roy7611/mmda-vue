/* eslint-disable @typescript-eslint/no-unused-vars */
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
	type Module,
	type MetaUiField,
	type UiContext,
	defaultPager,
	EntityAction,
	isFunction,
	ApiClient,
	MetaModel,
	EntityState,
	isRefNone,
	MetaUiGroup,
	UiGroupRenderer,
	isNullOrUndefined,
} from '@mmda/core';
import { type UiViewContext, type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type ProductionPlan, defineProductionPlan } from '@/models/ProductionPlan';
import { type ProductionOrder, defineProductionOrder } from '@/models/ProductionOrder';
import { type ProductionPlanItem, defineProductionPlanItem } from '@/models/ProductionPlanItem';
import { ProductionPlanStatus } from '@/enums/ProductionPlanStatus';
// import { ProductionPlanStatus } from '@/enums/ProductionPlanStatus';
import { h, onUpdated, reactive, ref } from 'vue';
import { ProductionOrderStatus } from '@/enums/ProductionOrderStatus';
import { ProductionTaskStatus, ProductionTaskStatusEnum } from '@/enums/ProductionTaskStatus';
import { TaskConstraintType, TaskConstraintTypeEnum } from '@mmda/base/src/enums/TaskConstraintType';
// import { text } from 'stream/consumers';

const pushNum = ref(1);
//生产编号 规则
const getNumber = () => {
	const numberLength = pushNum.value.toString().length;
	let reNo: string = null;
	switch (numberLength) {
		case 1:
			reNo = '000' + pushNum.value.toString();
			break;
		case 2:
			reNo = '00' + pushNum.value.toString();
			break;
		case 3:
			reNo = '0' + pushNum.value.toString();
			break;
		case 4:
			reNo = pushNum.value.toString();
			break;
	}
	pushNum.value++;
	return reNo;
};
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
//计算两个时间之间的小时数
const getHoursBetweenDates = (date1: any, date2: any) => {
	const time1 = new Date(date1).getTime();
	const time2 = new Date(date2).getTime();
	return Math.round(((time2 - time1) / (1000 * 60 * 60)) * 100) / 100;
};
//应隐藏约束日期的条件
const shouldHideConstraintDate = (constraintType: TaskConstraintType | null | undefined) =>
	[TaskConstraintType.NONE, TaskConstraintType.AS_SOON_AS_POSSIBLE, TaskConstraintType.AS_LATE_AS_POSSIBLE].includes(constraintType as TaskConstraintType);
/**
 * 获取子订单
 */
const getChildOrders = async (context: UiContext, orders: ProductionOrder[]): Promise<ProductionOrder[]> => {
	if (!orders || orders.length === 0) return [];
	const results = await Promise.all(
		orders.map(async (value: ProductionOrder) => {
			if (!value?.orderID) return [] as ProductionOrder[];
			const res = await context.globalProps.$api.getOne(value.orderID, {
				action: 'plannableDescendants',
				repository: 'ProductionOrders',
				service: 'mes',
			});
			if (!res) return [] as ProductionOrder[];
			const list = Array.isArray(res) ? res : [res];
			return list.map((item: ProductionOrder) => defineProductionOrder(item));
		})
	);
	return results.flat();
};
const hrefData = ref();

/**
 * 生产计划交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-08-09 22:29:39.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产计划交互逻辑
 */
export class ProductionPlanLogic extends UiLogic<ProductionPlan> {
	constructor(init: UiLogicInit) {
		super(defineProductionPlan, init);

		this.addRelativeLogic<ProductionPlanItem>('items', master => new ProductionPlanItemLogic(this, master));
		this.beforeSave = (context: UiContext<ProductionPlan>, model: ProductionPlan, action: EntityAction) => {
			const { $t: t } = context.globalProps;
			//同时有开始时间，结束时间
			if (model.expectedStart && model.expectedFinish) {
				if (compareTime(model.expectedStart, model.expectedFinish) == 1) {
					return Promise.reject(Error(t('invalid.planTimeToSmall')));
				}
			}
			return Promise.resolve(true);
		};

		this.afterAction = (context: UiContext<ProductionPlan>, model: ProductionPlan, action: EntityAction, apiResultOrError?: any) => {
			const err = apiResultOrError;
			if (err?.status == 400 && err?.code == 'task.relasedQuantity.exceed') {
				const { $api, $router, $toast, $t: t } = context.globalProps;
				const apiClient = $api as ApiClient;
				context.uiBuilder.toast(context, {
					severity: 'error',
					summary: t('dialog.title.error'),
					detail: err.message ?? '操作失败',
					group: 'br',
					// life: 3000
				})
				context.uiBuilder.confirmMessage(context, {
					header: t('dialog.title.prompt'),
					message: t('ganttLabel.jumpMaterialInspection'),
					type: 'warn',
					accept: async () => {
						//调用接口，查询 projectID 跳转
						try {
							const res = await apiClient.getAll({
								repository: 'Projects',
								service: 'mes',
								queryParams: {
									planID: model.planID ?? '',
								},
							});
							if (res.list) {
								let projectID;
								if (res.list.length > 0) {
									const projectList: any = res.list;
									projectID = projectList[0].projectID;
								}
								// 构建路由对象
								const route = {
									path: '/MES/ComputeKitting',
									query: {
										projectID: projectID,
										type: 'CompleteMaterial',
										moduleCode: 'M.03.002',
										planID: model.planID
									},
								};
								// 在新标签页打开
								const routeUrl = $router.resolve(route);
								window.open(routeUrl.href, '_blank');
							}
							return true;
						} catch (error: any) {
							$toast.add({
								severity: 'error',
								detail: error.message,
								summary: '错误',
								group: 'br',
								life: 3000,
							});
							return false;
						}
					},
				})
				// context.uiBuilder.confirmDialog(
				// 	h(
				// 		'div',
				// 		{
				// 			style: {
				// 				width: '100%',
				// 				fontSize: '1.2rem',
				// 				textAlign: 'center',
				// 				paddingBottom: '1rem',
				// 				paddingTop: '1rem',
				// 			},
				// 		},
				// 		[t('ganttLabel.jumpMaterialInspection')]
				// 	),
				// 	context,
				// 	{
				// 		title: t('dialog.title.prompt'),
				// 		width: '25%',
				// 		height: '30%',
				// 		showFooter: true,
				// 		accept: async () => {
				// 			//调用接口，查询 projectID 跳转
				// 			try {
				// 				const res = await apiClient.getAll({
				// 					repository: 'Projects',
				// 					service: 'mes',
				// 					queryParams: {
				// 						planID: model.planID ?? '',
				// 					},
				// 				});
				// 				if (res.list) {
				// 					let projectID;
				// 					if (res.list.length > 0) {
				// 						const projectList: any = res.list;
				// 						projectID = projectList[0].projectID;
				// 					}
				// 					// 构建路由对象
				// 					const route = {
				// 						path: '/MES/ComputeKitting',
				// 						query: {
				// 							projectID: projectID,
				// 							type: 'CompleteMaterial',
				// 							moduleCode: 'M.03.002',
				// 						},
				// 					};
				// 					// 在新标签页打开
				// 					const routeUrl = $router.resolve(route);
				// 					window.open(routeUrl.href, '_blank');
				// 				}
				// 				return true;
				// 			} catch (error: any) {
				// 				$toast.add({
				// 					severity: 'error',
				// 					detail: error.message,
				// 					summary: '错误',
				// 					group: 'br',
				// 					life: 3000,
				// 				});
				// 				return false;
				// 			}
				// 		},
				// 	}
				// );

				return Promise.resolve(false);
			}

			if (err?.message || err?.detail) {
				context.uiBuilder.toast(context, {
					severity: 'error',
					summary: context.t('dialog.title.error'),
					detail: err.message ?? err.detail,
					group: 'br',
					life: 3000,
				});
				return Promise.resolve(false);
			}

			return Promise.resolve(true);
		};
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			hrefData.value = this.getParmas(window.location.href);
			fields.push(this.field('status').searchable(true));
		}
		return { fields, groups, customActions };
	}
	/**
	 * 获取跳转路径参数
	 * @param value href(拼接路径)
	 * @returns 拼接参数对象
	 */
	getParmas(value: any) {
		const queryParams = new URLSearchParams(new URL(value).search);
		const queryObject = {} as any;
		for (const [key, value] of queryParams.entries()) {
			if (queryObject[key]) {
				queryObject[key] = [].concat(queryObject[key], value);
			} else {
				queryObject[key] = value;
			}
		}
		return queryObject;
	}

	beforeSearch() {
		const { searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push({
				searchLabel: '计划日期',
				searchParam: 'planDate',
				valueFn: (v: any) => (v.filter((item: any) => item !== null).length > 1 ? `BETWEEN '${v[0].toFormat('yyyy-MM-dd')}' AND '${v[1].toFormat('yyyy-MM-dd')}'` : ''),
				renderer: (ctx: UiBuildContext<any> & any, csf) => {
					const { $ui: ui, $t: t, $api: apiBox } = ctx.globalProps;

					// const options = isString(taskLevelOption.value) ? JSON.parse(taskLevelOption.value) : [];
					if (hrefData.value.expectedStart || hrefData.value.expectedFinish) {
						csf.searchVal.value = [];

						if (hrefData.value.expectedStart) {
							csf.searchVal.value.push(new Date(hrefData.value.expectedStart));
						} else {
							csf.searchVal.value.push(null);
						}
						if (hrefData.value.expectedFinish) {
							csf.searchVal.value.push(new Date(hrefData.value.expectedFinish));
						} else {
							csf.searchVal.value.push(null);
						}
						hrefData.value.expectedStart = null;
						hrefData.value.expectedFinish = null;
					}

					return ui.factory.datePicker({
						selectionMode: 'range',
						numberOfMonths: '2',
						modelValue: csf.searchVal.value,
						onUpdatePicker: (times: string) => {
							csf.searchVal.value = times;
							ctx.app.localDb.put(`search/${ctx.logic.repository}/planDate`, times);
						},
					});
				},
			});
		}

		return { searchFields, customSearchFields };
	}

	/**
	 * 设置编辑交互逻辑
	 */
	//获取当天的日期，和明天的日期
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			const today = new Date();
			fields.push(
				this.field('planNo').lockIf(model => model.status != ProductionPlanStatus.NEW),
				//this.field('totalQuantity').lockIf(model => !isRefNone(model.status)),

				this.field('expectedStart')
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (newVal && model.expectedFinish) {
							const days = getDaysBetweenDates(newVal, model.expectedFinish);
							model.expectedPeriod = Number(days);
						} else {
							model.expectedPeriod = null;
						}
					})
					.lockIf(model => model.status != ProductionPlanStatus.NEW || (!isNullOrUndefined(model.customJson) && (JSON.parse(model.customJson)).source === 'dailyPlanning')),
				this.field('expectedFinish')
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (newVal && model.expectedStart) {
							const days = getDaysBetweenDates(model.expectedStart, newVal);
							model.expectedPeriod = Number(days);
						} else {
							model.expectedPeriod = null;
						}
					})
					.lockIf(model => model.status != ProductionPlanStatus.NEW || (!isNullOrUndefined(model.customJson) && (JSON.parse(model.customJson)).source === 'dailyPlanning')),

				this.field('planDate').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
					const { $ui: ui } = ctx.globalProps;
					return ui.factory.datePicker({
						modelValue: ctx.model.planDate,
						minDate: today,
						onUpdatePicker(value: any) {
							ctx.model.planDate = value.toFormat('yyyy-MM-dd');
						},
					});
				})
				//planDate
			); //
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
				this.group<ProductionPlanItem>('items')
					.defaultAdder(this.addPlanItem)
					.onChange((ctx: UiViewContext<any>, model, items) => {
						const newArr = model.items.filter((value: any) => value.entityState < 4);
						const sumNumber = Math.round(Number(MetaModel.sum(newArr, item => item.taskQuantity)) * 100) / 100;
						model.totalQuantity = sumNumber;

						const sumOutput = Math.round(Number(MetaModel.sum(newArr, item => item.expectedOutput)) * 100) / 100;
						model.expectedOutput = sumOutput;
					})
			);
		}
		return { fields, groups, customActions };
	}

	addPlanItem(context: UiContext<ProductionPlan>, target: ProductionPlan) {
		context
			.select<ProductionOrder>({
				service: 'mes',
				repository: 'ProductionOrders',
				ctor: defineProductionOrder,
				selectionMode: 'multiple',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						filter: '((t.status BETWEEN 1 AND 5) OR (t.status = 0 AND t.subOrderCount = 0)) AND t.bomID IS NOT NULL',
						// status: ProductionJobStatus.NEW,

					},
				},
			})
			.then(async (selection: any) => {
				if (selection) {
					selection = selection.map((item: any) => {
						// 设置状态+
						item.status = ProductionTaskStatus.NEW;
						return item;
					});
					// 添加所有的子订单，与所选主订单按 orderID 去重
					const childern = await getChildOrders(context, selection)
					const existingIds = new Set(
						(context.model.items ?? [])
							.filter((item: ProductionPlanItem) => !MetaModel.deleted(item))
							.map((item: ProductionPlanItem) => item.orderID)
							.filter(Boolean)
					);
					const seen = new Set<string>();
					const source = [...selection, ...childern].filter((order: ProductionOrder) => {
						const id = order?.orderID;
						if (!id || seen.has(id) || existingIds.has(id)) return false;
						seen.add(id);
						return true;
					});
					context.addSubGroupItems<ProductionPlanItem>({
						target,
						group: 'items',
						source,
						// sequenceKey: 'itemID',
						propsMapper: {
							orderID: m => m,
							taskQuantity: m => m.orderQuantity + m.plusQuantity - m.releasedQuantity, // 任务数量 = (订单数量+加产数量) - 已下达数量 不能超过生产数量
							expectedOutput: m => m.expectedOutput,
							expectedStart: m => m.expectedStart + ' 00:00:00',
							expectedFinish: m => m.expectedFinish + ' 00:00:00',
							expectedDuration: m => {
								if (m.expectedStart && m.expectedFinish) {
									return getHoursBetweenDates(m.expectedStart + ' 00:00:00', m.expectedFinish + ' 00:00:00');
								}
								return null;
							},
							taskNo: m => target.planNo + '-' + getNumber(),
							taskID: m => m.id,
							status: m => ({ value: ProductionTaskStatus.NEW, text: ProductionTaskStatusEnum.textOf(ProductionTaskStatus.NEW) })
						},
					});

					// 过滤已删除的数据
					const usefulData = context.model.items.filter((item: ProductionPlanItem) => !MetaModel.deleted(item));

					//计算总量
					context.setFieldValue(
						'totalQuantity',
						MetaModel.sum(usefulData, item => item.taskQuantity)
					);

					//计算主表总计划产值
					context.setFieldValue(
						'expectedOutput',
						MetaModel.sum(usefulData, item => item.expectedOutput)
					);
				}
			});
	}

	newProductionPlanItem(context: UiContext<ProductionPlan>, target: ProductionPlan) {
		context
			.newSubGroupItem<ProductionPlanItem>({
				group: 'items',
				sequenceKey: 'taskID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.items.includes(item)) target.items.push(item);
				}
			});
	}

	//设置详情逻辑
	//beforeDetails(){}
}

//传入时间返回格式
// const getFormattedDate = (date: Date) => {
// 	const year = date.getFullYear();
// 	const month = String(date.getMonth() + 1).padStart(2, '0');
// 	const day = String(date.getDate()).padStart(2, '0');
// 	return `${year}-${month}-${day}`;
// }
// ;
const isDecimal = (num: number) => {
	return num % 1 !== 0;
};
/**
 * 构造生产计划交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionPlanLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionPlanLogic({
		service: metaUiService,
		repository: 'ProductionPlans',
		router,
		module: module || metaUiService.findModule('ProductionPlan'),
	});
/**
 * 计划任务交互逻辑
 */
export class ProductionPlanItemLogic extends UiGroupLogic<ProductionPlanItem, ProductionPlan> {
	constructor(parent: ProductionPlanLogic, master: ProductionPlan) {
		super(defineProductionPlanItem, parent, master, 'items');
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('qcInProcessStatus').lockIf(m => true),
				this.field('lineID').setSearchParam((ctx, model) => {
					const proprams = <any>{
						status: 'NOT IN 0,-1',
						bomID: model.bomID ?? ''
					};

					if (ctx.model.bom.plantID) {
						proprams.plantID = ctx.model.bom.plantID;
					}
					return proprams;
				}),
				this.field('taskQuantity').onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
					const { $api, $router, $toast, $t: t } = ctx.globalProps;
					//判断newVal是不是小数
					if (isDecimal(newVal) && newVal > 0) {
						$toast.add({
							severity: 'warn',
							title: t('dialog.title.error'),
							detail: t('invalid.notPorint'),
							life: 3000,
						});
						console.log('model', model);
						model.taskQuantity = oldVal;
					} else {
						// 更新 expectedOutput 计划产值 = 任务数量 * 单位产值
						ctx.setFieldValue('expectedOutput', model.taskQuantity * (model?.order?.unitOutput ?? 0));

						// 过滤已删除的数据
						const usefulData = ctx.root.model.items.filter((item: ProductionPlanItem) => !MetaModel.deleted(item));

						//计算总量
						ctx.root.setFieldValue(
							'totalQuantity',
							MetaModel.sum(usefulData, item => item.taskQuantity)
						);

						//计算主表总计划产值
						ctx.root.setFieldValue(
							'expectedOutput',
							MetaModel.sum(usefulData, item => item.expectedOutput)
						);
					}
				}),
				this.field('expectedStart')
					.onValidate((value, model, context) => {
						const { $t: t } = context.globalProps;
						if (value && model.expectedFinish && compareTime(value, model.expectedFinish) == 1) {
							return t('invalid.planTimeToSmall');
						}
					})
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (newVal && model.expectedFinish && compareTime(newVal, model.expectedFinish) != 1) {
							model.expectedDuration = getHoursBetweenDates(newVal, model.expectedFinish);
						} else {
							model.expectedDuration = null;
						}
					}),
				this.field('expectedFinish')
					.onValidate((value, model, context) => {
						const { $t: t } = context.globalProps;
						if (value && model.expectedStart && compareTime(model.expectedStart, value) == 1) {
							return t('invalid.planTimeToSmall');
						}
					})
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (newVal && model.expectedStart && compareTime(model.expectedStart, newVal) != 1) {
							model.expectedDuration = getHoursBetweenDates(model.expectedStart, newVal);
						} else {
							model.expectedDuration = null;
						}
					}),
				this.field('taskNo').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						ctx.model.status != ProductionPlanStatus.NEW && ctx.model.status != ProductionPlanStatus.PREPARED && ctx.model.status != ProductionPlanStatus.CANCELED
							? h(
								'a',
								{
									style: {
										color: '#409eff',
									},
									href: 'javascript:;',
									onClick: async () => {
										const { $api: apiBox, $router: router } = ctx.globalProps;

										if (ctx.model.taskID) {
											window.open(`/MES/ProductionTasks/${ctx.model.taskID}`, '_blank');
										}
									},
								},
								fldVal
							)
							: (fldVal ?? ''),
					]);
				}),
				this.field('constraintType').onChange((ctx: UiViewContext<any>, model, newVal) => {
					if (shouldHideConstraintDate(newVal)) {
						ctx.setFieldValue('constraintDate', null);
					}
				}),
				this.field('productCode').lockIf(model => !isNullOrUndefined(model.productCode) && model.productCode !== ''),
				this.field('expectedOutput').lockIf(() => true),
				// 限制日期：不需日期的限制类型下隐藏且不参与必填校验
				this.field('constraintDate')
					.hideIf(model => shouldHideConstraintDate(model.constraintType))
					.onValidate((value, model) => {
						if (!shouldHideConstraintDate(model.constraintType) && isNullOrUndefined(value)) {
							return '请输入限制日期';
						}
					}),
				this.field('productCategoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, !isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
				})
			);
		}

		return { fields, groups, customActions };
	}

	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('taskNo').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						ctx.model.status != ProductionPlanStatus.NEW && ctx.model.status != ProductionPlanStatus.PREPARED && ctx.model.status != ProductionPlanStatus.CANCELED
							? h(
								'a',
								{
									style: {
										color: '#409eff',
									},
									href: 'javascript:;',
									onClick: async () => {
										const { $api: apiBox, $router: router } = ctx.globalProps;

										if (ctx.model.taskID) {
											window.open(`/MES/ProductionTasks/${ctx.model.taskID}`, '_blank');
										}
									},
								},
								fldVal
							)
							: (fldVal ?? ''),
					]);
				}).setCustomCellRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						ctx.model.status != ProductionPlanStatus.NEW && ctx.model.status != ProductionPlanStatus.PREPARED && ctx.model.status != ProductionPlanStatus.CANCELED
							? h(
								'a',
								{
									style: {
										color: '#409eff',
									},
									href: 'javascript:;',
									onClick: async () => {
										const { $api: apiBox, $router: router } = ctx.globalProps;

										if (ctx.model.taskID) {
											window.open(`/MES/ProductionTasks/${ctx.model.taskID}`, '_blank');
										}
									},
								},
								fldVal
							)
							: (fldVal ?? ''),
					]);
				}),
				this.field('constraintDate').hideIf(model => shouldHideConstraintDate(model.constraintType)),
				this.field('productCategoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, !isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
				})
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
