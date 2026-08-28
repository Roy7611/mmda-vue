/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import { UiLogic, type UiLogicFnResult } from '@mmda/vui';
import type { Bom } from '@/models/Bom';
import type { BomLogic } from './BomLogic';

export function beforeIndex(this: BomLogic): UiLogicFnResult<Bom> {
	const { fields, groups, customActions } = UiLogic.prototype.beforeIndex.call(this);
	if (fields.length == 0) {
		fields.push(
			this.field('projectID').searchable(true),
			this.field('bomType').searchable(true),
			this.field('bomUsage').searchable(true),
			this.field('status').searchable(true)
		);
	}
	return { fields, groups, customActions };
}
