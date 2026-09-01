/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { MetaUiService, Module, MetaUiField, ApiClient, type UiContext, MetaModel, isRefNone, debounce, isNullOrUndefined, isObject, triggerEscKey } from '@mmda/core';
import { type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiSearchForm } from '@mmda/vui';
import { type ProjectMaterial, defineProjectMaterial } from '@/models/ProjectMaterial';
import { SourcingMode } from '@mmda/base/src/enums/SourcingMode';
import { defineComponent, getCurrentInstance, h, reactive, ref, toRefs } from 'vue';
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
const tableDataProject = ref([])
const tablecolumnsProject = ref([])
const tableDataKeyProject = ref('id')
const searchParamProject = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1
	},
	searchWord: '',
	searchParams: {}
});
export class ProjectMaterialLogic extends UiLogic<ProjectMaterial> {
	constructor(init: UiLogicInit) {
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
	/**
		 * 项目
		 * @param context 
		 * @param value 
		 */
	async getAllProject(context: UiContext, value?: any) {
		await context.globalProps.$api.getAll({
			repository: 'Projects',
			service: 'mes',
			queryParams: {
				pageSize: searchParamProject.pager.pageSize,
				pageNo: searchParamProject.pager.pageNo,
				sort: '',
				searchWord: value
			},
		}).then((res: any) => {
			searchParamProject.pager = res.pagination
			tableDataProject.value = res.list.map((it: any) => {
				return {
					...it,
					status: it.customProperties.$status,
					ownerID: it.customProperties.$ownerID,
					ownerDeptID: it.customProperties.$ownerDeptID,
					lastModifierID: it.customProperties.$lastModifierID,
					importance: it.customProperties.$importance,
					constraintType: it.customProperties.$constraintType
				}
			})
		})
	}
	searchParam: Record<string, any> = {};
	beforeSearch() {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push(
				{
					searchLabel: 'ganttLabel.sProject',
					searchParam: 'projectID',
					valueFn: (v: any) => !isRefNone(v) ? v.projectID : '',
					renderer: (ctx: UiBuildContext<any> & any, csf) => {
						if (!tableDataProject.value.length && isObject(csf.searchVal.value)) {
							tableDataProject.value.push(csf.searchVal.value)
						}
						return ctx.uiBuilder.factory.searchForRelative({
							modelValue: csf.searchVal.value,
							dataKey: 'projectID',
							optionLabel: (v: any) => v.projectName,
							class: 'w-full',
							// options: tableDataProject.value,
							options: tableDataProject.value,
							toSearch: async (event: Event) => {
								let data = [] as any;
								// 获取元数据字段
								const { metaui } = await ctx.logic!.loadMetadata('Projects', 'mes', true);
								tableDataKeyProject.value = metaui.primaryKey;
								ctx.searchParam.pager = searchParamProject.pager = {
									pageNo: 1,
									pageSize: 10
								}
								// 列表column
								const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
									isSearch: true,
									cacheKey: `payerID/SearchRelative/${metaui.primaryKey}`,
								});
								ctx.uiBuilder.confirmDialog(
									ctx.uiBuilder.buildSearchForRelativeContent(columns, {
										dataKey: tableDataKeyProject.value,
										onSearch: async (params: any) => {
											const { searchParams, reload, pager } = params;
											await this.getAllProject(ctx, searchParams.searchWord);
											return { list: tableDataProject.value, pager: searchParamProject.pager };
										},
										onPage: ({ pageNo, pageSize }: any) => {
											searchParamProject.pager.pageNo = pageNo;
											searchParamProject.pager.pageSize = pageSize;
											ctx.searchParam.pager = searchParamProject.pager
										},
										onSelect: (selection: any, row: any) => {
											data = row;
										},
										onRowDblclick: (row: any, index: number) => {
											csf.searchVal.value = csf.searchWord.value = row
											ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(row)));
											triggerEscKey(); // 弹窗关闭(触发esc建)
										},
									}),
									ctx,
									{
										title: ctx.t('ganttLabel.sProject'),
										style: { width: '80vw', maxHeight: '95%' },
										accept: async () => {
											csf.searchVal.value = csf.searchWord = data;
											ctx.model.projectID = data.projectID ?? ctx.model.projectID;
											ctx.model.projectNo = data.projectNo ?? ctx.model.projectNo;
											this.searchParam.projectID = ctx.model.projectID;
											ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)));
											return true;
										},
									}
								);
							},
							onUpdate: (value: any) => {
								csf.searchVal.value = value || null;
								ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, value);
							},
							onInput: (value: string) => {
								debounce(async () => {
									await this.getAllProject(ctx, value);
								}, 500)();
							},
						})
					}
				},
				{
					searchLabel: 'projectMaterial.activeProjects',
					searchParam: 'projectinprogress',
					renderer: (ctx: UiContext<any>, csf) => ctx.uiBuilder.factory.toggleSwitch(csf.searchVal.value, {
						trueValue: true,
						falseValue: false,
						'onUpdate:modelValue': (val: boolean) => {
							csf.searchVal.value = val
						}
					})
				},
				{
					searchLabel: 'projectMaterial.shortagesOnly',
					searchParam: 'shortageQuantity',
					renderer: (ctx: UiContext<any>, csf) => ctx.uiBuilder.factory.toggleSwitch(csf.searchVal.value, {
						trueValue: '>0',
						falseValue: '',
						'onUpdate:modelValue': (val: boolean) => {
							csf.searchVal.value = val
						}
					})
				}
			)
		}
		return { searchParam, searchFields, customSearchFields }
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('supplierID').searchable(true),
				this.field('brand').searchable(true),
				this.field('sourcingMode').searchable(true)
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
export const ProjectMaterialLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ProjectMaterialLogic({
	metaUiService: metaUiService,
	repository: 'ProjectMaterials',
	router,
	module: module || metaUiService.findModule('ProjectMaterial'),
})
//#endregion ~GENERATED PARTS END
