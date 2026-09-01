/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, type EntityAction, MetaModel, isRefNone, SortOrder, debounce, isNullOrUndefined, triggerEscKey, isObject, getSearchOp } from '@mmda/core';
import { type UiViewContext, type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne, UiSearchForm } from '@mmda/vui';
import { type QualityInspection, defineQualityInspection } from '@/models/QualityInspection';
import { type QualityInspectionItem, defineQualityInspectionItem } from '@/models/QualityInspectionItem';
import { type QualityInspectionMaterial, defineQualityInspectionMaterial } from '@/models/QualityInspectionMaterial';
import type { ProductionTask } from '@/models/ProductionTask';
import { QcInProcessType, QcInProcessTypeEnum } from '@/enums/QcInProcessType';
import { QcPhase, QcPhaseEnum } from '@mmda/base/src/enums/QcPhase';
import { QaStatus, QaStatusEnum } from '@mmda/base/src/enums/QaStatus';
import { ProductionTaskStatus } from '@/enums/ProductionTaskStatus';
import { h, ref, reactive } from 'vue';
/**
 * 质量检验交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-08-12 18:22:36.0
 */
const tableData = ref([]);
const tablecolumns = ref([]);
const tableDataKEY = ref('id');
const searchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});

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

const activeItems = (inspection?: QualityInspection) =>
	(inspection?.items ?? []).filter(item => !MetaModel.deleted(item));
const activeMaterials = (inspection?: QualityInspection) =>
	(inspection?.materials ?? []).filter(material => !MetaModel.deleted(material));
/** 仅单条有效检验物时，检验项与质检结果互相限制 */
export const shouldLinkItemAndQcResult = (inspection?: QualityInspection) =>
	activeMaterials(inspection).length === 1;
const qcResultValueOf = (value: any) =>
	QaStatusEnum.valueOf(isObject(value) ? value.value : value);
const isPassQcResult = (result: number) =>
	result === QaStatusEnum.valueOf(QaStatus.OK) ||
	result === QaStatusEnum.valueOf(QaStatus.AUC);
/** 质检结果展示名；提示 */
const qcResultLabel = (value: any) =>
	(isObject(value) && value.text) || QaStatusEnum.textOf(isObject(value) ? value.value : value) || '';

const SPECIAL_INSPECTION_SOURCES = ['ProductionPlate', 'ProductionLot', 'MaterialTrans', 'ProductionTask'];

/** 判断质量检验是否来自受限业务单据；传入来源时不再回退使用模型值。 */
export const isProductionInspectionSource = (inspection?: QualityInspection, sourceRefName?: string) =>
	SPECIAL_INSPECTION_SOURCES.includes(sourceRefName !== undefined ? sourceRefName : inspection?.refName || '');

/** 生成退料单等：先调用移料单 create 校验，成功后再跳转，失败则提示并留在当前页 */
const beforeMaterialTransCreateRedirect = async (
	context: UiContext,
	_model: QualityInspection,
	action: EntityAction,
) => {
	try {
		if (action.param?.type !== 'redirect') return true;
		const to = action.param.value?.to ?? action.param.value;
		if (to?.objName !== 'MaterialTrans' || to?.action !== 'create') return true;
		const res = await context.globalProps.$api.createOne(action.param.value.ref, {
			repository: 'MaterialTranses',
			service: 'mes',
		});
		context.globalProps.$router.push({
			name: 'MaterialTransCreate',
			state: { createParam: { entity: res } },
		});
	} catch (error: any) {
		context.uiBuilder.toast(context, {
			severity: 'error',
			summary: context.t('dialog.title.error'),
			detail: error.message ?? context.t('auth.operationFailed'),
			group: 'br',
			life: 3000,
		});
		return false;
	}
	return false;
};


/**
 * 是否从品控标准回填品控类型、制程品控类型及检验物。
 * 特殊来源（生产货组/生产批次/物料转移...）不回填
 */
export const shouldBackfillFromQcs = (inspection?: QualityInspection, createRefName?: string) =>
	!isProductionInspectionSource(inspection, createRefName);

export class QualityInspectionLogic extends UiLogic<QualityInspection> {
	private taskMaterialRequestID = 0;
	private qcPhaseAllOptions?: any[];
	constructor(init: UiLogicInit) {
		super(defineQualityInspection, init);
		this.addRelativeLogic<QualityInspectionItem>('items', master => new QualityInspectionItemLogic(this, master));
		this.addRelativeLogic<QualityInspectionMaterial>('materials', master => new QualityInspectionMaterialLogic(this, master));

		// 保存兜底：仅单条检验物时校验检验项与质检结果的一致性
		this.beforeSave = (context, model) => {
			const items = activeItems(model);
			const material = activeMaterials(model)[0];
			if (!shouldLinkItemAndQcResult(model) || !material) return Promise.resolve(true);

			// 单条检验物时，保存前兜底检查检验项与质检结果是否一致。
			const result = qcResultValueOf(material.qcResult);
			const hasBadItem = items.some(item => item.qualified === false);
			const allQualified = items.length > 0 && items.every(item => item.qualified === true);
			let detail: string | undefined;
			if (isPassQcResult(result) && hasBadItem) {
				detail = context.t('invalid.qcResultOkBlocked');
			} else if (
				allQualified &&
				!isPassQcResult(result) &&
				result !== QaStatusEnum.valueOf(QaStatus.NI)
			) {
				detail = context.t('invalid.qcResultOnlyOkOrNi');
			}
			if (!detail) return Promise.resolve(true);
			context.uiBuilder.toast(context, {
				severity: 'error',
				detail,
				summary: context.t('dialog.title.error'),
				group: 'br',
				life: 3000,
			});
			return Promise.resolve(false);
		};

		this.beforeAction = (context: UiContext, model: QualityInspection, action: EntityAction) =>
			beforeMaterialTransCreateRedirect(context, model, action);
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
						tableDataProject.value.push(csf.searchVal.value)
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
							let getData = [] as any
							// 获取元数据字段
							const { metaui } = await ctx.logic!.loadMetadata('Projects', 'mes', true);
							tableDataKeyProject.value = metaui.primaryKey;
							ctx.searchParam.pager = searchParamProject.pager = {
								pageNo: 1,
								pageSize: 10
							}
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
										ctx.searchParam.pager = searchParamProject.pager
									},
									onSelect: (selection: any, row: any) => {
										getData = [selection]
										data = row;
									},
									onRowDblclick: (row: any, index: number) => {
										csf.searchVal.value = csf.searchWord.value = row
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
											return false
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
					})
				}
			});
		}
		return { searchParam, searchFields, customSearchFields };
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('qcPhase').searchable(true),
				this.field('inProcessType').searchable(true),
				this.field('taskID')
					.searchable(true)
					.setSearchParam((context, model) => {
						return {
							sort: `planDate ${SortOrder.DESC}`,
							status: `IN ${ProductionTaskStatus.WORKING},${ProductionTaskStatus.FINISHED}`,
						};
					}),
				this.field('jobID').searchable(true),
				this.field('status').searchable(true)
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
			//品控标准
			fields.push(
				this.field('qcsID')
					.setSearchParam((ctx, model) => {
						const params: Record<string, any> = { status: '>0' };
						// 预设单为true说明是特殊来源生成的检验单：按 qcPhase 筛品控标准
						if (model.preset) {
							if (!isRefNone(model.qcPhase)) params.qcPhase = model.qcPhase;
							return params;
						}
						const currentCreateRefName = window.history?.state?.createParam?.refName as string | undefined;
						// 普通来源 + 已完工任务：不可选来料检验标准
						if (!isProductionInspectionSource(model, currentCreateRefName) && model.task?.status === ProductionTaskStatus.FINISHED) {
							params.qcPhase = getSearchOp('NOT_IN').toSQL(QcPhase.IQC);
							return params;
						}
						if (isRefNone(model.qcPhase)) return params;
						// 特殊来源按品控类型过滤；其他来源仅在编辑页按品控类型过滤。
						const isEdit = window.location.pathname.indexOf('Edit') > -1;
						if (isProductionInspectionSource(model, currentCreateRefName) || isEdit) {
							params.qcPhase = model.qcPhase;
						}
						return params;
					})
					.onChange(async (context, model, newVal, oldVal) => {
						// 获取为特殊来源的refName。
						const createRefName = window.history?.state?.createParam?.refName as string | undefined;
						// 普通来源：按品控标准回填品控类型、制程品控类型及检验物
						if (shouldBackfillFromQcs(model, createRefName)) {
							if (!isRefNone(newVal)) {
								let qcPhase = (context.getFieldCurrentOption('qcsID') ?? model.qcStandard)?.qcPhase;
								if (isRefNone(qcPhase)) qcPhase = (await context.globalProps.$api.getOne(newVal, { repository: 'QualityControlStandards', service: 'mes' }).catch((): null => null))?.qcPhase;
								if (!isRefNone(qcPhase)) {
									context.setFieldValue('qcPhase', { value: qcPhase, text: QcPhaseEnum.textOf(qcPhase) });
									this.syncInProcessTypeByQcPhase(context, model, qcPhase);
									// if (!isRefNone(model.taskID)) await this.syncMaterialsFromTaskSelection(context, model, model.taskID);
								}
							}
						}
						// 普通来源与特殊来源共用：清空或切换品控标准时同步处理检验项
						if (!isRefNone(oldVal)) context.removeSubGroupItems('items');
						if (isRefNone(newVal)) return;
						context.globalProps.$api.getAll({
							repository: 'QualityInspections',
							action: `${model.inspectionID}/createQualityInspectionItemByQCS`,
							queryParams: { qcsID: model.qcsID },
							service: 'mes',
						}).then((res: any) => {
							context.addSubGroupItems({
								target: model,
								group: 'items',
								sequenceKey: 'itemID',
								source: res.list,
								propsMapper: { qualified: () => false },
							});
						}).catch(() => { });
					})
					.lockIf(t => window.location.pathname.indexOf('Edit') > -1 && !isRefNone(t.qcsID)),

				this.field('qcPhase')
					// 预设单、特殊来源的品控类型不允许手动修改
					.lockIf(t => {
						if (t.preset) return true;
						const isEdit = window.location.pathname.indexOf('Edit') > -1;
						if (isEdit) return isProductionInspectionSource(t);
						const createRefName = window.history?.state?.createParam?.refName as string | undefined;
						return isProductionInspectionSource(t, createRefName);
					})
					.onChange((context, model) => {
						this.syncInProcessTypeByQcPhase(context, model);
						if (!isRefNone(model.taskID)) {
							this.syncMaterialsFromTaskSelection(context, model, model.taskID);
						}
					}),
				this.field('inspectionNo').lockIf(t => t.preset),
				this.field('inProcessType').lockIf(t => t.qcPhase !== 'IPQC' || t.preset),
				this.field('taskID')
					.lockIf(t => t.preset)
					.setSearchParam((context, model) => {
						const ref = context.metaui.getField('qcPhase').reference;
						const phase = ref?.valueOf(ref?.enumFn(model.qcPhase) ?? context.getFieldValue(context.metaui.getField('qcPhase'))) ?? model.qcPhase;
						return {
							sort: `planDate ${SortOrder.DESC}`,
							// 来料检验只能选进行中任务；其他品控类型可选进行中或已完工
							status: phase === QcPhase.IQC || phase === QcPhaseEnum.IQC_VALUE
								? ProductionTaskStatus.WORKING
								: `IN ${ProductionTaskStatus.WORKING},${ProductionTaskStatus.FINISHED}`,
						};
					})
					.onChange((context, model, newVal) => this.syncMaterialsFromTaskSelection(context, model, newVal))
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
					.onChange((ctx,model,items)=>{ })
			);
			 */
			groups.push(
				this.group<QualityInspectionItem>('items')
					// .defaultAdder(this.newQualityInspectionItem)
					.addCustomAction({
						name: 'createContractItem',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newQualityInspectionItem,
						view: UiViewOne.Edit,
						visible: (t: any) => !(t.preset && !isRefNone(t.qcsID)),
					})
					.addCustomAction({
						name: 'batchQualified',
						label: 'qualityInspection.batchQualified',
						icon: 'far fa-check-circle',
						role: 'success',
						onAction: this.batchSetQualified,
						view: UiViewOne.Edit,
						visible: (t) => (t.items ?? []).some((i: QualityInspectionItem) => !MetaModel.deleted(i) && !i.qualified),
					}),
				this.group<QualityInspectionMaterial>('materials')
					// .defaultAdder(this.newQualityInspectionMaterial)
					.addCustomAction({
						name: 'createContractItem',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newQualityInspectionMaterial,
						view: UiViewOne.Edit,
						visible: (t: any) => !t.preset,
					})
					.onChange((ctx, model) => {
						if (!model || !model.materials) return;
						model.totalQuantity = MetaModel.sum(model.materials, materials => materials.quantity);
						model.totalSampled = MetaModel.sum(model.materials, materials => materials.samplingQuantity);
						MetaModel.modify(model);
					})
			);
		}
		return { fields, groups, customActions };
	}
	/** 取出品控类型枚举码（兼容 { value } / 字符串） */
	private qcPhaseCodeOf(v: any): any {
		return isObject(v) && v != null && 'value' in v ? (v as any).value : v;
	}
	/** 普通来源 + 已完工任务：默认下拉读 refOptions，在此排除来料检验 */
	private applyQcPhaseExcludeIqc(context: UiContext<QualityInspection>, model: QualityInspection, taskStatus?: string) {
		const ref = context.metaui.getField('qcPhase').reference;
		if (!this.qcPhaseAllOptions) this.qcPhaseAllOptions = ref.refOptions.slice();
		const refName = window.history?.state?.createParam?.refName as string | undefined;
		const exclude = !isProductionInspectionSource(model, refName)
			&& (taskStatus ?? model.task?.status) === ProductionTaskStatus.FINISHED;
		ref.refOptions.splice(0, ref.refOptions.length,
			...this.qcPhaseAllOptions.filter(o => !exclude || ref.valueFn(o) !== QcPhase.IQC));
		if (exclude && this.qcPhaseCodeOf(model.qcPhase) === QcPhase.IQC) context.setFieldValue('qcPhase', null);
	}
	/** 制程品控类型只在 IPQC 下有效，切到其他品控类型时重置为“无”，避免残留无效业务值。 */
	private syncInProcessTypeByQcPhase(context: UiContext<QualityInspection>, model: QualityInspection, qcPhase?: any) {
		const phase = this.qcPhaseCodeOf(qcPhase ?? model.qcPhase);
		if (phase !== QcPhase.IPQC && model.inProcessType !== QcInProcessType.NONE) {
			context.setFieldValue('inProcessType', {
				value: QcInProcessType.NONE,
				text: QcInProcessTypeEnum.textOf(QcInProcessType.NONE),
			});
			MetaModel.modify(model);
		}
	}
	/** 按品控类型从生产任务生成检验物来源 */
	private buildMaterialsFromTask(task: ProductionTask, qcPhase: any) {
		// 来料品检：回填投料清单原材料
		if (this.qcPhaseCodeOf(qcPhase) === QcPhase.IQC) {
			return (task.feedings ?? [])
				.filter(feeding => !MetaModel.deleted(feeding))
				.map(feeding => ({
					materialCode: feeding.materialCode,
					materialName: feeding.materialName,
					quantity: feeding.quotaQuantity ?? 0,
					materialCategoryID: (feeding as any).productCategory?.categoryID ?? 0,
					productCategory: (feeding as any).productCategory ?? null,
					unit: feeding.unit,
					refName: 'ProductionTaskFeeding',
				}));
		}
		// 半成品/制程/产终/出货等：回填任务制品
		return [{
			materialCode: task.productCode,
			materialName: task.productName,
			quantity: task.taskQuantity ?? 0,
			materialCategoryID: task.productCategoryID ?? null,
			productCategory: task.productCategory ?? null,
			unit: task.unit,
			refName: 'ProductionTask',
		}];
	}
	// 创建或编辑质量检验时，根据生产任务与品控类型自动回填检验物
	async syncMaterialsFromTaskSelection(context: UiContext<QualityInspection>, model: QualityInspection, taskID?: string) {
		// 用请求序号避免快速切换任务时旧数据覆盖新数据
		const requestID = (this.taskMaterialRequestID ?? 0) + 1;
		this.taskMaterialRequestID = requestID;
		if (isRefNone(taskID)) {
			// 清空生产任务时同步清空检验物
			model.task = undefined;
			this.applyQcPhaseExcludeIqc(context, model);
			context.removeSubGroupItems('materials');
			model.totalQuantity = 0;
			model.totalSampled = 0;
			MetaModel.modify(model);
			return;
		}

		try {
			const task = await context.globalProps.$api.getOne(taskID, {
				repository: 'ProductionTasks',
				service: 'mes',
			}) as ProductionTask;
			if (requestID !== this.taskMaterialRequestID) return;
			this.applyQcPhaseExcludeIqc(context, model, task.status);

			const source = this.buildMaterialsFromTask(task, model.qcPhase);
			context.removeSubGroupItems('materials');
			if (source.length > 0) {
				context.addSubGroupItems({
					target: model,
					group: 'materials',
					sequenceKey: 'itemID',
					source,
				});
			}
			// 重新计算检验物汇总数量
			model.totalQuantity = MetaModel.sum(model.materials, material => material.quantity);
			model.totalSampled = MetaModel.sum(model.materials, material => material.samplingQuantity);
			MetaModel.modify(model);
		} catch {
			if (requestID !== this.taskMaterialRequestID) return;
			context.uiBuilder.toast(context, {
				severity: 'error',
				detail: context.t('qualityInspection.taskMaterialsLoadFailed'),
				summary: context.t('dialog.title.error'),
				group: 'br',
				life: 3000,
			});
		}
	}
	newQualityInspectionItem(context: UiContext<QualityInspection>, target: QualityInspection) {
		context
			.newSubGroupItem<QualityInspectionItem>({
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
	batchSetQualified(context: UiContext<QualityInspection>, target: QualityInspection) {
		const { $ui: ui } = context.globalProps;
		const pending = (target.items ?? []).filter(i => !MetaModel.deleted(i) && !i.qualified);
		if (!pending.length) return;
		const rows = pending.map(i => ({ ...i, qualifiedText: context.t('qualityInspection.unqualified') }));
		let selected: typeof rows = rows;
		context.uiBuilder.confirmDialog(
			context.uiBuilder.buildSearchForRelativeContent([
				ui.factory.column({ header: context.t('qualityInspection.category'), field: 'category' }),
				ui.factory.column({ header: context.t('qualityInspection.inspectionContent'), field: 'itemName' }),
				ui.factory.column({ header: context.t('qualityInspection.criterion'), field: 'criterion' }),
				ui.factory.column({ header: context.t('qualityInspection.qualified'), field: 'qualifiedText' }),
			], {
				dataKey: 'itemID',
				selectionMode: 'multiple',
				selectAll: true,
				showSearchBar: false,
				paginator: false,
				onSearch: async () => ({ list: rows, pager: { pageNo: 1, pageSize: rows.length, recordCount: rows.length } }),
				onSelect: (sel: typeof rows) => { selected = sel ?? []; },
			}),
			context,
			{
				title: context.t('qualityInspection.batchQualified'),
				style: { width: '75vw', maxHeight: '90%' },
				accept: async () => {
					const ids = new Set(selected.map(i => i.itemID));
					const hasBadItemAfter = pending.some(i => !ids.has(i.itemID));
					// 全部改为合格前，先确认当前质检结果允许该操作。
					if (shouldLinkItemAndQcResult(target) && !hasBadItemAfter) {
						const material = activeMaterials(target)[0];
						if (material) {
							const result = qcResultValueOf(material.qcResult);
							if ([QaStatus.DG, QaStatus.NG, QaStatus.SCRAP]
								.some(status => QaStatusEnum.valueOf(status) === result)) {
								context.uiBuilder.toast(context, {
									severity: 'error',
									detail: context.t({
										message: 'invalid.itemQualifiedWhenBadResult',
										param: { status: qcResultLabel(material.qcResult) },
									}),
									summary: context.t('dialog.title.error'),
									group: 'br',
									life: 3000,
								});
								return false;
							}
						}
					}
					pending.forEach(i => { if (ids.has(i.itemID)) { i.qualified = true; MetaModel.modify(i); } });
					MetaModel.modify(target);
					// 检验项变化后，将冲突的质检结果统一恢复为待检品。
					if (shouldLinkItemAndQcResult(target)) {
						const material = activeMaterials(target)[0];
						if (material) {
							const currentItems = activeItems(target);
							const hasBadItem = currentItems.some(item => item.qualified === false);
							const allQualified =
								currentItems.length > 0 && currentItems.every(item => item.qualified === true);
							const result = qcResultValueOf(material.qcResult);
							if (
								(hasBadItem && isPassQcResult(result)) ||
								(allQualified &&
									!isPassQcResult(result) &&
									result !== QaStatusEnum.valueOf(QaStatus.NI))
							) {
								material.qcResult = QaStatus.NI;
								MetaModel.modify(material);
							}
						}
					}
					return true;
				},
			},
		);
	}
	newQualityInspectionMaterial(context: UiContext<QualityInspection>, target: QualityInspection) {
		context
			.newSubGroupItem<QualityInspectionMaterial>({
				group: 'materials',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					context.addSubGroupItem('materials', item);
					target.totalSampled = MetaModel.sum(target.materials, material => material.samplingQuantity);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造质量检验交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const QualityInspectionLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new QualityInspectionLogic({
		metaUiService: metaUiService,
		repository: 'QualityInspections',
		router,
		module: module || metaUiService.findModule('QualityInspection'),
	});
/**
 * 检验项交互逻辑
 */
export class QualityInspectionItemLogic extends UiGroupLogic<QualityInspectionItem, QualityInspection> {
	constructor(parent: QualityInspectionLogic, master: QualityInspection) {
		super(defineQualityInspectionItem, parent, master, 'items');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 品控标准带入的检验项锁定；手动创建的临时增项（qcsID 为空）可编辑
				this.field('category').lockIf(item => !isRefNone(item.qcsID)),
				this.field('itemName').lockIf(item => !isRefNone(item.qcsID)),
				this.field('criterion').lockIf(item => !isRefNone(item.qcsID)),
				this.field('qualified')
					.onValidate((value, _model, ctx: UiViewContext<any>) => {
						const inspection = (ctx.root?.model ?? this.master) as QualityInspection;
						if (!shouldLinkItemAndQcResult(inspection)) return;
						// 仅单条检验物时限制“合格否”与质检结果的组合。
						const items = activeItems(inspection);
						const material = activeMaterials(inspection)[0];
						const hasBadItemAfter = items.some(
							item => item.itemID !== ctx.model.itemID && item.qualified === false
						);
						if (!material) return;
						const result = qcResultValueOf(material.qcResult);
						if (!value && isPassQcResult(result)) {
							return ctx.t('invalid.itemUnqualifiedWhenOk');
						}
						if (
							value &&
							!hasBadItemAfter &&
							[QaStatus.DG, QaStatus.NG, QaStatus.SCRAP]
								.some(status => QaStatusEnum.valueOf(status) === result)
						) {
							return ctx.t({
								message: 'invalid.itemQualifiedWhenBadResult',
								param: { status: qcResultLabel(material.qcResult) },
							});
						}
					})
					.setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
						//合格类型选择
						const checkTyoeList = [
							{
								id: 0,
								value: true,
								text: ctx.t('auth.qualified'),
							},
							{
								id: 1,
								value: false,
								text: ctx.t('auth.unqualified'),
							},
						];
						return ctx.globalProps.$ui.factory.radioGroup(ctx.model.qualified, {
							options: checkTyoeList,
							optionLabel: 'text',
							optionValue: 'value',
							onChange: (value: any) => {
								const inspection = (ctx.root?.model ?? this.master) as QualityInspection;
								const items = activeItems(inspection);
								const material = activeMaterials(inspection)[0];
								const hasBadItemAfter = items.some(
									item => item.itemID !== ctx.model.itemID && item.qualified === false
								);
								let blockedMessage: string | undefined;
								if (shouldLinkItemAndQcResult(inspection) && material) {
									const result = qcResultValueOf(material.qcResult);
									if (!value && isPassQcResult(result)) {
										blockedMessage = ctx.t('invalid.itemUnqualifiedWhenOk');
									} else if (
										value &&
										!hasBadItemAfter &&
										[QaStatus.DG, QaStatus.NG, QaStatus.SCRAP]
											.some(status => QaStatusEnum.valueOf(status) === result)
									) {
										blockedMessage = ctx.t({
											message: 'invalid.itemQualifiedWhenBadResult',
											param: { status: qcResultLabel(material.qcResult) },
										});
									}
								}
								if (blockedMessage) {
									ctx.uiBuilder.toast(ctx, {
										severity: 'error',
										detail: blockedMessage,
										summary: ctx.t('dialog.title.error'),
										group: 'br',
										life: 3000,
									});
									ctx.setFieldValue(fld, ctx.model.qualified);
									return;
								}
								ctx.setFieldValue(fld, value);
								const currentItems = activeItems(inspection);
								const hasBadItem = currentItems.some(item => item.qualified === false);
								const allQualified =
									currentItems.length > 0 && currentItems.every(item => item.qualified === true);
								if (shouldLinkItemAndQcResult(inspection) && material) {
									const result = qcResultValueOf(material.qcResult);
									if (
										(hasBadItem && isPassQcResult(result)) ||
										(allQualified &&
											!isPassQcResult(result) &&
											result !== QaStatusEnum.valueOf(QaStatus.NI))
									) {
										material.qcResult = QaStatus.NI;
										MetaModel.modify(material);
									}
								}
								// 状态改为已修改
								MetaModel.modify(ctx.model);
							},
						});
					})
			);
		}

		if (groups.length === 0) {
			groups.push(
				this.group<QualityInspectionItem>('a1').setWatermark((grp,
					ctx,
					props) => {
					if (isNullOrUndefined(ctx.model.qualified)) return
					if (ctx.model.qualified) {
						return {
							color: 'success',
							label: ctx.t('auth.qualified')
						}
					} else {
						return {
							color: 'danger',
							label: ctx.t('auth.unqualified')
						}
					}
				})
			)
		}
		return { fields, groups, customActions };
	}
	beforeDetails(): UiLogicFnResult<QualityInspectionItem> {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length === 0) {
			groups.push(
				this.group<QualityInspectionItem>('a1').setWatermark((grp,
					ctx,
					props) => {
					if (isNullOrUndefined(ctx.model.qualified)) return
					if (ctx.model.qualified) {
						return {
							color: 'success',
							label: ctx.t('auth.qualified')
						}
					} else {
						return {
							color: 'danger',
							label: ctx.t('auth.unqualified')
						}
					}
				})
			)
		}
		return { fields, groups, customActions }
	}
}
/**
 * 检验物交互逻辑
 */
export class QualityInspectionMaterialLogic extends UiGroupLogic<QualityInspectionMaterial, QualityInspection> {
	constructor(parent: QualityInspectionLogic, master: QualityInspection) {
		super(defineQualityInspectionMaterial, parent, master, 'materials');
	}
	async getData(ctx: any, value?: any) {
		const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
		const res = await apiBox.getAll({
			repository: 'QualityDefects',
			queryParams: {
				pageSize: searchParam.pager.pageSize,
				pageNo: searchParam.pager.pageNo,
				sort: '',
				searchWord: value,
			},
			service: 'mes',
		});
		searchParam.pager = res.pagination;
		tableData.value = res.list.map((it: any) => {
			return { ...it, severity: it.customProperties.$severity };
		});
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 质检结果：按检验项合格情况过滤选项（自定义下拉，避免单元格失焦仍提交非法值）
				this.field('qcResult')
					.setCustomEditor((fld, ctx: UiViewContext<any>) => {
						const { $ui: ui } = ctx.globalProps;
						const ref = fld.reference;
						const refFlds = ref?.refFlds?.length ? ref.refFlds : ['value', 'text'];
						const optionValue = refFlds.length > 0 ? refFlds[0] : 'value';
						const optionLabel = refFlds.length > 1 ? refFlds[1] : optionValue;
						const inspection = (ctx.root?.model ?? this.master) as QualityInspection;
						const items = activeItems(inspection);
						const hasBadItem = items.some(item => item.qualified === false);
						const allQualified =
							items.length > 0 && items.every(item => item.qualified === true);
						const isPassQcOption = (opt: any) => {
							if (opt == null) return false;
							const v = qcResultValueOf(opt);
							if (v === QaStatusEnum.valueOf(QaStatus.OK) || v === QaStatusEnum.valueOf(QaStatus.AUC)) return true;
							if (ref) {
								try {
									const rv = qcResultValueOf(ref.valueOf(opt));
									if (rv === QaStatusEnum.valueOf(QaStatus.OK) || rv === QaStatusEnum.valueOf(QaStatus.AUC)) return true;
								} catch {
									// ignore
								}
							}
							if (typeof opt === 'string') {
								const parts = opt.split(';');
								return parts[1] === QaStatus.OK || parts[1] === QaStatus.AUC ||
									parts[0] === String(QaStatusEnum.OK_VALUE) || parts[0] === String(QaStatusEnum.AUC_VALUE);
							}
							if (typeof opt === 'object') {
								return opt.value === QaStatus.OK || opt.value === QaStatus.AUC ||
									opt.id === QaStatusEnum.OK_VALUE || opt.id === QaStatusEnum.AUC_VALUE ||
									opt.code === QaStatus.OK || opt.code === QaStatus.AUC;
							}
							return false;
						};
						const isNiQcOption = (opt: any) => {
							if (opt == null) return false;
							if (qcResultValueOf(opt) === QaStatusEnum.valueOf(QaStatus.NI)) return true;
							if (ref) {
								try {
									if (qcResultValueOf(ref.valueOf(opt)) === QaStatusEnum.valueOf(QaStatus.NI)) return true;
								} catch {
									// ignore
								}
							}
							if (typeof opt === 'string') {
								const parts = opt.split(';');
								return parts[1] === QaStatus.NI || parts[0] === String(QaStatusEnum.NI_VALUE);
							}
							if (typeof opt === 'object') {
								return opt.value === QaStatus.NI || opt.id === QaStatusEnum.NI_VALUE || opt.code === QaStatus.NI;
							}
							return false;
						};
						const all = ctx.getFieldOptions(fld)?.selectOptions ?? ref?.refOptions ?? [];
						let options = all;
						// 根据检验项判定过滤不可选择的质检结果。
						if (shouldLinkItemAndQcResult(inspection)) {
							if (allQualified) {
								options = all.filter((opt: any) => isPassQcOption(opt) || isNiQcOption(opt));
							} else if (hasBadItem) {
								options = all.filter((opt: any) => !isPassQcOption(opt));
							}
						}
						return ui.factory.select({
							invalid: ctx.isInvalid(fld),
							modelValue: ctx.getFieldValue(fld),
							options,
							optionLabel,
							dataKey: optionValue,
							showClear: fld.nullable,
							onChange: (value: any) => {
								const currentItems = activeItems(inspection);
								const currentHasBadItem = currentItems.some(item => item.qualified === false);
								const currentAllQualified =
									currentItems.length > 0 && currentItems.every(item => item.qualified === true);
								const result = qcResultValueOf(value);
								let blockedMessage: string | undefined;
								// 下拉变更时再次校验，避免提交被过滤规则禁止的结果。
								if (shouldLinkItemAndQcResult(inspection)) {
									if (isPassQcResult(result) && currentHasBadItem) {
										blockedMessage = ctx.t('invalid.qcResultOkBlocked');
									} else if (
										currentAllQualified &&
										!isPassQcResult(result) &&
										result !== QaStatusEnum.valueOf(QaStatus.NI)
									) {
										blockedMessage = ctx.t('invalid.qcResultOnlyOkOrNi');
									}
								}
								if (blockedMessage) {
									ctx.uiBuilder.toast(ctx, {
										severity: 'error',
										detail: blockedMessage,
										summary: ctx.t('dialog.title.error'),
										group: 'br',
										life: 3000,
									});
									return;
								}
								ctx.setFieldValue(fld, value);
							},
						});
					})
					.onValidate((value, _model, ctx: UiViewContext<any>) => {
						const inspection = (ctx.root?.model ?? this.master) as QualityInspection;
						if (!shouldLinkItemAndQcResult(inspection)) return;
						const items = activeItems(inspection);
						const hasBadItem = items.some(item => item.qualified === false);
						const allQualified =
							items.length > 0 && items.every(item => item.qualified === true);
						const result = qcResultValueOf(value);
						if (isPassQcResult(result) && hasBadItem) {
							return ctx.t('invalid.qcResultOkBlocked');
						}
						if (
							allQualified &&
							!isPassQcResult(result) &&
							result !== QaStatusEnum.valueOf(QaStatus.NI)
						) {
							return ctx.t('invalid.qcResultOnlyOkOrNi');
						}
					}),
				this.field('defectDesc')
					.setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
						const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
						const { model } = ctx; const metaUiService = ctx.logic!.metaUiService;
						return ui.factory.searchForRelative({
							role: `defectDesc-search-for-relative`,
							name: 'defectDesc-search-for-relative',
							id: 'defectDesc-search-for-relative',
							modelValue: model.defectDesc,
							dataKey: 'defectID',
							optionLabel: 'defectDesc',
							options: tableData.value,
							placeholder: t('action.select'),
							toSearch: async (event: Event) => {
								let data = [] as any;
								const metaUi = await metaUiService.get('QualityDefects', 'mes');
								tablecolumns.value = metaUi.getListedFields().sort((prev: any, curr: any) => {
									return Number(prev.fieldIdx) - Number(curr.fieldIdx);
								});
								tableDataKEY.value = metaUi.primaryKey;
								await this.getData(ctx, '');
								ctx.uiBuilder.confirmDialog(
									ctx.uiBuilder.buildSearchForRelativeContent(
										tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
										{
											dataKey: tableDataKEY.value,
											onSearch: async (params: any) => {
												const { searchParams, reload, pager } = params;
												await this.getData(ctx, searchParams.searchWord);
												return { list: tableData.value, pager: searchParam.pager };
											},
											onPage: ({ pageNo, pageSize }: any) => {
												searchParam.pager.pageNo = pageNo;
												searchParam.pager.pageSize = pageSize;
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
										// height: '30%',
										accept: async () => {
											// 缺陷描述回填
											ctx.model.defectDesc = data.defectDesc ?? ctx.model.defectDesc;
											// 缺陷标识回填
											ctx.model.defectID = data.defectID ?? ctx.model.defectID;
											MetaModel.modify(ctx.model);
											return true;
										},
									}
								);
							},
							onInput: async (value: string) => {
								model.defectDesc = value;
								model.defectID = null;
							},
							onUpdate: async (value: any) => {
								// await this.getAllplan(ctx, value)
								// console.log(value,  '搜索')
								if (!isRefNone(value)) {
									ctx.model.defectDesc = value.defectDesc
									ctx.model.defectID = value.defectID
								} else {
									ctx.model.defectDesc = null;
									ctx.model.defectID = null;
								}
							},
						});
					})
					.lockIf(model =>
						qcResultValueOf(model.qcResult) === QaStatusEnum.valueOf(QaStatus.OK)
					),
				this.field('materialCode').lockIf(v => !isRefNone(v.refName)),
				this.field('materialName').lockIf(v => !isRefNone(v.refName)),
				this.field('materialCategoryID')
					.setCustomRenderer((fld, ctx: UiViewContext<any>) => {
						const text = ctx.model.productCategory?.categoryName;
						return ctx.globalProps.$ui.factory.textSpan(text || '');
					})
					.lockIf(v => !isRefNone(v.refName)),
				this.field('quantity')
					.lockIf(v => !isRefNone(v.refName))
					.onChange((context, model) => {
						if (!this.master || !this.master.materials) return;
						this.master.totalQuantity = MetaModel.sum(this.master.materials, materials => materials.quantity);
						MetaModel.modify(this.master);
					}),
				this.field('samplingQuantity').onChange((context, model) => {
					if (!this.master || !this.master.materials) return;
					this.master.totalSampled = MetaModel.sum(this.master.materials, materials => materials.samplingQuantity);
					MetaModel.modify(this.master);
				}),
				this.field('qcQuantity').onValidate((val, model, ctx) => {
					if (!this.master || isNullOrUndefined(val)) return
					const maxQcQty = Math.max((model.quantity ?? 0) - (this.master.totalGood || 0), 0)
					if (val > maxQcQty) {
						return ctx?.t('invalid.inspectionQuantityTooLarge')
					}
				}),
				this.field('unit').lockIf(v => !isRefNone(v.refName)),
				this.field('qualifiedQuantity').lock().hideIf(v => isNullOrUndefined(v.qualifiedQuantity)),
				this.field('unqualifiedQuantity').lock().hideIf(v => isNullOrUndefined(v.unqualifiedQuantity))
				// this.field('rectified').lockIf(t => t.qcResult === QaStatus.OK)
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
					.onChange((ctx,model,items)=>{ })
			);
			 */
		}
		return { fields, groups, customActions };
	}
	beforeDetails(): UiLogicFnResult<QualityInspectionMaterial> {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('materialCategoryID')
					.setCustomRenderer((fld, ctx: UiViewContext<any>) => {
						const text = ctx.model.productCategory?.categoryName;
						return ctx.globalProps.$ui.factory.textSpan(text || '');
					}),
				this.field('qualifiedQuantity').lock().hideIf(v => isNullOrUndefined(v.qualifiedQuantity)),
				this.field('unqualifiedQuantity').lock().hideIf(v => isNullOrUndefined(v.unqualifiedQuantity))
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
