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
import { type ProductionLine, defineProductionLine } from '@/models/ProductionLine';
import { type Station, defineStation } from '@/models/Station';
import { type StationOperation, defineStationOperation } from '@/models/StationOperation';

/**
 * 生产线交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-09-01 19:02:48.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产线交互逻辑
 */
export class ProductionLineLogic extends UiLogic<ProductionLine> {
	constructor(init: UiLogicInit) {
		super(defineProductionLine, init);
		this.addRelativeLogic<Station>('stations', (master) => new StationLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('status'),);
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
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		// if (fields.length == 0) {

		// }
		// if (groups.length == 0) {

		// }

		return { fields, groups, customActions };
	}
}

/**
 * 构造生产线交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ProductionLineLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ProductionLineLogic({
	metaUiService: metaUiService,
	repository: 'ProductionLines',
	router,
	module: module || metaUiService.findModule('ProductionLine'),
})
/**
 * 工位交互逻辑
 */
export class StationLogic extends UiGroupLogic<Station, ProductionLine> {
	constructor(parent: ProductionLineLogic, master: ProductionLine) {
		super(defineStation, parent, master, 'stations')
		this.addRelativeLogic<StationOperation>('operations', master => new StationOperationLogic(this, master));
	}
}
/**
 * 工序交互逻辑
 */
export class StationOperationLogic extends UiGroupLogic<StationOperation, Station> {
	constructor(parent: StationLogic, master: Station) {
		super(defineStationOperation, parent, master, 'operations');
	}
	//beforeDetails(){}
}
//#endregion ~GENERATED PARTS END
