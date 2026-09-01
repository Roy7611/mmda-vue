/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, MetaModel, EntityAction, isNullOrUndefined, ApiClient, getSearchOp } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProductionEvent, defineProductionEvent } from '@/models/ProductionEvent';
import { ProductionTaskStatus } from '@/enums/ProductionTaskStatus';
import { ProductionEventPhoto, defineProductionEventPhoto } from '@/models/ProductionEventPhoto';
/**
 * 生产事件交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-09-01 23:04:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产事件交互逻辑
 */
export class ProductionEventLogic extends UiLogic<ProductionEvent> {
	constructor(init: UiLogicInit) {
		super(defineProductionEvent, init);
		this.addRelativeLogic<ProductionEventPhoto>('photos', master => new ProductionEventPhotoLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('status').searchable(true), this.field('eventType').searchable(true), this.field('eventCauses').searchable(true), this.field('taskID').searchable(true));
		}
		return { fields, groups, customActions };
	}
	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields
				.push
				(
					this.field('taskID')
						.lockIf((model: ProductionEvent, ctx: UiContext<ProductionEvent>) => model.taskID && ctx.isEditDialog)
						.setSearchParam((ctx, model, field) => ({
							status: getSearchOp('NOT_IN').toSQL([ProductionTaskStatus.CANCELED, ProductionTaskStatus.FINISHED])
						})),
					this.field('remark')
						.onWarn<string>((value, model, ctx) => {
							if (!isNullOrUndefined(value) && value.length >= 255) {
								return ctx.t('productionEvent.remarkMaxLength');
							}
							return '';
						}),
				)
			// this.field('eventCauses').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
			// 	const { $ui: ui, $t: t } = ctx.globalProps;
			// 	const fldRef = fld.reference;
			// 	if (!fldRef || !fldRef.isEnum) {
			// 		console.error(`${fld.fieldName} is not an enum field.`);
			// 		return h('span', { type: 'warning' }, { default: () => '不是枚举字段' });
			// 	}
			// 	const { labelFn } = fldRef;
			// 	const numVal = ctx.model[fld.fieldName] ?? 0;
			// 	const arrVal = fldRef.refOptions.filter(it => it.id & numVal).map(it => it.id);
			// 	return ui.factory.multiSelect({
			// 		id: `search_${fld.fieldName}`,
			// 		editable: true,
			// 		placeholder: t('action.select'),
			// 		optionLabel: 'text',
			// 		optionValue: 'id',
			// 		options: fldRef.refOptions.filter(item => item.id > 0),
			// 		modelValue: arrVal,
			// 		onChange: (event: any) => {
			// 			ctx.model.eventCauses = (event.value as number[]).reduce((prev, curr) => prev | curr, 0);
			// 			// 状态改为已修改
			// 			MetaModel.modify(ctx.model);
			// 		},
			// 	});
			// })
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
				this.group<ProductionEventPhoto>('photos')
					.addCustomAction({
						name: 'createProductionEventPhoto',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.addProductionEventPhoto,
						// view: UiViewOne.Edit,
					})
					.clearIf(() => true)
				// .defaultAdder(this.addProductionEventPhoto),
			);
		}
		return { fields, groups, customActions };
	}
	addProductionEventPhoto(context: UiContext<ProductionEvent>, target: ProductionEvent) {
		context
			.newSubGroupItem<ProductionEventPhoto>({
				target,
				sequenceKey: 'itemID',
				group: 'photos',
				propsMapper: {},
			})
			.then(Photo => {
				if (Photo) {
					if (!target.photos.includes(Photo)) target.photos.push(Photo);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造生产事件交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProductionEventLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProductionEventLogic({
		metaUiService: metaUiService,
		repository: 'ProductionEvents',
		router,
		module: module || metaUiService.findModule('ProductionEvent'),
	});
//#endregion ~GENERATED PARTS END
/**
 * 生产事件照片交互逻辑
 */
export class ProductionEventPhotoLogic extends UiGroupLogic<ProductionEventPhoto, ProductionEvent> {
	constructor(parent: ProductionEventLogic, master: ProductionEvent) {
		super(defineProductionEventPhoto, parent, master, 'photos');
	}
}
