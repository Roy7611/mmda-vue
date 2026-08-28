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
import { type Process, defineProcess } from '@/models/Process';
import { type ProcessOperation, defineProcessOperation } from '@/models/ProcessOperation';
import { type ProcessOperationResource, defineProcessOperationResource } from '@/models/ProcessOperationResource';
import { type ProcessOperationAlarm, defineProcessOperationAlarm } from '@/models/ProcessOperationAlarm';
import { type ProcessOperationParam, defineProcessOperationParam } from '@/models/ProcessOperationParam';
import { type ProcessOperationChart, defineProcessOperationChart } from '@/models/ProcessOperationChart';
import { type ProcessLogic } from '@/modules/processes/ProcessLogic';
/**
 * 制程工序交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-08-07 14:33:28.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 制程工序交互逻辑
 */
export class ProcessOperationLogic extends UiGroupLogic<ProcessOperation, Process> {
	constructor(parent: ProcessLogic, master: Process) {
		// 		super(defineProcessOperation, parent, master, 'operations');
		super(defineProcessOperation, parent, master, 'operations');
		this.addRelativeLogic<ProcessOperationResource>('resources', (master) => new ProcessOperationResourceLogic(this, master));
		this.addRelativeLogic<ProcessOperationAlarm>('alarms', master => new ProcessOperationAlarmLogic(this, master));
		this.addRelativeLogic<ProcessOperationParam>('params', master => new ProcessOperationParamLogic(this, master));
		this.addRelativeLogic<ProcessOperationChart>('charts', master => new ProcessOperationChartLogic(this, master));
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
			// this.group<ProcessOperationResource>('resources').defaultAdder(this.newProcessOperationResource),
			groups.push(
				this.group<ProcessOperationAlarm>('alarms').hideIf(() => true),
				this.group<ProcessOperationParam>('params').hideIf(() => true),
				this.group<ProcessOperationChart>('charts').hideIf(() => true)
			)
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();

		if (groups.length == 0) {
			groups.push(
				this.group<ProcessOperationAlarm>('alarms').hideIf(() => true),
				this.group<ProcessOperationParam>('params').hideIf(() => true),
				this.group<ProcessOperationChart>('charts').hideIf(() => true)
			)
		}

		return { fields, groups, customActions };
	}
}

/**
	 * 所需资源交互逻辑
	 */
export class ProcessOperationResourceLogic extends UiGroupLogic<ProcessOperationResource, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationResource, parent, master, 'resources')
	}
}
/**
* 报警交互逻辑
*/
export class ProcessOperationAlarmLogic extends UiGroupLogic<ProcessOperationAlarm, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationAlarm, parent, master, 'alarms');
	}
}
/**
 * 参数交互逻辑
 */
export class ProcessOperationParamLogic extends UiGroupLogic<ProcessOperationParam, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationParam, parent, master, 'params');
	}
}
/**
 * 图表交互逻辑
 */
export class ProcessOperationChartLogic extends UiGroupLogic<ProcessOperationChart, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationChart, parent, master, 'charts');
	}
}
//#endregion ~GENERATED PARTS END
