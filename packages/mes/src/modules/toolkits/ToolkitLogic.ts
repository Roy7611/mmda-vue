/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { h, ref, VNode, type Ref, } from "vue";
import type { MetaUiService, Module, MetaUiField, UiContext, MetaUiGroup } from '@mmda/core';
import { defaultPager, isArray, isRefNone, MetaModel, EntityState, inFilter, nullFilter } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, UiViewOne, type UiLogicFnResult, type PropData } from '@mmda/vui';
import { type Toolkit, defineToolkit } from '@/models/Toolkit';
import { type Tool, defineTool } from '@/models/Tool';
import { ToolStatus } from '@/enums/ToolStatus'
import { type ToolUse, defineToolUse } from '@/models/ToolUse';

/**
 * 工具包交互逻辑
 * @author mmda codebot
 * @since 2026-03-31 08:20:01.0
 * @revision 2026-03-31 08:20:01.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 工具包交互逻辑
 */
export class ToolkitLogic extends UiLogic<Toolkit> {
	constructor(init: UiLogicInit) {
		super(defineToolkit, init);
		this.addRelativeLogic<Tool>('tools', (master) => new ToolLogic(this, master));

		this.currentDom = ref(null);
		this.targetDom = ref(null);
	}


	customToolNode(group: MetaUiGroup, context: UiViewContext<any>, props: PropData): VNode {
		const { uiBuilder } = context;
		const activeTools = (context.model.tools ?? []).filter((item: Tool) => !MetaModel.deleted(item));
		if (activeTools.length === 0) {
			return h('div', {
				class: 'flex-1 overflow-y-auto p-4! col-span-full flex items-center justify-center text-gray-500',
				id: 'tool-list-empty',
			}, context.t('empty.select'));
		}
		return uiBuilder.factory.dataViewBox({
			value: activeTools,
			showLayout: false,
			layout: 'grid',
			paginator: false,
			class: 'flex-1 overflow-y-auto p-2! col-span-full',
			id: 'tool-list',
		}, {
			item: (item: any, index: number) => {
				return h('div', {
					class: `tool-item w-full h-full relative flex flex-col col-span-3 items-start justify-center bg-gray-100 pb-2 opacity-${this.currentDom.value?.id !== this.targetDom.value?.id ? '50' : '100'}`,
					id: `tool-${item.toolID}`,
					draggable: true,
					onDragstart: (e: DragEvent) => props.onDragstart && props.onDragstart(e, context, item),
					onDragenter: (e: DragEvent) => props.onDragenter && props.onDragenter(e, context, item),
					onDragover: (e: DragEvent) => props.onDragover && props.onDragover(e, context, item),
					onDragend: (e: DragEvent) => props.onDragend && props.onDragend(e, context, item),
				}, [
					uiBuilder.factory.badge({
						value: item.toolkitIndex,
						severity: 'info',
						class: 'absolute top-2 left-2 z-10'
					}),
					// 图片区域
					h('div', { class: 'w-full h-36 flex-shrink-0 flex items-center justify-center rounded-lg relative overflow-hidden bg-gray-50' }, [
						// 如果有图片则显示图片，否则显示产品图标
						item.toolPic
							? uiBuilder.factory.image(item.toolPic, {
								preview: false,
								draggable: false,
								class: 'object-cover rounded-md pt-2',
								style: {
									width: '100%',
									height: '100%',
								},
								imageStyle: {
									width: '100%',
									height: '100%',
									objectFit: 'contain',
								}
							})
							: h('i', {
								class: 'pi pi-box text-2xl text-gray-400',
								style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }
							}),
					]),

					h('div', {
						class: 'flex-1 w-full pt-2 pb-2 min-w-0 px-2'
					}, [
						h('div', {
							class: 'font-semibold text-gray-800 text-sm leading-tight break-all text-center'
						}, [
							`${item.toolName}(${item.toolNo})`
						]),
					]),
					// 操作区域
					h('div', { class: 'w-full flex justify-evenly' },
						context.view === UiViewOne.Details ? [
							uiBuilder.factory.button({
								role: `view-${group.groupName}-action`,
								id: `view-${group.groupName}-button`,
								outlined: true,
								icon: 'pi pi-eye',
								colorRole: 'info',
								label: context.t('action.details'),
								onAction: () => context.subGroupItem(group, item, {
									groupMode: 'details',
									initMetadataParams: (groupCtx) => ({
										redirection: item?.category?.materialX,
										queryParams: {
											xMetaObject: item?.category?.materialX,
										},
									}),
								})
							})
						] :
							[
								uiBuilder.factory.button({
									role: `view-${group.groupName}-action`,
									id: `view-${group.groupName}-button`,
									outlined: true,
									icon: 'pi pi-eye',
									colorRole: 'info',
									label: context.t('action.details'),
									onAction: () => context.subGroupItem(group, item, {
										groupMode: 'details', initMetadataParams: (groupCtx) => ({
											redirection: item?.category?.materialX,
											queryParams: {
												xMetaObject: item?.category?.materialX,
											},
										}),
									})
								}),
								uiBuilder.factory.button({
									role: `delete-${group.groupName}-action`,
									id: `delete-${group.groupName}-button`,
									outlined: true,
									icon: 'pi pi-trash',
									colorRole: 'info',
									severity: 'danger',
									label: context.t('action.delete'),
									onAction: () => {
										context.removeSubGroupItem(group, item);
									}
								})
							])
				])
			}
		})
	}


	currentDom: Ref<any>;
	targetDom: Ref<any>;
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
			groups.push(
				this.group<Tool>('tools').defaultAdder(this.addTools)
					.onChange((ctx, model, items) => {
						// 过滤出未删除的tool并按toolkitIndex排序
						const activeTools = items.filter((item: Tool) => !MetaModel.deleted(item));
						ctx.setFieldValue('toolCount', activeTools.length);
						// 按toolkitIndex排序
						activeTools.sort((a: Tool, b: Tool) => a.toolkitIndex - b.toolkitIndex);
						// 重新排序toolkitIndex
						activeTools.forEach((tool: Tool, index: number) => {
							tool.toolkitIndex = index + 1;
						});
					})
					.setCustomEditor((group, ctx: UiViewContext<any>, props) => {
						return this.customToolNode(group, ctx, {
							...props,
							view: ctx.view,
							onDragstart: (e: DragEvent, context: UiViewContext<any>, item: Tool) => {
								e.dataTransfer.effectAllowed = 'move'; // 拖动样式改为 "move"
								this.currentDom.value = e.currentTarget;
							},
							onDragenter: (e: DragEvent, context: UiViewContext<any>, item: Tool) => {
								e.preventDefault();
								if ((e.currentTarget as HTMLDivElement).id === this.currentDom.value.id || !(e.currentTarget as HTMLDivElement).id.includes('tool-')) {   // 当移动到当前拖动元素，或者父元素上面我们不做操作
									return
								}
								this.targetDom.value = e.currentTarget

								const ids: string[] = [];
								const toolItems = document.querySelectorAll(`.tool-item`);
								toolItems.forEach((node: any) => {
									ids.push(node.id)
								})
								const currentIndex = ids.indexOf(this.currentDom.value.id) // 获取到拖动元素的下标
								const targetindex = ids.indexOf((e.currentTarget as HTMLDivElement).id) // 获取到拖动至目标元素的下标

								if (currentIndex < targetindex) {
									(e.currentTarget as HTMLDivElement).parentNode.insertBefore(this.currentDom.value, (e.currentTarget as HTMLDivElement).nextElementSibling)
								} else {
									(e.currentTarget as HTMLDivElement).parentNode.insertBefore(this.currentDom.value, e.currentTarget as HTMLDivElement)
								}
							},
							onDragover: (e: DragEvent) => {
								e.preventDefault();
							},
							onDragend: (e: DragEvent, context: UiViewContext<any>, item: Tool) => {
								e.preventDefault();
								// 根据最终DOM顺序更新所有tool的toolkitIndex
								const toolItems = document.querySelectorAll(`.tool-item`);
								toolItems.forEach((node: any, index: number) => {
									const toolId = node.id.replace('tool-', '');
									const toolIndex = context.model.tools.findIndex((tool: Tool) => tool.toolID === toolId);
									if (toolIndex !== -1) {
										context.model.tools[toolIndex].toolkitIndex = index + 1;
									}
								});
								this.currentDom.value = null;
								this.targetDom.value = null;
							}
						});
					})
			);

		}
		return { fields, groups, customActions };
	}

	addTools(context: UiViewContext<any>, target: Toolkit,) {
		context.select<Tool>({
			selectionMode: 'multiple',
			repository: 'Tools',
			searchParam: {
				pager: defaultPager(),
				filterModel: {
					toolkitID: nullFilter(),
					status: inFilter([ToolStatus.NORMAL, ToolStatus.ALERTED]),
				}
			},
			ctor: defineTool,
		}).then((selections: Boolean | Tool[]) => {
			if (isArray(selections)) {
				if (selections.length > 0) {
					// 找出重复数据
					const sameArr = selections.filter((item) => target.tools.filter((tool) => !MetaModel.deleted(tool)).findIndex((tool) => item.toolID === tool.toolID) != -1);
					if (sameArr.length > 0) return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						group: 'br',
						detail: context.globalProps.$t('invalid.requiredTools'),
						life: 3000
					})

					selections.forEach((item) => {
						const targetIndex = target.tools.findIndex((tool) => item.toolID === tool.toolID)
						if (targetIndex != -1) {
							target.tools[targetIndex].entityState = EntityState.MODIFIED;
						}
					}
					);
					context.addSubGroupItems<Tool>({
						target,
						group: 'tools',
						source: selections,
						propsMapper: {
							lifecycleModes: (item) => item.lifecycleModes,
						}
					});

				}
			}
		})
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
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
			groups.push(
				this.group<Tool>('tools').setCustomRenderer((group, ctx: UiViewContext<any>, props) => {
					return this.customToolNode(group, ctx, { view: ctx.view });
				})
			);

		}
		return { fields, groups, customActions };
	}
}

/**
 * 构造工具包交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const ToolkitLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new ToolkitLogic({
	metaUiService: metaUiService,
	repository: 'Toolkits',
	router,
	module: module || metaUiService.findModule('Toolkit'),
})
/**
 * 工具交互逻辑
 */
export class ToolLogic extends UiGroupLogic<Tool, Toolkit> {
	constructor(parent: ToolkitLogic, master: Toolkit) {
		super(defineTool, parent, master, 'tools')
		this.addRelativeLogic<ToolUse>('uses', master => new ToolUseLogic(this, master));
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {

			fields.push(
				// 设备管理相关字段 - 只有当 asEquip 为 true 时才显示
				this.field('checklistID').hideIf((model: Tool) => !model.asEquip),
				this.field('maxLifeCycles')
					.lockIf((model: Tool) => model.status !== ToolStatus.NONE)
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('lifecycles')
					.lockIf((model: Tool) => model.status !== ToolStatus.NONE)
					.hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('usedCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('cost').lockIf((model: Tool) => model.status !== ToolStatus.NONE),
				this.field('liveToDate').lockIf((model: Tool) => model.status !== ToolStatus.NONE),
				this.field('maintenancePlanID').hideIf((model: Tool) => !model.asEquip),
				this.field('lastMaintained').hideIf((model: Tool) => !model.maintenancePlanID || model.status === ToolStatus.NONE),
				this.field('planToMaintain').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('remainingLife').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1)),
				this.field('remainingCost').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 4) == 4)),
			);


		}
		if (groups.length == 0) {
			// groups.push(this.group('a2').hideIf(model => !model.asEquip));
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();

		if (fields.length == 0) {
			fields.push(
				// 设备管理相关字段 - 只有当 asEquip 为 true 时才显示
				this.field('checklistID').hideIf((model: Tool) => !model.asEquip),
				this.field('maintenancePlanID').hideIf((model: Tool) => !model.asEquip),
				this.field('lastMaintained').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('planToMaintain').hideIf((model: Tool) => !model.maintenancePlanID),
				this.field('remainingLife').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 1) == 1)),
				this.field('maxLifeCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('lifecycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('usedCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCycles').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 2) == 2) || (model.lifecycleModes as any) == 0),
				this.field('remainingCost').hideIf((model: Tool) => !(((model.lifecycleModes as any) & 4) == 4)),
				this.field('materialID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					if (isRefNone(ctx.model.materialID)) return h('div');

					return ctx.uiBuilder.fldFactory.HasOneText(fld, ctx)
				})
			)
		}

		if (groups.length == 0) {
			// groups.push(this.group('a2').hideIf(model => !model.asEquip));
		}

		return { fields, groups, customActions };
	}
}

/**
 * 使用记录交互逻辑
 */
export class ToolUseLogic extends UiGroupLogic<ToolUse, Tool> {
	constructor(parent: ToolLogic, master: Tool) {
		super(defineToolUse, parent, master, 'uses');
	}
	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			// fields.push(this.field('userID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
			// fields.push(this.field('ownerID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
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
		return { fields, groups, customActions };
	}
}

//#endregion ~GENERATED PARTS END
