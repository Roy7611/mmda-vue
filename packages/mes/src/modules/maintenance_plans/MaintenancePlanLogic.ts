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
import { type MaintenancePlan, defineMaintenancePlan } from '@/models/MaintenancePlan';
/**	/** 原有逻辑
 * import { MaintenanceFrequencyEnum, MaintenanceFrequency } from '@/enums/MaintenanceFrequency';
 */


/**
 * 维护计划交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:03.0
 * @revision 2024-09-01 23:04:21.0
 */
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 维护计划交互逻辑
	 */
	export class MaintenancePlanLogic extends UiLogic<MaintenancePlan>{
		constructor(init: UiLogicInit){
			super(defineMaintenancePlan,init);
		}
		beforeIndex() {
			const { fields, groups, customActions } = super.beforeIndex();
			if (fields.length == 0) {
				fields.push(this.field('frequency'),);
			}
			return { fields, groups, customActions };
		}
		/**
		 * 设置编辑交互逻辑
		 */
		beforeEdit(){
			const {fields,groups,customActions} = super.beforeEdit();
			if(fields.length == 0) {
			/** 原有逻辑
				fields.push(
				this.field('frequency')
					.onChange((ctx, model, newVal, oldVal) => model.onDay = newVal === MaintenanceFrequency.DAILY ? 1 : model.onDay),
				this.field('onDay')
					.lockIf((t: MaintenancePlan) => t.frequency === MaintenanceFrequency.DAILY)
			)
					*/
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
	 * 构造维护计划交互逻辑
	 * @param metaUiService 元数据服务
	 * @param router 路由
	 * @param module 模块
	 * @returns 
	 */
	export const MaintenancePlanLogicCtor = (metaUiService:MetaUiService,router:Router,module?:Module) => new MaintenancePlanLogic({
		metaUiService: metaUiService,
		repository: 'MaintenancePlans',
		router,
		module: module || metaUiService.findModule('MaintenancePlan'),
	})
	//#endregion ~GENERATED PARTS END
