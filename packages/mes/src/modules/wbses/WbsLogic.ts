/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type Wbs, defineWbs } from '@/models/Wbs';
import { type WbsTask, defineWbsTask } from '@/models/WbsTask';
import { UserStatus } from '@mmda/base/src/enums/UserStatus';
/**
 * 工作分解结构交互逻辑
 * @author mmda codebot
 * @since 2024-12-07 03:41:03.0
 * @revision 2024-12-07 03:41:03.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 工作分解结构交互逻辑
 */
export class WbsLogic extends UiLogic<Wbs> {
	constructor(init: UiLogicInit) {
		super(defineWbs, init);
		this.addRelativeLogic<WbsTask>('tasks', (master) => new WbsTaskLogic(this, master));
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
			groups.push(this.group<WbsTask>('tasks')
				// .defaultAdder(this.newWbsTask)
				.addCustomAction({
					name: 'createContractItem',
					label: '创建',
					icon: 'far fa-plus-circle',
					role: 'info',
					onAction: this.newWbsTask,
					view: UiViewOne.Edit,
				}));
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

	newWbsTask(context: UiContext<Wbs>, target: Wbs) {
		context
			.newSubGroupItem<WbsTask>({
				group: 'tasks',
				sequenceKey: 'taskNo',
				target,
			})
			.then(item => {
				if (item) {
					target.tasks.push(item);
				}
			});
	}

	//设置详情逻辑
	//beforeDetails(){}
}





/**
 * 构造工作分解结构交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const WbsLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new WbsLogic({
	service: metaUiService,
	repository: 'Wbses',
	router,
	module: module || metaUiService.findModule('Wbs'),
})
/**
 * 分解任务交互逻辑
 */
export class WbsTaskLogic extends UiGroupLogic<WbsTask, Wbs> {
	constructor(parent: WbsLogic, master: Wbs) {
		super(defineWbsTask, parent, master, 'tasks')
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();

	if (fields.length == 0) {
		fields.push(
			this.field('ownerID').setSearchParam((context, model) => ({
					status: `IN ${UserStatus.ACTIVATED}`
			})),
		)
	}
		
		return { fields, groups, customActions };
	}




}
//#endregion ~GENERATED PARTS END
