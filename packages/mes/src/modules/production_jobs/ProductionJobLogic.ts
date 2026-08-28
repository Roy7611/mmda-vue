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
import { type ProductionJob, defineProductionJob } from '@/models/ProductionJob';
import { type ProductionJobFeeding, defineProductionJobFeeding } from '@/models/ProductionJobFeeding';
/**
 * 生产作业交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:29.0
 * @revision 2024-09-01 08:45:29.0
 */
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 生产作业交互逻辑
	 */
	export class ProductionJobLogic extends UiLogic<ProductionJob>{
		constructor(init: UiLogicInit){
			super(defineProductionJob,init);
			this.addRelativeLogic<ProductionJobFeeding>('feedings',(master)=>new ProductionJobFeedingLogic(this,master));
		}
		beforeIndex() {
			const { fields, groups, customActions } = super.beforeIndex();
			if (fields.length == 0) {
				fields.push(this.field('projectID').searchable(true), this.field('opPhase').searchable(true),this.field('constraintType').searchable(true),this.field('status').searchable(true), );
			}
			return { fields, groups, customActions };
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
			groups.push(this.group<ProductionJobFeeding>('feedings').defaultAdder(this.newProductionJobFeeding));
				
			}
			return {fields,groups,customActions};
		}
		newProductionJobFeeding(context: UiContext<ProductionJob>, target: ProductionJob) {
			context.newSubGroupItem<ProductionJobFeeding>({
				group: 'feedings',
				sequenceKey: 'itemID',
				target,
			})
				.then(item => {
					if (item) {
						target.feedings.push(item);
					}
				});
		}
		//设置详情逻辑
		//beforeDetails(){}
	}

	/**
	 * 构造生产作业交互逻辑
	 * @param metaUiService 元数据服务
	 * @param router 路由
	 * @param module 模块
	 * @returns 
	 */
	export const ProductionJobLogicCtor = (metaUiService:MetaUiService,router:Router,module?:Module) => new ProductionJobLogic({
		service: metaUiService,
		repository: 'ProductionJobs',
		router,
		module: module || metaUiService.findModule('ProductionJob'),
	})
	/**
	 * 投料清单交互逻辑
	 */
	export class ProductionJobFeedingLogic extends UiGroupLogic<ProductionJobFeeding,ProductionJob>{
		constructor(parent: ProductionJobLogic, master: ProductionJob){
			super(defineProductionJobFeeding,parent,master,'feedings')
		}
	}
	//#endregion ~GENERATED PARTS END
