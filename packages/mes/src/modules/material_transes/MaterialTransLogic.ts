/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, isNullOrUndefined, getSearchOp, debounce, EntityUrlParam } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiLogicBeforeFn, UiViewOne } from '@mmda/vui';
import { type MaterialTrans, defineMaterialTrans } from '@/models/MaterialTrans';
import { type MaterialTransItem, defineMaterialTransItem } from '@/models/MaterialTransItem';
import { type MaterialTransTool, defineMaterialTransTool } from '@/models/MaterialTransTool';
import { type LinesideInventoryItem, defineLinesideInventoryItem } from '@/models/LinesideInventoryItem';
import { type PurchasedReceivableItem, definePurchasedReceivableItem } from '@/compat/srm/PurchasedReceivableItem';
import { type PurchasedReturnableItem, definePurchasedReturnableItem } from '@/compat/srm/PurchasedReturnableItem';
import { type Material, defineMaterial } from '@mmda/base/src/models/Material';
import { MaterialType } from '@mmda/base/src/enums/MaterialType';
import { UsageStatus, UsageStatusEnum } from '@mmda/base/src/enums/UsageStatus';
import { ProductionOrderStatus } from '@/enums/ProductionOrderStatus'
import type { Ref } from 'vue';
import { ref } from 'vue';
import { type MaterialTransReason, defineMaterialTransReason } from '@/models/MaterialTransReason';
import { reactive, h } from 'vue';
// 部分到货（移料单）组件
import { MaterialRItem } from './MaterialRItem/MaterialRItem';
import { QaStatus, QaStatusEnum } from '@mmda/base/src/enums/QaStatus';
import { ProductionOrder } from '@/models/ProductionOrder';
import type { UiBuildContext } from '@mmda/vui';
/**
 * 移料单交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:28.0
 * @revision 2024-09-01 23:04:25.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 移料单交互逻辑
 */
//提交的值
const subData = reactive({
	data: [],
});
const isMaterialReason = ref(false)
// const notice = reactive({
// 	data: {
// 		ownerID: '',
// 		ownerName: '',
// 		ownerInvalid: false, //显示用 是否选择了用户
// 		ownerDeptID: '',
// 		ownerDeptName: '',
// 		importance: 'UNKNOWN', //重要性
// 		urgency: 'NORMAL', //紧急性
// 		notification: '', //待办事宜
// 		copyTo: [], //通知给
// 		copyToInvalid: false, //是否选择了 通知给谁。
// 	},
// });
// // 取消
// const beforeCancel = async (context: UiContext, model: MaterialTrans, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('action.cancel'),
// 	data: notice.data,
// 	id: model.transID ?? '',
// 	action: 'cancel',
// 	repository: 'MaterialTranses',
// 	detail: context.globalProps.$t('auth.CancelSuccess')
// })
// // 作废
// const beforeRepeal = async (context: UiContext, model: MaterialTrans, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('action.repeal'),
// 	data: notice.data,
// 	id: model.transID ?? '',
// 	action: 'repeal',
// 	repository: 'MaterialTranses',
// 	detail: context.globalProps.$t('auth.RepealSuccess')
// })
// // 准备发料
// const beforePrepare = async (context: UiContext, model: MaterialTrans, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Prepare'),
// 	data: notice.data,
// 	id: model.transID ?? '',
// 	action: 'prepare',
// 	repository: 'MaterialTranses',
// 	detail: context.globalProps.$t('auth.PrepareSuccess')
// })
const getValidationErrors = (context: UiBuildContext<any>, errors: any): string => {
	let errorMessage = '';
	errors.forEach(({ field, error }: any) => {
		if (field && field.indexOf('/') != -1) {
			const [grpName, rowNum, fldName] = field.split('/').filter((name: string) => !name.includes('children'));
			const row = context.model[grpName]?.[+rowNum];
			const rowValidation = row
				? context.subGroupItemContext(grpName, row).$v
				: undefined;
			if (rowValidation) {
				rowValidation[fldName] = { touched: true, message: error };
				(rowValidation.summary ??= { errorNum: 0 }).errorNum++;
			}
		} else if (field) {
			context.$v[field] = { touched: true, message: error };
		}
		errorMessage = errorMessage ? errorMessage + ';' + error : error;
	});
	return errorMessage
}
// 确认收料
const beforeReceive = async (context: UiBuildContext<any>, model: MaterialTrans, action: EntityAction) => {
	const { $t: t, $api: apiBox, $toast: toast } = context.globalProps;
	try {
		const isHasShip = await apiBox.getAll({
			repository: 'MaterialTranses',
			path: `${model.transID ?? ''}/hasShip`,
			service: 'mes',
		});
		if (isHasShip.list) {
			return context.uiBuilder.confirmMessage(context, {
				header: t('action.confirm'),
				message: t('confirmation.hasShipMsg'),
				type: action.param.hint,
				rejectLabel: t('action.cancel'),
				acceptLabel: t('action.confirm'),
				// 确认
				accept: async () => {
					context.uiBuilder.confirmMessage(context, {
						header: t('action.confirm'),
						message: t('dialog.areYourSure'),
						type: action.param.hint,
						rejectLabel: t('auth.AllReceive'),
						acceptLabel: t('auth.PartReceive'),
						// 部分到货
						accept: async () => {
							try {
								context.uiBuilder.confirmDialog(
									h(MaterialRItem, {
										id: 'materialRItems',
										name: 'materialRItems',
										ctx: context,
										proModel: model.items.sort((a: any, b: any) => a.rowNum - b.rowNum).filter((item: any) => (item.leftOverQuantity - item.quantity) < 0),
										//字表emit提交父组件方法
										onGetTepModel(val: any) {
											subData.data = val;
										},
									}),
									context,
									{
										title: t('auth.MaterialTransItem'),
										width: '70%',
										accept: async () => {
											const paramData = subData.data.map(item => ({ refID: item.transID, refItemID: item.itemID, refName: item.arrivedQuantity }));
											try {
												const res: boolean = await apiBox.doAction(
													{
														path: model.transID ?? '',
														action: action.name,
														repository: 'MaterialTranses',
														service: 'mes',
													},
													{
														payload: {
															refItemKeys: paramData,
														},
													}
												);
												// 关闭窗口
												if (res) {
													toast.add({
														severity: 'success',
														detail: t('dialog.success'),
														summary: t('dialog.success'),
														group: 'br',
														life: 3000,
													});
													context.reload();
												}
											} catch (error: any) {
												context.uiBuilder.toast(context, {
													severity: 'error',
													summary: t('dialog.title.error'),
													detail: error.message ?? t('auth.operationFailed'),
													group: 'br',
													life: 3000,
												});
											}
										},
									}
								);
							} catch (error) {
								console.error(error);
							}
						},
						// 全部到货
						reject: async () => {
							try {
								const res: boolean = await apiBox.doAction(
									{
										path: model.transID ?? '',
										action: action.name,
										repository: 'MaterialTranses',
										service: 'mes',
									},
									{}
								);
								// 关闭窗口
								if (res) {
									toast.add({
										severity: 'success',
										detail: t('dialog.success'),
										summary: t('dialog.success'),
										group: 'br',
										life: 3000,
									});
									context.reload();
								}
							} catch (error: any) {
								context.uiBuilder.toast(context, {
									severity: 'error',
									summary: t('dialog.title.error'),
									detail: error.validationErrors && error.validationErrors.length ? getValidationErrors(context, error.validationErrors) : error.message ?? t('auth.operationFailed'),
									group: 'br',
									life: 3000,
								});
							}
						},
						onHide: () => { },
					});
				},
				reject: async () => { },
				onHide: async () => { },
			});
		} else {
			return context.uiBuilder.confirmMessage(context, {
				header: t('action.confirm'),
				message: t('dialog.areYourSure'),
				type: action.param.hint,
				rejectLabel: t('auth.AllReceive'),
				acceptLabel: t('auth.PartReceive'),
				// 部分到货
				accept: async () => {
					try {
						context.uiBuilder.confirmDialog(
							h(MaterialRItem, {
								id: 'materialRItems',
								name: 'materialRItems',
								ctx: context,
								proModel: model.items.sort((a: any, b: any) => a.rowNum - b.rowNum).filter((item: any) => (item.leftOverQuantity - item.quantity) < 0),
								//字表emit提交父组件方法
								onGetTepModel(val: any) {
									subData.data = val;
								},
							}),
							context,
							{
								title: t('auth.MaterialTransItem'),
								width: '70%',
								accept: async () => {
									const paramData = subData.data.map(item => ({ refID: item.transID, refItemID: item.itemID, refName: item.arrivedQuantity }));
									try {
										const res: boolean = await apiBox.doAction(
											{
												path: model.transID ?? '',
												action: action.name,
												repository: 'MaterialTranses',
												service: 'mes',
											},
											{
												payload: {
													refItemKeys: paramData,
												},
											}
										);
										// 关闭窗口
										if (res) {
											toast.add({
												severity: 'success',
												detail: t('dialog.success'),
												summary: t('dialog.success'),
												group: 'br',
												life: 3000,
											});
											context.reload();
										}
									} catch (error: any) {
										context.uiBuilder.toast(context, {
											severity: 'error',
											summary: t('dialog.title.error'),
											detail: error.message ?? t('auth.operationFailed'),
											group: 'br',
											life: 3000,
										});
									}
								},
							}
						);
					} catch (error) {
						console.error(error);
					}
				},
				// 全部到货
				reject: async () => {
					try {
						const res: boolean = await apiBox.doAction(
							{
								path: model.transID ?? '',
								action: action.name,
								repository: 'MaterialTranses',
								service: 'mes',
							},
							{}
						);
						// 关闭窗口
						if (res) {
							toast.add({
								severity: 'success',
								detail: t('dialog.success'),
								summary: t('dialog.success'),
								group: 'br',
								life: 3000,
							});
							context.reload();
						}
					} catch (error: any) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							summary: t('dialog.title.error'),
							detail: error.validationErrors && error.validationErrors.length ? getValidationErrors(context, error.validationErrors) : error.message,
							group: 'br',
							life: 3000,
						});
					}
				},
				onHide: () => { },
			});
		}
	} catch (error) {
		console.error(error);
	}
	// return false
};
// // 放行
// const beforeRelease = async (context: UiContext, model: MaterialTrans, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Release'),
// 	data: notice.data,
// 	id: model.transID ?? '',
// 	action: 'release',
// 	repository: 'MaterialTranses',
// 	detail: context.globalProps.$t('auth.ReleaseSuccess')
// })
// // 确认装运
// const beforeShip = async (context: UiContext, model: MaterialTrans, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Ship'),
// 	data: notice.data,
// 	id: model.transID ?? '',
// 	action: 'ship',
// 	repository: 'MaterialTranses',
// 	detail: context.globalProps.$t('auth.ShipSuccess')
// })
// // 确认移料
// const beforeTransport = async (context: UiContext, model: MaterialTrans, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Transport'),
// 	data: notice.data,
// 	id: model.transID ?? '',
// 	action: 'transport',
// 	repository: 'MaterialTranses',
// 	detail: context.globalProps.$t('auth.TransportSuccess')
// })
export class MaterialTransLogic extends UiLogic<MaterialTrans> {
	/** 侧边栏移料原因列表（分页加载，首屏 30 条） */
	transReasons: Ref<MaterialTransReason[]> = ref([]);
	/** 当前选中的移料原因，null 表示未筛选 */
	selectedTransReason: Ref<MaterialTransReason | null> = ref(null);
	/** 移料原因列表加载中标志，防止滚动触底时重复请求 */
	transReasonsLoading = ref(false);
	/** 移料原因分页状态：pageNo 当前页、pageSize 每页条数、recordCount 总记录数 */
	transReasonsPager = { pageNo: 1, pageSize: 30, recordCount: 0 };
	/**
	 * 防抖刷新主列表。
	 * 用户快速切换/取消侧边栏选中时，合并为一次 refresh，避免并发请求导致列表与筛选条件不一致。
	 */
	private _debouncedRefreshList: (ctx: UiContext<MaterialTrans>) => void;

	constructor(init: UiLogicInit) {
		super(defineMaterialTrans, init);

		// 300ms 防抖：末次选中变更后才刷新移料单列表
		this._debouncedRefreshList = debounce((ctx: UiContext<MaterialTrans>) => {
			void ctx.refresh(false);
		}, 300);

		// 重置顶部筛选器时，同步清空侧边栏选中状态
		this.afterResetFilters = () => {
			this.selectedTransReason.value = null;
		};

		this.beforeSave = (context: UiBuildContext<any>, model: MaterialTrans, action: EntityAction) => {
			const { tel, email, telPrefix } = model;
			const { $t: t } = context.globalProps;
			// 移料原因 原站点必须填写
			if (model?.reason?.requiredFromSiteID == true && !model.fromSiteID) {
				return Promise.reject(Error(t('invalid.fromSite')));
			}
			// 移料原因 去站点必须填写
			if (model?.reason?.requiredToSiteID == true && !model.toSiteID) {
				return Promise.reject(Error(t('invalid.toSiteID')));
			}
			return Promise.resolve(true);
		};
		this.beforeAction = (context: UiBuildContext<any>, model: MaterialTrans, action: EntityAction) => {
			try {
				if (action.name == 'receive') return beforeReceive(context, model, action);
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		};
		this.addRelativeLogic<MaterialTransItem>('items', master => new MaterialTransItemLogic(this, master));
		this.addRelativeLogic<MaterialTransTool>('tools', master => new MaterialTransToolLogic(this, master));
	}

	/**
	 * 创建移料单。
	 * 列表侧边栏已选中移料原因时，向服务端附带引用参数，供后端预填 transReasonID。
	 * 格式：{ refName: 'MaterialTransReason', refID: reasonID }
	 * 若调用方 param 已含 refName/refID，则不覆盖（保留显式传参/API 优先）。
	 */
	async create(param: any = {}, entityUrlParam?: EntityUrlParam): Promise<MaterialTrans> {
		let createParam = param;
		if (!param?.refName && !param?.refID) {
			const reasonID =
				this.selectedTransReason.value?.reasonID ??
				(this.router?.currentRoute.value?.query?.transReasonID as string | undefined);
			if (reasonID) {
				createParam = Object.assign({}, param, {
					refName: 'MaterialTransReason',
					refID: isMaterialReason.value ? reasonID : '',
				});
			}
		}
		return super.create(createParam, entityUrlParam);
	}

	/**
	 * 侧边栏选中/取消移料原因时，同步筛选条件并刷新主列表。
	 * @param ctx 列表构建上下文，用于更新 queryParams 与触发 refresh
	 * @param reason 选中的移料原因；传 null 表示取消筛选
	 */
	async selectTransReason(ctx: UiContext<MaterialTrans>, reason: MaterialTransReason | null) {
		this.selectedTransReason.value = reason;
		const transReasonID = reason ? reason.reasonID : '';
		// 同步 searchParam 与 URL，保证 refresh 与深链接一致
		(ctx.searchParam.queryParams ??= {});
		const res = await ctx.globalProps.$api.getAll({
			repository: 'MaterialTransReasons',
			queryParams: {
				status: 1,
				reasonTypes: 1
			},
		})
		const ReasonArr = res.list.filter((item: any) => item.reasonID === transReasonID)
		isMaterialReason.value = ReasonArr.length ? true : false
		if (transReasonID) {
			ctx.searchParam.queryParams.transReasonID = transReasonID;
			ctx.addQueryParam('transReasonID', transReasonID);
		} else {
			delete ctx.searchParam.queryParams.transReasonID;
			ctx.addQueryParam('transReasonID', '');
		}
		ctx.searchParam.pager.pageNo = 1;
		this._debouncedRefreshList(ctx);
	}

	/**
	 * 加载侧边栏移料原因首屏数据。
	 * 仅拉取 USED 状态原因；加载完成后根据 URL 中的 transReasonID 恢复选中项。
	 */
	async getTransReasons() {
		this.transReasonsPager.pageNo = 1;
		this.transReasonsLoading.value = true;
		return this.apiClient
			.getAll({
				repository: 'MaterialTransReasons',
				service: 'mes',
				queryParams: {
					status: 'USED',
					pageNo: 1,
					pageSize: this.transReasonsPager.pageSize,
					reasonTypes: 1
				},
			})
			.then((res: any) => {
				this.transReasons.value = res.list;
				this.transReasonsPager.recordCount = res.pagination?.recordCount ?? res.list?.length ?? 0;
				this._restoreSelectedTransReason();
			})
			.finally(() => {
				this.transReasonsLoading.value = false;
			});
	}

	/**
	 * 滚动触底时分页加载更多移料原因，追加到 transReasons 末尾。
	 */
	async loadMoreTransReasons() {
		if (this.transReasonsLoading.value) return;
		const { pageNo, pageSize, recordCount } = this.transReasonsPager;
		const totalPages = Math.ceil(recordCount / pageSize);
		if (pageNo >= totalPages) return;
		this.transReasonsLoading.value = true;
		const nextPage = pageNo + 1;
		return this.apiClient
			.getAll({
				repository: 'MaterialTransReasons',
				service: 'mes',
				queryParams: {
					status: 'USED',
					pageNo: nextPage,
					pageSize,
				},
			})
			.then((res: any) => {
				this.transReasonsPager.pageNo = nextPage;
				this.transReasons.value = [...this.transReasons.value, ...res.list];
			})
			.finally(() => {
				this.transReasonsLoading.value = false;
			});
	}

	/**
	 * Listbox 列表容器滚动事件：距底部 threshold 像素内触发下一页加载。
	 * @param event 来自 pt.listContainer.onScroll 的滚动事件
	 */
	onTransReasonsScroll(event: Event) {
		const el = event.target as HTMLElement;
		const threshold = 50;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
			void this.loadMoreTransReasons();
		}
	}

	/**
	 * 从路由 query 恢复侧边栏选中项（深链接或刷新页面后保持筛选状态）。
	 */
	private _restoreSelectedTransReason() {
		const transReasonID = this.router?.currentRoute.value?.query?.transReasonID as string;
		if (!transReasonID) return;
		const found = this.transReasons.value.find(
			(r: MaterialTransReason) => r.reasonID === transReasonID
		);
		if (found) {
			this.selectedTransReason.value = found;
		}
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('status').searchable(true),
				// todo 宇轩不需要
				// this.field('projectID').searchable(true).setSearchParam((ctx, model: any) => {
				// 	// 搜索项目时：如果已经选择了订单，则利用该订单自带的 projectID 去搜索对应的项目
				// 	return model.order?.projectID ? { projectID: model.order.projectID } : {};
				// }),
				this.field('orderID').searchable(true).setSearchParam((ctx, model: any) => {
					// 搜索订单时：如果已经选择了项目，则传入项目ID来限制订单列表
					return {
						projectID: model.projectID ?? '',
						status: getSearchOp('NOT_IN').toSQL([ProductionOrderStatus.CANCELED, ProductionOrderStatus.PAUSED]),
					};
				}),
				this.field('supplierID').searchable(true),
				this.field('fromSiteID').searchable(true),
				this.field('toSiteID').searchable(true),
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
				// 项目与生产订单双向联动过滤
				this.field('projectID').setSearchParam((ctx, model: any) => {
					// 搜索项目时：如果已经选择了订单，则利用该订单自带的 projectID 去搜索对应的项目
					return model.order?.projectID ? { projectID: model.order.projectID } : {};
				}).hideIf((t, context) => {
					const roleactionProject = context.globalProps.$app.context.modules.filter((item: any) => item.moduleCode === 'M.02')[0].subModules.find((module: any) => module.moduleCode === 'M.02.001')
					return !roleactionProject.authority.allowRead
				}),
				this.field('orderID')
					.setSearchParam((ctx, model: any) => {
						return {
							projectID: model.projectID ?? '',
							status: getSearchOp('NOT_IN').toSQL([ProductionOrderStatus.CANCELED, ProductionOrderStatus.PAUSED]),
						};
					})
					.onChange((ctx, model: any) => {
						if (model.order) {
							model.projectID = model.order.projectID;
							model.project = model.order.project;
						}
					}).hideIf(t => !isNullOrUndefined(t.refName) && t.refName === 'CompleteInspection'),

				this.field('transReasonID')
					.setSearchParam((context, model) => ({
						status: UsageStatusEnum.valueOf(UsageStatus.USED),
						reasonTypes: 2, // 移料原因筛选条件 自定义 判断是否是物流单所使用的原因
					}))
					.onChange((ctx, model, items) => {
						//原因改变清空 来和去站点
						model.fromSiteID = null;
						model.toSiteID = null;
						// 清除所有子项
						ctx.removeSubGroupItems('items');
					})
					.lockIf((model: any) => {
						if (model?.reason?.requiredFromSiteID == true && model.fromSiteID) {
							return true;
						} else if (model?.reason?.requiredToSiteID == true && model.toSiteID) {
							return true;
						} else if (model.refName === 'CompleteInspection') {
							return true;
						} else {
							return false;
						}
					}),
				this.field('fromSiteID')
					.setSearchParam((ctx, model) => {
						return {
							siteType: model?.reason?.requiredFromSiteTypes ?? '',
							siteNature: model?.reason?.reasonCode === 'TP_RET' ? 'fromMRet' : model?.reason?.reasonCode === 'TP_IN_REQ' ? 'fromRet' : model?.reason?.reasonCode === 'TP_OUT_REQ' ? 'fromReq' : '',
						};
					})
					.lockIf(t => !isRefNone(t?.reason) && isRefNone(t?.reason?.requiredFromSiteTypes)),
				this.field('toSiteID')
					.setSearchParam((ctx, model) => {
						return {
							siteType: model?.reason?.requiredToSiteTypes ?? '',
							siteNature: model?.reason?.reasonCode === 'TP_RET' ? 'toMRet' : model?.reason?.reasonCode === 'TP_IN_REQ' ? 'toRet' : model?.reason?.reasonCode === 'TP_OUT_REQ' ? 'toReq' : '',
						};
					})
					.lockIf(t => !isRefNone(t?.reason) && isRefNone(t?.reason?.requiredToSiteTypes))
			);
		}
		if (groups.length == 0) {
			groups.push(
				(() => {
					//是否是齐料检查过来的标识
					const isCompleteInspectionTrans = (t: MaterialTrans) => Boolean(!isNullOrUndefined(t.refName) && t.refName === 'CompleteInspection');

					const itemsGroup = this.group<MaterialTransItem>('items')
						//.clearIf((t: MaterialTrans) => !isCompleteInspectionTrans(t))
						.deleteIf((t: MaterialTrans) => t.refName !== "Material" ? t.refName !== "Material" : !isCompleteInspectionTrans(t))
						.editIf((t: MaterialTrans) => t.refName !== "Material" ? t.refName !== "Material" : !isCompleteInspectionTrans(t))
						.lockIf(model => model.refName === 'CompleteInspection' || model.refName === 'TP_IN_REQ')
						// .defaultAdder(this.addMaterialTransItem)
						.addCustomAction({
							name: 'addContractItem',
							label: 'bom.linesideInventory',
							icon: 'far fa-plus-circle',
							role: 'info',
							onAction: this.addMaterialTransItem,
							view: UiViewOne.Edit,
							visible: (t: MaterialTrans) => !isCompleteInspectionTrans(t) && (isNullOrUndefined(t.reason) ? true : t.reason.reasonCode !== 'PRODUCTION'),
						})
						.addCustomAction({
							name: 'addMaterialItem',
							label: 'view.material',
							icon: 'far fa-plus-circle',
							role: 'info',
							onAction: this.addMaterialTransItemFormMaterial,
							view: UiViewOne.Edit,
							visible: (t: MaterialTrans) => !isCompleteInspectionTrans(t) && (isNullOrUndefined(t.reason) ? true : t.reason.reasonCode !== 'PRODUCTION'),
						})
						.addCustomAction({
							name: 'createContractItem',
							label: 'action.create',
							icon: 'far fa-plus-circle',
							role: 'info',
							onAction: this.newMaterialTransItem,
							view: UiViewOne.Edit,
							visible: (t: MaterialTrans) => !isCompleteInspectionTrans(t) && !isRefNone(t.reason) && (t.reason.reasonCode === 'PURCHASE' || t.reason.reasonCode === 'PRODUCTION'),
						});
					Object.assign(itemsGroup.field('quantity').field, { listSize: 260 });
					itemsGroup.field('quantity').inPlaceEdit().onValidate<number>((value, model, ctx) => (value === 0 ? ctx.t('materialTrans.quantityNonZero') : null));
					itemsGroup.field('unit').inPlaceEdit();
					return itemsGroup.clearIf(t => !isCompleteInspectionTrans(t))
						// .addCustomAction({
						// 	name: 'createLinesideInventoryItem',
						// 	label: '从未到货清单中选择',
						// 	icon: 'far fa-plus-circle',
						// 	role: 'info',
						// 	onAction: this.addPurchasedReceivableItems,
						// 	visible: (t: MaterialTrans) => !isRefNone(t.reason) && t.reason.reasonCode === 'PURCHASE',
						// })
						// .addCustomAction({
						// 	name: 'createLinesideInventoryItem',
						// 	label: '从待退货项中选择',
						// 	icon: 'far fa-plus-circle',
						// 	role: 'info',
						// 	onAction: this.addPurchasedReturnableItems,
						// 	visible: (t: MaterialTrans) => !isRefNone(t.reason) && t.reason.reasonCode === 'PURCHASE_RETURN',
						// })
						// .addCustomAction({
						// 	name: 'createLinesideInventoryItem',
						// 	label: '从线边库存项中选择',
						// 	icon: 'far fa-plus-circle',
						// 	role: 'info',
						// 	onAction: this.addLinesideInventoryItem,
						// 	visible: (t: MaterialTrans) => !isRefNone(t.fromSiteID) && (!isRefNone(t.reason) && t.reason.reasonCode !== 'PURCHASE_RETURN'),
						// })
						.onChange((context, model) => {
							// 总数量计算
							model.totalQuantity = Number(MetaModel.sum(model.items, items => items.quantity).toFixed(4));
							// 总重量计算
							model.totalWeight = Number(MetaModel.sum(model.items, items => items.weight * items.quantity).toFixed(4));
							const items = model.items.filter((value: any) => value.entityState < 4);
							if (items.length === 0) {
								context.clearFieldValue('transSummary');
							}
							else if (items.length > 1) {
								// 清除生产订单
								context.clearFieldValue('orderID')
							} else {
								if (items[0].orderID) {
									// 自动回填生产订单
									context.globalProps.$api.getOne(items[0].orderID, { repository: 'ProductionOrders' }).then((res: ProductionOrder) => {
										if (res) {
											context.setFieldValue('orderID', ({ orderID: items[0].orderID, orderNo: res.orderNo }))
										}
									})
								}
							}
						});
				})(),
			);
		}
		return { fields, groups, customActions };
	}

	/**
	 * 选择物料
	 * @param context
	 * @param target
	 * @returns
	 */
	addMaterialTransItemFormMaterial(context: UiBuildContext<any>, target: MaterialTrans) {
		context
			.select<Material>({
				repository: 'Materials',
				service: 'base',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						status: getSearchOp('IN').toSQL('USED'),
						materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
					},
				},
				ctor: defineMaterial,
				selectionMode: 'multiple',
			})
			.then(selection => {
				if (selection) {
					context.addSubGroupItems<MaterialTransItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							materialCategory: m => m.category.categoryName,
							usage: m => MetaModel.getRefProp(m, 'materialType'),
							refName: m => 'MaterialTrans',
							refID: m => m.transID,
							arrivedQuantity: m => 0,
							// 退回数量不带入
							returnQuantity: m => 0,
							// 剩余数量不带入
							leftOverQuantity: m => 0,
							// 剩余状态不带入
							leftOver: m => false,
							// 引用序号
							refItemID: m => m.itemID,
							projectID: m => m.projectID,
						},
					});
				}
			})
			.catch((error: any) => {
				// console.log(error);
			});
	}
	addLinesideInventoryItem(context: UiBuildContext<any>, target: MaterialTrans) {
		context
			.select<LinesideInventoryItem>({
				repository: 'LinesideInventoryItems',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						siteID: target.fromSiteID ?? '',
						projectID: target.projectID ?? '',
						moduleCode: context.module?.moduleCode,
						qaStatus: `IN ${QaStatusEnum.valueOf(QaStatus.OK)}, ${QaStatusEnum.valueOf(QaStatus.AUC)}`,
					},
				},
				ctor: defineLinesideInventoryItem,
				selectionMode: 'multiple',
			})
			.then(selection => {
				if (selection) {
					context.addSubGroupItems<MaterialTransItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							refName: m => 'MaterialTrans',
							refID: m => m.transID,
							arrivedQuantity: m => 0,
							// 退回数量不带入
							returnQuantity: m => 0,
							// 剩余数量不带入
							leftOverQuantity: m => 0,
							// 剩余状态不带入
							leftOver: m => false,
							// 引用序号
							refItemID: m => m.itemID,
							projectID: m => m.projectID,
						},
					});
				}
			})
			.catch((error: any) => {
				// console.log(error);
			});
	}
	addPurchasedReturnableItems(context: UiBuildContext<any>, target: MaterialTrans) {
		context
			.select<PurchasedReturnableItem>({
				repository: 'PurchasedReturnableItems',
				service: 'srm',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						projectID: target.projectID ?? '',
						moduleCode: context.module?.moduleCode,
					},
				},
				ctor: definePurchasedReturnableItem,
				selectionMode: 'multiple',
			})
			.then(selection => {
				if (selection) {
					context.addSubGroupItems<MaterialTransItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							partNo: m => m.skuCode,
							materialName: m => m.skuName,
							materialCode: m => m.skuCode,
							quantity: m => m.quantity,
							unit: m => context.t('inventory.piece'),
							projectID: m => m.projectID,
						},
					});
					console.log(target.items, 'itens');
				}
			})
			.catch((error: any) => {
				// console.log(error);
			});
	}
	addPurchasedReceivableItems(context: UiBuildContext<any>, target: MaterialTrans) {
		context
			.select<PurchasedReceivableItem>({
				repository: 'PurchasedReceivableItems',
				service: 'srm',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						projectID: target?.projectID ?? '',
						supplierID: target?.supplierID ?? '',
						moduleCode: context.module?.moduleCode,
					},
				},
				ctor: definePurchasedReceivableItem,
				selectionMode: 'multiple',
			})
			.then(selection => {
				if (selection) {
					context.addSubGroupItems<MaterialTransItem>({
						target,
						group: 'items',
						sequenceKey: 'itemID',
						source: selection,
						propsMapper: {
							partNo: m => m.skuCode,
							materialName: m => m.skuName,
							materialCode: m => m.skuCode,
							quantity: m => (m.receivableQuantity > 0 ? m.receivableQuantity : 1),
							unit: m => context.t('inventory.piece'),
							projectID: m => m.projectID,
						},
					});
				}
			})
			.catch((error: any) => {
				// console.log(error);
			});
	}
	newMaterialTransItem(context: UiBuildContext<any>, target: MaterialTrans) {
		context
			.newSubGroupItem<MaterialTransItem>({
				group: 'items',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					// 总数量计算
					context.model.totalQuantity = Number(MetaModel.sum(context.model.items, items => items.quantity).toFixed(4));
					// 总重量计算
					context.model.totalWeight = Number(MetaModel.sum(context.model.items, items => items.weight * items.quantity).toFixed(4));
					context.addSubGroupItem('items', item);
				}
			});
	}
	// 添加按钮（分情况）
	addMaterialTransItem(context: UiBuildContext<any>, target: MaterialTrans) {
		if (!isRefNone(target.reason)) {
			if (!isRefNone(target?.reason?.requiredFromSiteTypes) && target.reason.reasonCode !== 'PURCHASE_RETURN') {
				if (target?.reason?.requiredFromSiteID && isRefNone(target.fromSiteID)) {
					return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						detail: context.t('materialTrans.selectFromSite'),
						group: 'br',
						life: 3000,
					});
				}
				this.addLinesideInventoryItem(context, target);
				// if (!isRefNone(target.fromSiteID)) {
				// 	this.addLinesideInventoryItem(context, target)
				// } else {
				// 	context.uiBuilder.toast(context, {
				// 		severity: 'error',
				// 		summary: context.globalProps.$t('dialog.title.error'),
				// 		detail: context.t('materialTrans.selectFromSite'),
				// 		group: 'br',
				// 		life: 3000
				// 	})
				// }
			} else {
				switch (target.reason.reasonCode) {
					// 采购
					case 'PURCHASE':
						this.addPurchasedReceivableItems(context, target);
						break;
					// 退货
					case 'PURCHASE_RETURN':
						this.addPurchasedReturnableItems(context, target);
						break;
					default:
						break;
				}
			}
		} else {
			context.uiBuilder.toast(context, {
				severity: 'error',
				summary: context.globalProps.$t('dialog.title.error'),
				detail: context.t('materialTrans.selectReason'),
				group: 'br',
				life: 3000,
			});
		}
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length === 0) {
			fields.push(
				this.field('orderID').hideIf(t => !isNullOrUndefined(t.refName) && t.refName === 'CompleteInspection'),
			)
		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造移料单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialTransLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new MaterialTransLogic({
		metaUiService: metaUiService,
		repository: 'MaterialTranses',
		router,
		module: module || metaUiService.findModule('MaterialTrans'),
	});
/**
 * 移料清单交互逻辑
 */
export class MaterialTransItemLogic extends UiGroupLogic<MaterialTransItem, MaterialTrans> {
	constructor(parent: MaterialTransLogic, master: MaterialTrans) {
		super(defineMaterialTransItem, parent, master, 'items');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 质量状态（移料原因为采购编辑可以修改）
				this.field('qaStatus').lockIf(() => this.master.transReasonID !== '40'),
				this.field('quantity')
					.onValidate<number>((value, model, ctx) => (value === 0 ? ctx.t('materialTrans.quantityNonZero') : null))
					.onChange((context, model) => {
						// 总数量计算
						this.master.totalQuantity = Number(MetaModel.sum(this.master.items, items => items.quantity).toFixed(4));
					}),
				// 总重量计算
				this.field('weight').onChange((context, model) => {
					this.master.totalWeight = Number(MetaModel.sum(this.master.items, items => items.weight * items.quantity).toFixed(4));
				}),
				this.field('orderID').setCustomRenderer((fld, ctx: UiBuildContext<any>, props) => {
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

									if (fldVal) {
										window.open(`/MES/ProductionOrders/${fldVal}`, '_blank');
									}
								},
							},
							fldVal ?? ''
						),
					]);
				})
			);
		}
		return { fields, groups, customActions };
	}
	beforeDetails(): UiLogicFnResult<MaterialTransItem> {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length === 0) {
			fields.push(
				this.field('orderID').setCustomRenderer((fld, ctx: UiBuildContext<any>, props) => {
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

									if (fldVal) {
										window.open(`/MES/ProductionOrders/${fldVal}`, '_blank');
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
/**
 * 器具清单交互逻辑
 */
export class MaterialTransToolLogic extends UiGroupLogic<MaterialTransTool, MaterialTrans> {
	constructor(parent: MaterialTransLogic, master: MaterialTrans) {
		super(defineMaterialTransTool, parent, master, 'tools');
	}
}
//#endregion ~GENERATED PARTS END
