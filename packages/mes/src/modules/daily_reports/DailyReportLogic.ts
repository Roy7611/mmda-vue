/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { h, reactive, ref, unref } from 'vue';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, MetaModel, defaultPager } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type DailyReport, defineDailyReport } from '@/models/DailyReport';
import { type DailyReportTask, defineDailyReportTask } from '@/models/DailyReportTask';
import { type DailyReportEvent, defineDailyReportEvent } from '@/models/DailyReportEvent';
import { type DailyReportPhoto, defineDailyReportPhoto } from '@/models/DailyReportPhoto';
import ChooseImage from '@/components/ChooseImage/ChooseImage';
import { defineProjectTask, ProjectTask } from '@/models/ProjectTask';

/**
 * 日报交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:27.0
 * @revision 2024-09-23 13:00:48.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 日报交互逻辑
 */
const tableDataKey = ref('id')
const searchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1
	},
	searchWord: '',
	searchParams: {}
})
const taskData = ref([])
export class DailyReportLogic extends UiLogic<DailyReport> {
	constructor(init: UiLogicInit) {
		super(defineDailyReport, init);
		this.addRelativeLogic<DailyReportTask>('tasks', master => new DailyReportTaskLogic(this, master));
		this.addRelativeLogic<DailyReportEvent>('events', master => new DailyReportEventLogic(this, master));
		this.addRelativeLogic<DailyReportPhoto>('photos', master => new DailyReportPhotoLogic(this, master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				//this.field('deptID').searchable(true),
				this.field('projectID').searchable(true),
				this.field('status').searchable(true),
				this.field('abnormalities').searchable(true)
				// this.field('siteID').searchable(true),  没有产线
			);
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

			groups.push(
				this.group<DailyReportEvent>('events').addCustomAction({
					name: 'createDailyReportEvent',
					label: '创建',
					icon: 'far fa-plus-circle',
					role: 'info',
					onAction: this.addDailyReportEvent,
					// view: UiViewOne.Edit,
				}),
				this.group<DailyReportTask>('tasks').defaultAdder(this.addDailyReportTask).hideIf((t, context) => {
					const roleactionProject = context.globalProps.$app.context.modules.filter((item: any) => item.moduleCode === 'M.02')[0].subModules.find((module: any) => module.moduleCode === 'M.02.001')
					return !roleactionProject.authority.allowRead
				}),
				this.group<DailyReportPhoto>('photos').defaultAdder(this.addProductionEventPhoto),
				this.group<DailyReportEvent>('S9').hideIf(() => true)
			);
		}
		return { fields, groups, customActions };
	}

	addProductionEventPhoto(context: UiContext<DailyReport>, target: DailyReport) {
		context
			.newSubGroupItem<DailyReportPhoto>({
				target,
				group: 'photos',
				sequenceKey: 'itemID',
				propsMapper: {},
			})
			.then(item => {
				if (item) {
					// target.photos.push(item);
					context.addSubGroupItem('photos', item);
				}
			});
	}
	addDailyReportEvent(context: UiContext<DailyReport>, target: DailyReport) {
		context
			.newSubGroupItem<DailyReportEvent>({
				target,
				sequenceKey: 'itemID',
				group: 'events',
				propsMapper: {},
			})
			.then(Event => {
				if (Event) {
					Event.eventID = target?.eventID ?? '';
					if (!target.events.includes(Event)) target.events.push(Event);
				}
			});
	}
	addDailyReportTask(context: UiContext<DailyReport>, target: DailyReport) {
		context.select<ProjectTask>({
			repository: 'ProjectTasks',
			searchParam: {
				pager: defaultPager(),
			},
			ctor: defineProjectTask,
			selectionMode: 'multiple',
		}).then((selection: any) => {
			if (selection) {
				context.addSubGroupItems<DailyReportTask>({
					target,
					group: 'tasks',
					source: selection,
					propsMapper: {
						taskID: m => m
					},
				})
			}
		})
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(
				this.group<DailyReportTask>('tasks').hideIf((t, context) => {
					const roleactionProject = context.globalProps.$app.context.modules.filter((item: any) => item.moduleCode === 'M.02')[0].subModules.find((module: any) => module.moduleCode === 'M.02.001')
					return !roleactionProject.authority.allowRead
				}),
			)
		}
		return { fields, groups, customActions };

	}
}

/**
 * 构造日报交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const DailyReportLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new DailyReportLogic({
		service: metaUiService,
		repository: 'DailyReports',
		router,
		module: module || metaUiService.findModule('DailyReport'),
	});
/**
 * 任务进展交互逻辑
 */
export class DailyReportTaskLogic extends UiGroupLogic<DailyReportTask, DailyReport> {
	constructor(parent: DailyReportLogic, master: DailyReport) {
		super(defineDailyReportTask, parent, master, 'tasks');
	}
}
/**
 * 事件交互逻辑
 */

//选择图片
const chooseImages = async (ctx: UiContext<any>, master: any, selectType: string) => {
	const { $ui: ui, $t: t, $toast: toast } = ctx.globalProps;
	const selectData = ref([]);
	console.log('phptos');
	const photoList = ref([]);
	if (master.photos && master.photos.length > 0) {
		photoList.value = master.photos.filter((item: any) => {
			return item.entityState != 4;
		});
	} else {
		photoList.value = [];
	}

	return await ctx.uiBuilder.confirmDialog(
		h(ChooseImage, {
			selectOption: photoList.value,
			ctx: ctx,
			selectType: selectType,
			onSelectedData(val: any) {
				selectData.value = [];
				if (val && val.length > 0) {
					val.forEach((item: any) => {
						selectData.value.push(item.photo);
					});
				} else {
					selectData.value = [];
				}
			},
		}),
		ctx,
		{
			title: t('action.chooseOneImage'),
			width: '45%',
			height: '80%',
			accept: async () => {
				if (selectData.value && selectData.value.length <= 0) {
					toast.add({
						severity: 'warn',
						detail: t('invalid.chooseImage'),
						summary: `${t('dialog.title.warning')}`,
						group: 'br',
						life: 5000,
					});
					return false;
				} else {
					ctx.model.refPhotos = selectData.value.join(',');
					MetaModel.modify(ctx.model);
					return true;
				}
			},
		}
	);
};
const getReportTasks = (ctx: UiContext<any>) =>
	(ctx.root?.model?.tasks ?? []).filter((item: any) => !MetaModel.deleted(item));

const getReportTaskLabel = (item: any) => {
	if (!item) return '';
	const task = item.projectTask ?? (item.taskID && typeof item.taskID === 'object' ? item.taskID : item);
	return [task?.taskNo, task?.taskName].filter(Boolean).join(' / ') || String(item.taskID ?? '');
};

const filterReportTasks = (tasks: any[], keyword?: string) => {
	const kw = String(keyword ?? '').trim().toLowerCase();
	if (!kw) return tasks;
	return tasks.filter((item: any) => {
		const label = getReportTaskLabel(item).toLowerCase();
		const id = String(item?.taskID?.taskID ?? item?.taskID ?? '').toLowerCase();
		return label.includes(kw) || id.includes(kw);
	});
};
export class DailyReportEventLogic extends UiGroupLogic<DailyReportEvent, DailyReport> {
	constructor(parent: DailyReportLogic, master: DailyReport) {
		super(defineDailyReportEvent, parent, master, 'events');
	}

	beforeEdit(): UiLogicFnResult<DailyReportEvent> {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('refPhotos').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
					const { $ui: ui, $t: t } = ctx.globalProps;
					return h(
						'div',
						{
							class: 'upBox',
						},
						[
							ui.factory.image(ctx.model.refPhotos, {
								isEdit: true,
								preview: true,
								style: {
									width: `${props?.width ?? 60}px`,
								},
								onDelete: () => {
									ctx.model.refPhotos = null;
								},
							}),
							ui.factory.button({
								label: t('action.chooseImage'),
								style: {
									marginTop: '1rem',
									width: '8rem',
								},
								onAction: () => chooseImages(ctx, this.master, 'simple'),
							}),
						]
					);

					// ui.factory.button({
					// 	label: t('action.chooseImage'),
					// 	style: {
					// 		width: '8rem',
					// 	},
					// 	onAction: () => chooseImages(ctx, this.master, 'simple'),
					// });
				}),
				this.field('taskID').setCustomEditor((fld, ctx: UiViewContext<any>, props) => {
					const { $ui: ui, $t: t } = ctx.globalProps;
					const tasks = getReportTasks(ctx);
					const selectedId = ctx.model.taskID?.taskID ?? ctx.model.taskID;
					const selectedTask = tasks.find((item: any) => item.taskID === selectedId) ?? ctx.model.taskID;
					return ui.factory.searchForRelative({
						role: 'taskID-search-for',
						name: 'taskID-search-for',
						id: 'taskID-search-for',
						modelValue: selectedTask,
						dataKey: 'taskID',
						optionLabel: getReportTaskLabel,
						class: 'w-full',
						options: tasks,
						onUpdate: (value: any) => {
							ctx.setFieldValue('taskID', value ?? null);
						},
						toSearch: async (event: Event) => {
							let data = null as any;
							const metaFields = ctx.root.logic!.meta.metaui.groups.filter((item: any) => item.relObjName === 'DailyReportTask');
							const groupUi = metaFields[0]?.groupUi;
							if (!groupUi) return false;
							await ctx.uiBuilder.confirmDialog(ctx.uiBuilder.buildSearchForRelativeContent(
								ctx.uiBuilder.buildColumns(groupUi, ctx, {
									isSearch: true
								}),
								{
									dataKey: unref(tableDataKey),
									paginator: false,
									onSearch: ({ searchParams }: any) => {
										const list = filterReportTasks(getReportTasks(ctx), searchParams?.searchWord);
										return {
											list,
											pager: {
												...searchParam.pager,
												recordCount: list.length,
											}
										}
									},
									onPage: ({ pageNo, pageSize }: any) => {
										searchParam.pager.pageNo = pageNo;
										searchParam.pager.pageSize = pageSize;
									},
									onSelect: (selection: any, row: any) => {
										data = taskData.value = row;
									},
								}
							), ctx, {
								title: '请选择关联任务',
								width: '80%',
								accept: async () => {
									if (!data) return false;
									ctx.setFieldValue('taskID', data.taskID);
									return true;
								},
							})
						}
					})
				}).hideIf((t, context) => {
					const roleactionProject = context.globalProps.$app.context.modules.filter((item: any) => item.moduleCode === 'M.02')[0].subModules.find((module: any) => module.moduleCode === 'M.02.001')
					return !roleactionProject.authority.allowRead
				})
			);
			// fields.push(this.field('remark').onChange(e => console.log('demo', e)));
		}
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf(model => true),
			);
		}


		return { fields, groups, customActions };
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (!fields.length) {
			fields.push(
				this.field('taskID').hideIf((t, context) => {
					const roleactionProject = context.globalProps.$app.context.modules.filter((item: any) => item.moduleCode === 'M.02')[0].subModules.find((module: any) => module.moduleCode === 'M.02.001')
					return !roleactionProject.authority.allowRead
				})
			)
		}
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf(model => true),
			);
		}
		return { fields, groups, customActions };
	}
}

/**
 * 照片交互逻辑
 */
export class DailyReportPhotoLogic extends UiGroupLogic<DailyReportPhoto, DailyReport> {
	constructor(parent: DailyReportLogic, master: DailyReport) {
		super(defineDailyReportPhoto, parent, master, 'photos');
	}

	beforeEdit(): UiLogicFnResult<DailyReportPhoto> {
		const { fields, groups, customActions } = super.beforeEdit();
		if (!fields.length) {
			fields.push(this.field('remark').onChange(e => console.log('demo', e)));
		}
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf(model => true),
			);
		}

		return { fields, groups, customActions };
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf(model => true),
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
