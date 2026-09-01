/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, MetaUiField } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ModuleAuditTrail, defineModuleAuditTrail } from '../../models/ModuleAuditTrail';
/**
 * 审计追踪交互逻辑
 * @author mmda codebot
 * @since 2026-01-07 14:52:35.0
 * @revision 2026-01-07 14:57:06.0
 */
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 审计追踪交互逻辑
	 */
	export class ModuleAuditTrailLogic extends UiLogic<ModuleAuditTrail>{
		constructor(init: UiLogicInit){
			super(defineModuleAuditTrail,init);
		}

		/**
		 * 设置编辑交互逻辑
		 */
		beforeEdit(){
			const {fields,groups,customActions} = super.beforeEdit();
			if(fields.length == 0) {
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
			}
			return {fields,groups,customActions};
		}

		//设置详情逻辑
		//beforeDetails(){}
	}

	/**
	 * 构造审计追踪交互逻辑
	 * @param metaUiService 元数据服务
	 * @param router 路由
	 * @param module 模块
	 * @returns 
	 */
	export const ModuleAuditTrailLogicCtor = (metaUiService:MetaUiService,router:Router,module?:Module) => new ModuleAuditTrailLogic({
		metaUiService: metaUiService,
		repository: 'ModuleAuditTrails',
		router,
		module: module || metaUiService.findModule('ModuleAuditTrail'),
	})
	//#endregion ~GENERATED PARTS END
