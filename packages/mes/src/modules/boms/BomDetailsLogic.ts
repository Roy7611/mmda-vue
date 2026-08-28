/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import { h } from 'vue';
import { isNullOrUndefined } from '@mmda/core';
import { UiLogic, type UiLogicFnResult, type UiViewContext } from '@mmda/vui';
import type { Bom } from '@/models/Bom';
import type { BomItem } from '@/models/BomItem';
import { BomType } from '@/enums/BomType';
import {
	type BomLogic,
	renderBomItemMaterialPic,
} from './BomLogic';

export function beforeDetails(this: BomLogic): UiLogicFnResult<Bom> {
	const { fields, groups, customActions } = UiLogic.prototype.beforeDetails.call(this);
	if (fields.length == 0) {
		fields.push(
			this.field('alternate').hideIf(model => model.bomType !== BomType.ALTERNATE),
			this.field('revisedDesc').hideIf(model => isNullOrUndefined(model.revisedDesc)),
			this.field('totalQuantity').hideIf(model => isNullOrUndefined(model.totalQuantity)),
			this.field('refBomID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
				const fldVal = ctx.getFieldValue(fld);
				return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
					h(
						'a',
						{
							style: {
								color: '#409eff',
							},
							href: 'javascript:;',
							onClick: async () => {
								const { $api: apiBox, $router: router } = ctx.globalProps;

								if (fldVal.BomID) {
									window.open(`/MES/Boms/${fldVal.BomID}`, '_blank');
								}
							},
						},
						fldVal ? fldVal.BomNo : ''
					),
				]);
			}),
			this.field('productCategoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
				const fldVal = ctx.getFieldValue(fld);
				return h('div', { style: { width: '100%', overflow: 'hidden' } }, !isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
			})
		);
	}
	if (groups.length == 0) {
		groups.push(
			this.group<BomItem>('items')
				.field('materialPic')
				.setCustomRenderer(renderBomItemMaterialPic)
				.setCustomCellRenderer(renderBomItemMaterialPic)
				.parent
		);
	}
	return { fields, groups, customActions };
}
