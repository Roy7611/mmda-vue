/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { MetaUiService, Module } from '@mmda/core';
import { type EntityLogicInit, EntityLogic } from '@mmda/vui';
import { type ProjectMaterial, defineProjectMaterial } from '@/models/ProjectMaterial';
import { SourcingMode } from '@mmda/base/src/enums/SourcingMode';
/**
 * 项目材料交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:31.0
 * @revision 2024-09-01 08:45:31.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目材料交互逻辑
 */
export class ProjectMaterialLogic extends EntityLogic<ProjectMaterial> {
	constructor(init: EntityLogicInit) {
		super(defineProjectMaterial, init);
		this.selectableList = {
			projectMaterials: (e: any) => {
				return e.sourcingMode !== SourcingMode.MAKE && (e.budgetQuantity + e.amendQuantity) > 0;
			}
		}
	}
	/**
	 * 设置编辑交互逻辑
	 */
	async getAll(param: any) {
		console.log(this.searchParams.projectID?.['projectID'])
		const res = await super.getAll({
			...param, queryParams:
			{
				...this.searchParams.queryParams,
				projectID: this.searchParams.projectID?.['projectID'] ?? '',
				projectinprogress: this.searchParams.projectinprogress ?? true,
				shortageQuantity: this.searchParams.shortageQuantity ?? '',
				// pageSize: 100
			}
		});
		return res;
	}
	/** Custom searchbar temporarily disabled (searchVal not ready). */
	beforeSearch() {
		const { searchParam, searchFields } = super.beforeSearch();
		return { searchParam, searchFields, customSearchFields: [] }
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('supplierID'),
				this.field('brand'),
				this.field('sourcingMode')
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
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造项目材料交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ProjectMaterialLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) => new ProjectMaterialLogic({
	metaUiService: metaUiService,
	repository: 'ProjectMaterials',
	
	module: module || metaUiService.findModule('ProjectMaterial'),
})
//#endregion ~GENERATED PARTS END
