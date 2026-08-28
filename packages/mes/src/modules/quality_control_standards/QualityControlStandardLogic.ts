/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type QualityControlStandard, defineQualityControlStandard } from '@/models/QualityControlStandard';
import { type QualityControlStandardItem, defineQualityControlStandardItem } from '@/models/QualityControlStandardItem';
import { QualityInspectionMethod } from '@/enums/QualityInspectionMethod';

/**
 * 质量控制标准交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:39.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 质量控制标准交互逻辑
 */
export class QualityControlStandardLogic extends UiLogic<QualityControlStandard> {
	constructor(init: UiLogicInit) {
		super(defineQualityControlStandard, init);
		this.addRelativeLogic<QualityControlStandardItem>('items', master => new QualityControlStandardItemLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('status').searchable(true), this.field('qcPhase').searchable(true), this.field('inspectionMethod').searchable(true));
		}
		return { fields, groups, customActions };
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push
				(
					//抽检才有比例，全检时比例固定为100%
					this.field('inspectionMethod').onChange((ctx, model, newVal, oldVal) => {
						if (newVal == QualityInspectionMethod.ALL) {
							model.samplingRatio = 1;
						} else {
							model.samplingRatio = 0;
						}
					}),
					// this.field('samplingRatio').lockIf(model => model.inspectionMethod == QualityInspectionMethod.ALL)
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
			groups.push(
				this.group<QualityControlStandardItem>('items')
					.addCustomAction({
						name: 'createContractItem',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newQualityControlStandardItem,
						view: UiViewOne.Edit,
					})
			);
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((model,items)=>{ })
			);
			 */
		}
		return { fields, groups, customActions };
	}
	newQualityControlStandardItem(context: UiContext<QualityControlStandard>, target: QualityControlStandard) {
		context
			.newSubGroupItem<QualityControlStandardItem>({
				group: 'items',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					// target.items.push(item);
					context.addSubGroupItem('items', item);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造质量控制标准交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const QualityControlStandardLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new QualityControlStandardLogic({
		service: metaUiService,
		repository: 'QualityControlStandards',
		router,
		module: module || metaUiService.findModule('QualityControlStandard'),
	});
/**
 * 检查项交互逻辑
 */
export class QualityControlStandardItemLogic extends UiGroupLogic<QualityControlStandardItem, QualityControlStandard> {
	constructor(parent: QualityControlStandardLogic, master: QualityControlStandard) {
		super(defineQualityControlStandardItem, parent, master, 'items');
	}
}
//#endregion ~GENERATED PARTS END
