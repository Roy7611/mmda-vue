/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProductionItem, defineProductionItem } from '@/models/ProductionItem';
import { type ProductionItemTool, defineProductionItemTool } from '@/models/ProductionItemTool';
import { type ProductionItemJournal, defineProductionItemJournal } from '@/models/ProductionItemJournal';
import { type ProductionItemParam, defineProductionItemParam } from '@/models/ProductionItemParam';
import { type ProductionItemAlarm, defineProductionItemAlarm } from '@/models/ProductionItemAlarm';
import { ref } from 'vue';

/**
 * 生产单件交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-09-21 11:01:51.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产单件交互逻辑
 */

export class ProductionItemLogic extends UiLogic<ProductionItem> {
	isEdit: any;
	constructor(init: UiLogicInit) {
		super(defineProductionItem, init);
			this.addRelativeLogic<ProductionItemTool>('tools',(master)=>new ProductionItemToolLogic(this,master));
			this.addRelativeLogic<ProductionItemJournal>('journals',(master)=>new ProductionItemJournalLogic(this,master));
			this.addRelativeLogic<ProductionItemParam>('params',(master)=>new ProductionItemParamLogic(this,master));
			this.addRelativeLogic<ProductionItemAlarm>('alarms',(master)=>new ProductionItemAlarmLogic(this,master));
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('taskID').searchable(true),
				// this.field('prodDate').searchable(true),
				this.field('qcResult').searchable(true)
			);
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
					.setSearchParam((ctx, model) => {
						//let filters = null;
						//filters = 'status=WORKING';
						return {
							//filter: filters,
							status: 'WORKING',
						};
					})
					.onChange<string>((ctx, model, newVal, oldVal) => {
						console.log('newVal', newVal);
						console.log('model', model);
						ctx.setFieldValue('productCode', model.task?.productCode ?? null);
						ctx.setFieldValue('productName', model.task?.productName ?? null);
					})
					.lockIf(() => this.isEdit),
				this.field('productCode').lockIf(() => this.isEdit),
				this.field('productName').lockIf(() => this.isEdit),
				this.field('plateID').lockIf(() => this.isEdit),
				this.field('lotNo').lockIf(() => this.isEdit),

				this.field('startTime')
					.onChange<Date>((ctx, model, newVal, oldVal) => {
						const finish = model.finishTime;
						console.log(finish, newVal);
						if (finish && new Date(newVal).getTime() > new Date(finish).getTime()) {
							ctx.uiBuilder.toast(ctx, {
								severity: 'error',
								summary: ctx.t('dialog.title.error'),
								detail: `开始日期不能超过结束日期`,
								group: 'br',
							});
						}
					})
					.lockIf(() => this.isEdit),
				this.field('finishTime')
					.onChange<Date>((ctx, model, newVal, oldVal) => {
						const start = model.startTime;
						if (start && new Date(newVal).getTime() < new Date(start).getTime()) {
							ctx.uiBuilder.toast(ctx, {
								severity: 'error',
								summary: ctx.t('dialog.title.error'),
								detail: `结束日期不能早于开始日期`,
								group: 'br',
							});
						}
					})
					.lockIf(() => this.isEdit),

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
			groups.push(
				this.group<ProductionItemParam>('params').hideIf(() => {
					return true;
				}),
				this.group<ProductionItemAlarm>('alarms').hideIf(() => {
					return true;
				}),
				this.group<ProductionItemJournal>('journals').hideIf(() => {
					return true;
				})
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 * 参数
	 * @param context
	 * @param target
	 */
	newparams(context: UiContext<ProductionItem>, target: ProductionItem) {
		context
			.newSubGroupItem<ProductionItemParam>({
				group: 'params',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					target.params.push(item);
				}
			});
	}
	/**
	 * 警告
	 * @param context
	 * @param target
	 */
	newalarms(context: UiContext<ProductionItem>, target: ProductionItem) {
		context
			.newSubGroupItem<ProductionItemAlarm>({
				group: 'alarms',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					target.alarms.push(item);
				}
			});
	}
	/**
	 * 日志
	 * @param context
	 * @param target
	 */

	newjournals(context: UiContext<ProductionItem>, target: ProductionItem) {
		context
			.newSubGroupItem<ProductionItemJournal>({
				group: 'journals',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					target.journals.push(item);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造生产单件交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionItemLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionItemLogic({
		service: metaUiService,
		repository: 'ProductionItems',
		router,
		module: module || metaUiService.findModule('ProductionItem'),
	})
	/**
	 * 用具交互逻辑
	 */
	export class ProductionItemToolLogic extends UiGroupLogic<ProductionItemTool,ProductionItem>{
		constructor(parent: ProductionItemLogic, master: ProductionItem){
			super(defineProductionItemTool,parent,master,'tools')
		}
	}
	/**
	 * 日志交互逻辑
	 */
	export class ProductionItemJournalLogic extends UiGroupLogic<ProductionItemJournal,ProductionItem>{
		constructor(parent: ProductionItemLogic, master: ProductionItem){
			super(defineProductionItemJournal,parent,master,'journals')
		}
	}
	/**
	 * 参数交互逻辑
	 */
	export class ProductionItemParamLogic extends UiGroupLogic<ProductionItemParam,ProductionItem>{
		constructor(parent: ProductionItemLogic, master: ProductionItem){
			super(defineProductionItemParam,parent,master,'params')
		}
	}
/**
 * 报警交互逻辑
 */
export class ProductionItemAlarmLogic extends UiGroupLogic<ProductionItemAlarm, ProductionItem> {
	constructor(parent: ProductionItemLogic, master: ProductionItem) {
		super(defineProductionItemAlarm, parent, master, 'alarms');
	}
}
//#endregion ~GENERATED PARTS END
