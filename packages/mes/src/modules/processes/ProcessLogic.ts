/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { h, ref, computed, type Ref, toRaw, defineAsyncComponent } from 'vue';
import { MetaUiService, Module, MetaUiField, type UiContext, defaultPager, isNullOrUndefined, MetaModel, MetaUiGroup, Entity, getSearchOp, EntitySearchParam, PagedList, type EntityUrlParam } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne, UiLogicBeforeFn } from '@mmda/vui';
import { type Process, defineProcess } from '@/models/Process';
import { type ProcessOperation, defineProcessOperation } from '@/models/ProcessOperation';
import { type ProcessRoute, defineProcessRoute } from '@/models/ProcessRoute';
import { type ProcessLine, defineProcessLine } from '@/models/ProcessLine';
import { ProductionLine, defineProductionLine } from '@/models/ProductionLine';
import { type ProcessOperationResource, defineProcessOperationResource } from '@/models/ProcessOperationResource';
import { type ProcessOperationAlarm, defineProcessOperationAlarm } from '@/models/ProcessOperationAlarm';
import { type ProcessOperationParam, defineProcessOperationParam } from '@/models/ProcessOperationParam';
import { type ProcessOperationChart, defineProcessOperationChart } from '@/models/ProcessOperationChart';
import { WipTransMode } from '@/enums/WipTransMode';
import { OpPhase } from '@/enums/OpPhase';
import { QcInProcessType } from '@/enums/QcInProcessType';
import { ResourceType, ResourceTypeEnum } from '@/enums/ResourceType';
import { type Material, defineMaterial } from '@mmda/base/src/models/Material';
import { MaterialType } from '@mmda/base/src/enums/MaterialType';
import { type MaterialCat, defineMaterialCat } from '@mmda/base/src/models/MaterialCat';

/** BPMN 编辑器异步加载，避免制程逻辑文件静态引入 bpmn-js */
const BpmnCom = defineAsyncComponent(() =>
	import('@mmda/vui-primevue').then((m) => m.BpmnModeler)
);

/**
 * 制程交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:04.0
 * @revision 2024-09-01 23:04:29.0
 */
export class ProcessLogic extends UiLogic<Process> {
	constructor(init: UiLogicInit) {
		super(defineProcess, init);
		this.addRelativeLogic<ProcessOperation>('operations', master => new ProcessOperationLogic(this, master));
		this.addRelativeLogic<ProcessRoute>('routes', master => new ProcessRouteLogic(this, master));
		this.addRelativeLogic<ProcessLine>('lines', master => new ProcessLineLogic(this, master));

		// 保存前清除BPMN缓存
		this.beforeSave = async (context: UiContext, model: Process) => {
			await this.clearCachedData();
			return true;
		}

		this.afterSave = async (context: UiContext) => {
			await this.clearCachedData();
		}
	}

	/**
	 * 规范化产出比率
	 * @param {unknown} value - 当前输入的产出比率
	 * @returns {number} - 可参与计算的数值型产出比率
	 */
	getOutputRateValue(value: unknown) {
		const rate = typeof value === 'number' ? value : Number(value ?? 0);
		return Number.isFinite(rate) ? rate : 0;
	}

	/**
	 * 根据生产节拍同步节拍产量
	 * @param {UiContext} ctx - 当前上下文
	 * @param {unknown} cycleMinutes - 当前生产节拍
	 * @returns {number} - 节拍产量
	 */
	syncCycleOutputQty(ctx: UiViewContext<any>, cycleMinutes: unknown) {
		const value = typeof cycleMinutes === 'number' ? cycleMinutes : Number(cycleMinutes ?? 0);
		const cycleOutputQty = Number.isFinite(value) && value > 0
			? Number((1 / value).toFixed(3))
			: 0;
		ctx.setFieldValue('cycleOutputQty', cycleOutputQty);
		return cycleOutputQty;
	}

	/**
	 * 计算当前工序可用的剩余产出比率
	 * @param {ProcessOperation[] | undefined} operations - 当前制程下的所有工序
	 * @param {string} [currentOpID] - 当前编辑中的工序标识
	 * @returns {number} - 扣除其他工序后剩余可分配的产出比率
	 */
	getRemainOutputRate(operations: ProcessOperation[] | undefined, currentOpID?: string) {
		const usedRate = (operations ?? [])
			.filter(op => !MetaModel.deleted(op) && op.id !== currentOpID)
			.reduce((sum, op) => sum + this.getOutputRateValue(op.outputRate), 0);

		return Math.max(0, Number((1 - usedRate).toFixed(6)));
	}

	/**
	 * 更新制程的生产周期、生产节拍和节拍产量
	 * @param {UiContext} ctx - 制程上下文
	 * @param {ProcessOperation[] | undefined} operations - 当前制程下的所有工序
	 */
	updateProcessCycleData(ctx: UiViewContext<any>, operations: ProcessOperation[] | undefined) {
		const validOperations = (operations ?? []).filter(op => !MetaModel.deleted(op));
		const leadTime = Number((validOperations.reduce((sum, op) => sum + this.getOutputRateValue(op.cycleTime), 0) / 60).toFixed(2));
		const maxCycleTime = validOperations.reduce((max, op) => Math.max(max, this.getOutputRateValue(op.cycleTime)), 0);
		const cycleMinutes = Number((maxCycleTime / 60).toFixed(2));
		const cycleOutputQty = cycleMinutes > 0 ? Number((1 / cycleMinutes).toFixed(3)) : 0;

		ctx.setFieldValue('leadTime', leadTime);
		ctx.setFieldValue('cycleMinutes', cycleMinutes);
		ctx.setFieldValue('cycleOutputQty', cycleOutputQty);
	}

	//#region 树形列表逻辑
	categoryName: Ref<string> = ref('');
	treeData: Ref<MaterialCat[]> = ref([]);
	treeLoading: Ref<boolean> = ref(false);

	/**
	 * 搜索物料分类
	 * @param {UiContext} ctx - 上下文对象
	 * @param {string} [searchWord=''] - 搜索关键词,默认为空字符串
	 * @returns {Promise<boolean>} - 搜索成功返回true,否则返回false
	 */
	async searchFn(ctx: UiContext, searchWord: string | MaterialCat = '') {
		this.treeLoading.value = true;
		return await new Promise((resolve, reject) => {
			resolve(this.apiClient.getAll({
				repository: 'MaterialCats',
				service: 'base',
				queryParams: {
					depth: 0,
					materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
					searchWord: searchWord
				},
			}));
		}).then((res: any) => {
			this.treeData.value = res.list
			Promise.resolve(true);
		}).finally(() => {
			this.treeLoading.value = false;
		});
	};



	currentCategory: MaterialCat;
	get selectionItem() {
		return this.currentCategory ? {
			[this.currentCategory.key]: true
		} : {}
	}
	/**
	 * 节点点击事件处理
	 * @param {UiContext} ctx - 上下文对象
	 * @param {ToolCategory} data - 节点数据
	 */
	async onNodeSelectFn(ctx: UiContext<Process>, data: MaterialCat) {
		this.currentCategory = data;
		ctx.refresh(false);
	}
	//#endregion

	async create(param: any = {}, entityUrlParam?: EntityUrlParam): Promise<Process> {
		return super.create(param, entityUrlParam).then(res => {
			if (this.currentCategory) {
				res.productCategory = this.currentCategory;
				res.productCategoryID = this.currentCategory.categoryID;
			}
			return res;
		});
	}
	async getAll(param: EntitySearchParam, context?: UiContext): Promise<PagedList<Process>> {

		param.queryParams = Object.assign({}, param.queryParams, {
			productCategoryID: this.currentCategory?.categoryID ?? '',
		});
		return super.getAll(param, context);
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('processType').searchable(true),
				//  this.field('productCategoryID').searchable(true),
				this.field('status').searchable(true),
				//当前没有制品类别模块，先以普通文本形式显示
				this.field('productCategoryID').setCustomCellRenderer((fld, ctx) => {
					return ctx.uiBuilder.factory.textSpan(ctx.model.productCategory?.categoryName ?? '-', {});
				})
			);
		}
		return { fields, groups, customActions };
	}

	// #region BPMN逻辑
	selectionCtx: Ref<UiContext<any>>
	isSubProcess: Ref<boolean>
	subProcessStack: Process[] = []; // 子制程栈，用于逐级返回
	prevOp: ProcessOperation; // 上一个工序
	currentOp: ProcessOperation; // 当前工序
	nextOp: ProcessOperation; // 下一个工序 
	prevElement: any; // 上一个元素
	nextElement: any; // 下一个元素
	isdeleted: boolean
	showRemoveConnectToast: boolean; // 是否显示过删除连线提示
	groupName: string; // 当前操作的工序/路线
	subProcess: Process; // 子制程
	currentElement: any; // 当前选中的元素
	// #endregion

	// 获取子表工序/路线数据
	getGroupItem(context: UiViewContext<any>, groupName: string, element: any) {
		if (!element || (element.type !== 'bpmn:Task' && element.type !== 'bpmn:SequenceFlow')) return null;
		// 根据元素属性找到对应的工序/路线数据
		const id = element.businessObject.$attrs[`camunda:id`];
		// 老版本的流程图元素可能没有camunda:id属性，而是用camunda:opCode/camunda:routeCode来记录的，所以需要兼容一下老版本数据
		const oldID = groupName === 'operations' ? element.businessObject.$attrs[`camunda:opCode`] : element.businessObject.$attrs[`camunda:routeCode`];

		if (this.isSubProcess.value) {
			const itemIndex = this.subProcess[groupName].findIndex((item: Entity) => {
				if (!id) {
					return groupName === 'operations' ? item.opCode === oldID : groupName === 'routes' ? item.routeCode === oldID : false;
				} else {
					if (!item.id) {
						const newItem = groupName === 'operations' ? defineProcessOperation(item) : groupName === 'routes' ? defineProcessRoute(item) : item;
						return newItem.id === id
					} else {
						return item.id === id
					}
				}
			});
			return itemIndex != -1 ? this.subProcess[groupName][itemIndex] : null;
		} else {
			const itemIndex = context.model[groupName].findIndex((item: Entity) => {
				if (!id) {
					return groupName === 'operations' ? item.opCode === oldID : groupName === 'routes' ? item.routeCode === oldID : false;
				} else {
					return item.id === id
				}
			});
			return itemIndex != -1 ? context.model[groupName][itemIndex] : null;
		}
	};

	handlerRoute(modeler: any, context: UiViewContext<any>, connection: any, type: 'update' | 'delete' = 'update') {
		const route = this.getGroupItem(context, 'routes', connection);
		switch (type) {
			case 'update':
				this.updateRoute(modeler, context, connection);
				break;
			case 'delete':
				if (route) {
					context.removeSubGroupItem('routes', route);
				}
				break;

			default:
				break;
		}

	}

	// 删除与工序相关的所有路线
	removeRelatedRoutes(modeler: any, context: UiViewContext<any>, incoming: any[], outgoing: any[]) {
		if (!context.model.routes) return;
		if (incoming.length) {
			incoming.forEach((item: any) => {
				// const route = this.getGroupItem(context, 'routes', item);
				// if (route) {
				// 	context.removeSubGroupItem('routes', route);
				// }
				this.handlerRoute(modeler, context, item, 'delete');
			})
		}
		if (outgoing.length) {
			outgoing.forEach((item: any) => {
				this.handlerRoute(modeler, context, item, 'delete');
			})
		}
	};




	changeRoutes(modeler: any, context: UiViewContext<any>, incoming: any[], outgoing: any[],) {
		if (!context.model.routes) return;
		if (incoming.length) {
			incoming.forEach((item: any) => {
				// const route = this.getGroupItem(context, 'routes', item);
				// if (route) {
				// 	this.updateRoute(modeler, context, item);
				// }
				this.handlerRoute(modeler, context, item, 'update');
			})
		}
		if (outgoing.length) {
			outgoing.forEach((item: any) => {
				this.handlerRoute(modeler, context, item, 'update');
			})
		}
	}

	/**
	 * 校验函数参数，检查当前连线是否符合流程图定义
	 * @param context - UiContext对象
	 * @param source - 连线的起始节点
	 * @param target - 连线的结束节点
	 * @returns boolean - true表示校验通过，false表示校验失败
	 */
	validateConnection(context: UiViewContext<any>, source: any, target: any): string {
		const { uiBuilder } = context
		const prevOp = this.getGroupItem(context, 'operations', source)
		const nextOp = this.getGroupItem(context, 'operations', target)

		// 1. 开始节点 → 结束节点
		if ((source.type === 'bpmn:StartEvent' || source.id.includes('StartEvent')) &&
			target && (target.type === 'bpmn:EndEvent' || target.id.includes('EndEvent'))) {
			uiBuilder.toast(context, {
				severity: 'error',
				summary: '连线违规',
				detail: '开始节点不能直接连接结束节点！',
				group: 'br',
				life: 3000
			});
			return '开始节点不能直接连接结束节点！'; // 校验失败
		}

		// 2. 开始节点 → 结束阶段元素
		if ((source.type === 'bpmn:StartEvent' || source.id.includes('StartEvent'))) {
			if (nextOp?.opPhase === 'END') {
				uiBuilder.toast(context, {
					severity: 'error',
					summary: '连线违规',
					detail: '开始节点不能连接结束阶段的工序！',
					group: 'br',
					life: 3000
				});
				return '开始节点不能连接结束阶段的工序！';
			}
		}

		// 3. 其他阶段元素 → 结束节点
		if (target && (target.type === 'bpmn:EndEvent' || target.id.includes('EndEvent')) && prevOp?.opPhase !== 'END') {
			uiBuilder.toast(context, {
				severity: 'error',
				summary: '连线违规',
				detail: '结束节点不能连接除结束阶段以外的其他工序!',
				group: 'br',
				life: 3000
			});
			return '结束节点不能连接除结束阶段以外的其他工序!';
		}

		// 4. 结束阶段元素 → 任何阶段元素
		if (prevOp?.opPhase === 'END' && nextOp) {
			uiBuilder.toast(context, {
				severity: 'error',
				summary: '连线违规',
				detail: '结束阶段工序只能连接结束节点！',
				group: 'br',
				life: 3000
			});
			return '结束阶段工序只能连接结束节点！';
		}

		// 5. 重复连线
		if (prevOp && nextOp) {
			const isRouteExists = context.model.routes?.find((route: any) =>
				route.prevOpCode === prevOp.opCode &&
				route.nextOpCode === nextOp.opCode &&
				!MetaModel.deleted(route)
			);

			if (isRouteExists) {
				uiBuilder.toast(context, {
					severity: 'error',
					summary: '创建失败',
					detail: '当前已存在该路线！',
					group: 'br',
					life: 3000
				});
				return '当前已存在该路线！';
			}
		}

		// 6. 自己连接自己
		if (prevOp && nextOp && (prevOp.opCode === nextOp.opCode)) {
			uiBuilder.toast(context, {
				severity: 'error',
				summary: '创建失败',
				detail: '当前工序不能连接自己！',
				group: 'br',
				life: 3000
			});
			return '当前工序不能连接自己！';
		}

		// todo 7. 只能有一条终结路线
		// if (prevOp && nextOp && nextOp.opPhase === OpPhase.END) {
		// 	// 若当前路线是连接终结工序的路线,再判断是否只有这一条路线连接终结工序
		// 	const endOpRelatedRoutes = context.model.routes.filter((route: any) => route.nextOpCode === nextOp.opCode);
		// 	if (endOpRelatedRoutes.length === 1) {

		// 		context.uiBuilder.toast(context, {
		// 			severity: 'error',
		// 			summary: '删除失败',
		// 			detail: '只能有一条终结路线！',
		// 			group: 'br',
		// 			life: 3000
		// 		});
		// 		return '只能有一条终结路线！';
		// 	}
		// }

		return '';
	};

	validateRemoveShape(modeler: any, context: UiViewContext<any>, shape: any): boolean {
		// 当前操作的工序
		const currentOp = this.getGroupItem(context, 'operations', shape) as ProcessOperation;

		// 1. 开始节点唯一
		if (shape.id.includes('StartEvent') || shape.type === 'bpmn:StartEvent') {
			const elementRegistry = modeler.get('elementRegistry');
			const allElements = elementRegistry.getAll();
			const startNodeCount = allElements.filter((el: any) =>
				el.type === 'bpmn:StartEvent'
			).length;

			if (startNodeCount <= 1) {
				context.uiBuilder.toast(context, {
					severity: 'error',
					summary: '删除失败',
					detail: '至少需要一个开始节点',
					group: 'br',
					life: 3000
				});
				return false;
			}
		}

		return true;
	}

	/**
	 * 更新BPMN模型的元素属性
	 * @param {any} modeling - 模型编辑器
	 * @param {any} element - 需要更新的元素
	 * @param {Record<string, any>} updateObj - 需要更新的字段
	 */
	updateProperties(modeling: any, element: any, updateObj: Record<string, any> = {}) {
		modeling.updateProperties(element, updateObj);
	}

	async saveXML(context: UiViewContext<any>, modeler: any) {
		try {
			const res = await modeler.saveXML({ format: true });
			context.setFieldValue('xmlJson', res.xml);
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * 返回上级流程
	 */
	async goToPrevProcess(context: UiViewContext<any>, modeler: any) {
		try {
			if (this.subProcessStack && this.subProcessStack.length > 0) {
				this.subProcessStack.pop();
			}

			if (this.subProcessStack && this.subProcessStack.length > 0) {
				// 还有上一级子制程
				this.subProcess = this.subProcessStack[this.subProcessStack.length - 1];
				modeler.setReadOnly(true);
				await modeler.importXML(this.subProcess.xmlJson);
				this.selectionCtx.value = context.subGroupItemContext('operations', this.subProcess['operations'][0], 'details');
			} else {
				// 返回到主流程
				if (!context.model.xmlJson) return;
				modeler.setReadOnly(context.view !== UiViewOne.Edit && context.view !== UiViewOne.Create);
				// 加载父流程XML
				await modeler.importXML(context.model.xmlJson);
				this.isSubProcess.value = false;
				this.selectionCtx.value = null;
				this.subProcess = null;
			}
		} catch (error) {
			console.error('返回上级制程失败:', error);
			context.uiBuilder.toast(context, {
				severity: 'error',
				summary: '错误',
				detail: '返回上级制程失败',
				group: 'br',
				life: 3000
			});
		}
	}

	updateSelectionCtx(ctx: UiViewContext<any>, element: any) {
		this.currentElement = element;
		if (element.type === 'bpmn:Task') {
			this.groupName = 'operations';
			this.prevElement = element.incoming?.[0]?.source;
			this.prevOp = this.getGroupItem(ctx, 'operations', this.prevElement);
			this.nextElement = element.outgoing?.[0]?.target;
			this.nextOp = this.getGroupItem(ctx, 'operations', this.nextElement);
			this.currentOp = this.getGroupItem(ctx, 'operations', element);
		} else if (element.type === 'bpmn:SequenceFlow') {
			this.groupName = 'routes';
			this.prevElement = element.source;
			this.prevOp = this.getGroupItem(ctx, 'operations', this.prevElement);
			this.nextElement = element.target;
			this.nextOp = this.getGroupItem(ctx, 'operations', this.nextElement);
		}
		const item = this.getGroupItem(ctx, this.groupName, element);

		if (item) {
			this.selectionCtx.value = ctx.subGroupItemContext(this.groupName, item, 'details');
		} else {
			this.selectionCtx.value = null;
		}
	}

	async elementChanged(ctx: UiViewContext<any>, modeler: any, event: any) {
		const { element } = event;
		if (element.type === "label") return; // 标签变化不处理
		const { incoming, outgoing } = element;
		const modeling = modeler.get('modeling');

		if (element.type === 'bpmn:Task') {
			this.currentOp = this.getGroupItem(ctx, 'operations', element); // 记录当前工序数据
			if (!this.currentOp) return; // 当前工序不存在 不处理

			// 记录上一个工序和下一个工序 和上一个元素和下一个元素
			this.prevOp = incoming?.[0]?.source ? this.getGroupItem(ctx, 'operations', incoming?.[0]?.source) : null;
			this.nextOp = outgoing?.[0]?.target ? this.getGroupItem(ctx, 'operations', outgoing?.[0]?.target) : null;
			this.prevElement = incoming?.[0]?.source;
			this.nextElement = outgoing?.[0]?.target;

		} else if (element.type === 'bpmn:SequenceFlow') {
			// 记录上一个工序和下一个工序 和上一个元素和下一个元素
			this.prevElement = element.source;
			// 后节点是结束节点 不需要找到上一个工序
			this.prevOp = element?.target?.type !== 'bpmn:EndEvent' ? this.getGroupItem(ctx, 'operations', element.source) : null;
			// 同理 前节点是开始节点 不需要找到下一个工序
			this.nextOp = element?.source?.type !== 'bpmn:StartEvent' ? this.getGroupItem(ctx, 'operations', element.target) : null;

			if (this.nextOp?.id === this.currentOp?.id) this.nextOp = null; // 下一个工序是当前工序 不需要记录

			// 当上工序和下工序为空 或下工序为空 则无需记录下一个元素 因为没有工序了
			this.nextElement = ((!this.prevOp && !this.nextOp) || !this.nextOp) ? null : element.target;
		}

		if (this.currentOp && this.prevOp && this.nextOp && this.currentOp.opCode !== this.nextOp.opCode && this.currentOp.opCode !== this.prevOp.opCode) { // 1. 上工序 下工序 当前工序 都存在时 且上/下工序不等于当前工序时 更新路线
			// 更新路线
			this.updateRoute(modeler, ctx, incoming?.[0])
			this.updateRoute(modeler, ctx, outgoing?.[0])
		} else if (this.prevOp && (this.nextOp || this.currentOp)) { // 2. 当 prevOp 和 (nextOp || currentOp) 存在时 需要判断当前路线是否存在 不存在需要建立连接 创建路由
			const nextOp = this.nextOp || this.currentOp;
			const isRouteExists = ctx.model.routes?.find((route: any) =>
				route.prevOpCode === this.prevOp.opCode &&
				route.nextOpCode === nextOp.opCode &&
				this.prevOp.opCode !== nextOp.opCode &&
				!MetaModel.deleted(route)
			);
			if (!isRouteExists) {
				await this.createRoute(ctx, this.prevOp, nextOp).then(route => {
					if (route) {
						// 给节点设置属性
						this.updateProperties(modeling, element.type === 'bpmn:Task' ? incoming?.[0] : element, {
							'camunda:id': route.id,
						})
						route && ctx.addSubGroupItem('routes', route)
					}
				});
			}
		}
	}

	clearCachedData() {
		this.prevOp = null;
		this.currentOp = null;
		this.nextOp = null;
		this.prevElement = null;
		this.nextElement = null;
	}

	async elementDblcick(ctx: UiViewContext<any>, modeler: any, event: any) {
		const { element } = event;

		const item = this.getGroupItem(ctx, 'operations', element);
		if (item?.subProcess && item.subProcess?.xmlJson) {
			if (!this.subProcessStack) {
				this.subProcessStack = [];
			}
			this.isSubProcess.value = true;
			this.subProcessStack.push(item.subProcess);
			this.subProcess = item.subProcess;
			modeler.setReadOnly(true);
			await modeler.importXML(item.subProcess.xmlJson);
			// this.subProcess = this.createEntity(item.subProcess);
			this.selectionCtx.value = ctx.subGroupItemContext('operations', this.subProcess['operations'][0], 'details');;
		}
	}

	updateRoute(modeler: any, context: UiViewContext<any>, connection: any) {
		const oldRoute = this.getGroupItem(context, 'routes', connection);
		if (!oldRoute) return; // 无法找到路由
		const { source, target } = connection;
		const prevOp = this.getGroupItem(context, 'operations', source);
		const nextOp = this.getGroupItem(context, 'operations', target);
		if (!prevOp || !nextOp) return;

		context.model.routes.forEach((route: ProcessRoute) => {
			if (route.id === oldRoute.id) {
				route.prevOpCode = prevOp.opCode;
				route.nextOpCode = nextOp.opCode;
				route.routeName = `${prevOp.opName} → ${nextOp.opName}`;
				MetaModel.modify(route);

				const modeling = modeler.get('modeling');
				this.updateProperties(modeling, connection, {
					'camunda:id': route.id,
				})
			}
		})
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		this.clearCachedData(); // 清空缓存
		this.selectionCtx = ref(null)
		this.isSubProcess = ref(false)
		this.subProcessStack = []
		this.showRemoveConnectToast = false

		if (fields.length == 0) {
			fields.push(
				//制品类别滤掉materialType为“劳动力”的类别
				this.field('productCategoryID').setSearchParam(() => {
					return {
						materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
					};
				}),
				this.field('cycleMinutes').onChange((ctx: UiViewContext<any>, model, newVal) => {
					this.syncCycleOutputQty(ctx, newVal);
				}),
				this.field('cycleOutputQty').lockIf(() => true),
			)
		}
		if (groups.length == 0) {
			groups.push(
				this.group<ProcessLine>('lines').defaultAdder(this.addLines),
				this.group<ProcessOperation>('operations')
					.hideIf(() => true)
					.onChange((ctx: UiViewContext<any>, model, items) => {
						items.forEach(item => {
							if (item.opPhase === OpPhase.END) {
								ctx.setFieldValue('endOpCode', item)
							}
						});
						this.updateProcessCycleData(ctx, items);
					}),
				this.group<ProcessRoute>('routes')
					.setCustomEditor((group, ctx: UiViewContext<any>, props) => {
						const { uiBuilder } = ctx;
						return h('div',
							{ class: 'process-bpmn-container col-span-full' },
							[
								h(BpmnCom, {
									context: ctx,
									selectionCtx: this.selectionCtx.value,
									'onUpdate:selectionCtx': (element) => this.updateSelectionCtx(ctx, element),
									onClosePanel: (modeler) => this.closePanelFn(modeler, this.currentElement),
									bpmnProps: {
										methods: {
											// beforeCreateShape: (modeler, shape) => {
											// 	this.groupName = 'operations';
											// 	return true
											// },
											createdShape: async (modeler, event) => {
												const modeling = modeler.get('modeling');
												const { context: { shape }, } = event;

												if (shape.type === 'bpmn:Task') {
													return await this.createOperation(ctx, ctx.model)
														.then(async (op: any) => {
															if (op) {
																// 添加工序
																ctx.addSubGroupItem('operations', op);
																// 给节点设置属性
																this.updateProperties(modeling, shape, {
																	'camunda:id': op.id,
																	name: op.opName,
																})
																this.selectionCtx.value = ctx.subGroupItemContext('operations', op, 'details');
																this.currentElement = shape
															} else {
																// 删除创建的元素
																modeling.removeShape(shape);
															}
															return !!op
														})
												} else {
													this.selectionCtx.value = null;
													this.clearCachedData();
													return true
												}
											},
											beforeRemoveShape: (modeler, shape) => {
												const modeling = modeler.get('modeling');

												if (!this.validateRemoveShape(modeler, ctx, shape)) return false;

												const item = this.getGroupItem(ctx, 'operations', shape);

												if (item) {
													if (shape.type === 'bpmn:Task' && !this.isdeleted) {
														ctx.uiBuilder.confirmMessage(ctx, {
															header: ctx.t('action.confirm'),
															message: ctx.t('confirmation.delete'),
														}).then(() => {
															this.isdeleted = true;
															// 先删除关联的连线，然后再删除形状
															// 这样可以阻止 bpmn.js 自动将删除元素前后的元素重新连线
															modeling.removeElements([...shape.incoming, ...shape.outgoing, shape]);
														}).finally(() => {
															this.isdeleted = false;
														});
														return false;
													} else {
														return true;
													}
												} else {
													return true;
												}
											},
											removedShape: async (modeler, event) => {
												event.stopPropagation();
												const { context: { shape } } = event;

												if (shape.type === 'bpmn:Task') {
													const item = this.getGroupItem(ctx, 'operations', shape);
													if (item) {
														// 删除工序数据
														ctx.removeSubGroupItem('operations', item);

														// 删除相关连线
														this.removeRelatedRoutes(modeler, ctx, shape.incoming, shape.outgoing);
													}
												}
												this.closePanelFn(modeler, shape)
												return true;
											},
											beforeReconnect: (modeler, connection, source, target) => {
												const res = this.validateConnection(ctx, source, target,)
												// res 为空且当前非删除状态时 表示可以连接
												if (!res && !this.isdeleted) {
													this.updateRoute(modeler, ctx, connection)
													this.clearCachedData();
												}
												return !res
											},
											beforeConnect: async (modeler, source, target) => {
												const res = await this.validateConnection(ctx, source, target,)
												return !res
											},
											removedConnection: async (modeler, event) => {
												const { element } = event;
												const item = this.getGroupItem(ctx, 'routes', element);

												if (item && !this.isSubProcess.value) {
													// 删除路线数据
													ctx.removeSubGroupItem('routes', item);
												}
												this.closePanelFn(modeler, element);
												return true;
											},
											elementsChanged: async (modeler, event) => {
												return await this.saveXML(ctx, modeler);
											},
											elementChanged: async (modeler, event) => {
												return await this.elementChanged(ctx, modeler, event);
											},
											elementDblcick: async (modeler, event) => {
												await this.elementDblcick(ctx, modeler, event);
											},
											initContextPadEntries: (element: any, entries: any) => {
												this.groupName = 'operations';
												if (element.type === 'bpmn:Task') {
													const currentOp = this.getGroupItem(ctx, 'operations', element);
													if (!currentOp) return;
													if (currentOp.opPhase === OpPhase.END) { // 结束阶段的工序 关闭创建工序/连接功能
														delete entries['append.append-task'];
													} else if (currentOp.opPhase !== OpPhase.END) { // 非结束阶段的工序 关闭连接结束节点功能
														delete entries['append.end-event']
													}
												}
											},
											updateLabel: async (modeler, event) => {
												const { context: { element, newLabel } } = event;
												if (element.type === 'bpmn:Task') {
													this.selectionCtx.value.setFieldValue('opName', newLabel);
												}
											}
										}
									},
									bpmnPanelProps: {
										footerSlot: (selection, modeler) =>
											this.isSubProcess.value ?
												[
													ctx.uiBuilder.factory.button({
														label: '查看',
														severity: 'info',
														size: 'small',
														icon: 'pi pi-eye',
														onAction: () => {
															return ctx.subGroupItem('operations', selection, { groupMode: UiViewOne.Details });
														},
														pt: {
															root: () => ({
																style: {
																	padding: '6px 12px',
																	fontSize: '12px'
																}
															})
														}
													}),
													ctx.uiBuilder.factory.button({
														label: '返回',
														severity: 'secondary',
														size: 'small',
														icon: 'pi pi-arrow-left',
														onAction: () => {
															// 调用返回主制程函数
															// emit('returnPrev')
															this.goToPrevProcess(ctx, modeler);
														},
														pt: {
															root: () => ({
																style: {
																	padding: '6px 12px',
																	fontSize: '12px'
																}
															})
														}
													})
												] :
												[
													uiBuilder.factory.button({
														label: '编辑',
														severity: 'info',
														size: 'small',
														icon: 'pi pi-pencil',
														onAction: () => {
															ctx.subGroupItem(this.groupName, selection, { groupMode: UiViewOne.Edit })
																.then((m) => {
																	if (this.groupName === 'operations') {
																		const modeling = modeler.get('modeling');
																		this.updateProperties(modeling, this.currentElement, {
																			'camunda:id': selection.id,
																			name: selection.opName,
																		})
																		this.changeRoutes(modeler, ctx, this.currentElement.incoming, this.currentElement.outgoing);
																	}
																});
														},
														pt: {
															root: () => ({
																style: {
																	padding: '6px 12px',
																	fontSize: '12px'
																}
															})
														}
													})
												]
									}
								})
							]);
					})
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 * 添加生产线
	 * @param context 
	 * @param target 
	 */
	addLines(context: UiViewContext<any>, target: Process) {
		context
			.select<ProductionLine>({
				repository: 'ProductionLines',
				ctor: defineProductionLine,
				selectionMode: 'multiple',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						status: 'USED',
					}
				},
				selectableFn: (line: ProductionLine) => !(target.lines && target.lines.find((l: ProcessLine) => !MetaModel.deleted(l) && l.lineID === line.lineID))
			})
			.then((selection: ProductionLine[] | unknown) => {
				const list = Array.isArray(selection) ? selection : [];
				if (list.length === 0) return;
				//获取最大优先级
				let priority = target.lines?.reduce((max, line: ProcessLine) =>
					!MetaModel.deleted(line) && Number(line.priority) > max ? Number(line.priority) : max, 0
				) ?? 0;
				console.log(list, target, priority,),
					context.addSubGroupItems({
						target,
						group: 'lines',
						sequenceKey: 'itemID',
						source: list,
						propsMapper: {
							lineID: (m) => m,
							processID: () => target.processID,
							priority: () => ++priority,
						}
					});
			});
	}

	/**
	 * 创建路线
	 * @param context 
	 * @param target 
	 */
	async createRoute(context: UiViewContext<any>, prevOp: ProcessOperation, nextOp: ProcessOperation): Promise<ProcessRoute> {
		try {
			if (MetaModel.deleted(prevOp) || MetaModel.deleted(nextOp)) return null;
			//路线创建
			const route = await context.createSubGroupItems<ProcessRoute>({
				target: context.model,
				group: 'routes',
				propsMapper: {
					processID: () => context.model.processID || '',
					routeCode: () => `R${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}`,
					routeName: () => `${prevOp?.opName} → ${nextOp.opName}`,
					prevOpCode: () => prevOp?.opCode,
					nextOpCode: () => nextOp.opCode,
					lag: () => 0,
					x1: () => typeof prevOp.x === 'number' && !isNaN(prevOp.x) ? prevOp.x : 0,
					y1: () => typeof prevOp.y === 'number' && !isNaN(prevOp.y) ? prevOp.y : 0,
					x2: () => typeof nextOp.x === 'number' && !isNaN(nextOp.x) ? nextOp.x : 0,
					y2: () => typeof nextOp.y === 'number' && !isNaN(nextOp.y) ? nextOp.y : 0,
				}
			});

			return route as ProcessRoute;
		} catch (error: any) {
			console.error('创建路线异常:', error);
			context.uiBuilder.toast(context, {
				severity: 'error',
				summary: '错误',
				detail: error.message ?? '创建路线异常',
				group: 'br',
				life: 3000
			});
			Promise.reject(error.message);
		}
	}

	/**
	 * 创建工序
	 * @param context 
	 * @param target 
	 */
	async createOperation(context: UiViewContext<any>, target: Process) {
		// console.log(context.model, target)
		return await context
			.newSubGroupItem<ProcessOperation>({
				group: 'operations',
				sequenceKey: 'itemID',
				target: context.model,
				propsMapper: {
					// opCode: () => `${context.model.processCode}-${context.model.operations.length + 1}`,
					opCode: () => `OP${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}`,
				},
			})
	}

	closePanelFn(modeler: any, element: any) {
		this.selectionCtx.value = null
		const selection = modeler.get('selection');
		selection.deselect(element);
		this.currentElement = null;
		this.clearCachedData();
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		this.clearCachedData(); // 清空缓存
		this.selectionCtx = ref(null)
		this.isSubProcess = ref(false)
		this.subProcessStack = []

		if (fields.length == 0) {
			fields.push(
				//当前没有制品类别模块，先以普通文本形式显示
				this.field('productCategoryID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					return ctx.uiBuilder.factory.textSpan(ctx.model.productCategory ? ctx.model.productCategory.categoryName : '-', {});
				})
			);
		}

		if (groups.length === 0) {
			groups.push(
				this.group<ProcessRoute>('routes')
					.setCustomRenderer((group, ctx: UiViewContext<any>, props) => {
						return h('div', {
							class: 'process-bpmn-container col-span-full'
						}, [
							h(BpmnCom, {
								context: ctx,
								selectionCtx: this.selectionCtx.value,
								'onUpdate:selectionCtx': (element) => this.updateSelectionCtx(ctx, element),
								onClosePanel: (modeler) => this.closePanelFn(modeler, this.currentElement),
								bpmnProps: {
									methods: {
										elementDblcick: async (modeler, event) => await this.elementDblcick(ctx, modeler, event),
									}
								},
								bpmnPanelProps: {
									footerSlot: (selection, modeler) =>
										[
											ctx.uiBuilder.factory.button({
												label: '查看',
												severity: 'info',
												size: 'small',
												icon: 'pi pi-eye',
												onAction: () => {
													// 打开子制程详情页
													ctx.subGroupItem(this.groupName, selection, { groupMode: UiViewOne.Details });
												},
												pt: {
													root: () => ({
														style: {
															padding: '6px 12px',
															fontSize: '12px'
														}
													})
												}
											}),
											this.isSubProcess.value &&
											ctx.uiBuilder.factory.button({
												label: '返回',
												severity: 'secondary',
												size: 'small',
												icon: 'pi pi-arrow-left',
												onAction: () => {
													// 调用返回主制程函数
													this.goToPrevProcess(ctx, modeler);
												},
												pt: {
													root: () => ({
														style: {
															padding: '6px 12px',
															fontSize: '12px'
														}
													})
												}
											})
										]
								}
							})
						]);
					}),
				this.group<ProcessOperation>('operations').hideIf(() => true)

			)
		}
		return { fields, groups, customActions }
	}

}

/**
 * 构造制程交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProcessLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProcessLogic({
		service: metaUiService,
		repository: 'Processes',
		router,
		module: module || metaUiService.findModule('Process'),
	});
/**
 * 工序交互逻辑
 */
export class ProcessOperationLogic extends UiGroupLogic<ProcessOperation, Process> {
	constructor(parent: ProcessLogic, master: Process) {
		super(defineProcessOperation, parent, master, 'operations');
		this.addRelativeLogic<ProcessOperationResource>('resources', master => new ProcessOperationResourceLogic(this, master));
		this.addRelativeLogic<ProcessOperationAlarm>('alarms', master => new ProcessOperationAlarmLogic(this, master));
		this.addRelativeLogic<ProcessOperationParam>('params', master => new ProcessOperationParamLogic(this, master));
		this.addRelativeLogic<ProcessOperationChart>('charts', master => new ProcessOperationChartLogic(this, master));
	}

	/**
	 * 根据物料用途映射资源类型值对象，用于资源类型字段回填和显示。
	 */
	getResourceTypeValue(materialType?: MaterialType) {
		const resourceTypeMap: Partial<Record<MaterialType, ResourceType>> = {
			[MaterialType.TOOLS]: ResourceType.EQUIP_TOOLS,
			[MaterialType.LABOR]: ResourceType.LABOR_SKILL,
		};
		const type = materialType ? resourceTypeMap[materialType] : undefined;
		return type
			? {
				value: type,
				text: ResourceTypeEnum.textOf(type),
			}
			: null;
	}

	/** 将工时字段转换为可计算的数值，空值或非法值按 0 处理。 */
	private getTimeValue(value: unknown) {
		const time = typeof value === 'number' ? value : Number(value ?? 0);
		return Number.isFinite(time) ? time : 0;
	}

	/** 准备时间或标准工时变化时，自动更新生产周期。 */
	private syncCycleTime(ctx: UiContext<ProcessOperation>, model: ProcessOperation) {
		const cycleTime = this.getTimeValue(model.setupTime) + this.getTimeValue(model.opTime);
		ctx.setFieldValue('cycleTime', cycleTime);
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			const rootLogic = this.parent as ProcessLogic;
			fields.push(
				this.field('outputRate').onValidate((value, model, ctx: UiViewContext<any>) => {
					const outputRate = rootLogic.getOutputRateValue(value);
					const remainingRate = rootLogic.getRemainOutputRate(ctx.root.model.operations, model.id);

					if (outputRate < 0) {
						return '产出比率不能小于0！';
					}
					if (outputRate > 1) {
						return '产出比率不能超过100%！';
					}
					if (outputRate > remainingRate) {
						return `产出比率不能超过剩余余量${(remainingRate * 100).toFixed(2)}%！`;
					}
				}),
				this.field('setupTime').onChange((ctx: UiViewContext<any>, model) => {
					this.syncCycleTime(ctx, model);
				}),
				this.field('opTime').onChange((ctx: UiViewContext<any>, model) => {
					this.syncCycleTime(ctx, model);
				}),
				this.field('cycleTime')
					.onChange((ctx: UiViewContext<any>, model, newVal) => {
						rootLogic.updateProcessCycleData(ctx.root, ctx.root.model.operations);
					})
					.onWarn((value, model) => {
						const standardCycleTime = this.getTimeValue(model.setupTime) + this.getTimeValue(model.opTime);
						if (this.getTimeValue(value) < standardCycleTime) {
							return `生产周期小于准备时间与标准工时之和（${standardCycleTime}秒），请确认！`;
						}
						return '';
					}),
				this.field('qcInProcessTypes')
					.onChange((ctx: UiViewContext<any>, model, newVal) => {
						if (!newVal || newVal === QcInProcessType.NONE) {
							model.qcsID = null;
							model.qcStandard = null;
						}
					}),
				this.field('qcsID')
					.hideIf((model) => !model.qcInProcessTypes || model.qcInProcessTypes === QcInProcessType.NONE)
					.setSearchParam((ctx, model) => {
						return { status: 'USED', qcPhase: 'IPQC' };
					}),
				this.field('subProcessID').setSearchParam((ctx, model) => {
					return { status: 'USED', };
				}),
				// todo 参与唯一键组装，不好判断
				// this.field('opCode').onValidate((value, model, ctx: UiViewContext<any>) => {
				// 	if (ctx.root.model.operations?.length) {
				// 		// const op = ctx.root.model.operations.find((op: ProcessOperation) => op.opCode === value)
				// 		const ops = ctx.root.model.operations.filter((op: ProcessOperation) => op.opCode === value)
				// 		// 判断是否是第一条数据
				// 		if (ops.length) {
				// 			// 如果存在一条相同编码的数据 判断当前是否是新建 新建则需要提示用户不能重复
				// 			if (ops.length == 1 && model.isCreated) {
				// 				return '工序编码已存在！';
				// 			}
				// 		}
				// 	}
				// }),
				this.field('opName')
					.onChange((ctx: UiViewContext<any>, model) => {
						if (model.opPhase === OpPhase.END) MetaModel.setRefProp(ctx.root.model, 'endOpCode', model.opName);
					})
					.onValidate((value, model, ctx: UiViewContext<any>) => {
					if (!value) {
						return '工序名称不能为空！';
					}
					if (ctx.root.model.operations?.length) {
						const op = ctx.root.model.operations.find((op: ProcessOperation) => !MetaModel.deleted(op) && op.opName === value)
						if (op && op.id !== model.id) {
							return '工序名称已存在！';
						}
					}
				}),
				this.field('opPhase')
					.onValidate((value, model, ctx: UiViewContext<any>) => {
						const rootLogic = ctx.root.logic as ProcessLogic;
						const endOps = ctx.root.model.operations?.filter((op: ProcessOperation) => !MetaModel.deleted(op) && op.opPhase === OpPhase.END)
						let validateStr: string;

						if (value === OpPhase.END) {
							// 1. 判断是否已经设置了结束工序
							if (endOps && (endOps.length > 1 || (endOps.length == 1 && endOps[0].id !== model.id))) {
								validateStr = '已设置结束工序，当前工序不允许设置为结束工序！';
							}
							// 2. 判断结束工序前面连接的节点是否是开始节点
							if (rootLogic?.prevElement?.type === 'bpmn:StartEvent') {
								validateStr = '开始节点不能连接结束阶段的工序！';
							}
							// 3. 判断当前工序是否可以设置为结束工序：检查 routes 中是否有以此工序为起点的连线
							const hasNextRoute = ctx.root.model.routes?.some(
								(route: ProcessRoute) => !MetaModel.deleted(route) && route.prevOpCode === model.opCode
							);
							if (hasNextRoute) {
								validateStr = '当前工序不能设置为结束阶段的工序！';
							}
						} else {
							// 4. 判断非结束工序后面连接的节点是否是结束节点
							if (rootLogic?.nextElement?.type === 'bpmn:EndEvent') {
								validateStr = '结束节点不能连接结束阶段以外的工序！';
							}
						}

						return validateStr;
					}),
				this.field('wipTransBatchQty').hideIf((m, ctx: UiViewContext<any>) => m.wipTransMode !== WipTransMode.BATCH),
				this.field('wipTransDuration').hideIf((m, ctx: UiViewContext<any>) => m.wipTransMode !== WipTransMode.PERIODIC),
				this.field('wipTransMode').onChange((ctx: UiViewContext<any>, model, newVal) => {
					if (newVal === WipTransMode.BATCH) {
						ctx.setFieldValue('wipTransDuration', null);
						return;
					}
					if (newVal === WipTransMode.PERIODIC) {
						ctx.setFieldValue('wipTransBatchQty', null);
						return;
					}
				}),
			)
		}

		if (groups.length == 0) {
			// this.group<ProcessOperationResource>('resources').defaultAdder(this.newProcessOperationResource),
			groups.push(
				this.group<ProcessOperationAlarm>('alarms').hideIf(() => true),
				this.group<ProcessOperationParam>('params').hideIf(() => true),
				this.group<ProcessOperationChart>('charts').hideIf(() => true),
				this.group<ProcessOperationResource>('resources')
					.defaultAdder(this.addResources)
					.addCustomAction({
						name: 'createResource',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.createResource,
						view: UiViewOne.Edit,
					}),
			)
		}

		return { fields, groups, customActions };
	}

	// 添加资源
	addResources(context: UiContext<ProcessOperation>, target: ProcessOperation) {
		return context.select<Material>({
			repository: 'Materials',
			service: 'base',
			ctor: defineMaterial,
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					status: getSearchOp('IN').toSQL('USED'), // 只能选择启用的物料
					materialType: getSearchOp('IN').toSQL([MaterialType.LABOR, MaterialType.TOOLS]),
				}
			},
			selectableFn: (m: Material) => !(target.resources && target.resources.find((r: ProcessOperationResource) => !MetaModel.deleted(r) && r.resourceID === m.materialID))
		}).then((selection: Material[] | unknown) => {
			const list = Array.isArray(selection) ? selection : [];
			if (list.length === 0) return;
			context.addSubGroupItems({
				target,
				group: 'resources',
				sequenceKey: 'itemID',
				source: list,
				propsMapper: {
					processID: () => target.processID,
					opCode: () => target.opCode,
					resourceID: (m) => m,
					resourceType: (m: Material) => this.getResourceTypeValue(m.materialType),
					unit: (m: Material) => m.unit ?? null,
				},
			});
		});
	}

	// 创建资源
	async createResource(context: UiContext<ProcessOperation>, target: ProcessOperation) {
		// console.log(context.model, target)
		return await context
			.newSubGroupItem<ProcessOperationResource>({
				group: 'resources',
				sequenceKey: 'itemID',
				target,
				propsMapper: {
					processID: () => target.processID,
					opCode: () => target.opCode,
				},
			}).then(item => {
				if (item) {
					context.addSubGroupItem('resources', item);
				}
			})
			.catch(e => {
				console.log(e);
			});
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();

		if (fields.length == 0) {
			fields.push(
				this.field('wipTransBatchQty').hideIf((m, ctx: UiViewContext<any>) => m.wipTransMode !== WipTransMode.BATCH),
				this.field('wipTransDuration').hideIf((m, ctx: UiViewContext<any>) => m.wipTransMode !== WipTransMode.PERIODIC),
			)
		}

		if (groups.length == 0) {
			groups.push(
				this.group<ProcessOperationAlarm>('alarms').hideIf(() => true),
				this.group<ProcessOperationParam>('params').hideIf(() => true),
				this.group<ProcessOperationChart>('charts').hideIf(() => true)
			)
		}

		return { fields, groups, customActions };
	}
}
/**
 * 资源池交互逻辑
 */
export class ProcessOperationResourceLogic extends UiGroupLogic<ProcessOperationResource, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationResource, parent, master, 'resources');
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('resourceID')
					.setSelectable((context: UiViewContext<any> & any, field: MetaUiField, row: any) =>
						!(context.prev.model && context.prev.model.find((r: ProcessOperationResource) => r.resourceID === row.materialID)))
					.onChange((context: UiContext<ProcessOperationResource>, model: ProcessOperationResource, newVal) => {
						if (isNullOrUndefined(newVal)) {
							context.setFieldValue('resourceType', null);
							context.setFieldValue('unit', null);
							return;
						}

						const resource = context.getFieldCurrentOption('resourceID') as Material | undefined;
						context.setFieldValue('resourceType', (this.parent as ProcessOperationLogic).getResourceTypeValue(resource?.materialType));
						context.setFieldValue('unit', resource?.unit ?? null);
					})
					.setSearchParam((context: UiContext<ProcessOperationResource>,
						model: ProcessOperationResource,
						field: MetaUiField) => {
						return {
							status: getSearchOp('IN').toSQL('USED'), // 只能选择启用的物料
							materialType: getSearchOp('IN').toSQL([MaterialType.LABOR, MaterialType.TOOLS]),
						};
					}),
				this.field('resourceType')
					.lockIf((model) => !isNullOrUndefined(model.resourceID)),
			)
		}
		return { fields, groups, customActions };
	}
}
/**
 * 报警交互逻辑
 */
export class ProcessOperationAlarmLogic extends UiGroupLogic<ProcessOperationAlarm, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationAlarm, parent, master, 'alarms');
	}
}
/**
 * 参数交互逻辑
 */
export class ProcessOperationParamLogic extends UiGroupLogic<ProcessOperationParam, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationParam, parent, master, 'params');
	}
}
/**
 * 图表交互逻辑
 */
export class ProcessOperationChartLogic extends UiGroupLogic<ProcessOperationChart, ProcessOperation> {
	constructor(parent: ProcessOperationLogic, master: ProcessOperation) {
		super(defineProcessOperationChart, parent, master, 'charts');
	}
}
/**
 * 路线交互逻辑
 */
export class ProcessRouteLogic extends UiGroupLogic<ProcessRoute, Process> {
	constructor(parent: ProcessLogic, master: Process) {
		super(defineProcessRoute, parent, master, 'routes');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('prevOpCode').setSearchParam((ctx: UiViewContext<any>, model) => {
					return { processID: ctx.model.processID };
				}),
				this.field('nextOpCode').setSearchParam((ctx: UiViewContext<any>, model) => {
					return { processID: ctx.model.processID };
				}),
				this.field('toSubOpCode')
					.hideIf((m, ctx: UiViewContext<any>) => !ctx.root.logic?.nextOp?.subProcessID)
					.setSearchParam((ctx: UiViewContext<any>, model) => {
						const rootLogic = ctx.root.logic as ProcessLogic;

						return { processID: rootLogic?.nextOp?.subProcessID };
					})
			)
		}
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf((model, ctx: UiViewContext<any>) => {
						if (ctx.view === UiViewOne.Create) return false;
						const fields = ctx.metaui.getGroup('s9')?.fields;
						return fields ? fields.every((f: any) => !model[f.fieldName]) : true;
					})
			);

		}
		return { fields, groups, customActions };
	}


	beforeDetails(): UiLogicFnResult<ProcessRoute> {
		const { fields, groups, customActions } = super.beforeDetails();

		if (fields.length == 0) {
			fields.push(
				this.field('toSubOpCode')
					.hideIf((m, ctx: UiViewContext<any>) => !ctx.root.logic?.nextOp?.subProcessID)
			)
		}
		if (groups.length == 0) {
			groups.push(
				this.group('s9').hideIf((model, ctx: UiViewContext<any>) => {		
						const fields = ctx.metaui.getGroup('s9')?.fields;
						return fields ? fields.every((f: any) => !model[f.fieldName]) : true;
					})
			);

		}
		return { fields, groups, customActions };
	}
}
/**
 * 产线交互逻辑
 */
export class ProcessLineLogic extends UiGroupLogic<ProcessLine, Process> {
	constructor(parent: ProcessLogic, master: Process) {
		super(defineProcessLine, parent, master, 'lines');
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length === 0) {
			fields.push(
				this.field('cycleMinutes').onChange((ctx: UiViewContext<any>, model, newVal) => {
					(this.parent as ProcessLogic).syncCycleOutputQty(ctx, newVal);
				}),
				this.field('cycleOutputQty').lockIf(() => true),
			);
		}
		return { fields, groups, customActions };
	}
}

//#endregion ~GENERATED PARTS END
