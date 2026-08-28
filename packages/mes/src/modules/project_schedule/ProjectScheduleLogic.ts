import { resolve } from 'node:path';
/**
 * Copyright (c) 2006, 2020, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiFieldLogic, MetaUiField, MetaUiService, Module, ApiClient, EntityAction } from '@mmda/core';
import { MetaUiPack } from '@mmda/core';
import type { UiLogicInit, UiLogicFnResult, UiSearchForm } from '@mmda/vui';
import { UiLogic } from '@mmda/vui';
import { reactive, h, toRaw, ref, RendererElement, RendererNode, VNode, getCurrentInstance } from 'vue';
import { type CustomPage, defineCustomPage } from '@/models/CustomPage';
import { $t } from '@primevue/themes';

import { getTaskData, getLinkRes, getProSub, getPlanRes, getBreaks, getReflash, getReload } from '@/components/ProjectGanntView/ProjectGanttUpdate';
import { TaskRelationship, TaskRelationshipEnum } from '@mmda/base/src/enums/TaskRelationship';
import { TaskConstraintTypeEnum } from '@mmda/base/src/enums/TaskConstraintType';
import GanttPlanning from '@/components/ProjectGanntView/ProjectGanttPlanning';
import ChoosePerson from '@/components/ChoosePerson/ChoosePerson';
//生产工作包
import { ProjectWorkPackageEditor } from '@/modules/project_work_packages/ProjectWorkPackageEditor';

import { uiBuilder } from '@/mes';
import type { UiBuildContext } from '@mmda/vui';

//负责人
const chargePerson = reactive({
	data: {
		uid: null,
		userName: null,
		userID: null,
		deptName: null,
		detpID: null,
	},
});
const notice = reactive({
	data: {
		ownerID: '',
		ownerName: '',
		ownerInvalid: false, //显示用 是否选择了用户
		ownerDeptID: '',
		ownerDeptName: '',
		importance: 'UNKNOWN', //重要性
		urgency: 'NORMAL', //紧急性
		notification: '', //待办事宜
		copyTo: [], //通知给
		copyToInvalid: false, //是否选择了 通知给谁。
	},
});
//公用action
// const beforeNotice = async (context: UiContext, model: ProductionSchedule, action: EntityAction, actionName: string, repositoryName: string) =>
// 	NoticeFn(context, {
// 		title: context.globalProps.$t('auth.submitInformation'),
// 		data: notice.data,
// 		id: model.orderID ?? '',
// 		action: actionName,
// 		repository: repositoryName,
// 		detail: context.globalProps.$t('success.operationSuccessful'),
// 	});
interface MetaData {
	repository: string;
	service?: string;
	reload?: boolean;
}

/**
 * 生产看板交互逻辑
 * @author mmda codebot
 * @since 2023-11-28 00:20:38.0
 * @revision 2023-11-28 01:38:08.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产看板交互逻辑
 */

//linkTypes
const linkTypes = [
	{ key: 'FINISH_TO_START', value: 0 },
	{ key: 'START_TO_START', value: 1 },
	{ key: 'FINISH_TO_FINISH', value: 2 },
	{ key: 'START_TO_FINISH', value: 3 },
];

const updateRes = reactive({
	data: [],
});
const linkRes = reactive({
	data: false,
});

//id map
const threeMep = reactive({
	data: [],
});

//日计划提交对象
const dailyPlanning = reactive({
	data: {
		planNo: null,
		planNoInvalid: false,
		remark: null,
		date: null, //@datetime("yyyy-MM-dd")
	},
});

const getSubstringBeforeNthDot = (str: any, n: number) => {
	n = n + 1;
	const parts = str.split('.');
	if (parts.length < n) {
		// 如果点的数量少于指定的n，直接返回原字符串
		return str;
	}
	// 截取前n-1个部分，并使用点将它们重新连接起来
	return parts.slice(0, n - 1).join('.');
};

const tableData = ref([]);
const tablecolumns = ref([]);
const tableDataKEY = ref('id');
// const materialcolumns = ref([]);
const materialData = ref([]);

// const paginationData = reactive({
// 	pageSize: 10,
// 	currentPage: 1,
// 	recordCount: 0,
// });

//选中的rows
const selectionRows = ref([]);

const selfParam = reactive({
	my: false,
});

const searchParam = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {},
});
//权限
// const Qx = reactive({
// 	jurisdiction: <any>{},
// });

// //获取交付物
// const getProjectMaterial = async (ctx: any, taskItem?: any, value?: any) => {
// 	const { $ui: ui, $api, $router, $toast, $t: t } = ctx.globalProps;
// 	const apiClient = $api as ApiClient;
// 	const { model } = ctx; const metaUiService = ctx.logic!.metaUiService;
// 	if (taskItem.action) {
// 		taskItem.action = null;
// 	}
// 	const res = await apiClient.getAll({
// 		repository: 'ProjectMaterials',
// 		queryParams: {
// 			sourcingMode: 'MAKE',
// 			pageSize: searchParam.pager.pageSize,
// 			pageNo: searchParam.pager.pageNo,
// 			sort: '',
// 			searchWord: value,
// 		},
// 		service: 'mes',
// 	});
// 	searchParam.pager = res.pagination;
// 	materialData.value = res.list.map((it: any) => {
// 		return {
// 			...it,
// 			sourcingMode: it.customProperties.$sourcingMode,
// 			inspectMethod: it.customProperties.$inspectMethod,
// 			tracingMode: it.customProperties.$tracingMode,
// 			undetermined: it.undetermined == true ? '是' : '否',
// 			onSiteAssembly: it.onSiteAssembly == true ? '是' : '否',
// 		};
// 	});
// };

//获取项目工作包
const getPdItem = async (ctx: any, taskItem?: any, value?: any, importDev?: string) => {
	const { $ui: ui, $api, $router, $toast, $t: t } = ctx.globalProps;
	const apiClient = $api as ApiClient;
	const { model } = ctx; const metaUiService = ctx.logic!.metaUiService;
	if (taskItem.action) {
		taskItem.action = null;
	}

	const qParams = <any>{
		projectID: taskItem.projectID,
		pageSize: searchParam.pager.pageSize,
		pageNo: searchParam.pager.pageNo,
		sort: '',
		searchWord: value,
	};
	const sourcingMode = importDev;
	if (importDev) {
		qParams.sourcingMode = importDev;
	}
	const res = await apiClient.getAll({
		repository: 'ProjectDeliveryItems',
		queryParams: qParams,
		service: 'mes',
	});
	searchParam.pager = res.pagination;
	console.log('searchParam.pager', searchParam.pager);
	tableData.value = res.list.map((it: any) => {
		return { ...it, sourcingMode: it.customProperties.$sourcingMode, taskPhase: it.customProperties.$taskPhase };
	});
};

//获取甘特图子任务
const getSub = async (appContext: any, task: any) => {
	console.log('task', task);
	const { $api, $router, $toast, $t: t } = appContext.globalProps;
	const updateObj = {
		deleteID: task.id,
		subList: <any>[],
		subLinkList: <any>[],
	};
	//getProSub(updateObj);
	//删除,并更新
	try {
		let res: any = null;
		const apiClient = $api as ApiClient;
		res = await apiClient.getAll({
			action: 'getAllTaskSchedule',
			repository: 'ProjectSchedule',
			service: 'mes',
			queryParams: {
				projectID: task.projectID,
			},
		});
		//子项
		if (res.list && res.list.length > 0) {
			let newSubList: any[];
			let newSbuLinkList: any[];
			if (res.list[0].tasks && res.list[0].tasks.length > 0) {
				newSubList = res.list[0].tasks.map((item: any) => {
					item.id = item.taskID;
					item.text = item.taskName;
					item.ownerName = item.customProperties.$ownerID ?? '';
					item.ownerDept = item.customProperties.$ownerDeptID ?? '';
					item.projectName = item.taskName;
					item.start_date = item.expectedStart;
					item.end_date = item.expectedFinish;
					item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
					item.duration = item.expectedDuration;
					item.statusType = item.customProperties.$status;
					item.taskColor = !item.taskColor ? '0099ff' : item.taskColor;
					item.color = '#' + item.taskColor;
					item.constraint_type = item.customProperties.$constraintType;
					//item.isLoadingChildren= true;//是否已经加载过子集
					item.refName = 'ProjectTask';
					//判断taskNo是否有点
					//1个点 item.projectID
					//两个点以上 取点数 -1点之前的值   item.projectID+ "_" +
					const resNo = item.taskNo.split('.').length - 1;
					if (resNo <= 0) {
						item.parent = item.projectID;
						item.level = 1;
						const obj = <any>{};
						obj.key = item.taskNo;
						obj.value = item.taskID;
						obj.projectID = item.projectID;
						threeMep.data.push(obj);
					} else {
						//截取点长度后的值
						// console.log('getSubstringBeforeNthDot(item.taskNo, resNo)', getSubstringBeforeNthDot(item.taskNo, resNo));
						//根据NO找父亲
						const taskID = getSubstringBeforeNthDot(item.taskNo, resNo);
						const fartherObj = threeMep.data.filter((mapItem: any) => {
							return mapItem.key == taskID && mapItem.projectID == item.projectID;
						});
						item.level = resNo + 1;
						item.parent = fartherObj[0]?.value ?? '';
						const obj = <any>{};
						obj.key = item.taskNo;
						obj.value = item.taskID;
						obj.projectID = item.projectID;
						threeMep.data.push(obj);
					}
					return item;
				});
			}

			if (res.list[0].links && res.list[0].links.length > 0) {
				newSbuLinkList = res.list[0].links.map((linkItem: any) => {
					linkItem.refName = 'ProjectTask';
					linkItem.relationID = linkItem.fromTaskID + '_' + linkItem.toTaskID;
					linkItem.source = linkItem.fromTaskID;
					linkItem.target = linkItem.toTaskID;
					linkItem.getLoad = true;
					//link转换 甘特图type
					const res = linkTypes.find((item: any) => {
						return item.key == linkItem.relationType;
					});
					if (res.value) {
						linkItem.type = res.value;
					} else {
						linkItem.type = 0;
					}
					return linkItem;
				});
			}

			updateObj.subList = newSubList;
			updateObj.subLinkList = newSbuLinkList;

			getProSub(updateObj);
		} else {
			appContext.uiBuilder.toast(appContext, {
				severity: 'info',
				summary: t('state.noData'),
				life: 3000,
			});
		}
		//子项的link
		// if (res.list && res.list.length > 0 && res.list[0].links && res.list[0].links.length > 0) {
		// 	const newSubLinkList = res.list[0].links.map((item: any) => {

		// 	});
		// }
	} catch (error: any) {
		appContext.uiBuilder.toast(appContext, {
			severity: 'error',
			title: t('dialog.title.error'),
			summary: error.detail ?? '',
			group: 'br',
			life: 3000,
		});
	}
};

const refLashDatas = reactive({
	data: {
		tasks: [],
		links: [],
	},
});
export class ProjectScheduleLogic extends UiLogic<CustomPage> {
	taskDatas: any;
	//甘特图模版
	skin = 'material'; //传入dark为黑暗模式
	scheduleroleaction: any = {}; //权限
	roleaction = getCurrentInstance().appContext.config.globalProperties.$app.context.modules;
	constructor(init: UiLogicInit) {
		super(defineCustomPage, init);
	}
	async initMetadata(reload: boolean = false) {
		// 接口调通后删除此方法
		// super.initMetadata();
		return Promise.resolve({ metaui: null });
	}

	//获得权限
	// async getRoleaction() {
	// 	this.roleaction.forEach((item: any) => {
	// 		if (item.moduleLabel === '生产计划' && item.moduleCode == 'M.02' && item.subModules) {
	// 			item.subModules.forEach((i: any) => {
	// 				if (i.moduleLabel === '生产排程' && i.moduleCode == 'M.02.011' && i.actions) {
	// 					this.scheduleroleaction = i; //排程按钮权限
	// 				}
	// 			});
	// 		}
	// 	});
	// }

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			//fields.push(this.field('status').searchable(true));
		}
		//获得权限
		//this.getRoleaction();

		return { fields, groups, customActions };
	}

	async getAll(param: any) {
		// console.log(this.searchParam)
		console.log(this.searchParams);
		// const params = super.getSearchParams()
		// console.log(params);
		// param.planID = this.searchParam.planID
		// param.taskID = this.searchParam.taskID
		const res = await super.getAll({
			...param,
			queryParams: {
				status: this.searchParams.status?.['status'] ?? '',
			},
		});
		return res;
	}

	// const wbsData = reactive({
	// 	payload: {
	// 		refID: '',
	// 	},
	// });

	//设置负责人
	setResponsible = async (ctx: any, taskItems?: any) => {
		console.log('ctx', ctx);
		console.log('taskItems', taskItems);
		const { $ui: ui, $api, $router, $toast, $t: t } = ctx.globalProps;

		//弹窗选择负责人
		const apiClient = $api as ApiClient;
		try {
			// 生成弹窗
			await ctx.uiBuilder.confirmDialog(
				h(ChoosePerson, {
					context: ctx,
					onChangeData(val: any) {
						chargePerson.data = val.data;
					},
				}),
				ctx,
				{
					width: '30vw',
					height: '15vh',
					title: '选择一个负责人',
					accept: async () => {
						console.log('chargePerson', chargePerson);
						if (!chargePerson.data.userID) {
							$toast.add({
								severity: 'error',
								summary: '请选择一个负责人',
								group: 'br',
								life: 3000,
							});
							return false;
						} else {
							if (taskItems && taskItems.length > 0) {
								//提交模型
								const payLoad = <any>[];
								taskItems.forEach((item: any) => {
									//chargePerson.data
									// item.ownerName = chargePerson.data.userName;
									// item.ownerID = chargePerson.data.userID;
									// item.ownerDept = chargePerson.data.deptName;
									// item.ownerDeptID = chargePerson.data.detpID;
									const itemKeys = <any>{
										taskID: item.taskID,
										taskNo: item.taskNo,
										projectID: item.projectID,
										ownerID: item.ownerID,
										ownerDeptID: item.ownerDeptID,
										refName: item.refName,
									};
									payLoad.push(itemKeys);
								});

								try {
									const res = await apiClient.doAction(
										{
											action: 'assign',
											repository: 'ProjectSchedule',
											service: 'mes',
										},
										payLoad
									);
									if (res) {
										$toast.add({
											severity: 'success',
											detail: '操作成功',
											summary: '成功',
											life: 3000,
										});
										//成功后更新数据 放回去
										taskItems.forEach((item: any) => {
											item.ownerName = chargePerson.data.userName;
											item.ownerID = chargePerson.data.userID;
											item.ownerDept = chargePerson.data.deptName;
											item.ownerDeptID = chargePerson.data.detpID;
										});
										getReflash(taskItems);
										//返回更新
										console.log('成功');
									}
									return true;
								} catch (error: any) {
									$toast.add({
										severity: 'error',
										detail: error.message,
										summary: '错误',
										group: 'br',
										life: 3000,
									});
									return false;
								}
							}
						}
					},
				}
			);
			return false;
		} catch (error: any) {
			$toast.add({
				severity: 'error',
				title: $t('dialog.title.error'),
				summary: error.detail ?? '',
				group: 'br',
				life: 3000,
			});
			return false;
		}
	};

	searchParam: Record<string, any> = {};
	beforeSearch(): UiSearchForm {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();

		if (customSearchFields.length == 0) {
			customSearchFields.push({
				searchLabel: '我的',
				searchParam: 'my',
				renderer: (ctx: UiBuildContext<any> & any, csf) => {
					const { $ui: ui } = ctx.globalProps;
					console.log('csf', csf);
					return ui.factory.toggleSwitch(csf.searchVal.value, {
						onValueChange: async (val: boolean) => {
							csf.searchVal.value = val;
							ctx.app.localDb.put(`search/${ctx.logic.repository}/my`, JSON.parse(JSON.stringify(val)));
						},
					});
				},
			});
		}

		console.log(searchParam, 'searchParam');
		this.searchParam = searchParam;
		return { searchParam, searchFields, customSearchFields };
	}

	async getData() {
		return true;
	}

	//获取甘特图任务数据
	async getProSchedule(appContext: any, query: any) {
		const { $api, $router, $toast, $t: t } = appContext.app.config.globalProperties;
		const task = reactive({
			taskData: {
				data: <any>[],
				link: <any>[],
			},
		});
		this.taskDatas = task.taskData;

		this.taskDatas.tasks = [];
		this.taskDatas.links = [];
		if (!query) {
			query = null;
		}

		try {
			let res: any = null;
			const apiClient = $api as ApiClient;
			res = await apiClient.getAll({
				action: 'getAllProjectSchedule',
				repository: 'ProjectSchedule',
				service: 'mes',
				//queryParams:query,
			});
			if (res.list) {
				//this.taskDatas.tasks= res.list;
				const originalArray = JSON.parse(JSON.stringify(res.list));
				const newArrayList = res.list.map((item: any) => {
					item.id = item.projectID;
					item.ownerName = item.customProperties.$ownerID ?? '';
					item.ownerDept = item.customProperties.$ownerDeptID ?? '';
					item.text = item.projectName;
					item.start_date = item.expectedStart;
					item.end_date = item.expectedFinish;
					item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
					item.duration = item.expectedDuration;
					item.statusType = item.customProperties.$status;
					item.taskNo = item.projectNo;
					//item.parent = item.parentTaskID;
					item.taskColor = !item.taskColor ? '0099ff' : item.taskColor;
					item.color = '#' + item.taskColor;
					item.constraint_type = item.customProperties.$constraintType;
					item.isLoadingChildren = true; //是否已经加载过子集
					item.refName = 'Project';
					item.taskID = item.projectID;
					const obj = <any>{};
					obj.key = item.projectID;
					obj.value = item.projectID;
					obj.projectID = item.projectID;
					threeMep.data.push(obj);
					return item;
				});
				const addSubMap = originalArray.map((item2: any) => {
					item2.parent = item2.projectID;
					item2.ownerName = item2.customProperties.$ownerID ?? '';
					item2.ownerDept = item2.customProperties.$ownerDeptID ?? '';
					item2.id = item2.projectID + '_1';
					item2.projectName = t('ganttLabel.loading');
					item2.text = '';
					item2.start_date = new Date();
					item2.end_date = new Date();
					item2.constraint_date = null;
					item2.duration = 0;
					item2.statusType = null;
					item2.taskColor = !item2.taskColor ? '0099ff' : item2.taskColor;
					item2.color = '#' + item2.taskColor;
					item2.constraint_type = null;
					item2.isLoadingChildren = false; //是否已经加载过子集
					item2.status = null;
					item2.expectedStart = null;
					item2.expectedFinish = null;
					item2.expectedDuration = null;
					item2.refName = 'loadMore';
					item2.taskID = item2.projectID;
					item2.taskNo = item2.projectNo;
					return item2;
				});

				const newData = [...newArrayList, ...addSubMap];
				this.taskDatas.data = newData;
				this.taskDatas.link = [];

				console.log('appContext', appContext);
				return this.taskDatas;
			}
		} catch (error: any) {
			$toast.add({
				severity: 'error',
				title: $t('dialog.title.error'),
				summary: error.detail ?? '',
				group: 'br',
				life: 3000,
			});
			return task.taskData;
		}
	}

	//获取甘特图任务数据
	async getProScheduleR(appContext: any, query: any) {
		const { $api, $router, $toast, $t: t } = appContext.globalProps;
		const task = reactive({
			taskData: {
				data: <any>[],
				link: <any>[],
			},
		});

		refLashDatas.data.tasks = [];
		refLashDatas.data.links = [];
		if (!query) {
			query = null;
		}

		try {
			let res: any = null;
			const apiClient = $api as ApiClient;
			res = await apiClient.getAll({
				action: 'getAllProjectSchedule',
				repository: 'ProjectSchedule',
				service: 'mes',
				queryParams: query,
			});
			if (res.list) {
				//this.taskDatas.tasks= res.list;
				const originalArray = JSON.parse(JSON.stringify(res.list));
				const newArrayList = res.list.map((item: any) => {
					item.id = item.projectID;
					item.ownerName = item.customProperties.$ownerID ?? '';
					item.ownerDept = item.customProperties.$ownerDeptID ?? '';
					item.text = item.projectName;
					item.start_date = item.expectedStart;
					item.end_date = item.expectedFinish;
					item.constraint_date = item.constraintDate ? new Date(item.constraintDate) : null;
					item.duration = item.expectedDuration;
					item.statusType = item.customProperties.$status;
					item.taskNo = item.projectNo;
					//item.parent = item.parentTaskID;
					item.taskColor = !item.taskColor ? '0099ff' : item.taskColor;
					item.color = '#' + item.taskColor;
					item.constraint_type = item.customProperties.$constraintType;
					item.isLoadingChildren = true; //是否已经加载过子集
					item.refName = 'Project';
					item.taskID = item.projectID;
					const obj = <any>{};
					obj.key = item.projectID;
					obj.value = item.projectID;
					obj.projectID = item.projectID;
					threeMep.data.push(obj);
					return item;
				});
				const addSubMap = originalArray.map((item2: any) => {
					item2.parent = item2.projectID;
					item2.ownerName = item2.customProperties.$ownerID ?? '';
					item2.ownerDept = item2.customProperties.$ownerDeptID ?? '';
					item2.id = item2.projectID + '_1';
					item2.projectName = t('ganttLabel.loading');
					item2.text = '';
					item2.start_date = new Date();
					item2.end_date = new Date();
					item2.constraint_date = null;
					item2.duration = 0;
					item2.statusType = null;
					item2.taskColor = !item2.taskColor ? '0099ff' : item2.taskColor;
					item2.color = '#' + item2.taskColor;
					item2.constraint_type = null;
					item2.isLoadingChildren = false; //是否已经加载过子集
					item2.status = null;
					item2.expectedStart = null;
					item2.expectedFinish = null;
					item2.expectedDuration = null;
					item2.refName = 'loadMore';
					item2.taskID = item2.projectID;
					item2.taskNo = item2.projectNo;
					return item2;
				});
				const newData = [...newArrayList, ...addSubMap];
				refLashDatas.data.tasks = newData;
				refLashDatas.data.links = [];
				//await getReload(appContext, taskItem, '');
				getReload(refLashDatas.data);
			}
		} catch (error: any) {
			$toast.add({
				severity: 'error',
				title: $t('dialog.title.error'),
				summary: error.detail ?? '',
				group: 'br',
				life: 3000,
			});
			//return task.taskData;
		}
	}

	//甘特图下达
	async changeRelease(taskItem: any, appContext: any) {
		if (taskItem.action) {
			taskItem.action = null;
		}
		//appContext.uiBuilder.
		const res = appContext.uiBuilder.buildNotice(appContext, {
			onSubmit: async (data: any) => {
				const { $t: t, $api: apiBox, $toast: toast } = appContext.globalProps;
				//调用接口
				try {
					const res: boolean = await apiBox.doAction(
						{
							path: taskItem.taskID ?? '',
							action: 'release',
							repository: 'ProjectSchedule',
							service: 'mes',
						},
						data
					);
					//关闭窗口
					if (res) {
						toast.add({
							severity: 'success',
							detail: `${t('dialog.success')}`,
							summary: t('dialog.success'),
							group: 'br',
							life: 3000,
						});
						//调用接口
						await getSub(appContext, taskItem);
						return true;
					}
				} catch (error: any) {
					appContext.uiBuilder.toast(appContext, {
						severity: 'error',
						detail: error.message ?? `${t('invalid.error')}`,
						summary: t('invalid.error'),
						group: 'br',
						life: 3000,
					});
					return false;
				}
			},
		});

		//beforeNotice(appContext, taskItem, null, 'breakDown', 'ProductionOrders');
		//提交给组件更新数据
		//getBreaks(await res);
	}

	//获取子任务
	async getSubSchedule(appContext: any, task: any) {
		await getSub(appContext, task);
	}

	//添加工作包
	async addWorkPackage(taskItem: any, appContext: any) {
		if (taskItem.action) {
			taskItem.action = null;
		}

		const { $ui: ui, $api, $router, $toast, $t: t, $toast: toast } = appContext.globalProps;
		const apiClient = $api as ApiClient;
		const { model, metaUiService } = appContext;

		//获取元数据
		const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
		tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
			return Number(prev.fieldIdx) - Number(curr.fieldIdx);
		});

		tableDataKEY.value = 'itemID';
		await getPdItem(appContext, taskItem, '');

		//弹窗显示数据
		if (tableData.value && tableData.value.length > 0) {
			appContext.uiBuilder.confirmDialog(
				appContext.uiBuilder.buildSearchForRelativeContent(
					tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
					{
						dataKey: tableDataKEY.value,
						selectionMode: 'multiple',
						onSearch: async (params: any) => {
							const { searchParams, reload, pager } = params;
							await getPdItem(appContext, taskItem, searchParams.searchWord);
							return { list: tableData.value, pager: searchParam.pager };
						},
						onPage: ({ pageNo, pageSize }: any) => {
							searchParam.pager.pageNo = pageNo;
							searchParam.pager.pageSize = pageSize;
						},
						onSelect: (selection: any, row: any) => {
							selectionRows.value = selection;
						},
					}
				),
				appContext,
				{
					title: '请选择项目交付物',
					width: '90vw',
					accept: async () => {
						if (selectionRows.value.length > 0) {
							//提交模型
							const payLoad = {
								payload: {
									taskID: taskItem.projectID,
									items: <any>[],
								},
							};
							const rItemKeys = selectionRows.value.map((item: any) => {
								const itemKeys = <any>{
									projectID: item.projectID,
									itemID: item.itemID,
									ownerID: null,
									ownerDeptID: null,
								};
								return itemKeys;
							});
							payLoad.payload.items = rItemKeys;
							try {
								//调用接口提交交付物，生成工作包
								const resPackages = await apiClient.doAction(
									{
										path: taskItem.taskID,
										action: 'addWorkPackage',
										repository: 'ProjectSchedule',
										service: 'mes',
									},
									payLoad
								);
								if (resPackages == true) {
									appContext.uiBuilder.toast(appContext, {
										severity: 'success',
										summary: t('success.operationSuccessful'),
										life: 3000,
									});
									//调用接口更新数据
									await getSub(appContext, taskItem);
									return true;
								}
							} catch (error: any) {
								appContext.uiBuilder.toast(appContext, {
									severity: 'error',
									title: $t('dialog.title.error'),
									summary: error.detail ?? '',
									group: 'br',
									life: 3000,
								});
								return false;
							}

							return;
						} else {
							appContext.uiBuilder.toast(appContext, {
								severity: 'error',
								summary: t('invalid.requiredSelectAny'),
								group: 'br',
								life: 3000,
							});
							return false;
						}
					},
				}
			);
		} else {
			toast.add({
				severity: 'info',
				detail: `${t('invalid.noDeliverables')}`,
				life: 3000,
			});
		}
	}

	//导入交付物
	async imporitDeliverables(taskItem: any, appContext: any) {
		if (taskItem.action) {
			taskItem.action = null;
		}

		const { $ui: ui, $api, $router, $toast, $t: t, $toast: toast } = appContext.globalProps;
		const apiClient = $api as ApiClient;
		const { model, metaUiService } = appContext;

		//获取元数据
		const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
		tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
			return Number(prev.fieldIdx) - Number(curr.fieldIdx);
		});

		tableDataKEY.value = 'itemID';
		await getPdItem(appContext, taskItem, '', 'MAKE');

		//弹窗显示数据
		if (tableData.value && tableData.value.length > 0) {
			appContext.uiBuilder.confirmDialog(
				appContext.uiBuilder.buildSearchForRelativeContent(
					tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
					{
						dataKey: tableDataKEY.value,
						selectionMode: 'multiple',
						onSearch: async (params: any) => {
							const { searchParams, reload, pager } = params;
							await getPdItem(appContext, taskItem, searchParams.searchWord, 'MAKE');
							return { list: tableData.value, pager: searchParam.pager };
						},
						onPage: ({ pageNo, pageSize }: any) => {
							searchParam.pager.pageNo = pageNo;
							searchParam.pager.pageSize = pageSize;
						},
						onSelect: (selection: any, row: any) => {
							selectionRows.value = selection;
						},
						onSelectAll: (selection: any, row: any) => {
							selectionRows.value = selection;
						},
					}
				),
				appContext,
				{
					title: '请选择项目交付物',
					width: '90vw',
					accept: async () => {
						if (selectionRows.value.length > 0) {
							//提交模型
							const payLoad = {
								payload: {
									taskID: taskItem.projectID,
									items: <any>[],
								},
							};
							const rItemKeys = selectionRows.value.map((item: any) => {
								const itemKeys = <any>{
									projectID: item.projectID,
									itemID: item.itemID,
									ownerID: null,
									ownerDeptID: null,
								};
								return itemKeys;
							});
							payLoad.payload.items = rItemKeys;
							try {
								//调用接口提交交付物，生成工作包
								const resPackages = await apiClient.doAction(
									{
										path: taskItem.taskID,
										action: 'addWorkPackage',
										repository: 'ProjectSchedule',
										service: 'mes',
									},
									payLoad
								);
								if (resPackages == true) {
									appContext.uiBuilder.toast(appContext, {
										severity: 'success',
										summary: t('success.operationSuccessful'),
										life: 3000,
									});
									//调用接口更新数据
									await getSub(appContext, taskItem);
									return true;
								}
							} catch (error: any) {
								appContext.uiBuilder.toast(appContext, {
									severity: 'error',
									title: $t('dialog.title.error'),
									summary: error.detail ?? '',
									group: 'br',
									life: 3000,
								});
								return false;
							}

							return;
						} else {
							appContext.uiBuilder.toast(appContext, {
								severity: 'error',
								summary: t('invalid.requiredSelectAny'),
								group: 'br',
								life: 3000,
							});
							return false;
						}
					},
				}
			);
		} else {
			toast.add({
				severity: 'info',
				detail: `${t('invalid.noDeliverables')}`,
				life: 3000,
			});
		}
	}
	// //导入交付物
	// async imporitDeliverables(taskItem: any, appContext: any) {
	// 	if (taskItem.action) {
	// 		taskItem.action = null;
	// 	}

	// 	const { $ui: ui, $api, $router, $toast, $t: t, $toast: toast } = appContext.globalProps;
	// 	const apiClient = $api as ApiClient;
	// 	const { model, metaUiService } = appContext;

	// 	//获取元数据
	// 	const mUI = await metaUiService.get('ProjectDeliveryItems', 'mes');
	// 	tablecolumns.value = mUI.getListedFields().sort((prev: any, curr: any) => {
	// 		return Number(prev.fieldIdx) - Number(curr.fieldIdx);
	// 	});

	// 	tableDataKEY.value = 'itemID';
	// 	await getPdItem(appContext, taskItem, '');

	// 	//弹窗显示数据
	// 	if (materialData.value && materialData.value.length > 0) {
	// 		appContext.uiBuilder.confirmDialog(
	// 			appContext.uiBuilder.buildSearchForRelativeContent(
	// 				tablecolumns.value.map((item: any) => ui.factory.column({ header: item.displayLabel, field: item.fieldName })),
	// 				{
	// 					dataKey: tableDataKEY.value,
	// 					selectionMode: 'multiple',
	// 					onSearch: async (params: any) => {
	// 						const { searchParams, reload, pager } = params;
	// 						await getPdItem(appContext, taskItem, searchParams.searchWord);
	// 						return { list: materialData.value, pager: searchParam.pager };
	// 					},
	// 					onPage: ({ pageNo, pageSize }: any) => {
	// 						searchParam.pager.pageNo = pageNo;
	// 						searchParam.pager.pageSize = pageSize;
	// 					},
	// 					//全选有BUG 只能单选
	// 					onSelect: (selection: any, row: any) => {
	// 						console.log('selection', selection);
	// 						selectionRows.value = selection;
	// 					},
	// 				}
	// 			),
	// 			appContext,
	// 			{
	// 				title: '请选择项目交付物',
	// 				width: '90vw',
	// 				accept: async () => {
	// 					if (selectionRows.value.length > 0) {
	// 						//提交模型
	// 						const payLoad = {
	// 							payload: {
	// 								taskID: taskItem.projectID,
	// 								items: <any>[],
	// 							},
	// 						};
	// 						const rItemKeys = selectionRows.value.map((item: any) => {
	// 							const itemKeys = <any>{
	// 								projectID: item.projectID,
	// 								itemID: item.itemID,
	// 								ownerID: null,
	// 								ownerDeptID: null,
	// 							};
	// 							return itemKeys;
	// 						});
	// 						payLoad.payload.items = rItemKeys;
	// 						try {
	// 							//调用接口提交交付物，生成工作包
	// 							const resPackages = await apiClient.doAction(
	// 								{
	// 									path: taskItem.taskID,
	// 									action: 'addWorkPackage',
	// 									repository: 'ProjectSchedule',
	// 									service: 'mes',
	// 								},
	// 								payLoad
	// 							);
	// 							if (resPackages == true) {
	// 								appContext.uiBuilder.toast(appContext, {
	// 									severity: 'success',
	// 									summary: t('success.operationSuccessful'),
	// 									life: 3000,
	// 								});
	// 								//调用接口更新数据
	// 								await getSub(appContext, taskItem);
	// 								return true;
	// 							}
	// 						} catch (error: any) {
	// 							appContext.uiBuilder.toast(appContext, {
	// 								severity: 'error',
	// 								title: $t('dialog.title.error'),
	// 								summary: error.detail ?? '',
	// 								life: 3000,
	// 							});
	// 							return false;
	// 						}

	// 						return;
	// 					} else {
	// 						appContext.uiBuilder.toast(appContext, {
	// 							severity: 'error',
	// 							summary: t('invalid.requiredSelectAny'),
	// 							life: 3000,
	// 						});
	// 						// appContext.uiBuilder.toast(appContext, {
	// 						// 	severity: 'error',
	// 						// 	title: t('invalid.requiredSelectAny'),
	// 						// 	summary: t('invalid.requiredSelectAny'),
	// 						// 	life: 3000,
	// 						// });
	// 						return false;
	// 					}
	// 				},
	// 			}
	// 		);
	// 	} else {
	// 		toast.add({
	// 			severity: 'info',
	// 			detail: `${t('invalid.noDeliverables')}`,
	// 			life: 3000,
	// 		});
	// 	}
	// }

	//甘特图 link
	async changeLinks(linkItem: any, appContext: any) {
		if (linkItem.action) {
			linkItem.action = null;
		}

		// linkItem.refName = 'ProductionOrderRelation';
		linkItem.fromTaskID = linkItem.source;
		linkItem.toTaskID = linkItem.target;
		linkItem.relationID = linkItem.id;
		linkItem.relationType = linkItem.type;
		const { $api, $router, $toast } = appContext.app.config.globalProperties;
		try {
			let res: any = null;
			const apiClient = $api as ApiClient;
			res = await apiClient.doAction(
				{
					action: 'saveLink',
					repository: 'ProjectSchedule',
					service: 'mes',
				},
				linkItem
			);
			return;
			// linkRes.data = res;
			// getLinkRes(linkRes.data);
		} catch (error: any) {
			appContext.uiBuilder.toast(appContext, {
				severity: 'error',
				title: $t('dialog.title.error'),
				summary: error.detail ?? '',
				group: 'br',
				life: 3000,
			});
			return false;
		}
	}

	//甘特图日计划弹窗
	async subPlanning(planDate: any, appContext: any) {
		dailyPlanning.data.date = planDate;
		appContext.uiBuilder.confirm(appContext, {
			title: '编制日计划',
			message: h(GanttPlanning, {
				dataModel: dailyPlanning.data,
				ctx: appContext,
				onChangePlanningData(val: any) {
					dailyPlanning.data = val.data;
				},
			}),
			accept: async () => {
				//选中人必填
				if (!dailyPlanning.data.planNo) {
					dailyPlanning.data.planNoInvalid = true;
					return false;
				} else {
					dailyPlanning.data.planNoInvalid = false;
					return this.submitPlan(dailyPlanning.data, appContext);
				}
			},
		});
	}
	//甘特图日计划调用接口返回
	async submitPlan(planItem: any, content: any) {
		const { $api, $router, $toast } = content.globalProps;

		if (planItem.action) {
			planItem.action = null;
		}

		try {
			let res: any = null;
			const apiClient = $api as ApiClient;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			res = await apiClient.doAction(
				{
					action: 'dailyPlanning',
					repository: 'ProductionScheduleTasks',
					service: 'mes',
				},
				planItem
			);
			return true;
		} catch (error: any) {
			let errorMessage = null;
			errorMessage = error.message;
			if (error.validationErrors && error.validationErrors.length > 0) {
				errorMessage = error.validationErrors[0].error;
			}
			content.appContext.uiBuilder.toast(content.appContext, {
				severity: 'error',
				title: $t('dialog.title.error'),
				summary: errorMessage ?? '',
				group: 'br',
				life: 3000,
			});
			return false;
		}
	}
	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		return { fields, groups, customActions };
	}
}

/**
 * 构造生产计划交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectScheduleLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProjectScheduleLogic({
		service: metaUiService,
		repository: 'ProjectSchedule',
		router,
		module: module || metaUiService.findModule('ProjectSchedule'),
		customPage: true,
	});
//#endregion ~GENERATED PARTS END
