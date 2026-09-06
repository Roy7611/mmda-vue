/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { type MetaUiService, type Module, type MetaUiField, type UiContext, type EntityAction, isNullOrUndefined, MetaModel } from '@mmda/core';
import { type UiViewContext, type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewMany } from '@mmda/vui';
import { type ProductionTask, defineProductionTask } from '@/models/ProductionTask';
import { ProductionTaskStatus } from '@/enums/ProductionTaskStatus';
import { type ProductionTaskFeeding, defineProductionTaskFeeding } from '@/models/ProductionTaskFeeding';

//生产计划
const planNoData = {
	planNo: <any>null,
	planNoPager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	planNosList: <any>[],
	tablecolumns: <any>[],
	tableDataKEY: 'id',
});

/**
 * 获取所有的 生产计划 plan
 */
const getAllplan = async (context: UiContext, value?: any) => {
	await context.logic!.getAllOf<Record<string, unknown>>('ProductionPlans', {
		queryParams: {
			pageNo: planNoData.planNoPager.pageNo,
			pageSize: planNoData.planNoPager.pageSize,
			searchWord: value,
		},
	}, { service: 'mes' })
		.then((res: any) => {
			res.list = res.list.map((it: any) => {
				return {
					...it,
				};
			});
			console.log(res.list, 'plan');
			planNoData.planNoPager = res.pagination;
			planNoData.planNosList = res.list;
		})
		.catch((error: any) => {
			console.log(error);
		});
};

/**
 * 生产任务交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-09-01 23:07:58.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产任务交互逻辑
 */
export class ProductionTaskLogic extends UiLogic<ProductionTask> {
	constructor(init: UiLogicInit) {
		super(defineProductionTask, init);
		this.addRelativeLogic<ProductionTaskFeeding>('feedings', master => new ProductionTaskFeedingLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				/**
				 * searchable报错，疑似元数据库没有值
				 */
				this.field('status'),
				this.field('expectedStart'),
				this.field('lineID'),
				//当前没有制品类别模块，先以普通文本形式显示
				this.field('productCategoryID').setCustomCellRenderer((fld, ctx) => {
					return ctx.uiBuilder.factory.textSpan(ctx.model.productCategory ? ctx.model.productCategory.categoryName : '-', {});
				})
			);

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

	// 列表搜索：状态选项来自元数据，排除「新」
	beforeLoad = (ctx: UiViewContext<any>) => {
		if (ctx.view !== UiViewMany.Index) return Promise.resolve(true);
		const field = ctx.metaui.getField('status');
		const ref = field.reference;
		if (ref?.isEnum) {
			ctx.getFieldOptions(field).selectOptions = ref.refOptions.filter(
				(o: any) => ref.valueFn(o) !== ProductionTaskStatus.NEW,
			);
		}
		return Promise.resolve(true);
	};

	beforeSearch() {
		const { searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push({
				searchLabel: 'view.planNo',
				searchParam: 'planNo',
				valueFn: (v: any) => v.planNo,
				renderer: (ctx: UiContext & any, csf) => {
					const { $ui: ui, $t: t } = ctx.globalProps;
					// if (hrefData.value.projectID) {
					// 	this.getOneProjects(ctx, hrefData.value.projectID, csf.searchVal.value);
					// }
					return ui.factory.searchForRelative({
						id: 'search_planNo',
						modelValue: csf.searchVal.value,
						placeholder: t('action.select'),
						dataKey: 'planID',
						optionLabel: 'planNo',
						//options: planNoData.planNosList,
						options: !isNullOrUndefined(csf.searchVal.value) ? [csf.searchVal.value] : planNoData.planNosList,
						toSearch: async () => {
							const picked = await ctx.select({
								repository: 'ProductionPlans',
								service: 'mes',
								selectionMode: 'single',
							})
							if (!Array.isArray(picked) || !picked.length) return false
							const data = picked[0]
							planNoData.planNo = data
							csf.searchVal.value = data ?? null
							ctx.app.localDb.put(`search/${ctx.logic.repository}/planNo`, JSON.parse(JSON.stringify(data)))
							return true
						},
						onUpdate: async (value: any) => {
							csf.searchVal.value = value;
							planNoData.planNo = value;
							ctx.app.localDb.put(`search/${ctx.logic.repository}/planNo`, value);
						},
						onInput: async (value: any) => {
							// console.log(value, '输入')
							if (value) {
								// getAllPayees()
							}
						},
					});
				},
			});
		}

		return { searchFields, customSearchFields };
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
			groups.push(this.group<ProductionTaskFeeding>('feedings').defaultAdder(this.newProductionTaskFeeding));
		}
		return { fields, groups, customActions };
	}
	newProductionTaskFeeding(context: UiContext<ProductionTask>, target: ProductionTask) {
		context
			.newSubGroupItem<ProductionTaskFeeding>({
				group: 'feedings',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.records.includes(item)) target.records.push(item);
				}
			});
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('planNo').setCustomRenderer((fld, ctx: UiViewContext<any>) => {
					const fldVal = ctx.getFieldValue(fld);
					if (isNullOrUndefined(fldVal) || isNullOrUndefined(ctx.model.planID)) return fldVal;
					return ctx.uiBuilder.factory.link({
						text: fldVal,
						href: `/MES/ProductionPlans/${ctx.model.planID}`,
						target: '_blank',
						style: { color: '#409eff' },
					});
				}),
				this.field('orderNo').setCustomRenderer((fld, ctx: UiViewContext<any>) => {
					const fldVal = ctx.getFieldValue(fld);
					if (isNullOrUndefined(fldVal) || isNullOrUndefined(ctx.model.orderID)) return fldVal;
					return ctx.uiBuilder.factory.link({
						text: fldVal,
						href: `/MES/ProductionOrders/${ctx.model.orderID}`,
						target: '_blank',
						style: { color: '#409eff' },
					});
				}),
				this.field('endOpCode').setCustomRenderer((fld, ctx: UiContext<ProductionTask>, props) => ctx.uiBuilder.factory.textSpan(MetaModel.getRefProp(ctx.model, 'endOpCode'))),
				//当前没有制品类别模块，先以普通文本形式显示
				this.field('productCategoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					return ctx.uiBuilder.factory.textSpan(ctx.model.productCategory ? ctx.model.productCategory.categoryName : '-', {});
				})
			)
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
		return { fields, groups, customActions };
	}
}

/**
 * 构造生产任务交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionTaskLogicCtor = (metaUiService: MetaUiService, router: UiLogicInit["router"], module?: Module) =>
	new ProductionTaskLogic({
		metaUiService: metaUiService,
		repository: 'ProductionTasks',
		router,
		module: module || metaUiService.findModule('ProductionTask'),
	});
/**
 * 投料清单交互逻辑
 */
export class ProductionTaskFeedingLogic extends UiGroupLogic<ProductionTaskFeeding, ProductionTask> {
	constructor(parent: ProductionTaskLogic, master: ProductionTask) {
		super(defineProductionTaskFeeding, parent, master, 'feedings');
	}
}
//#endregion ~GENERATED PARTS END
