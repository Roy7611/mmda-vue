/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField, UiContext } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type EquipmentChecklist, defineEquipmentChecklist } from '@/models/EquipmentChecklist';
import { type EquipmentChecklistItem, defineEquipmentChecklistItem } from '@/models/EquipmentChecklistItem';
/**
 * 设备点检表交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:03.0
 * @revision 2024-09-01 23:04:18.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 设备点检表交互逻辑
 */
export class EquipmentChecklistLogic extends UiLogic<EquipmentChecklist> {
	constructor(init: UiLogicInit) {
		super(defineEquipmentChecklist, init);
		this.addRelativeLogic<EquipmentChecklistItem>('items', master => new EquipmentChecklistItemLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();

		if (fields.length == 0) {
			// 根据点检周期过滤
			if (this.field('checkCycle').field) {
				fields.push(this.field('checkCycle').searchable(true));
			}
			// 根据状态过滤
			if (this.field('status').field) {
				fields.push(this.field('status').searchable(true));
			}
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
			if(groups.length == 0) {
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
				groups.push(
					this.group<EquipmentChecklist>('items').addCustomAction({
						name: 'createContractItem',
						label: 'action.create',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newEquipmentChecklist,
						view: UiViewOne.Edit,
					}),
					//.defaultAdder(this.newEquipmentChecklist)
			);
			}
			return {fields,groups,customActions};
		}
		/**
		 * 
		 * @param context 
		 * @param target 
		 * 创建设备点检表
		 */
		newEquipmentChecklist(context: UiContext<EquipmentChecklist>, target: EquipmentChecklist) {
			context
				.newSubGroupItem<EquipmentChecklistItem>({
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
	 * 构造设备点检表交互逻辑
	 * @param metaUiService 元数据服务
	 * @param router 路由
	 * @param module 模块
	 * @returns 
	 */
	export const EquipmentChecklistLogicCtor = (metaUiService:MetaUiService,router:Router,module?:Module) => new EquipmentChecklistLogic({
		metaUiService: metaUiService,
		repository: 'EquipmentChecklists',
		router,
		module: module || metaUiService.findModule('EquipmentChecklist'),
	})
	/**
	 * 点检项交互逻辑
	 */
	export class EquipmentChecklistItemLogic extends UiGroupLogic<EquipmentChecklistItem,EquipmentChecklist>{
		constructor(parent: EquipmentChecklistLogic, master: EquipmentChecklist){
			super(defineEquipmentChecklistItem,parent,master,'items')
		}
	}
	//#endregion ~GENERATED PARTS END
