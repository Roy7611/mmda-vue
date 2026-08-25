/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Sku, defineSku } from '../../models/Sku';
import { type SkuFeature, defineSkuFeature } from '../../models/SkuFeature';
import { type SkuMedia, defineSkuMedia } from '../../models/SkuMedia';
/**
 * Sku交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-09-01 23:08:30.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * Sku交互逻辑
 */
export class SkuLogic extends UiLogic<Sku> {
	constructor(init: UiLogicInit) {
		super(defineSku, init);
		this.addRelativeLogic<SkuFeature>('features', (master) => new SkuFeatureLogic(this, master));
		this.addRelativeLogic<SkuMedia>('medias', (master) => new SkuMediaLogic(this, master));
	}
	beforeIndex(): UiLogicFnResult<Sku> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('status').searchable(true),
			)
		}
		return { fields, groups, customActions }
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
				this.group<SkuFeature>('features').defaultAdder(this.newSkuFeature),
				this.group<SkuMedia>('medias').defaultAdder(this.newSkuMedia),
				// this.group<Sku>('skus').defaultAdder(this.newSku),
			)
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
	/**
		 * 创建SKU媒体
		 * @param context 界面上下文
		 * @param target 项目模板
		*/
	newSkuMedia(context: UiContext, target: Sku) {
		context.newSubGroupItem<SkuMedia>({
			group: 'medias',
			sequenceKey: 'itemID',
			target,
		}).then(item => {
			if (item) {
				context.addSubGroupItem('medias', item);
			}
		})
	}

	/**
		 * 创建物料特征
		 * @param context 界面上下文
		 * @param target 项目模板
		*/
	newSkuFeature(context: UiContext, target: Sku) {
		context.newSubGroupItem<SkuFeature>({
			group: 'features',
			target,
		}).then(item => {
			if (item) {
				context.addSubGroupItem('features', item);
			}
		})
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造Sku交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const SkuLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new SkuLogic({
	service: metaUiService,
	repository: 'Skus',
	router,
	module: module || metaUiService.findModule('Sku'),
})
/**
 * 特征交互逻辑
 */
export class SkuFeatureLogic extends UiGroupLogic<SkuFeature, Sku> {
	constructor(parent: SkuLogic, master: Sku) {
		super(defineSkuFeature, parent, master, 'features')
	}
}
/**
 * 媒体文件交互逻辑
 */
export class SkuMediaLogic extends UiGroupLogic<SkuMedia, Sku> {
	constructor(parent: SkuLogic, master: Sku) {
		super(defineSkuMedia, parent, master, 'medias')
	}
}
//#endregion ~GENERATED PARTS END
