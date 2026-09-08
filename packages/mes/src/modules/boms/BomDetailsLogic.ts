/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import { isNullOrUndefined, type UiContext } from '@mmda/core';
import { UiLogic, type UiLogicFnResult } from '@mmda/vui';
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
			this.field('refBomID').setCustomRenderer((fld, ctx: UiContext<any>, props) => {
				const fldVal = ctx.getFieldValue(fld);
				return ctx.uiBuilder.factory.link({
					text: fldVal ? fldVal.BomNo : '',
					href: fldVal?.BomID ? `/MES/Boms/${fldVal.BomID}` : undefined,
					target: '_blank',
					style: { color: '#409eff', width: '100%', overflow: 'hidden' },
				});
			}),
			this.field('productCategoryID').setCustomRenderer((fld, ctx: UiContext<any>, props) => {
				const fldVal = ctx.getFieldValue(fld);
				return ctx.uiBuilder.factory.textSpan(!isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
			})
		);
	}
	if (groups.length == 0) {
		groups.push(
			this.group<BomItem>('items')
				.rowDetail('operations')
				.field('materialPic')
				.setCustomRenderer(renderBomItemMaterialPic)
				.setCustomCellRenderer(renderBomItemMaterialPic)
				.parent
		);
	}
	return { fields, groups, customActions };
}
