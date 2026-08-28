/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router, useRouter } from 'vue-router';
import { MetaUiService, Module, EntityAction, type UiContext, MetaModel, debounce, isNullOrUndefined, triggerEscKey, isNullObject } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiBuildContext, UI_BUILDER_KEY, UiGroupLogic, UiViewOne, UI_CREATE, type UiLogicFnResult, UiAction } from '@mmda/vui';
import { type StationPortal, defineStationPortal } from '@/models/StationPortal';
import { inject, defineComponent, getCurrentInstance, h, reactive, ref, toRefs, Suspense } from 'vue';
import { isObject } from 'lodash';
import { ProductionEventEditor } from '@/modules/production_events/ProductionEventEditor';
import { ProductionItemEditor } from '@/modules/production_items/ProductionItemEditor';
import { ProductionEventLogic, ProductionEventLogicCtor } from '@/modules/production_events/ProductionEventLogic';


const tableDataplan = ref([]);
const tablecolumnsplan = ref([]);
const tableDataKEYplan = ref('id');
const searchParamplan = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
const tableDatatask = ref([]);
const tablecolumnstask = ref([]);
const tableDataKEYtask = ref('id');
const searchParamtask = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
const eventtypeoption = [
	{ label: '信息', value: 'INFO', id: 0 },
	{ label: '成功', value: 'SUCCESS', id: 1 },
	{ label: '警告', value: 'WARNING', id: 2 },
	{ label: '危险', value: 'DANGER', id: 4 },
];

const eventcauseoption = [
	{ lable: '-', name: 'NONE', value: 0 },
	{ lable: '人', name: 'MAN', value: 1 },
	{ lable: '设备', name: 'EQUIP', value: 2 },
	{ lable: '材料', name: 'MATERIAL', value: 4 },
	{ lable: '设计', name: 'DESIGN', value: 8 },
	{ lable: '工艺', name: 'PROCESS', value: 16 },
	{ lable: '质量', name: 'QC', value: 32 },
	{ lable: '其他', name: 'OTHER', value: 128 },
];
const reporteventparams = {
	refID: '',
	// refID: context.globalProps.$route.params.id,
	refItemKeys: <any>null,
	refName: 'ProductionTask',
};
const QaStatus = [
	{ label: '待检品', value: 'NI', id: 0 },
	{ label: '良品', value: 'OK', id: 1 },
	{ label: '瑕疵品', value: 'DG', id: 2 },
	{ label: '让步接受', value: 'AUC', id: 3 },
	{ label: '不良品', value: 'NG', id: 4 },
	{ label: '废品', value: 'SCRAP', id: 8 },
];
const minDateexpiryDate = ref(new Date());
const maxDateprodDate = ref(new Date());
/**
 * 智能工位交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 10:22:26.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 智能工位交互逻辑
 */
export class StationPortalLogic extends UiLogic<StationPortal> {
	static getAllplan() {
		throw new Error('Method not implemented.');
	}
	allstations: any;
	constructor(init: UiLogicInit) {
		super(defineStationPortal, init);
		// this.selectableList = { onSelectmaterial: (item: any) => item.materialID != null };
	}

	/**
	 * 事件上报
	 * @param context
	 */
	async repotevent(context: UiContext, reporteventparams: any) {
		const { uiBuilder } = context

		const reportAction: EntityAction = {
			name: "report",
			label: "上报",
			icon: null,
			group: null,
			description: "上报生产事件",
			param: {
				type: "execute",
				prompt: "FLOW_TO",
				value: null,
				hint: "INFO"
			}
		}

		let eventCtx: (UiBuildContext<any> & {
			prepareFn(action: EntityAction): Promise<any>;
		}) | null = null;
		return uiBuilder.confirmDialog(
			h(
				Suspense,
				{},
				{
					default: () =>
						h(ProductionEventEditor, {
							id: '_',
							view: UI_CREATE,
							editing: true,
							isEditDialog: true,
							params: reporteventparams,
							showToolbar: false,
							attachmentsCollapsed: true,
							onMountedSuccess: (ctx: UiBuildContext<any>) => {
								eventCtx = ctx as UiBuildContext<any> & {
									prepareFn(action: EntityAction): Promise<any>;
								};
							},
						}),
				}
			),
			context,
			{
				title: '生产事件',
				height: '65vh',
				width: '80vw',
				accept: async () => {
					if (eventCtx) {
						return await eventCtx.save().then((res: any) => true);
				}
				},
				reject: () => {
					return false;

				},
			}
		).then((res: boolean) => {
			if (res) {
				return eventCtx.prepareFn(reportAction).then((res: any) => {
					return new Promise<boolean>((resolve, reject) => {
						uiBuilder.buildNotice(eventCtx, {
							action: reportAction,
							prepareData: res,
							onSubmit: (data: any) => {
								reportAction.param = data
							},
							onHide: async () => {
								await eventCtx.logic.doAction(eventCtx.model, reportAction)
								resolve(true)
							},
							reject: () => reject(false),
						})
					})
				})
			}
		})
		// const eventdialog = defineComponent({
		// 	name: 'eventdialog',
		// 	setup() {
		// 		return () =>
		// 			h('div', { class: 'flex flex_wrap' }, [
		// 				//textarea
		// 				context.uiBuilder.factory.formItem(
		// 					{
		// 						id: 'search_eventtitle',
		// 						label: context.t('stationlabel.eventtitle'),
		// 						name: 'eventtitle',
		// 						placeholder: context.t('action.input'),
		// 						modelValue: context.model.eventtitle,
		// 						required: true,
		// 						isEdit: true,
		// 					},
		// 					{
		// 						default: () =>
		// 							context.uiBuilder.factory.textarea(context.model.eventtitle, {
		// 								modelValue: context.model.eventtitle,
		// 								rows: 5,
		// 								'onUpdate:modelValue': (value: string) => {
		// 									context.model.eventtitle = value;
		// 								},
		// 							}),
		// 				}
		// 				),
		// 				context.uiBuilder.factory.formItem(
		// 					{
		// 						id: 'search_eventtype',
		// 						label: context.t('stationlabel.eventtype'),
		// 						name: 'eventtype',
		// 						required: true,
		// 						isEdit: true,
		// 					},
		// 					{
		// 						default: () =>
		// 							context.uiBuilder.factory.select({
		// 								modelValue: context.model.eventtype,
		// 								options: eventtypeoption,
		// 								id: 'eventtype',
		// 								placeholder: context.t('action.select'),
		// 								dataKey: 'id',
		// 								optionLabel: 'label',
		// 								optionValue: 'value',
		// 								onUpdate: (value: string) => {
		// 									context.model.eventtype = value;
		// 								},
		// 							}),
		// 				}
		// 				),
		// 				context.uiBuilder.factory.formItem(
		// 					{
		// 						id: 'search_eventcause',
		// 						label: context.t('stationlabel.eventcause'),
		// 						name: 'eventcause',
		// 						required: true,
		// 						isEdit: true,
		// 						placeholder: context.t('action.input'),
		// 					},
		// 					{
		// 						default: () =>
		// 							context.uiBuilder.factory.checkboxGroup(context.model.eventcauselist, {
		// 								options: eventcauseoption.filter(item => item.value > 0).map(item => Object.assign({}, { id: item.value, lable: item.lable, name: item.lable, value: item.value })),
		// 								class: 'w-full',
		// 								onChange: (value: number[]) => {
		// 									context.model.eventcauselist = value;
		// 									context.model.eventcause = value.reduce((prev, curr) => prev | curr, 0);
		// 									// console.log(context.model.eventcauselist,)
		// 								},
		// 							}),
		// 				}
		// 				),
		// 			]);
		// 	},
		// });
		// context.uiBuilder.confirmDialog(h(eventdialog, {}), context, {
		// 	title: '事件报告',
		// 	class: '',
		// 	height: '15rem',
		// 	width: '60rem',
		// 	accept: async () => {
		// 		// console.log(context.model)
		// 		return await this.comfirmsubmitevent(context, taskID);
		// 	},
		// 	reject: () => {
		// 		context.globalProps.$toast.add({ severity: 'info', summary: context.t('action.cancel'), detail: context.t('failure.canceloperation'), life: 3000 });
		// 		return true;
		// 	},
		// });
	}
	/**
	 * 确认提交生产事件
	 * @param context
	 * @returns
	 */
	comfirmsubmitevent = async (context: UiContext<any>, taskID: any) => {
		//  console.log(context.model.eventtitle,)
		// reporteventparams.refID = context.globalProps.$route.params.id
		reporteventparams.refID = taskID;
		if (context.model.eventtitle && context.model.eventtype && context.model.eventcause) {
			await context.globalProps.$api
				.doAction(
					{
						repository: 'ProductionEvents',
						service: 'mes',
						action: 'create',
					},
					reporteventparams
				)
				.then(async (res: any) => {
					console.log(res, 'eventcreate');
					res.eventTitle = context.model.eventtitle;
					res.eventType = context.model.eventtype;
					res.eventCauses = context.model.eventcause;
					await context.globalProps.$api
						.doAction(
							{
								repository: 'ProductionEvents',
								service: 'mes',
								action: 'save',
							},
							res
						)
						.then((res: any) => {
							if (res) {
								context.model.eventcause = 0;
								context.model.eventtype = '';
								context.model.eventtitle = '';
								context.globalProps.$toast.add({ severity: 'success', summary: '成功', detail: '事件报告成功', life: 3000 });

								context.globalProps.$router.go(0);
								return true;
							} else {
								return true;
						}
						})
						.catch((error: any) => {
							context.globalProps.$toast.add({ severity: 'error', summary: '错误', group: 'br', detail: error.message, life: 3000 });
							return true;
						})
						.finally(() => {
							return true;
						});
				})
				.catch((error: any) => {
					context.globalProps.$toast.add({ severity: 'error', summary: '错误', group: 'br', detail: error.message, life: 3000 });
					return true;
				});
			return true;
		} else {
			context.globalProps.$toast.add({ severity: 'error', summary: '错误', group: 'br', detail: '必填项不能为空', life: 3000 });
		}
	};
	/**
	 * 报工
	 * @param context
	 */
	repotwork(context: UiContext<any>, reportparams: any, reportparamspath: any) {
		if (reportparamspath.objName == 'ProductionLot') {
			const ProductionLotdialog = defineComponent({
				name: 'ProductionLotdialog',
				setup() {
					return () =>
						h('div', { class: 'flex_wrap' }, [
							context.uiBuilder.factory.formItem(
								{
									label: context.t('stationlabel.batchesquantity'),
									// placeholder: context.t('action.input'),
									// modelValue: context.model.quantity,
									// required: true,
									// isEdit: true,
									// onUpdate: (val: string) => (context.model.quantity = Number(val)),
								},
								{
									default: () =>
										context.uiBuilder.factory.numberInput({
											min: 0,
											maxFractionDigits: 3,
											modelValue: context.model.quantity,
											onInput: (e: any) => (context.model.quantity = e.value),
										}),
							}
							),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.Batchnumber'),
								placeholder: context.t('action.input'),
								modelValue: context.model.lotNo,
								onUpdate: (val: string) => (context.model.lotNo = val),
							}),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.goodsQuality'),
								// placeholder: context.t('action.input'),
								// modelValue: context.model.goodQuantity,
								// onUpdate: (val: string) => (context.model.goodQuantity = Number(val)),
							}, {
								default: () =>
									context.uiBuilder.factory.numberInput({
										min: 0,
										maxFractionDigits: 3,
										modelValue: context.model.goodQuantity,
										placeholder: context.t('action.input'),
										// onInput: (e: any) => (context.model.goodQuantity = e.value),
										onUpdate: (val: number) => (context.model.goodQuantity = val),
									}),
							}),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.concessionQuantity'),
								// placeholder: context.t('action.input'),
								// modelValue: context.model.aucQuantity,
								// onUpdate: (val: string) => (context.model.aucQuantity = Number(val)),
							}, {
								default: () =>
									context.uiBuilder.factory.numberInput({
										min: 0,
										maxFractionDigits: 3,
										modelValue: context.model.aucQuantity,
										placeholder: context.t('action.input'),
										onUpdate: (val: number) => (context.model.aucQuantity = val),
									}),
							}),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.Quantityofdefectivegoods'),
								// placeholder: context.t('action.input'),
								// modelValue: context.model.defectiveQuantity,
								// onUpdate: (val: string) => (context.model.defectiveQuantity = Number(val)),
							}, {
								default: () =>
									context.uiBuilder.factory.numberInput({
										min: 0,
										maxFractionDigits: 3,
										modelValue: context.model.defectiveQuantity,
										placeholder: context.t('action.input'),
										onUpdate: (val: number) => (context.model.defectiveQuantity = val),
									}),
							}),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.Badquantity'),
								// placeholder: context.t('action.input'),
								// modelValue: context.model.ngQuantity,
								// onUpdate: (val: string) => (context.model.ngQuantity = Number(val)),
							}, {
								default: () =>
									context.uiBuilder.factory.numberInput({
										min: 0,
										maxFractionDigits: 3,
										modelValue: context.model.ngQuantity,
										placeholder: context.t('action.input'),
										onUpdate: (val: number) => (context.model.ngQuantity = val),
									}),
							}),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.Quantityofwasteproducts'),
								// placeholder: context.t('action.input'),
								// modelValue: context.model.scrapQuantity,
								// onUpdate: (val: string) => (context.model.scrapQuantity = Number(val)),
							}, {
								default: () =>
									context.uiBuilder.factory.numberInput({
										min: 0,
										maxFractionDigits: 3,
										modelValue: context.model.scrapQuantity,
										placeholder: context.t('action.input'),
										onUpdate: (val: number) => (context.model.scrapQuantity = val),
									}),
							}),
						]);
				},
			});
			// 弹窗
			context.uiBuilder.confirmDialog(h(ProductionLotdialog, {}), context, {
				title: '生产批次报工',
				height: '18rem',
				accept: async () => {
					return await this.submitProductionLot(context, reportparams);
				},

				// 报工取消操作
				reject: () => {
					context.model.quantity = 1;
					context.model.lotNo = '';
					context.model.goodQuantity = 0;
					context.model.aucQuantity = 0;
					context.model.defectiveQuantity = 0;
					context.model.ngQuantity = 0;
					context.model.scrapQuantity = 0;
					context.globalProps.$toast.add({ severity: 'info', summary: context.t('action.cancel'), detail: context.t('failure.canceloperation'), life: 3000 });
					return false;
				},
				// 关闭弹窗时同样重置数据
				onHide: () => {
					context.model.quantity = 1;
					context.model.lotNo = '';
					context.model.goodQuantity = 0;
					context.model.aucQuantity = 0;
					context.model.defectiveQuantity = 0;
					context.model.ngQuantity = 0;
					context.model.scrapQuantity = 0;
				}
			});
		}
		//Item报工由设备自动计划报工
		// else if (reportparamspath.objName == 'ProductionItem') {

		// 	const ProductionItemdialog = defineComponent({
		// 		name: 'ProductionLotdialog',
		// 		setup() {
		// 			return () =>
		// 				h('div', { class: 'flex flex-col flex_wrap' }, [
		// 					context.uiBuilder.factory.formItem({
		// 						label: '瑕疵数量',
		// 						placeholder: '请输入瑕疵数量',
		// 						modelValue: context.model.ngTimes,
		// 						onUpdate: (val: string) => (context.model.ngTimes = Number(val)),
		// 					}),
		// 				]);
		// 		},
		// 	});
		// 	context.uiBuilder.confirmDialog(h(ProductionItemdialog, {}), context, {
		// 		title: '报工',
		// 		accept: async () => {
		// 			// console.log(context.model)
		// 			return await this.submitProductionItem(context, reportparams);
		// 		},
		// 		reject: () => {
		// 			context.globalProps.$toast.add({ severity: 'error', summary: '取消', detail: context.t('failure.canceloperation'), life: 3000 });
		// 			return true
		// 		},
		// 	});
		// }
		else if (reportparamspath.objName == 'ProductionItem') {
			context.globalProps.$toast.add({ severity: 'info', summary: '提示', detail: '该任务是生产单件报工,由设备自动计数报工', life: 3000 });
		} else if (reportparamspath.objName == 'ProductionPlate') {
			context.model.quantity = null;
			context.model.packQty = null;
			const ProductionPlatedialog = defineComponent({
				name: 'ProductionPlatedialog',
				setup() {
					return () =>
						h('div', { class: 'flex flex-col' }, [
							context.uiBuilder.factory.formItem(
								{
									label: context.t('stationlabel.outputQuantity'),
									required: true,
									isEdit: true,
								},
								{
									default: () =>
										context.uiBuilder.factory.numberInput({
											modelValue: context.model.quantity,
											min: 0,
											placeholder: context.t('action.input'),
											onUpdate: (val: number) => { context.model.quantity = val; const perPack = Number(context.model.packQuantity) || 0; if (perPack > 0) context.model.packQty = Math.ceil((Number(val) || 0) / perPack); },
										}),
							}
							),
							context.uiBuilder.factory.formItem(
								{
									label: context.t('stationlabel.packagingQuantity'),
								},
								{
									default: () =>
										context.uiBuilder.factory.numberInput({
											modelValue: context.model.packQty,
											min: 0,
											placeholder: context.t('action.input'),
											onUpdate: (val: number) => { context.model.packQty = val; const perPack = Number(context.model.packQuantity) || 0; context.model.quantity = (Number(val) || 0) * perPack; },
										}),
							}
							),
							context.uiBuilder.factory.formItem({
								label: context.t('stationlabel.Batchnumber'),
								placeholder: context.t('action.input'),
								modelValue: context.model.lotNo,
								onUpdate: (val: string) => (context.model.lotNo = val),
							}),
							context.uiBuilder.factory.formItem(
								{
									label: context.t('stationlabel.Qualityinspectionresults'),
									modelValue: context.model.qcResult,
								},
								{
									default: () =>
										context.uiBuilder.factory.select({
											modelValue: context.model.qcResult,
											options: QaStatus,
											dataKey: 'id',
											placeholder: context.t('action.select'),
											optionLabel: 'label',
											optionValue: 'value',
											onUpdate: (value: string) => {
												context.model.qcResult = value;
											},
										}),
							}
							),
						]);
				},
			});
			context.uiBuilder.confirmDialog(h(ProductionPlatedialog, {}), context, {
				title: '生产货组报工',
				height: '15rem',
				accept: async () => {
					// console.log(context.model)
					return await this.submitProductionPlate(context, reportparams);
				},
				reject: () => {
					context.model.quantity = null;
					context.model.packQty = null;
					context.model.lotNo = '';
					context.globalProps.$toast.add({ severity: 'info', summary: context.t('action.cancel'), detail: context.t('failure.canceloperation'), life: 3000 });
					return false;
				},
				onHide: () => {
					context.model.quantity = null;
					context.model.packQty = null;
					context.model.lotNo = '';
				},
			});
		}
	}
	/**
	 * 生产批次报工
	 * @param context
	 * @param reportparams 报工参数
	 * @returns
	 */
	async submitProductionLot(context: UiContext<any>, reportparams: any) {
		if (!context.model.quantity || Number(context.model.quantity) <= 0) {
			context.globalProps.$toast.add({ severity: 'error', summary: '提示', group: 'br', detail: '批次数量不能为空且必须大于0', life: 3000 });
			return false;
		}
		if (Number(context.model.goodQuantity) > Number(context.model.quantity)) {
			context.globalProps.$toast.add({ severity: 'error', summary: '提示', group: 'br', detail: '优良品数量不能大于批次数量', life: 3000 });
			return false;
		}
		try {
			const res: any = await context.globalProps.$api.doAction(
				{ action: 'create', service: 'mes', repository: 'ProductionLots' },
				reportparams
			);
			res.quantity = context.model.quantity;
			res.goodQuantity = context.model.goodQuantity;
			res.aucQuantity = context.model.aucQuantity;
			res.defectiveQuantity = context.model.defectiveQuantity;
			res.ngQuantity = context.model.ngQuantity;
			res.scrapQuantity = context.model.scrapQuantity;
			if (context.model.lotNo) res.lotNo = context.model.lotNo;

			await context.globalProps.$api.doAction(
				{ action: 'save', service: 'mes', repository: 'ProductionLots' },
				res
			);
			context.globalProps.$toast.add({ severity: 'success', summary: context.t('dialog.success'), detail: '报工成功', life: 3000 });
			context.globalProps.$router.go(0);
			return true;
		} catch (error: any) {
			const detail = error.validationErrors?.length
				? error.validationErrors.map((e: any) => e.error).join('；')
				: error.message;
			context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail, life: 3000 });
			return false;
		}
	}
	/**
	 * 生产货组报工
	 * @returns
	 */
	async submitProductionPlate(context: UiContext<any>, reportparams: any) {
		if (!context.model.quantity || Number(context.model.quantity) <= 0) {
			context.globalProps.$toast.add({ severity: 'error', summary: '提示', group: 'br', detail: '产出数量不能为空且必须大于0', life: 3000 });
			return false;
		}
		try {
			const res: any = await context.globalProps.$api.doAction(
				{ action: 'create', service: 'mes', repository: 'ProductionPlates' },
				reportparams
			);
			res.quantity = context.model.quantity;
			res.packQty = context.model.packQty;
			res.lotNo = context.model.lotNo;
			res.qcResult = context.model.qcResult;
			await context.globalProps.$api.doAction(
				{ action: 'save', service: 'mes', repository: 'ProductionPlates' },
				res
			);
			context.globalProps.$toast.add({ severity: 'success', summary: context.t('dialog.success'), detail: '报工成功', life: 3000 });
			context.globalProps.$router.go(0);
			return true;
		} catch (error: any) {
			const detail = error.validationErrors?.length
				? error.validationErrors.map((e: any) => e.error).join('；')
				: error.message;
			context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail, life: 3000 });
			return false;
		}
	}
	//投料记录
	async Materialtrack(context: UiContext<any>, Materialtrackparams: any, data: any) {
		Materialtrackparams.refItemKeys = [
			{
				refName: 'productionTaskFeeding',
				refID: data.data.taskID,
				refItemID: data.data.itemID,
			},
		];
		if (data.data.tracingMode == 'LOT') {
			//批次追踪，投料量取已领取量
			await context.globalProps.$api
				.doAction(
					{
						action: 'create',
						repository: 'ProductionTaskFeedingNotes',
						service: 'mes',
					},
					Materialtrackparams
				)
				.then((res: any) => {
					// console.log(res);
					context.model.createMaterialtrack.list = res;
					context.model.createMaterialtrack.list.fedQuantity = data.data.reqQuantity;
				})
				.catch((error: any) => {
					context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail: error.message, life: 3000 });
				});
			context.uiBuilder.confirmDialog(
				h('div', { class: 'flex_wrap' }, [
					context.uiBuilder.factory.formItem({
						label: '物料名称',
						disabled: true,
						modelValue: data.data.materialName,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formItem({
						label: '物料编码',
						disabled: true,
						modelValue: data.data.materialCode,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formItem({
						label: '投料数量',
						modelValue: context.model.createMaterialtrack.list.fedQuantity,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.fedQuantity = val.trim();
						},
					}),
					context.uiBuilder.factory.formItem({
						label: '追溯码',
						modelValue: context.model.createMaterialtrack.list.traceCodes,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.traceCodes = val;
						},
					}),
					context.uiBuilder.factory.formItem({
						label: '制造厂家',
						modelValue: context.model.createMaterialtrack.list.manufacturer,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.manufacturer = val;
						},
					}),
					context.uiBuilder.factory.formItem(
						{
							label: '生产日期',
						},
						{
							default: () =>
								context.uiBuilder.factory.datePicker({
									modelValue: context.model.createMaterialtrack.list.prodDate,
									maxDate: maxDateprodDate.value,
									onUpdatePicker: (e: any) => {
										context.model.createMaterialtrack.list.prodDate = e.toSQLDate();
									},
								}),
					}
					),
					context.uiBuilder.factory.formItem(
						{
							label: '有效日期',
						},
						{
							default: () =>
								context.uiBuilder.factory.datePicker({
									modelValue: context.model.createMaterialtrack.list.expiryDate,
									minDate: minDateexpiryDate.value,
									onUpdatePicker: (e: any) => {
										context.model.createMaterialtrack.list.expiryDate = e.toSQLDate();
									},
								}),
					}
					),
				]),
				context,
				{
					title: '扫码投料',
					height: '3rem',
					accept: async () => {
						return await this.confirmMaterialtrack(context);
					},
					reject: () => {
						return true;
					},
				}
			);
		} else if (data.data.tracingMode == 'SN') {
			//序列号追踪，扫码多个序列号，逗号隔开，计算序列号数量
			await context.globalProps.$api
				.doAction(
					{
						action: 'create',
						repository: 'ProductionTaskFeedingNotes',
						service: 'mes',
					},
					Materialtrackparams
				)
				.then((res: any) => {
					// console.log(res);
					context.model.createMaterialtrack.list = res;
					// createMaterialtrack.list.fedQuantity = 1;
				})
				.catch((error: any) => {
					context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail: error.message, life: 3000 });
				});
			context.uiBuilder.confirmDialog(
				h('div', { class: 'flex_wrap' }, [
					context.uiBuilder.factory.formItem({
						label: '物料名称',
						disabled: true,
						modelValue: data.data.materialName,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formItem({
						label: '物料编码',
						disabled: true,
						modelValue: data.data.materialCode,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formItem({
						label: '投料数量',
						modelValue: context.model.createMaterialtrack.list.fedQuantity,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.fedQuantity = val.trim();
						},
					}),
					context.uiBuilder.factory.formItem({
						label: '追溯码',
						modelValue: context.model.createMaterialtrack.list.traceCodes,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.traceCodes = val;
						},
						// onInput: (e: any) => {
						// 	let value = e.target.value;
						// 	let comma = value.split(',').map((item: any) => {
						// 		return item.trim();
						// 	});
						// 	console.log(value,comma);
						// },
					}),
					context.uiBuilder.factory.formItem({
						label: '制造厂家',
						modelValue: context.model.createMaterialtrack.list.manufacturer,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.manufacturer = val;
						},
					}),
					context.uiBuilder.factory.formItem(
						{
							label: '生产日期',
						},
						{
							default: () =>
								context.uiBuilder.factory.datePicker({
									modelValue: context.model.createMaterialtrack.list.prodDate,
									maxDate: maxDateprodDate.value,
									onUpdatePicker: (e: any) => {
										context.model.createMaterialtrack.list.prodDate = e.toSQLDate();
									},
								}),
					}
					),
					context.uiBuilder.factory.formItem(
						{
							label: '有效日期',
						},
						{
							default: () =>
								context.uiBuilder.factory.datePicker({
									modelValue: context.model.createMaterialtrack.list.expiryDate,
									minDate: minDateexpiryDate.value,
									onUpdatePicker: (e: any) => {
										context.model.createMaterialtrack.list.expiryDate = e.toSQLDate();
									},
								}),
					}
					),
				]),
				context,
				{
					title: '扫码投料',
					height: '3rem',
					accept: async () => {
						return await this.confirmMaterialtrack(context);
					},
					reject: () => {
						return true;
					},
				}
			);
		} else {
			//无追踪方式
			await context.globalProps.$api
				.doAction(
					{
						action: 'create',
						repository: 'ProductionTaskFeedingNotes',
						service: 'mes',
					},
					Materialtrackparams
				)
				.then((res: any) => {
					// console.log(res);
					context.model.createMaterialtrack.list = res;
					context.model.createMaterialtrack.list.fedQuantity = 1;
				})
				.catch((error: any) => {
					context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail: error.message, life: 3000 });
				});
			context.uiBuilder.confirmDialog(
				h('div', { class: 'flex_wrap' }, [
					context.uiBuilder.factory.formItem({
						label: '物料名称',
						disabled: true,
						modelValue: data.data.materialName,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formItem({
						label: '物料编码',
						disabled: true,
						modelValue: data.data.materialCode,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formItem({
						label: '投料数量',
						modelValue: context.model.createMaterialtrack.list.fedQuantity,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.fedQuantity = val.trim();
						},
					}),
					context.uiBuilder.factory.formItem({
						label: '追溯码',
						id: 'scanInput',
						modelValue: context.model.createMaterialtrack.list.traceCodes,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.traceCodes = val;
						},
						onInput: (e: any) => {
							const value = e.target.value;
							const comma = e.target.value.split(',');

							console.log(value, comma, comma.length);
							if (comma && comma.length > 0) {
								context.model.createMaterialtrack.list.fedQuantity = comma.length;
								console.log(comma.length, context.model.createMaterialtrack.list.fedQuantity);
						}
						},
					}),
					context.uiBuilder.factory.formItem({
						label: '制造厂家',
						modelValue: context.model.createMaterialtrack.list.manufacturer,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.manufacturer = val;
						},
					}),
					context.uiBuilder.factory.formItem(
						{
							label: '生产日期',
						},
						{
							default: () =>
								context.uiBuilder.factory.datePicker({
									modelValue: context.model.createMaterialtrack.list.prodDate,
									maxDate: maxDateprodDate.value,
									onUpdatePicker: (e: any) => {
										context.model.createMaterialtrack.list.prodDate = e.toSQLDate();
									},
								}),
					}
					),
					context.uiBuilder.factory.formItem(
						{
							label: '有效日期',
						},
						{
							default: () =>
								context.uiBuilder.factory.datePicker({
									modelValue: context.model.createMaterialtrack.list.expiryDate,
									minDate: minDateexpiryDate.value,
									onUpdatePicker: (e: any) => {
										context.model.createMaterialtrack.list.expiryDate = e.toSQLDate();
									},
								}),
					}
					),
				]),
				context,
				{
					title: '扫码投料',
					height: '10rem',
					accept: async () => {
						return await this.confirmMaterialtrack(context);
					},
					reject: () => {
						return true;
					},
				}
			);
		}
	}
	async confirmMaterialtrack(context: UiContext<any>) {
		if (!context.model.createMaterialtrack.list.fedQuantity)
			return context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail: context.t('stationlabel.inputfedQuantity'), life: 3000 });
		await context.globalProps.$api
			.doAction(
				{
					action: 'save',
					repository: 'ProductionTaskFeedingNotes',
					service: 'mes',
				},
				context.model.createMaterialtrack.list
			)
			.then((res: any) => {
				if (res) {
					context.globalProps.$toast.add({ severity: 'success', summary: context.t('dialog.success'), detail: context.t('success.operationSuccessful'), life: 3000 });
					context.globalProps.$router.go(0);
					return true;
				}
			})
			.catch((error: any) => {
				context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), group: 'br', detail: error.message, life: 3000 });
				return true;
			});
		return true;
	}
	/**
	 * 生产单件报工
	 */
	// async submitProductionItem(context: UiContext, reportparams: any) {
	// 	await context.globalProps.$api
	// 		.doAction(
	// 			{
	// 				action: 'create',
	// 				service: 'mes',
	// 				repository: 'ProductionItems',
	// 			},
	// 			reportparams
	// 		)
	// 		.then(async (res: any) => {
	// 			res.ngTimes = context.model.ngTimes;
	// 			await context.globalProps.$api
	// 				.doAction(
	// 					{
	// 						action: 'save',
	// 						service: 'mes',
	// 						repository: 'ProductionItems',
	// 					},
	// 					res
	// 				)
	// 				.then((result: any) => {
	// 					context.globalProps.$toast.add({ severity: 'success', summary: context.t('dialog.success'), detail: '报工成功', life: 3000 });
	// 					context.globalProps.$router.go(0)
	// 					return true;
	// 				})
	// 				.catch((error: any) => {
	// 					context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), detail: error.message, life: 3000 });
	// 				})
	// 				.finally(() => {
	// 					return true;
	// 				});
	// 		})
	// 		.catch((error: any) => {
	// 			context.globalProps.$toast.add({ severity: 'error', summary: context.t('dialog.title.error'), detail: error.message, life: 3000 });
	// 			return true;
	// 		});
	// 	return true;
	// }

	// /**
	//  * 组盘创建/提交（生产准备环节）
	//  */
	// async createGroupDisk(context: UiContext, groupDiskParams: any) {
	// 	const { uiBuilder, globalProps } = context;
	// 	const { $toast, $logger } = globalProps || {}; // 增加空值判断，避免报错

	// 	// 1. 操作配置
	// 	const groupDiskAction: EntityAction = {
	// 		name: "createGroupDisk",
	// 		label: "组盘确认",
	// 		icon: "pi pi-box", 
	// 		group: "productionPrepare",
	// 		description: "生产准备-组盘创建（绑定生产单件与器具）",
	// 		param: {
	// 			type: "execute",
	// 			prompt: context.t("GROUP_DISK_CONFIRM") || "确认创建组盘？", // 适配国际化
	// 			value: null,
	// 			hint: context.t("INFO") || "创建后将同步至立库"
	// 		}
	// 	};

	// 	let groupDiskCtx: UiContext | null = null; // 明确类型，避免null报错

	// 	return uiBuilder.confirmDialog(
	// 		h(
	// 			Suspense,
	// 			{},
	// 			{
	// 				default: () =>
	// 					h(ProductionItemEditor, {
	// 						id: `groupDisk_${Date.now()}`, // 增加唯一ID，便于追踪
	// 						view: UI_CREATE,
	// 						editing: true,
	// 						isEditDialog: true,
	// 						params: {
	// 							...groupDiskParams,
	// 							toolMaterialTypes: ['模具', '砂箱'], // 限定器具类型
	// 							// 补充生产上下文参数，减少编辑器内二次获取
	// 							productionLine: context.model?.productionLine || '',
	// 							stationId: globalProps?.stationId || ''
	// 						},
	// 						showToolbar: false,
	// 						attachmentsCollapsed: true,
	// 						onMountedSuccess: (ctx: UiContext) => {
	// 							groupDiskCtx = ctx;
	// 						},
	// 						// 增加错误捕获
	// 						onError: (err: any) => {
	// 							$logger?.error("组盘编辑器加载失败", err);
	// 							$toast?.add({
	// 								severity: 'error',
	// 								summary: context.t('error.loadFailed'),
	// 								detail: context.t('error.editorLoadError'),
	// 								life: 5000
	// 							});
	// 					}
	// 					}),
	// 				// 增加加载占位
	// 				fallback: () => h('div', { class: 'p-4' }, context.t('loading.groupDiskEditor'))
	// 			}
	// 		),
	// 		context,
	// 		{
	// 			title:'生产准备-组盘创建',
	// 			height: '70vh',
	// 			width: '85vw',
	// 			accept: async () => {
	// 				if (!groupDiskCtx) {
	// 					$toast?.add({
	// 						severity: 'error',
	// 						summary: context.t('error.invalidContext'),
	// 						detail: context.t('error.noEditorContext'),
	// 						life: 3000
	// 					});
	// 					return false;
	// 				}

	// 				try {
	// 					// 保存组盘数据，增加加载状态提示
	// 					$toast?.add({
	// 						severity: 'info',
	// 						summary: context.t('info.saving'),
	// 						detail: context.t('info.savingGroupDisk'),
	// 						life: 0 // 不自动关闭，保存完成后手动关闭
	// 					});

	// 					const res = await groupDiskCtx.save();

	// 					// 关闭保存提示
	// 					$toast?.removeAll();

	// 					if (res?.success) {
	// 						// 物料转器具（保留注释，需要时解开）
	// 						// const materials = groupDiskCtx.model?.selectedMaterials || [];
	// 						// if (materials.length > 0) {
	// 						//   await convertMaterialToTool(groupDiskCtx, materials);
	// 						// }
	// 						return true;
	// 					} else {
	// 						$toast?.add({
	// 							severity: 'error',
	// 							summary: context.t('failure.saveFailed'),
	// 							detail: res?.message || context.t('failure.unknownError'),
	// 							life: 5000
	// 						});
	// 						return false;
	// 				}
	// 				} catch (err: any) {
	// 					$toast?.removeAll();
	// 					$logger?.error("组盘保存失败", err);
	// 					$toast?.add({
	// 						severity: 'error',
	// 						summary: context.t('failure.saveError'),
	// 						detail: err.message || context.t('failure.operationFailed'),
	// 						life: 5000
	// 					});
	// 					return false;
	// 				}
	// 			},
	// 			reject: () => {
	// 				$toast?.add({
	// 					severity: 'info',
	// 					summary: context.t('action.cancel'),
	// 					detail: context.t('failure.cancelGroupDisk'),
	// 					life: 3000
	// 				});
	// 				return false;
	// 			},
	// 		}
	// 	).then((res: boolean) => {
	// 		if (res && groupDiskCtx) { // 增加groupDiskCtx存在性判断
	// 			return groupDiskCtx.prepareFn(groupDiskAction)
	// 				.then((prepareRes: any) => {
	// 					return new Promise<boolean>((resolve, reject) => {
	// 						uiBuilder.buildNotice(groupDiskCtx!, { // 非空断言（已判断存在）
	// 							action: groupDiskAction,
	// 							prepareData: prepareRes,
	// 							onSubmit: (data: any) => {
	// 								groupDiskAction.param = { ...groupDiskAction.param, ...data }; // 合并参数
	// 							},
	// 							onHide: async () => {
	// 								try {
	// 									await groupDiskCtx!.logic.doAction(groupDiskCtx!.model, groupDiskAction);
	// 									$toast?.add({
	// 										severity: 'success',
	// 										summary: context.t('success.groupDiskCreated'),
	// 										detail: context.t('success.groupDiskBindSuccess'),
	// 										life: 3000
	// 									});
	// 									resolve(true);
	// 								} catch (err: any) {
	// 									$logger?.error("组盘提交后操作失败", err);
	// 									$toast?.add({
	// 										severity: 'error',
	// 										summary: context.t('failure.postOperationFailed'),
	// 										detail: err.message || context.t('failure.tryAgainLater'),
	// 										life: 5000
	// 									});
	// 									resolve(false); // 此处用resolve避免Promise链中断
	// 							}
	// 							},
	// 							reject: () => {
	// 								$toast?.add({
	// 									severity: 'info',
	// 									summary: context.t('action.cancel'),
	// 									detail: context.t('failure.operationCancelled'),
	// 									life: 3000
	// 								});
	// 								reject(false);
	// 							},
	// 						});
	// 					});
	// 				})
	// 				.catch((err: any) => {
	// 					$logger?.error("组盘准备函数执行失败", err);
	// 					$toast?.add({
	// 						severity: 'error',
	// 						summary: context.t('failure.prepareFailed'),
	// 						detail: err.message || context.t('failure.operationFailed'),
	// 						life: 5000
	// 					});
	// 					return false;
	// 				});
	// 		}
	// 		return false;
	// 	});
	// }

	// 物料转器具
	// async function convertMaterialToTool(context: UiContext, materials: any[]) {
	//   const { globalProps } = context;
	//   const { $api, $toast, $logger } = globalProps;
	//   try {
	//     const res = await $api.post('/api/tool/materialToTool', {
	//       materials: materials.map(m => ({
	//         materialId: m.id,
	//         toolName: m.name,
	//         toolType: m.type
	//       }))
	//     });
	//     if (!res.success) {
	//       throw new Error(res.message || '物料转器具失败');
	//     }
	//   } catch (err: any) {
	//     $logger.error('物料转器具接口调用失败', err);
	//     $toast.add({
	//       severity: 'error',
	//       summary: '物料转器具失败',
	//       detail: err.message || '请联系管理员处理',
	//       life: 5000
	//     });
	//     throw err; // 抛出错误，中断后续流程
	//   }
	// }


	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('lineID')
					.searchable(true)
					.setSearchParam((ctx, model) => {
						return { status: 'USED' };
					}),
				// this.field('opCode').searchable(true).setSearchParam((context, model) => {
				// 	const lineItem = context.searchFields.filter((item: any) => item.field.fieldName === 'lineID')
				// 	return { lineID: lineItem[0].searchValue ?? '' }
				// })
				// this.field('equippingType').searchable(true)
			);
		}
		return { fields, groups, customActions };
	}
	async getAll(param: any) {
		// console.log(this.searchParams)

		const res = await super.getAll({
			...param,
			pager: {
				pageSize: 100,
			},
			// queryParams:
			// {
			// 	...param.queryParams,
			// 	planID: this.searchParams.planID?.['planID'] ?? '',
			// 	taskID: this.searchParams.taskID?.['taskID'] ?? ''
			// }
		});
		return res;
	}

	/**
	 * 生产计划
	 * @param context
	 * @param value
	 */
	async getAllplan(context: UiContext<any>, value?: any) {
		await context.globalProps.$api
			.getAll({
				repository: 'ProductionPlans',
				service: 'mes',
				queryParams: {
					pageSize: searchParamplan.pager.pageSize,
					pageNo: searchParamplan.pager.pageNo,
					sort: '',
					searchWord: value,
					planID: context.model.taskPlanID ?? ''
				},
			})
			.then((res: any) => {
				searchParamplan.pager = res.pagination;
				tableDataplan.value = res.list.map((it: any) => {
					return { ...it, status: it.customProperties.$status };
				});
				// console.log(tableDataplan.value,'计划list')
			});
	}
	/**
	 * 生产任务
	 * @param context
	 * @param value
	 */
	async getAlltask(context: UiContext<any>, value?: any) {
		await context.globalProps.$api
			.getAll({
				repository: 'ProductionTasks',
				service: 'mes',
				queryParams: {
					pageSize: searchParamtask.pager.pageSize,
					pageNo: searchParamtask.pager.pageNo,
					sort: '',
					searchWord: value,
					planID: context.model.planID ?? ''
				},
			})
			.then((res: any) => {
				searchParamtask.pager = res.pagination;
				tableDatatask.value = res.list.map((it: any) => {
					return {
						...it,

						status: it.customProperties.$status,
						constraintType: it.customProperties.$constraintType,
						priority: it.customProperties.$priority,

					};
				});
				// console.log(tableDatatask.value,'任务list')
			});
	}
	/**
	 * 生产计划、生产任务参数：planID={planID}&taskID={taskID}
	 * @returns
	 */
	searchParam: Record<string, any> = {};
	beforeSearch() {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push(
				{
					searchLabel: '生产计划',
					searchParam: 'planID',
					valueFn: (v: any) => v.planID,
					renderer: (ctx: UiBuildContext<any> & any, csf) => {
						if (!tableDataplan.value.length && isObject(csf.searchVal.value)) {
							tableDataplan.value.push(csf.searchVal.value)
					}
						return ctx.uiBuilder.factory.searchForRelative(
							{
								modelValue: csf.searchWord,
								placeholder: ctx.t('action.select'),
								dataKey: 'planID',
								optionLabel: 'planNo',
								options: tableDataplan.value,
								toSearch: async (event: Event) => {
									let data = null as any;
									const { metaui } = await ctx.logic!.loadMetadata('ProductionPlans', 'mes', true);
									tableDataKEYplan.value = metaui.primaryKey;
									tablecolumnsplan.value = await ctx.uiBuilder.buildColumns(metaui, ctx, {
										isSearch: true,
										cacheKey: `planID/SearchRelative/${metaui.primaryKey}`,
									});
									// await this.getAllplan(ctx, '');
									ctx.uiBuilder.confirmDialog(
										ctx.uiBuilder.buildSearchForRelativeContent(
											tablecolumnsplan.value,
											{
												dataKey: tableDataKEYplan.value,
												onSearch: async (params: any) => {
													const { searchParams, reload, pager } = params;
													await this.getAllplan(ctx, searchParams.searchWord);
													return { list: tableDataplan.value, pager: searchParamplan.pager };
												},
												onPage: ({ pageNo, pageSize }: any) => {
													searchParamplan.pager.pageNo = pageNo;
													searchParamplan.pager.pageSize = pageSize;
												},
												onSelect: (selection: any, row: any) => {
													// console.log(selection, row, '选择')
													data = row;
												},
												onRowDblclick: (row: any, index: number) => {
													csf.searchVal.value = csf.searchWord.value = row
													ctx.app.localDb.put(
														`search/${ctx.logic.repository}/planID`,
														JSON.parse(JSON.stringify(row))
													)
													triggerEscKey()
												},
										}
										),
										ctx,
										{
											title: '选择一个生产计划',
											style: { width: '80vw', maxHeight: '95%' },
											accept: async () => {
												if (!data?.planID) {
													ctx.globalProps.$toast.add({ severity: 'error', summary: '提示', group: 'br', detail: '必须选择其中一项', life: 3000 });
													return false;
											}
												csf.searchWord.value = csf.searchVal.value = data;
												ctx.model.planID = data.planID ?? ctx.model.planID;
												ctx.model.planNo = data.planNo ?? ctx.model.planNo;
												this.searchParam.planID = ctx.model.planID;
												ctx.app.localDb.put(`search/${ctx.logic.repository}/planID`, JSON.parse(JSON.stringify(data)));
												// ctx.addQueryParam('planID', this.searchParams.planID?.['planID']);
												return true;
											},
									}
									);
								},
								onChange: (value: any) => {
									csf.searchWord.value = csf.searchVal.value = value
									ctx.app.localDb.put(`search/${ctx.logic.repository}/planID`, JSON.parse(JSON.stringify(isObject(csf.searchVal.value) ? csf.searchVal.value : null)));
									if (!value) {
										ctx.model.planID = ''
								}
								},
								onInput: (value: string) => {
									if (csf.isComposing) return;
									debounce(async () => {
										await this.getAllplan(ctx, value);
									}, 500)();
								},
								onCompositionstart: () => {
									csf.isComposing = true;
								},
								onCompositionend: (e: any) => {
									csf.searchWord.value = e.target.value
									debounce(async () => {
										await this.getAllplan(ctx, e.target.value);
									}, 500)();
									csf.isComposing = false;
								},
							},
							{}
						)
					},
				},
				{
					searchLabel: '生产任务',
					searchParam: 'taskID',
					valueFn: (v: any) => v.taskID,
					renderer: (ctx: UiBuildContext<any> & any, csf) => {
						if (!tableDatatask.value.length && isObject(csf.searchVal.value)) {
							tableDatatask.value.push(csf.searchVal.value)
					}

						return ctx.uiBuilder.factory.searchForRelative(
							{
								modelValue: csf.searchWord,
								placeholder: ctx.t('action.select'),
								dataKey: 'taskID',
								optionLabel: (v: any) => v.taskNo,
								//options: tableDatatask.value,
								options: tableDatatask.value,
								toSearch: async (event: Event) => {
									let data = null as any;
									const { metaui } = await ctx.logic!.loadMetadata('ProductionTasks', 'mes', true);
									tableDataKEYtask.value = metaui.primaryKey;
									tablecolumnstask.value = await ctx.uiBuilder.buildColumns(metaui, ctx, {
										isSearch: true,
										cacheKey: `taskID/SearchRelative/${metaui.primaryKey}`,
									});
									// await this.getAlltask(ctx, '');
									ctx.uiBuilder.confirmDialog(
										ctx.uiBuilder.buildSearchForRelativeContent(
											tablecolumnstask.value,
											{
												dataKey: tableDataKEYtask.value,
												onSearch: async (params: any) => {
													const { searchParams, reload, pager } = params;
													await this.getAlltask(ctx, searchParams.searchWord);
													return { list: tableDatatask.value, pager: searchParamtask.pager };
												},
												onPage: ({ pageNo, pageSize }: any) => {
													searchParamtask.pager.pageNo = pageNo;
													searchParamtask.pager.pageSize = pageSize;
												},
												onSelect: (selection: any, row: any) => {
													data = row;
												},
												onRowDblclick: (row: any, index: number) => {
													csf.searchVal.value = csf.searchWord.value = row
													ctx.app.localDb.put(
														`search/${ctx.logic.repository}/taskID`,
														JSON.parse(JSON.stringify(row))
													)
													triggerEscKey()
												},
										}
										),
										ctx,
										{
											title: '选择一个生产任务',
											style: { width: '80vw', maxHeight: '95%' },
											accept: async () => {
												if (!data?.taskID) {
													ctx.globalProps.$toast.add({ severity: 'error', summary: '提示', group: 'br', detail: '必须选择其中一项', life: 3000 });
													return false;
											}
												csf.searchWord.value = csf.searchVal.value = data ?? null;
												ctx.model.taskID = data.taskID ?? ctx.model.taskID;
												ctx.model.taskNo = data.taskNo ?? ctx.model.taskNo;
												ctx.model.taskPlanID = data.planID ?? ctx.model.planID;
												this.searchParam.taskID = ctx.model.taskID;
												ctx.app.localDb.put(`search/${ctx.logic.repository}/taskID`, JSON.parse(JSON.stringify(data)));
												//  ctx.addQueryParam('taskID', this.searchParams.taskID?.['taskID']);
												return true;
											},
									}
									);
								},
								onChange: (value: any) => {
									csf.searchWord.value = csf.searchVal.value = value
									ctx.app.localDb.put(`search/${ctx.logic.repository}/taskID`, JSON.parse(JSON.stringify(isObject(csf.searchVal.value) ? csf.searchVal.value : null)));
									if (!value) {
										ctx.model.taskPlanID = ''
								}
								},
								onInput: (value: string) => {
									if (csf.isComposing) return;
									debounce(async () => {
										await this.getAlltask(ctx, value);
									}, 500)();
								},
								onCompositionstart: () => {
									csf.isComposing = true;
								},
								onCompositionend: (e: any) => {
									csf.searchWord.value = e.target.value
									debounce(async () => {
										await this.getAlltask(ctx, e.target.value);
									}, 500)();
									csf.isComposing = false;
								},
							},
							{}
						)
					},
				}
			);
		}
		this.searchParam = searchParam;
		return { searchFields, customSearchFields };
	}
	/**
	 *
	 * @param appContext
	 * @param searchParam
	 */

	goDetail(id: any) {
		// console.log(id)
		// window.location.href = `MES/StationPortals/${id}`
		// this.router.push({ name: 'StationPortal', params: { id } })
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
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造智能工位交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const StationPortalLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new StationPortalLogic({
		service: metaUiService,
		repository: 'StationPortals',
		router,
		module: module || metaUiService.findModule('StationPortal'),
	});
//#endregion ~GENERATED PARTS END
