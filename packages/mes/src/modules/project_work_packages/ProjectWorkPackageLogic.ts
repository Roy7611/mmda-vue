/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { type MetaUiService, type Module, type MetaUiField, type UiContext, isRefNone, EntityAction, isNullOrUndefined, triggerEscKey, isObject, debounce } from '@mmda/core';
import { type EntityLogicInit, EntityLogic, SubEntityLogic, type UiLogicFnResult } from '@mmda/vui';
import { type ProjectWorkPackage, defineProjectWorkPackage } from '@/models/ProjectWorkPackage';
import { type ProjectWorkPackageItem, defineProjectWorkPackageItem } from '@/models/ProjectWorkPackageItem';
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

const taskLevelOption = { value: [] } as any;
const taskPhaseOption = { value: [] } as any;
const hrefData = { value:  };
//项目
const projectsData = {
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
	await context.logic!.getAllOf<Record<string, unknown>>('Projects', {
		queryParams: {
			pageNo: projectsData.projectsPager.pageNo,
			pageSize: projectsData.projectsPager.pageSize,
			searchWord: value,
		},
	}, { service: 'mes' })
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

export class ProjectWorkPackageLogic extends EntityLogic<ProjectWorkPackage> {
	constructor(init: EntityLogicInit) {
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
				this.field('status'),
				this.field('taskName').setCustomCellRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return ctx.uiBuilder.factory.link({
						text: fldVal,
						href: ctx.model.taskID ? `/MES/ProjectWorkPackages/${ctx.model.taskID}` : undefined,
						style: { color: '#409eff', width: '100%', overflow: 'hidden' },
					});
				}),

				//this.field('taskLevel'),
				// this.field('taskPhase'),
				this.field('riskLevel')
				// this.field('projectID')
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
			await context.logic!.getAllOf<Record<string, unknown>>('Projects', {
				queryParams: {
					pageNo: projectsData.projectsPager.pageNo,
					pageSize: projectsData.projectsPager.pageSize,
					projectID: value ?? null,
				},
			}, { service: 'mes' })
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
					searchLabel: 'projectWorkPackage.phase',
					searchParam: 'taskPhase',
					valueFn: (value: any) => `IN ${value.join(',')}`,
					renderer: (ctx: UiContext & any, csf) => {
						const { $ui: ui, $t: t } = ctx.globalProps;
						this.getTaskPhase(ctx);
						const options = isString(taskPhaseOption.value) ? JSON.parse(taskPhaseOption.value) : [];
						if (hrefData.value.taskPhase) {
							console.log('hrefData.value.taskPhase', hrefData.value.taskPhase);
							csf.searchVal.value = [];
							csf.searchVal.value.push(hrefData.value.taskPhase);
							hrefData.value.taskPhase = null;
						}

						// csf.searchVal.value = null;
						return ui.factory.multiValueSelect({
							id: `search_taskPhase`,
							placeholder: t('action.select'),
							labelField: 'text',
							valueField: 'value',
							class: 'ui-searchOp w-full',
							options: options,
							value: csf.searchVal.value,
							onChange: (val: unknown) => {
								csf.searchVal.value = val;
								ctx.app.localDb.put(`search/${ctx.logic.repository}/taskPhase`, val);
							},
						});
					},
				},

				{
					searchLabel: 'ganttLabel.sProject',
					searchParam: 'projectID',
					valueFn: (v: any) => (!isRefNone(v) ? v.projectID : ''),
					renderer: (ctx: UiContext & any, csf) => {
						const { $ui: ui, $t: t } = ctx.globalProps;
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
							toSearch: async () => {
								const picked = await ctx.select({
									repository: 'Projects',
									service: 'mes',
									selectionMode: 'single',
								})
								if (!Array.isArray(picked) || !picked.length) return false
								const data = picked[0]
								projectsData.project = data
								csf.searchVal.value = data ?? null
								ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)))
								return true
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
export const ProjectWorkPackageLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) =>
	new ProjectWorkPackageLogic({
		metaUiService: metaUiService,
		repository: 'ProjectWorkPackages',
		
		module: module || metaUiService.findModule('ProjectWorkPackage'),
	});
/**
 * 执行追踪交互逻辑
 */
export class ProjectWorkPackageItemLogic extends SubEntityLogic<ProjectWorkPackageItem, ProjectWorkPackage> {
	constructor(parent: ProjectWorkPackageLogic, master: ProjectWorkPackage) {
		super(defineProjectWorkPackageItem, parent, master, 'items');
	}

	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('taskName').setCustomCellRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return ctx.uiBuilder.factory.link({
						text: fldVal,
						href: ctx.model.refID ? `/MES/${ctx.model.refName}s/${ctx.model.refID}` : undefined,
						target: '_blank',
						style: { color: '#409eff', width: '100%', overflow: 'hidden' },
					});
				})
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
