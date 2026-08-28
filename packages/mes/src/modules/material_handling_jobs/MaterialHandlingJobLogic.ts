/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, type EntityAction, defaultPager, EntityState, ApiClient, daysBetween, isNullOrUndefined, MetaModel } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type MaterialHandlingJob, defineMaterialHandlingJob } from '@/models/MaterialHandlingJob';
import { type MaterialHandlingJobStep, defineMaterialHandlingJobStep } from '@/models/MaterialHandlingJobStep';
import { type MaterialHandlingJobRelation, defineMaterialHandlingJobRelation } from '@/models/MaterialHandlingJobRelation';
/**
 * 物料搬运作业交互逻辑
 * @author mmda codebot
 * @since 2024-11-03 12:12:33.0
 * @revision 2024-11-03 12:12:33.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 物料搬运作业交互逻辑
 */
/**
 * 计算间隙工时（s）
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 间隙工时（s）
 */
const getTimes = (startTime: any, endTime: any) => {
	// 获取开始时间的时分秒
	const [h1, m1] = startTime.split(':')
	// 获取结束时间的时分秒
	const [h2, m2] = endTime.split(':')
	// 获取开始时间的工时
	const totalTime1 = h1 * 3600 + m1 * 60
	// 获取结束时间的工时
	const totalTime2 = h2 * 3600 + m2 * 60
	return totalTime2 - totalTime1
}
export class MaterialHandlingJobLogic extends UiLogic<MaterialHandlingJob> {
	constructor(init: UiLogicInit) {
		super(defineMaterialHandlingJob, init);
		this.addRelativeLogic<MaterialHandlingJobStep>('steps', (master) => new MaterialHandlingJobStepLogic(this, master));
		this.addRelativeLogic<MaterialHandlingJobRelation>('relations', (master) => new MaterialHandlingJobRelationLogic(this, master));
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeIndex(): UiLogicFnResult<MaterialHandlingJob> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				// 优先级
				this.field('priority').searchable(true),
				// 执行设备
				this.field('equipID').searchable(true),
				// 生产单件
				this.field('prodItemID').searchable(true),
				// 状态
				this.field('status').searchable(true),
				// 限制类型
				this.field('constraintType').searchable(true),
				// 组合模式
				this.field('groupMode').searchable(true)
			)
		}
		return { fields, groups, customActions }
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// 计划开始
				this.field('expectedStart').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedFinish) {
						const times = getTimes(newVal, model.expectedFinish);
						model.expectedDuration = Number(times);
					} else {
						model.expectedDuration = null;
					}
				}),
				// 计划完成
				this.field('expectedFinish').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedStart) {
						const times = getTimes(model.expectedStart, newVal);
						model.expectedDuration = Number(times);
					} else {
						model.expectedDuration = null;
					}
				}),
				// 开始时间
				this.field('actualStart').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.actualFinish) {
						const times = getTimes(newVal, model.actualFinish)
						model.duration = Number(times);
					} else {
						model.duration = null
					}
				}),
				// 完成时间
				this.field('actualFinish').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.actualStart) {
						const times = getTimes(model.actualStart, newVal)
						model.duration = Number(times)
					} else {
						model.duration = null
					}
				})
			)
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
			groups.push(
				// 作业步骤
				this.group<MaterialHandlingJobStep>('steps').defaultAdder(this.createMaterialHandlingJobStep),
				// 作业关系
				this.group<MaterialHandlingJobRelation>('relations').defaultAdder(this.createMaterialHandlingJobRelation)
			)
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
	/**
	 * 添加作业步骤
	 */
	createMaterialHandlingJobStep(context: UiContext<MaterialHandlingJob>, target: MaterialHandlingJob) {
		context.newSubGroupItem<MaterialHandlingJobStep>({
			group: 'steps',
			target,
		})
			.then(item => {
				if (item) {
					target.steps.push(item);
				}
			});
	}
	/**
		 * 添加作业关系
		 */
	createMaterialHandlingJobRelation(context: UiContext<MaterialHandlingJob>, target: MaterialHandlingJob) {
		context.newSubGroupItem<MaterialHandlingJobRelation>({
			group: 'relations',
			target,
		})
			.then(item => {
				if (item) {
					target.relations.push(item);
				}
			});
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造物料搬运作业交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const MaterialHandlingJobLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new MaterialHandlingJobLogic({
	service: metaUiService,
	repository: 'MaterialHandlingJobs',
	router,
	module: module || metaUiService.findModule('MaterialHandlingJob'),
})
/**
 * 作业步骤交互逻辑
 */
export class MaterialHandlingJobStepLogic extends UiGroupLogic<MaterialHandlingJobStep, MaterialHandlingJob> {
	constructor(parent: MaterialHandlingJobLogic, master: MaterialHandlingJob) {
		super(defineMaterialHandlingJobStep, parent, master, 'steps')
	}
}
/**
 * 作业关系交互逻辑
 */
export class MaterialHandlingJobRelationLogic extends UiGroupLogic<MaterialHandlingJobRelation, MaterialHandlingJob> {
	constructor(parent: MaterialHandlingJobLogic, master: MaterialHandlingJob) {
		super(defineMaterialHandlingJobRelation, parent, master, 'relations')
	}
}
//#endregion ~GENERATED PARTS END
