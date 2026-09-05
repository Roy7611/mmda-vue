/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { getSqlOperator, MetaModel } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type AlternativeStrategy, defineAlternativeStrategy } from '@/models/AlternativeStrategy';
import { type AlternativeStrategyItem, defineAlternativeStrategyItem } from '@/models/AlternativeStrategyItem';
import type { UiViewContext } from '@mmda/vui';
/**
 * 替代料策略交互逻辑
 * @author mmda codebot
 * @since 2025-09-27 16:32:04.0
 * @revision 2025-09-27 16:32:04.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 替代料策略交互逻辑
 */
export class AlternativeStrategyLogic extends UiLogic<AlternativeStrategy> {
	constructor(init: UiLogicInit) {
		super(defineAlternativeStrategy, init);
		this.addRelativeLogic<AlternativeStrategyItem>('items', (master) => new AlternativeStrategyItemLogic(this, master));
	}

	beforeIndex(): UiLogicFnResult<AlternativeStrategy> {
		const { fields, groups, customActions } = super.beforeIndex();

		if (fields.length == 0) {
			fields.push(
				this.field('allowMixed'),
				this.field('status'),
				this.field('mixedByProbability')
			)
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
		}
		if (groups.length == 0) {
			groups.push(
				this.group<AlternativeStrategyItem>('items')
					.addCustomAction({
						name: 'createAlternativeStrategyItem',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newAlternativeStrategyItem,
						view: UiViewOne.Edit,
					})
			);
		}
		return { fields, groups, customActions };
	}

	/**
	 * 创建替代料策略项
	 */
	newAlternativeStrategyItem(ctx: UiContext<AlternativeStrategy>, model: AlternativeStrategy) {
		ctx.newSubGroupItem<AlternativeStrategyItem>({
			group: 'items',
			sequenceKey: 'priority',
			target: model,
			propsMapper: {
				strategyID: () => model.strategyID,
				priority: () => model.items ? model.items.length + 1 : 1,
			}
		}).then(item => {
			if (item) {
				// 行已在 newSubGroupItem 入集；重复检查需排除自身
				const isDuplicate = model.items.some(
					(i: AlternativeStrategyItem) => i !== item && i.materialID === item.materialID,
				);
				if (isDuplicate) {
					ctx.removeSubGroupItem('items', item);
					ctx.uiBuilder.toast(ctx, {
						severity: 'warn',           // warn 提示
						summary: ctx.t('invalid.duplicateMaterial'),
						detail: ctx.t({ message: 'invalid.duplicateMaterialDetail', param: { it: item.materialID } }),
						group: 'br',
						life: 3000,
					});
				}
			}
		});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造替代料策略交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const AlternativeStrategyLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new AlternativeStrategyLogic({
	metaUiService: metaUiService,
	repository: 'AlternativeStrategies',
	router,
	module: module || metaUiService.findModule('AlternativeStrategy'),
})
/**
 * 替代料清单交互逻辑
 */
export class AlternativeStrategyItemLogic extends UiGroupLogic<AlternativeStrategyItem, AlternativeStrategy> {
	constructor(parent: AlternativeStrategyLogic, master: AlternativeStrategy) {
		super(defineAlternativeStrategyItem, parent, master, 'items')
	}

	beforeEdit(): UiLogicFnResult<AlternativeStrategyItem> {
		const { fields, groups, customActions } = super.beforeEdit();

		if (fields.length == 0) {
			fields.push(
				this.field('materialID')
					.refFilter((model, ctx) => {
					const __p = ((context: UiContext<AlternativeStrategyItem>, model: AlternativeStrategyItem, field: MetaUiField) => ({
						status: getSqlOperator('IN').toSQL('USED'), // 只能选择启用的物料
					}),
				this.field('usageProbability')
					.onValidate<number>((val) => {
						if (val !== undefined && val !== null && val > 100) {
							return { message: 'invalid.maxValue', param: { it: 100 } };
						}
						if (val !== undefined && val !== null && val < 0) {
							return { message: 'invalid.minValue', param: { it: 0 } };
						}
						return '';
					}),
				this.field('priority')
					.onValidate<number>((val) => {
						if (val !== undefined && val !== null && val <= 0) {
							return { message: 'invalid.minValue', param: { it: 1 } }; // 优先级通常从1开始，必须大于0
						}
						return '';
					})
			)(ctx as any, model as any, undefined as any);
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
		}

		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
