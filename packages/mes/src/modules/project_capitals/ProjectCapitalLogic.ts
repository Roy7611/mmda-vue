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
import { type ProjectCapital, defineProjectCapital } from '@/models/ProjectCapital';
import { type ProjectCapitalItem, defineProjectCapitalItem } from '@/models/ProjectCapitalItem';
/**
 * 项目资金交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:31.0
 * @revision 2024-09-01 19:03:57.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目资金交互逻辑
 */
export class ProjectCapitalLogic extends UiLogic<ProjectCapital> {
	constructor(init: UiLogicInit) {
		super(defineProjectCapital, init);
		this.addRelativeLogic<ProjectCapitalItem>('items', master => new ProjectCapitalItemLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('riskLevel').searchable(true), this.field('status').searchable(true),this.field('projectID').searchable(true));
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
			groups.push(this.group<ProjectCapitalItem>('items').defaultAdder(this.newProjectCapitalItem));
		}
		return { fields, groups, customActions };
	}
	/**
	 *
	 * @param context
	 * @param target
	 * 创建资金项
	 */
	newProjectCapitalItem(context: UiContext<ProjectCapital>, target: ProjectCapital) {
		context
			.newSubGroupItem<ProjectCapitalItem>({
				group: 'items',
				sequenceKey: 'itemID',
				target,
			})
			.then(item => {
				if (item) {
					if (!target.items.includes(item)) target.items.push(item);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造项目资金交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectCapitalLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProjectCapitalLogic({
		service: metaUiService,
		repository: 'ProjectCapitals',
		router,
		module: module || metaUiService.findModule('ProjectCapital'),
	});
/**
 * 资金项交互逻辑
 */
export class ProjectCapitalItemLogic extends UiGroupLogic<ProjectCapitalItem, ProjectCapital> {
	constructor(parent: ProjectCapitalLogic, master: ProjectCapital) {
		super(defineProjectCapitalItem, parent, master, 'items');
	}
}
//#endregion ~GENERATED PARTS END
