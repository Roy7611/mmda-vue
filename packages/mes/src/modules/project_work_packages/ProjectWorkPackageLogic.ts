/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, isRefNone, EntityAction, isNullOrUndefined, triggerEscKey, isObject, debounce } from '@mmda/core';
import { type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProjectWorkPackage, defineProjectWorkPackage } from '@/models/ProjectWorkPackage';
import { type ProjectWorkPackageItem, defineProjectWorkPackageItem } from '@/models/ProjectWorkPackageItem';
import { getCurrentInstance, h, inject, reactive, ref } from 'vue';
import { MES_KEY } from '@/keys';
import { isString } from 'lodash';
import { ManualTaskStatus } from '@mmda/base/src/enums/ManualTaskStatus';
//计算两个天数之间的日期
const getDaysBetweenDates = (date1: any, date2: any) => {
	const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
	const time1 = new Date(date1).getTime();
	const time2 = new Date(date2).getTime();
	const diffDays = Math.round((time2 - time1) / oneDay);
	return diffDays + 1;
};

/**
 * 项目工作包交互逻辑
 * @author mmda codebot
 * @since 2024-09-02 02:27:27.0
 * @revision 2024-09-02 02:29:13.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目工作包交互逻辑
 */

const taskLevelOption = ref([]) as any;
const taskPhaseOption = ref([]) as any;
const hrefData = ref();
//项目
const projectsData = reactive({
	project: <any>null,
	projectsPager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	projectsList: <any>[],
	tablecolumns: <any>[],
	tableDataKEY: 'id',
});
/**
 * 获取所有的 Projects
 */
const getAllProjects = async (context: UiContext, value?: any) => {
	// const { $toast: toast, $ui: ui, $api: apiBox, $t: t } = getCurrentInstance().appContext.config.globalProperties;
	await context.globalProps.$api
		.getAll({
			repository: 'Projects',
			service: 'mes',
			queryParams: {
				pageNo: projectsData.projectsPager.pageNo,
				pageSize: projectsData.projectsPager.pageSize,
				searchWord: value,
			},
		})
		.then((res: any) => {
			res.list = res.list.map((it: any) => {
				return {
					...it,
				};
			});
			console.log(res.list, 'Projects');
			projectsData.projectsPager = res.pagination;
			projectsData.projectsList = res.list;
		})
		.catch((error: any) => {
			console.log(error);
		});
};

export class ProjectWorkPackageLogic extends UiLogic<ProjectWorkPackage> {
	constructor(init: UiLogicInit) {
		super(defineProjectWorkPackage, init);
		this.addRelativeLogic<ProjectWorkPackageItem>('items', master => new ProjectWorkPackageItemLogic(this, master));
		// this.afterAction = (context: UiContext, model: ProjectWorkPackage, action: EntityAction) => {
		// 	return Promise.resolve(false);
		// };
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		// projectsData.project = null; //载入清空返回的保存数据

		if (fields.length == 0) {
			hrefData.value = this.getParmas(window.location.href);
			fields.push(
				this.field('status').searchable(true),
				this.field('taskName').setCustomCellRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: {
									color: '#409eff',
								},
								href: 'javascript:;',
								onClick: async () => {
									const { $api: apiBox, $router: router } = ctx.globalProps;
									const refID = ctx.model.taskID;
									if (refID) {
										const routerURL = router.resolve({
											name: 'ProjectWorkPackage',
											params: { id: refID },
										});
										// projectsData.project = null; //载入清空返回的保存数据
										router.push(routerURL);
										// window.open(routerURL.href);
									}
								},
							},
							fldVal
						),
					]);
				}),

				//this.field('taskLevel').searchable(true),
				// this.field('taskPhase').searchable(true),
				this.field('riskLevel').searchable(true)
				// this.field('projectID').searchable(true)
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 * 获取跳转路径参数
	 * @param value href(拼接路径)
	 * @returns 拼接参数对象
	 */
	getParmas(value: any) {
		const queryParams = new URLSearchParams(new URL(value).search);
		const queryObject = {} as any;
		for (const [key, value] of queryParams.entries()) {
			if (queryObject[key]) {
				queryObject[key] = [].concat(queryObject[key], value);
			} else {
				queryObject[key] = value;
			}
		}
		return queryObject;
	}

	getTaskLevel(ctx: any) {
		ctx.metaUiService.get('ProjectWorkPackages', 'mes').then((res: any) => {
			taskLevelOption.value = res.getField('taskLevel').selectOptions;
		});
	}
	getTaskPhase(ctx: any) {
		ctx.metaUiService.get('ProjectWorkPackages', 'mes').then((res: any) => {
			taskPhaseOption.value = res.getField('taskPhase').selectOptions;
		});
	}

	setSearchVal(data: any, csf: any) {
		if (data.taskLevel) {
			csf.searchVal.value = [];
			csf.searchVal.value.push(data.taskLevel);
			data.taskLevel = null;
		}
	}

	getOneProjects = async (context: UiContext, value?: any, csf?: any) => {
		if (hrefData.value.projectID) {
			// const { $toast: toast, $ui: ui, $api: apiBox, $t: t } = getCurrentInstance().appContext.config.globalProperties;
			await context.globalProps.$api
				.getAll({
					repository: 'Projects',
					service: 'mes',
					queryParams: {
						pageNo: projectsData.projectsPager.pageNo,
						pageSize: projectsData.projectsPager.pageSize,
						projectID: value ?? null,
					},
				})
				.then((res: any) => {
					if (res && res.list.length > 0) {
						res.list = res.list.map((it: any) => {
							return {
								...it,
								importance: it.customProperties.$importance,
								status: it.customProperties.$status,
								constraintType: it.customProperties.$constraintType,
							};
						});

						projectsData.projectsList = res.list;
						projectsData.project = res.list[0];
						csf = projectsData.project.projectID;
						hrefData.value.projectID = null;
					} else {
						// getReportdata.projectID = '';
						projectsData.project = null;
						csf = null;
					}
				})
				.catch((error: any) => {
					console.log(error);
				});
		}
	};

	beforeSearch() {
		const { searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push(
				{
					searchLabel: '所属阶段',
					searchParam: 'taskPhase',
					valueFn: (value: any) => `IN ${value.join(',')}`,
					renderer: (ctx: UiBuildContext<any> & any, csf) => {
						const { $ui: ui, $t: t, $api: apiBox } = ctx.globalProps;
						this.getTaskPhase(ctx);
						const options = isString(taskPhaseOption.value) ? JSON.parse(taskPhaseOption.value) : [];
						if (hrefData.value.taskPhase) {
							console.log('hrefData.value.taskPhase', hrefData.value.taskPhase);
							csf.searchVal.value = [];
							csf.searchVal.value.push(hrefData.value.taskPhase);
							hrefData.value.taskPhase = null;
						}

						// csf.searchVal.value = null;
						return ui.factory.multiSelect({
							showClear: true,
							id: `search_taskPhase`,
							editable: true,
							// display: 'chip',
							placeholder: t('action.select'),
							optionLabel: 'text',
							optionValue: 'value',
							class: 'ui-searchOp w-full',
							options: options,
							modelValue: csf.searchVal.value,
							onUpdate: (val: string) => {
								csf.searchVal.value = val;
								ctx.app.localDb.put(`search/${ctx.logic.repository}/taskPhase`, val);
							},
						});
					},
				},

				{
					searchLabel: '工程项目',
					searchParam: 'projectID',
					valueFn: (v: any) => (!isRefNone(v) ? v.projectID : ''),
					renderer: (ctx: UiBuildContext<any> & any, csf) => {
						const { $ui: ui, $t: t, $api: apiBox } = ctx.globalProps;
						// if (hrefData.value.projectID) {
						// 	this.getOneProjects(ctx, hrefData.value.projectID, csf.searchVal.value);
						// }

						if (!projectsData.projectsList.length && isObject(csf.searchVal.value)) {
							projectsData.projectsList.push(csf.searchVal.value);
						}

						return ui.factory.searchForRelative({
							id: 'search_projectID',
							modelValue: csf.searchVal.value,
							placeholder: t('action.select'),
							dataKey: 'projectID',
							optionLabel: (v: any) => v.projectName,
							options: projectsData.projectsList,
							toSearch: async (event: Event) => {
								let data = [] as any;
								// const { metaUiService } = ctx;
								const { metaui } = await ctx.logic!.loadMetadata('Projects', 'mes', true);
								projectsData.tableDataKEY = metaui.primaryKey;
								ctx.searchParam.pager = projectsData.projectsPager = {
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
										dataKey: projectsData.tableDataKEY,
										onSearch: async (params: any) => {
											const { searchParams, reload, pager } = params;
											// projectsData.searchWord=searchParams.searchWord
											await getAllProjects(ctx, searchParams.searchWord);
											return { list: projectsData.projectsList, pager: projectsData.projectsPager };
										},
										onPage: ({ pageNo, pageSize }: any) => {
											projectsData.projectsPager.pageNo = pageNo;
											projectsData.projectsPager.pageSize = pageSize;
											ctx.searchParam.pager = projectsData.projectsPager
										},
										onSelect: (selection: any, row: any) => {
											// console.log(selection, row, '选择')
											data = row;
										},
										onRowDblclick(data: any, index: any) {
											projectsData.project = data;
											csf.searchVal.value = data ?? null;
											ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)));
											triggerEscKey();
										},
									}),
									ctx,
									{
										title: '项目',
										style: { width: '80vw', maxHeight: '95%' },
										accept: async () => {
											projectsData.project = data;
											csf.searchVal.value = data ?? null;
											ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)));
											return true;
										},
									}
								);
							},

							onUpdate: async (value: any) => {
								// await this.getAllplan(ctx, value)
								csf.searchVal.value = value;
								projectsData.project = value;
								ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, value);
							},
							onInput: (value: string) => {
								debounce(async () => {
									await getAllProjects(ctx, value);
								}, 500)();
							},
						});
					},
				}
			);
		}

		return { searchFields, customSearchFields };
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('expectedStart').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedFinish) {
						const days = getDaysBetweenDates(newVal, model.expectedFinish);
						model.expectedDuration = Number(days);
					} else {
						model.expectedDuration = null;
					}
				}),
				this.field('expectedFinish').onChange((ctx, model, newVal, oldVal) => {
					if (newVal && model.expectedStart) {
						const days = getDaysBetweenDates(model.expectedStart, newVal);
						model.expectedDuration = Number(days);
					} else {
						model.expectedDuration = null;
					}
				})
			);
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
 * 构造项目工作包交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectWorkPackageLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProjectWorkPackageLogic({
		service: metaUiService,
		repository: 'ProjectWorkPackages',
		router,
		module: module || metaUiService.findModule('ProjectWorkPackage'),
	});
/**
 * 执行追踪交互逻辑
 */
export class ProjectWorkPackageItemLogic extends UiGroupLogic<ProjectWorkPackageItem, ProjectWorkPackage> {
	constructor(parent: ProjectWorkPackageLogic, master: ProjectWorkPackage) {
		super(defineProjectWorkPackageItem, parent, master, 'items');
	}

	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('taskName').setCustomCellRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: {
									color: '#409eff',
								},
								href: 'javascript:;',
								onClick: async () => {
									const { $api: apiBox, $router: router } = ctx.globalProps;
									const refID = ctx.model.refID;
									if (refID) {
										const routerURL = router.resolve({
											name: ctx.model.refName,
											params: { id: refID },
										});
										window.open(routerURL.href, '_blank');
									}
								},
							},
							fldVal
						),
					]);
				})
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
