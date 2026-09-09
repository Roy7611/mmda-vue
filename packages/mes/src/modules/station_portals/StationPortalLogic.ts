/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { MetaUiService, Module, EntityAction, type UiContext, MetaModel, debounce, isNullOrUndefined, triggerEscKey, isNullObject } from '@mmda/core';
import { type EntityLogicInit, EntityLogic, UiBuildContext, UI_BUILDER_KEY, SubEntityLogic, UiViewOne, UI_CREATE, type UiLogicFnResult, UiAction } from '@mmda/vui';
import { type StationPortal, defineStationPortal } from '@/models/StationPortal';
import { isObject } from 'lodash';
import { productionEventEditorNode } from '@/modules/production_events/ProductionEventEditor';
import { ProductionItemEditor } from '@/modules/production_items/ProductionItemEditor';
import { productionLotReportNode, productionPlateReportNode, stationPortalFormWrap } from './station_portal_nodes';
import { ProductionEventLogic, ProductionEventLogicCtor } from '@/modules/production_events/ProductionEventLogic';


const tableDataplan = { value: [] };
const tablecolumnsplan = { value: [] };
const tableDataKEYplan = { value: 'id' };
const searchParamplan = {
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
const tableDatatask = { value: [] };
const tablecolumnstask = { value: [] };
const tableDataKEYtask = { value: 'id' };
const searchParamtask = {
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
const eventtypeoption = [
	{ label: 'stationlabel.eventLevelInfo', value: 'INFO', id: 0 },
	{ label: 'stationlabel.eventLevelSuccess', value: 'SUCCESS', id: 1 },
	{ label: 'stationlabel.eventLevelWarning', value: 'WARNING', id: 2 },
	{ label: 'stationlabel.eventLevelDanger', value: 'DANGER', id: 4 },
];

const eventcauseoption = [
	{ lable: '-', name: 'NONE', value: 0 },
	{ lable: 'stationlabel.eventCauseMan', name: 'MAN', value: 1 },
	{ lable: 'stationlabel.eventCauseEquipment', name: 'EQUIP', value: 2 },
	{ lable: 'stationlabel.eventCauseMaterial', name: 'MATERIAL', value: 4 },
	{ lable: 'stationlabel.eventCauseDesign', name: 'DESIGN', value: 8 },
	{ lable: 'stationlabel.eventCauseProcess', name: 'PROCESS', value: 16 },
	{ lable: 'stationlabel.eventCauseQuality', name: 'QC', value: 32 },
	{ lable: 'stationlabel.eventCauseOther', name: 'OTHER', value: 128 },
];
const reporteventparams = {
	refID: '',
	// refID: context.globalProps.$route.params.id,
	refItemKeys: <any>null,
	refName: 'ProductionTask',
};
const minDateexpiryDate = { value: new Date() };
const maxDateprodDate = { value: new Date() };
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
export class StationPortalLogic extends EntityLogic<StationPortal> {
	static getAllplan() {
		throw new Error('Method not implemented.');
	}
	allstations: any;
	constructor(init: EntityLogicInit) {
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
			label: "action.report",
			icon: null,
			group: null,
			description: "action.reportProductionEvent",
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
		return uiBuilder.dialog(
			productionEventEditorNode({
							id: '_',
							view: UI_CREATE,
							editing: true,
							isEditDialog: true,
							params: reporteventparams,
							showToolbar: false,
							attachmentsCollapsed: true,
							onMountedSuccess: (ctx: UiContext) => {
								eventCtx = ctx as UiBuildContext<any> & {
									prepareFn(action: EntityAction): Promise<any>;
								};
							},
			}),
			context,
			{
				title: context.t('stationlabel.productionEvent'),
				height: '65vh',
				width: '80vw',
				onAccept: async (button) => {
				  if (eventCtx) {
						return await eventCtx.save().then((res: any) => true);
				}
				}
			}
		).then((res) => {
			if (res === 'ok') {
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
		// 				context.uiBuilder.factory.formField(
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
		// 							context.uiBuilder.factory.textArea({
		// 								value: context.model.eventtitle,
		// 								rows: 5,
		// 								onChange: (value: string) => {
		// 									context.model.eventtitle = value;
		// 								},
		// 							}),
		// 				}
		// 				),
		// 				context.uiBuilder.factory.formField(
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
		// 				context.uiBuilder.factory.formField(
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
		// context.uiBuilder.dialog(h(eventdialog, {}), context, {
		// 	title: '事件报告',
		// 	class: '',
		// 	height: '15rem',
		// 	width: '60rem',
		// 	onAccept: async () => {
		// 		// console.log(context.model)
		// 		return await this.comfirmsubmitevent(context, taskID);
		// 	},
		// 	reject: () => {
		// 		context.uiBuilder.toast(context, { severity: 'info', title: context.t('action.cancel'), message: context.t('failure.canceloperation'), life: 3000 });
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
			await this.apiClient
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
					await this.apiClient
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
								context.uiBuilder.toast(context, { severity: 'success', title: context.t('dialog.title.success'), message: context.t('success.eventReported'), life: 3000 });

								context.globalProps.$router.go(0);
								return true;
							} else {
								return true;
						}
						})
						.catch((error: any) => {
							context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
							return true;
						})
						.finally(() => {
							return true;
						});
				})
				.catch((error: any) => {
					context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
					return true;
				});
			return true;
		} else {
			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: context.t('stationlabel.Requiredfieldscannotbeblank'), life: 3000 });
		}
	};
	/**
	 * 报工
	 * @param context
	 */
	repotwork(context: UiContext<any>, reportparams: any, reportparamspath: any) {
		if (reportparamspath.objName == 'ProductionLot') {
			context.uiBuilder.dialog(productionLotReportNode(context), context, {
				title: context.t('stationlabel.batchReport'),
				height: '18rem',
				onAccept: async (button) => {
					if (button === 'cancel') {
						context.model.quantity = 1;
						context.model.lotNo = '';
						context.model.goodQuantity = 0;
						context.model.aucQuantity = 0;
						context.model.defectiveQuantity = 0;
						context.model.ngQuantity = 0;
						context.model.scrapQuantity = 0;
						context.uiBuilder.toast(context, { severity: 'info', title: context.t('action.cancel'), message: context.t('failure.canceloperation'), life: 3000 });
						return true;
					}
					return await this.submitProductionLot(context, reportparams);
				},
				onClose: () => {
					context.model.quantity = 1;
					context.model.lotNo = '';
					context.model.goodQuantity = 0;
					context.model.aucQuantity = 0;
					context.model.defectiveQuantity = 0;
					context.model.ngQuantity = 0;
					context.model.scrapQuantity = 0;
				},
			});
		}
		//Item报工由设备自动计划报工
		// else if (reportparamspath.objName == 'ProductionItem') {

		// 	const ProductionItemdialog = defineComponent({
		// 		name: 'ProductionLotdialog',
		// 		setup() {
		// 			return () =>
		// 				h('div', { class: 'flex flex-col flex_wrap' }, [
		// 					context.uiBuilder.factory.formField({
		// 						label: '瑕疵数量',
		// 						placeholder: '请输入瑕疵数量',
		// 						modelValue: context.model.ngTimes,
		// 						onUpdate: (val: string) => (context.model.ngTimes = Number(val)),
		// 					}),
		// 				]);
		// 		},
		// 	});
		// 	context.uiBuilder.dialog(h(ProductionItemdialog, {}), context, {
		// 		title: '报工',
		// 		onAccept: async () => {
		// 			// console.log(context.model)
		// 			return await this.submitProductionItem(context, reportparams);
		// 		},
		// 		reject: () => {
		// 			context.uiBuilder.toast(context, { severity: 'error', title: '取消', message: context.t('failure.canceloperation'), life: 3000 });
		// 			return true
		// 		},
		// 	});
		// }
		else if (reportparamspath.objName == 'ProductionItem') {
			context.uiBuilder.toast(context, { severity: 'info', title: context.t('dialog.title.prompt'), message: context.t('stationlabel.singlePieceAutoReport'), life: 3000 });
		} else if (reportparamspath.objName == 'ProductionPlate') {
			context.model.quantity = null;
			context.model.packQty = null;
			context.uiBuilder.dialog(productionPlateReportNode(context), context, {
				title: context.t('stationlabel.lotReport'),
				height: '15rem',
				onAccept: async (button) => {
					if (button === 'cancel') {
						context.model.quantity = null;
						context.model.packQty = null;
						context.model.lotNo = '';
						context.uiBuilder.toast(context, { severity: 'info', title: context.t('action.cancel'), message: context.t('failure.canceloperation'), life: 3000 });
						return true;
					}
					return await this.submitProductionPlate(context, reportparams);
				},
				onClose: () => {
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
			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.prompt'), message: context.t('stationlabel.batchQuantityPositive'), life: 3000 });
			return false;
		}
		if (Number(context.model.goodQuantity) > Number(context.model.quantity)) {
			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.prompt'), message: context.t('stationlabel.goodQuantityTooLarge'), life: 3000 });
			return false;
		}
		try {
			const res: any = await this.apiClient.doAction(
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

			await this.apiClient.doAction(
				{ action: 'save', service: 'mes', repository: 'ProductionLots' },
				res
			);
			context.uiBuilder.toast(context, { severity: 'success', title: context.t('dialog.success'), message: context.t('success.workReported'), life: 3000 });
			context.globalProps.$router.go(0);
			return true;
		} catch (error: any) {
			const detail = error.validationErrors?.length
				? error.validationErrors.map((e: any) => e.error).join('；')
				: error.message;
			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: detail, life: 3000 });
			return false;
		}
	}
	/**
	 * 生产货组报工
	 * @returns
	 */
	async submitProductionPlate(context: UiContext<any>, reportparams: any) {
		if (!context.model.quantity || Number(context.model.quantity) <= 0) {
			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.prompt'), message: context.t('stationlabel.outputQuantityPositive'), life: 3000 });
			return false;
		}
		try {
			const res: any = await this.apiClient.doAction(
				{ action: 'create', service: 'mes', repository: 'ProductionPlates' },
				reportparams
			);
			res.quantity = context.model.quantity;
			res.packQty = context.model.packQty;
			res.lotNo = context.model.lotNo;
			res.qcResult = context.model.qcResult;
			await this.apiClient.doAction(
				{ action: 'save', service: 'mes', repository: 'ProductionPlates' },
				res
			);
			context.uiBuilder.toast(context, { severity: 'success', title: context.t('dialog.success'), message: context.t('success.workReported'), life: 3000 });
			context.globalProps.$router.go(0);
			return true;
		} catch (error: any) {
			const detail = error.validationErrors?.length
				? error.validationErrors.map((e: any) => e.error).join('；')
				: error.message;
			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: detail, life: 3000 });
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
			await this.apiClient
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
					context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
				});
			context.uiBuilder.dialog(
				stationPortalFormWrap([
					context.uiBuilder.factory.formField({
						label: context.t('view.materialName'),
						disabled: true,
						modelValue: data.data.materialName,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formField({
						label: context.t('view.materialCode'),
						disabled: true,
						modelValue: data.data.materialCode,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.feedingQuantity'),
						modelValue: context.model.createMaterialtrack.list.fedQuantity,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.fedQuantity = val.trim();
						},
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.traceCode'),
						modelValue: context.model.createMaterialtrack.list.traceCodes,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.traceCodes = val;
						},
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.manufacturer'),
						modelValue: context.model.createMaterialtrack.list.manufacturer,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.manufacturer = val;
						},
					}),
					context.uiBuilder.factory.formField(
						{
							label: context.t('stationlabel.productionDate'),
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
					context.uiBuilder.factory.formField(
						{
							label: context.t('stationlabel.expiryDate'),
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
					title: context.t('stationlabel.scanFeeding'),
					height: '3rem',
					onAccept: async (button) => {
					  return await this.confirmMaterialtrack(context);
					}
				}
			);
		} else if (data.data.tracingMode == 'SN') {
			//序列号追踪，扫码多个序列号，逗号隔开，计算序列号数量
			await this.apiClient
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
					context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
				});
			context.uiBuilder.dialog(
				stationPortalFormWrap([
					context.uiBuilder.factory.formField({
						label: context.t('view.materialName'),
						disabled: true,
						modelValue: data.data.materialName,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formField({
						label: context.t('view.materialCode'),
						disabled: true,
						modelValue: data.data.materialCode,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.feedingQuantity'),
						modelValue: context.model.createMaterialtrack.list.fedQuantity,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.fedQuantity = val.trim();
						},
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.traceCode'),
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
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.manufacturer'),
						modelValue: context.model.createMaterialtrack.list.manufacturer,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.manufacturer = val;
						},
					}),
					context.uiBuilder.factory.formField(
						{
							label: context.t('stationlabel.productionDate'),
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
					context.uiBuilder.factory.formField(
						{
							label: context.t('stationlabel.expiryDate'),
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
					title: context.t('stationlabel.scanFeeding'),
					height: '3rem',
					onAccept: async (button) => {
					  return await this.confirmMaterialtrack(context);
					}
				}
			);
		} else {
			//无追踪方式
			await this.apiClient
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
					context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
				});
			context.uiBuilder.dialog(
				stationPortalFormWrap([
					context.uiBuilder.factory.formField({
						label: context.t('view.materialName'),
						disabled: true,
						modelValue: data.data.materialName,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formField({
						label: context.t('view.materialCode'),
						disabled: true,
						modelValue: data.data.materialCode,
						onUpdate: (val: string) => { },
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.feedingQuantity'),
						modelValue: context.model.createMaterialtrack.list.fedQuantity,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.fedQuantity = val.trim();
						},
					}),
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.traceCode'),
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
					context.uiBuilder.factory.formField({
						label: context.t('stationlabel.manufacturer'),
						modelValue: context.model.createMaterialtrack.list.manufacturer,
						onUpdate: (val: any) => {
							context.model.createMaterialtrack.list.manufacturer = val;
						},
					}),
					context.uiBuilder.factory.formField(
						{
							label: context.t('stationlabel.productionDate'),
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
					context.uiBuilder.factory.formField(
						{
							label: context.t('stationlabel.expiryDate'),
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
					title: context.t('stationlabel.scanFeeding'),
					height: '10rem',
					onAccept: async (button) => {
					  return await this.confirmMaterialtrack(context);
					}
				}
			);
		}
	}
	async confirmMaterialtrack(context: UiContext<any>) {
		if (!context.model.createMaterialtrack.list.fedQuantity)
			return context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: context.t('stationlabel.inputfedQuantity'), life: 3000 });
		await this.apiClient
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
					context.uiBuilder.toast(context, { severity: 'success', title: context.t('dialog.success'), message: context.t('success.operationSuccessful'), life: 3000 });
					context.globalProps.$router.go(0);
					return true;
				}
			})
			.catch((error: any) => {
				context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
				return true;
			});
		return true;
	}
	/**
	 * 生产单件报工
	 */
	// async submitProductionItem(context: UiContext, reportparams: any) {
	// 	await this.apiClient
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
	// 			await this.apiClient
	// 				.doAction(
	// 					{
	// 						action: 'save',
	// 						service: 'mes',
	// 						repository: 'ProductionItems',
	// 					},
	// 					res
	// 				)
	// 				.then((result: any) => {
	// 					context.uiBuilder.toast(context, { severity: 'success', title: context.t('dialog.success'), message: '报工成功', life: 3000 });
	// 					context.globalProps.$router.go(0)
	// 					return true;
	// 				})
	// 				.catch((error: any) => {
	// 					context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
	// 				})
	// 				.finally(() => {
	// 					return true;
	// 				});
	// 		})
	// 		.catch((error: any) => {
	// 			context.uiBuilder.toast(context, { severity: 'error', title: context.t('dialog.title.error'), message: error.message, life: 3000 });
	// 			return true;
	// 		});
	// 	return true;
	// }

	// /**
	//  * 组盘创建/提交（生产准备环节）
	//  */
	// async createGroupDisk(context: UiContext, groupDiskParams: any) {
	// 	const { uiBuilder, globalProps } = context;
	// 	const { $logger} = globalProps || {}; // 增加空值判断，避免报错

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

	// 	return uiBuilder.dialog(
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
	// 							context.uiBuilder.toast(context, {
	// 								severity: 'error',
	// 								title: context.t('error.loadFailed'),
	// 								message: context.t('error.editorLoadError'),
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
	// 			onAccept: async () => {
	// 				if (!groupDiskCtx) {
	// 					context.uiBuilder.toast(context, {
	// 						severity: 'error',
	// 						title: context.t('error.invalidContext'),
	// 						message: context.t('error.noEditorContext'),
	// 						life: 3000
	// 					});
	// 					return false;
	// 				}

	// 				try {
	// 					// 保存组盘数据，增加加载状态提示
	// 					context.uiBuilder.toast(context, {
	// 						severity: 'info',
	// 						title: context.t('info.saving'),
	// 						message: context.t('info.savingGroupDisk'),
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
	// 						context.uiBuilder.toast(context, {
	// 							severity: 'error',
	// 							title: context.t('failure.saveFailed'),
	// 							message: res?.message || context.t('failure.unknownError'),
	// 							life: 5000
	// 						});
	// 						return false;
	// 				}
	// 				} catch (err: any) {
	// 					$toast?.removeAll();
	// 					$logger?.error("组盘保存失败", err);
	// 					context.uiBuilder.toast(context, {
	// 						severity: 'error',
	// 						title: context.t('failure.saveError'),
	// 						message: err.message || context.t('failure.operationFailed'),
	// 						life: 5000
	// 					});
	// 					return false;
	// 				}
	// 			},
	// 			reject: () => {
	// 				context.uiBuilder.toast(context, {
	// 					severity: 'info',
	// 					title: context.t('action.cancel'),
	// 					message: context.t('failure.cancelGroupDisk'),
	// 					life: 3000
	// 				});
	// 				return false;
	// 			},
	// 		}
	// 	).then((res) => {
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
	// 									context.uiBuilder.toast(context, {
	// 										severity: 'success',
	// 										title: context.t('success.groupDiskCreated'),
	// 										message: context.t('success.groupDiskBindSuccess'),
	// 										life: 3000
	// 									});
	// 									resolve(true);
	// 								} catch (err: any) {
	// 									$logger?.error("组盘提交后操作失败", err);
	// 									context.uiBuilder.toast(context, {
	// 										severity: 'error',
	// 										title: context.t('failure.postOperationFailed'),
	// 										message: err.message || context.t('failure.tryAgainLater'),
	// 										life: 5000
	// 									});
	// 									resolve(false); // 此处用resolve避免Promise链中断
	// 							}
	// 							},
	// 							reject: () => {
	// 								context.uiBuilder.toast(context, {
	// 									severity: 'info',
	// 									title: context.t('action.cancel'),
	// 									message: context.t('failure.operationCancelled'),
	// 									life: 3000
	// 								});
	// 								reject(false);
	// 							},
	// 						});
	// 					});
	// 				})
	// 				.catch((err: any) => {
	// 					$logger?.error("组盘准备函数执行失败", err);
	// 					context.uiBuilder.toast(context, {
	// 						severity: 'error',
	// 						title: context.t('failure.prepareFailed'),
	// 						message: err.message || context.t('failure.operationFailed'),
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
	//   const { $logger} = globalProps;
	//   try {
	//     const res = await this.apiClient.post('/api/tool/materialToTool', {
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
	//     context.uiBuilder.toast(context, {
	//       severity: 'error',
	//       title: '物料转器具失败',
	//       message: err.message || '请联系管理员处理',
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
					
					.refWhere((model, ctx) => {
					const __p = ((ctx, model) => {
						return { status: 'USED' };
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
				// this.field('opCode').refWhere((model, ctx) => {
					const __p = ((context, model) => {
				// 	const lineItem = context.searchFields.filter((item: any) => item.field.fieldName === 'lineID')
				// 	return { lineID: lineItem[0].searchValue ?? '' }
				// })(ctx as any, model as any, undefined as any);
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
				// this.field('equippingType')
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
		await this.apiClient
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
		await this.apiClient
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
					searchLabel: 'stationlabel.productionPlan',
					searchParam: 'planID',
					valueFn: (v: any) => v.planID,
					renderer: (ctx: UiContext & any, csf) => {
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
								toSearch: async () => {
									const picked = await ctx.select({
										repository: 'ProductionPlans',
										service: 'mes',
										selectionMode: 'single',
									})
									if (!Array.isArray(picked) || !picked.length) return false
									const data = picked[0]
									if (!data?.planID) {
										ctx.uiBuilder.toast(ctx, { severity: 'error', title: ctx.t('dialog.title.prompt'), message: ctx.t('stationlabel.mustSelectOne'), life: 3000 })
										return false
									}
									csf.searchWord.value = csf.searchVal.value = data
									ctx.model.planID = data.planID ?? ctx.model.planID
									ctx.model.planNo = data.planNo ?? ctx.model.planNo
									this.searchParam.planID = ctx.model.planID
									ctx.app.localDb.put(`search/${ctx.logic.repository}/planID`, JSON.parse(JSON.stringify(data)))
									return true
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
					searchLabel: 'stationlabel.productionTask',
					searchParam: 'taskID',
					valueFn: (v: any) => v.taskID,
					renderer: (ctx: UiContext & any, csf) => {
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
								toSearch: async () => {
									const picked = await ctx.select({
										repository: 'ProductionTasks',
										service: 'mes',
										selectionMode: 'single',
									})
									if (!Array.isArray(picked) || !picked.length) return false
									const data = picked[0]
									if (!data?.taskID) {
										ctx.uiBuilder.toast(ctx, { severity: 'error', title: ctx.t('dialog.title.prompt'), message: ctx.t('stationlabel.mustSelectOne'), life: 3000 })
										return false
									}
									csf.searchWord.value = csf.searchVal.value = data ?? null
									ctx.model.taskID = data.taskID ?? ctx.model.taskID
									ctx.model.taskNo = data.taskNo ?? ctx.model.taskNo
									ctx.model.taskPlanID = data.planID ?? ctx.model.planID
									this.searchParam.taskID = ctx.model.taskID
									ctx.app.localDb.put(`search/${ctx.logic.repository}/taskID`, JSON.parse(JSON.stringify(data)))
									return true
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
export const StationPortalLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) =>
	new StationPortalLogic({
		metaUiService: metaUiService,
		repository: 'StationPortals',
		
		module: module || metaUiService.findModule('StationPortal'),
	});
//#endregion ~GENERATED PARTS END
