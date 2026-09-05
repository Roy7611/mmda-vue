/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext, EntityAction } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProductionLot, defineProductionLot } from '@/models/ProductionLot';
/**
 * 生产批次交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-08-12 18:17:58.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产批次交互逻辑
 */
export class ProductionLotLogic extends UiLogic<ProductionLot> {
	isEdit: any;
	constructor(init: UiLogicInit) {
		super(defineProductionLot, init);

		this.beforeSave = (context: UiContext<ProductionLot>, model: ProductionLot, action: EntityAction) => {
			const { tel, email, telPrefix } = model
			const { $t: t } = context.globalProps
			if (!model.plateQty || model.plateQty<=0 ) return Promise.reject(Error(t('auth.plateQtyError')));
			return Promise.resolve(true);
		};
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('taskID'), this.field('prodDate'));
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
						console.log('newVal', newVal);
						console.log('model', model);
						ctx.setFieldValue('productCode', model.task.productCode ?? null);
						ctx.setFieldValue('productName', model.task.productName ?? null);
						ctx.setFieldValue('quantity', model.task.taskQuantity ?? null);
						ctx.setFieldValue('unit', model.task.unit ?? null);
					})
					.lockIf(() => this.isEdit),
				this.field('lotNo').lockIf(() => this.isEdit),
				this.field('prodDate').lockIf(() => this.isEdit),
				this.field('productCode').lockIf(() => this.isEdit),
				this.field('productName').lockIf(() => this.isEdit),
				this.field('unit').lockIf(() => this.isEdit),

				this.field('workerID').lockIf(model => model.workerID!=null && model.workerID!=''),
				this.field('shiftID').lockIf(model => model.shiftID!=null && model.shiftID!=''),
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
			groups.push(this.group<ProductionLot>('a2').hideIf(model => true));
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(this.group<ProductionLot>('a2').hideIf(model => false));
		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造生产批次交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionLotLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionLotLogic({
		metaUiService: metaUiService,
		repository: 'ProductionLots',
		router,
		module: module || metaUiService.findModule('ProductionLot'),
	});
//#endregion ~GENERATED PARTS END
