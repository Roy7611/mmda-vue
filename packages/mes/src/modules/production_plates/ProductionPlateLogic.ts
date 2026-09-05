/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProductionPlate, defineProductionPlate } from '@/models/ProductionPlate';
/**
 * 生产货组交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:30.0
 * @revision 2024-09-01 23:03:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产货组交互逻辑
 */
export class ProductionPlateLogic extends UiLogic<ProductionPlate> {
	isEdit: any;
	constructor(init: UiLogicInit) {
		super(defineProductionPlate, init);
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('taskID'), this.field('prodDate'), this.field('qcResult'));
		}
		return { fields, groups, customActions };
	}
	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();

		//判断页面是编辑
		if (this.router.currentRoute.value.params.id) {
			this.isEdit = true;
		} else {
			this.isEdit = false;
		}

		if (fields.length == 0) {
			fields.push(
				//生产任务变动
				this.field('taskID')
					.refFilter((model, ctx) => {
					const __p = ((ctx, model) => {
						//let filters = null;
						//filters = 'status=WORKING';
						return {
							//filter: filters,
							status: 'WORKING',
						};
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
				})
					.onChange<string>((ctx, model, newVal, oldVal) => {
						if (newVal) {
							const task = ctx.getFieldCurrentOption('taskID');
							if (task) {
								ctx.setFieldValue('productCode', task?.productCode ?? null);
								ctx.setFieldValue('productName', task?.productName ?? null);
								ctx.setFieldValue('quantity', task?.taskQuantity ?? null);
								ctx.setFieldValue('unit', task?.unit ?? null);
								ctx.setFieldValue('packID', task?.packID ?? null);
								ctx.setFieldValue('packQty', task?.packQty ?? 0);
							}
						} else {
							ctx.setFieldValue('productCode', null);
							ctx.setFieldValue('productName', null);
							ctx.setFieldValue('quantity', null);
							ctx.setFieldValue('unit', null);
							ctx.setFieldValue('packID', null);
							ctx.setFieldValue('packQty', 0);
						}
					})
					.lockIf(() => this.isEdit),
				this.field('prodDate').lockIf(() => this.isEdit),
				this.field('productCode').lockIf(() => this.isEdit),
				this.field('productName').lockIf(() => this.isEdit),
				this.field('unit').lockIf(() => this.isEdit),
				this.field('workerID').lockIf(model => model.workerID != null && model.workerID != ''),
				this.field('shiftID').lockIf(model => model.shiftID != null && model.shiftID != '')
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

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造生产货组交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionPlateLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionPlateLogic({
		metaUiService: metaUiService,
		repository: 'ProductionPlates',
		router,
		module: module || metaUiService.findModule('ProductionPlate'),
	});
//#endregion ~GENERATED PARTS END
