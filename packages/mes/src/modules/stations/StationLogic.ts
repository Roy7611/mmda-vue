/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { MetaUiService, Module, MetaUiField, type UiContext, defaultPager, EntityState, isRefNone } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiSearchForm } from '@mmda/vui';
import { type Station, defineStation } from '@/models/Station';
import { type StationOperation, defineStationOperation } from '@/models/StationOperation';
/**
 * 工位交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:44.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 工位交互逻辑
 */
export class StationLogic extends UiLogic<Station> {
	constructor(init: UiLogicInit) {
		super(defineStation, init);
		this.addRelativeLogic<StationOperation>('operations', master => new StationOperationLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('lineID')
					.searchable(true)
					.setSearchParam(() => {
						return { status: 'USED' };
					}),
				this.field('equippingType').searchable(true),
				this.field('reportingMode').searchable(true),
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
			fields.push(
				this.field('lineID').setSearchParam((ctx, model) => {
					return { status: 'USED' };
				}),
				// this.field('opCode')
				// 	.hideIf(model => isLineIDEmpty(model))
				// 	.setSearchParam((ctx, model) => {
				// 		return { lineID: model.lineID };
				// 	})
			);
		}
		if (groups.length == 0) {
			/**
			 * 可设置multiOp = true，然后在StationOperation子表中添加多道工序。
			 */
			groups.push(
				this.group<StationOperation>('operations')
					.addCustomAction({
						name: 'clearopcode',
						label: 'action.clear',
						icon: 'pi pi-trash',
						role: 'danger',
						onAction: (ctx: UiContext<Station>) => ctx.removeSubGroupItems('operations'),
						// visible: (t: StationOperation) => t.multiOp == true,
					})
					.addCustomAction({
						name: 'addopcode',
						label: 'action.add',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.Addopcode,
						// visible: (t: StationOperation) => t.multiOp == true,
					})
				// .defaultAdder(this.Addopcode)
			);
		}
		return { fields, groups, customActions };
	}
	// 添加工序
	Addopcode(context: UiContext<Station>, target: Station) {
		const { $ui: ui } = context.globalProps;
		console.log('Addopcode', context.model, target);
		// 1. 判断是否已选产线
		if (isLineIDEmpty(target)) {
			console.log('请先选择产线', context.model, target);
			return ui.toast(context, { title: context.t('dialog.title.warning'), message: context.t('invalid.selectLineFirst'), type: 'warn', life: 3000 });
		}
		if (target.multiOp == false) {
			return ui.toast(context, { title: context.t('dialog.title.warning'), message: context.t('invalid.multiOperationRequired'), type: 'warn', life: 3000 });
		}
		// 2. 选择工序时加 lineID 过滤
		context
			.select<StationOperation>({
				repository: 'ProcessOperations',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						lineID: target.lineID, // 产线过滤
						// status: '1',
					},
				},
				ctor: defineStationOperation,
				selectionMode: 'multiple',
			})
			.then(selection => {
				if (Array.isArray(selection)) {
					// 添加相同的工序显示提示信息
					const selectOpcodes = selection.map(s => s.opCode);
					const selectedOpcodes = context.model.operations.map((op: any) => op.opCode);
					const hasIntersection = selectOpcodes.some(opCode => selectedOpcodes.includes(opCode));
					if (hasIntersection) {
						return ui.toast(context, { title: context.t('dialog.title.warning'), message: context.t('invalid.duplicateOperation'), type: 'warn', life: 3000 });
					}
					context.addSubGroupItems<StationOperation>({
						target,
						group: 'operations',
						source: selection,
						propsMapper: {
							opCode: m => ({ opCode: m.opCode, opName: m.opName }),
						},
					});
					return true;
				}
			});
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造工位交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const StationLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new StationLogic({
		metaUiService: metaUiService,
		repository: 'Stations',
		router,
		module: module || metaUiService.findModule('Station'),
	});
/**
 * 工序交互逻辑
 */
export class StationOperationLogic extends UiGroupLogic<StationOperation, Station> {
	constructor(parent: StationLogic, master: Station) {
		super(defineStationOperation, parent, master, 'operations');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (groups.length == 0) {
			fields
				.push
				// this.field('opCode').lockIf(model => !isRefNone(model.opCode)),
				// this.field('processID').lockIf(model => !isRefNone(model.processID)),
				();
		}
		return { fields, groups, customActions };
	}
	//beforeDetails(){}
}
//#endregion ~GENERATED PARTS END

function isLineIDEmpty(model: Station) {
	return !model.lineID || model.lineID == '0';
}
