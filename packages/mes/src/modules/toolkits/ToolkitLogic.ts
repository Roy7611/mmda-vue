/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import type { MetaUiService, Module, MetaUiField, UiContext, MetaUiGroup } from '@mmda/core';
import { defaultPager, isArray, isRefNone, MetaModel, EntityState, inFilter, nullFilter } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, type PropData } from '@mmda/vui';
import { toolkitToolListNode } from './toolkit_tool_node';
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

		this.currentDom = { value: null };
		this.targetDom = { value: null };
	}


	customToolNode(group: MetaUiGroup, context: UiContext<any>, props: PropData): any {
		return toolkitToolListNode(group, context, props, this.currentDom.value?.id, this.targetDom.value?.id);
	}


	currentDom: { value: any };
	targetDom: { value: any };
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
					.setCustomEditor((group, ctx: UiContext<any>, props) => {
						return this.customToolNode(group, ctx, {
							...props,
							view: ctx.view,
							onDragstart: (e: DragEvent, context: UiContext<any>, item: Tool) => {
								e.dataTransfer.effectAllowed = 'move'; // 拖动样式改为 "move"
								this.currentDom.value = e.currentTarget;
							},
							onDragenter: (e: DragEvent, context: UiContext<any>, item: Tool) => {
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
							onDragend: (e: DragEvent, context: UiContext<any>, item: Tool) => {
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

	addTools(context: UiContext<any>, target: Toolkit,) {
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
						title: context.globalProps.$t('dialog.title.error'),
						message: context.globalProps.$t('invalid.requiredTools'),
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
				this.group<Tool>('tools').setCustomRenderer((group, ctx: UiContext<any>, props) => {
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
export const ToolkitLogicCtor = (metaUiService: MetaUiService, router: UiLogicInit["router"], module?: Module) => new ToolkitLogic({
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
				this.field('materialID').setCustomRenderer((fld, ctx: UiContext<any>, props) => {
					if (isRefNone(ctx.model.materialID)) return ctx.uiBuilder.factory.textSpan('');

					return ctx.uiBuilder.fldFactory.hasOneText(fld, ctx)
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
			// fields.push(this.field('userID').setCustomRenderer((fld, ctx: UiContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
			// fields.push(this.field('ownerID').setCustomRenderer((fld, ctx: UiContext<any>, props) => h('span', ctx.model.customProperties[`$${fld.fieldName}`])));
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
