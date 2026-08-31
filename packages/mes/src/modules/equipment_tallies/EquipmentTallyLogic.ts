/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, isNullOrUndefined } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type EquipmentTally, defineEquipmentTally } from '@/models/EquipmentTally';
import { type EquipmentTallyRecord, defineEquipmentTallyRecord } from '@/models/EquipmentTallyRecord';
import { h, reactive, ref, unref } from 'vue';
import { EquipmentCheckResult, EquipmentCheckResultEnum } from '@/enums/EquipmentCheckResult';

/**
 * 设备点检计分表交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:03.0
 * @revision 2024-08-12 18:18:43.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 设备点检计分表交互逻辑
 */
const tableDataKey = ref('id')
const searchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1
	},
	searchWord: '',
	searchParams: {}
})
const collectmaterialparams = {
	tableData: []
} as any
export class EquipmentTallyLogic extends UiLogic<EquipmentTally> {
	constructor(init: UiLogicInit) {
		super(defineEquipmentTally, init);
		this.addRelativeLogic<EquipmentTallyRecord>('records', master => new EquipmentTallyRecordLogic(this, master));
		this.beforeSave = (context: UiContext<EquipmentTally>, model: EquipmentTally, action: EntityAction) => {
			model.records.forEach(value => {
				if (value.entityState > 4) {
					value.entityState = 4
				}
			})
			return Promise.resolve(true);
		}
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			// 根据点检日期过滤
			if (this.field('checkDate').field) {
				fields.push(this.field('checkDate').searchable(true));
			}
			// 根据设备过滤
			if (this.field('equipmentID').field) {
				fields.push(this.field('equipmentID').searchable(true));
			}
			// 根据状态过滤
			if (this.field('status').field) {
				fields.push(this.field('status').searchable(true));
			}
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
				this.field('equipID').lockIf(() => !isNullOrUndefined(window.history.state.createParam) && window.history.state.createParam.refName)
			)
			/**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
				this.field('equipmentID').onChange<string>(async (model, newVal, oldVal) => {
					if (newVal) {
						try {
							const res = await this.apiClient.getAll({
								repository: 'EquipmentTallies',
								action: 'createEquipmentTallyRecordByEquipment',
								queryParams: {
									equipID: newVal.equipmentID,
								},
								service: 'mes',
							});
							if (res.list && res.list.length > 0) {
								MetaModel.clearItems(model.records);
								MetaModel.addSubGroupItems<EquipmentTally, EquipmentTallyRecord>({
									target: model,
									source: res.list,
									metaUiGroup: this.meta.metaui.getGroup('records'),
									sequenceKey: 'itemID',
									propsMapper: {
										deletable: () => false,
									},
									creator: defineEquipmentTallyRecord,
								});
							}
						} catch (errorC: any) {
 
							return false;
						}
					}
				})
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
				this.group('records')
					.addCustomAction({
						name: 'createContractItem',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newEquipmentTallyRecord,
						view: UiViewOne.Edit,
					})
					.addCustomAction({
						name: 'oneClickNormal',
						label: '一键正常',
						icon: 'far fa-plus-circle',
						role: 'success',
						onAction: this.oneClickNormal,
						visible: (t:any) => {
							// 判断所有数据是否正常
							const items = t.records.filter((value:any) => value.checkResult === EquipmentCheckResult.OK && value.entityState < 4)
							return items.length !== t.records.filter((value:any) =>value.entityState < 4 ).length
							
						},
						view: UiViewOne.Edit,
					})
				// .field('checkResult')
				// .inPlaceEdit()
				// .parent.field('remark')
				// .inPlaceEdit().parent
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 *
	 * @param context
	 * @param target
	 */
	newEquipmentTallyRecord(context: UiContext<EquipmentTally>, target: EquipmentTally) {
		context
			.newSubGroupItem<EquipmentTallyRecord>({
				group: 'records',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.records.includes(item)) target.records.push(item);
				}
			});
	}
	/**
	 *  一键正常
	 * @param context
	 * @param target
	 */
	async oneClickNormal(context: UiViewContext<any>, target: EquipmentTally) {
		const { $ui: ui, $router: router } = context.globalProps
		const metaFields = context.logic!.meta.metaui.groups.filter((item: any) => item.relObjName === 'EquipmentTallyRecord')
		const items = target.records.map(v => ({ ...v, id: `${v.tallyID},${v.itemID}` }))
		await context.uiBuilder.confirmDialog(context.uiBuilder.buildSearchForRelativeContent(
			ui.buildColumns(metaFields[0].groupUi, context, {
				isSearch: true
			}),
			{
				dataKey: unref(tableDataKey),
				selectionMode: 'multiple',
				paginator: false,
				onSearch: ({ searchParams, reload, pager }: any) => {
					return {
						list: items.filter(v => v.checkResult !== EquipmentCheckResult.OK).filter(item => item.itemName.includes(searchParams.searchWord) || (!isNullOrUndefined(item.category) ? item.category.includes(searchParams.searchWord) : '')), pager: searchParam.pager
					}
				},
				onPage: ({ pageNo, pageSize }: any) => {
					// console.log(pageNo, pageSize, '1111');

				},
				onSelect: (selection: any, row: any) => {
					collectmaterialparams.tableData = selection.map((v: any) => v.itemID)
				},
				onSelectAll: (selection: any, row: any) => {
					collectmaterialparams.tableData = selection.map((v: any) => v.itemID)
				}
			}
		), context, {
			title: '请选择点检记录',
			width: '80%',
			accept: async () => {
				target.records.forEach(value => {
					collectmaterialparams.tableData.forEach((id: any) => {
						if (value.itemID === id) {
							value.checkResult = EquipmentCheckResult.OK
							value.customProperties.$checkResult = EquipmentCheckResultEnum.textOf(EquipmentCheckResult.OK)
							MetaModel.modify(value)
						}
					})

				})
				return true
			}
		})
	}
	//设置详情逻辑
	beforeDetails(): UiLogicFnResult<EquipmentTally> {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length === 0) {
			fields.push(
				this.field('equipID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					const equipID = fldVal?.equipID ?? ctx.model.equipID;
					const label = fldVal?.equipName ?? fldVal?.equipNo ?? ctx.model.equipment?.equipName ?? '';
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: { color: '#409eff' },
								href: 'javascript:;',
								onClick: () => {
									if (equipID) {
										window.open(`/MES/Equipments/${equipID}`, '_blank');
									}
								},
							},
							label
						),
					]);
				})
			);
		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造设备点检计分表交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const EquipmentTallyLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new EquipmentTallyLogic({
		service: metaUiService,
		repository: 'EquipmentTallies',
		router,
		module: module || metaUiService.findModule('EquipmentTally'),
	});
/**
 * 点检记录交互逻辑
 */
export class EquipmentTallyRecordLogic extends UiGroupLogic<EquipmentTallyRecord, EquipmentTally> {
	constructor(parent: EquipmentTallyLogic, master: EquipmentTally) {
		super(defineEquipmentTallyRecord, parent, master, 'records');
	}
}
//#endregion ~GENERATED PARTS END
