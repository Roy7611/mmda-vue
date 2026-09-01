/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import { h, ref } from 'vue';
import { MetaModel, isNullOrUndefined, getSearchOp } from '@mmda/core';
import { UiLogic, UiViewOne, type UiLogicFnResult, type UiViewContext } from '@mmda/vui';
import type { Bom } from '@/models/Bom';
import type { BomItem } from '@/models/BomItem';
import { BomStatus } from '@/enums/BomStatus';
import { BomType } from '@/enums/BomType';
import { BomUsage } from '@/enums/BomUsage';
import { MaterialType, MaterialTypeEnum } from '@mmda/base/src/enums/MaterialType';
import { MaterialTracingMode, MaterialTracingModeEnum } from '@mmda/base/src/enums/MaterialTracingMode';
import { ResourceType } from '@/enums/ResourceType';
import type { ProcessOperationResource } from '@/models/ProcessOperationResource';
import {
	type BomLogic,
	forBomMaterialID,
	resources,
	collectEquipToolResourceIds,
	resolveProcessEntity,
	removeProcessResourceItems,
	resolveRefId,
	renderBomProductPic,
	renderBomItemMaterialPic,
	isCurrentBomRow,
	setSubBomItemsEditable,
} from './BomLogic';

export function beforeEdit(this: BomLogic): UiLogicFnResult<Bom> {
	const { fields, groups, customActions } = UiLogic.prototype.beforeEdit.call(this);
	const selectOptions = ref([]);
	if (fields.length == 0) {
		fields.push(
			this.field('bomUsage').onWarn((value, model, ctx: UiViewContext<any>) => {
				if (value === BomUsage.MAINTENANCE) {
					const hasNonSparePart = model.items?.some((item: BomItem) => !MetaModel.deleted(item) && !item.sparePart);
					if (hasNonSparePart) {
						return ctx.t('bom.maintenanceItemsMustBeSpareParts');
					}
				}
			}),
			this.field('expirationDays').onValidate((value, model, ctx: UiViewContext<any>) => {
				if(!isNullOrUndefined(value) && value > 32767) {
					return ctx.t('bom.expirationDaysMax')
				}
			}),
			this.field('refBomID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
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

								if (fldVal.BomID) {
									window.open(`/MES/Boms/${fldVal.BomID}`, '_blank');
								}
							},
						},
						fldVal ? fldVal.BomNo : ''
					),
				]);
			}),
			this.field('plantID').setSearchParam((ctx: UiViewContext<any>, model) => {
				return { status: 'USED' };
			}),
			this.field('alternate').hideIf(model => model.bomType !== BomType.ALTERNATE),
			// BOM类型
			// this.field('bomType').lockIf(t => !isNullOrUndefined(t.refBomID)),
			this.field('productID')
				.lockIf((t, ctx) => t.refName === 'ProductionOrder' || t.status !== BomStatus.NEW || t.bomType === BomType.ALTERNATE) // 新建BOM，且不是替代BOM
				.setSearchParam((ctx: UiViewContext<any>, model) => ({
					materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
					status: getSearchOp('IN').toSQL('USED'),
					categoryID: model.productCategoryID ?? '',
					materialID: forBomMaterialID.value.length ? `NOT IN ${forBomMaterialID.value.join(',')}` : ''
				}))
				.setFooterActions([
					{
						label: 'bom.createProductIdentifier',
						icon: 'pi pi-plus-circle',
						severity: 'success',
						onClick: () => {
							window.open('/BASE/Materials/Create', '_blank');
						},
					},
				])
				.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
					if (isNullOrUndefined(newVal)) {
						ctx.batchSetFieldValue({
							productCode: null,
							productName: null,
							specs: null,
							texture: null,
							unit: null,
							//tracingMode: null,
							modelType: null,
							productCategoryID: null,
							productPic: null,
							// baseQuantity: 1
						});
						ctx.setFieldValue('tracingMode', { value: MaterialTracingMode.NONE, text: MaterialTracingModeEnum.textOf(MaterialTracingMode.NONE) })
					} else {
						const productIDFieldOption = ctx.getFieldCurrentOption('productID');
						ctx.batchSetFieldValue({
							productCode: productIDFieldOption.materialCode ?? null,
							productName: productIDFieldOption.materialFullName ?? null,
							specs: productIDFieldOption.specs ?? null,
							texture: productIDFieldOption.texture ?? null,
							unit: productIDFieldOption.unit ?? null,
							//tracingMode: productIDFieldOption.trackingMode ?? null,
							modelType: productIDFieldOption.modelType ?? null,
							productCategoryID: productIDFieldOption.category ?? null,
							productPic: productIDFieldOption.materialPic ?? null,
							// baseQuantity: productIDFieldOption.minQty ?? null,

						});
						// 追踪方式
						ctx.setFieldValue('tracingMode', { value: productIDFieldOption.trackingMode, text: MaterialTracingModeEnum.textOf(productIDFieldOption.trackingMode) })
						// model.modelType= productIDFieldOption.materialType ?? null;
						//materialType
					}
					return newVal;
				}),
			this.field('processID')
				.lockIf(
					model =>
						[].concat(...model.items.filter(item => !MetaModel.deleted(item)).map(item => (item.operations ? item.operations.filter(operation => !MetaModel.deleted(operation)) : []))).length > 0
				)
				.setSearchParam((ctx: UiViewContext<any>, model) => {
					return { status: 'USED' };
				}).onChange((context, model, newVal, oldVal) => {
					if (newVal) {
						// 切换制程时，先只删除上一制程带入的机具物料
						const prevResourceIds = resources.value.length
							? resources.value.map((r: ProcessOperationResource) => r.resourceID)
							: collectEquipToolResourceIds(resolveProcessEntity(context, oldVal));
						removeProcessResourceItems(context, model, prevResourceIds);

						// 收集机具设备，并按 resourceID 去重（多工序可能引用同一资源）
						const resourceMap = new Map<string, ProcessOperationResource>();
						(model.process?.operations ?? []).forEach((value: any) => {
							(value.resources ?? [])
								.filter((item: ProcessOperationResource) => item.resourceType === ResourceType.EQUIP_TOOLS && item.resourceID)
								.forEach((item: ProcessOperationResource) => {
									if (!resourceMap.has(item.resourceID)) {
										resourceMap.set(item.resourceID, item);
									}
								});
						});
						resources.value = [...resourceMap.values()];
						if (resources.value.length) {
							// 排除子表已有物料，避免与手工添加或已存在行重复
							const existingIds = new Set(
								(model.items ?? [])
									.filter((item: BomItem) => !MetaModel.deleted(item))
									.map((item: BomItem) => resolveRefId(item.materialID))
									.filter(Boolean)
							);
							let toAdd = resources.value.filter(
								(r: ProcessOperationResource) => r.resourceID && !existingIds.has(r.resourceID)
							);
							// 若存在制品，则过滤掉当前制品
							if (model.productID) {
								const productIDFieldOption = context.getFieldCurrentOption('productID');
								toAdd = toAdd.filter((item: any) => item.resourceID !== productIDFieldOption.materialID)
							}
							if (toAdd.length) {
								context.addSubGroupItems({
									target: model,
									group: 'items',
									source: toAdd,
									sequenceKey: 'itemID',
									propsMapper: {
										materialID: (m: ProcessOperationResource) => m.resource,
										materialCode: (m: ProcessOperationResource) => m.resource ? m.resource.materialCode : null,
										materialName: (m: ProcessOperationResource) => m.resource ? m.resource.materialName : null,
										materialCategory: (m:ProcessOperationResource) => m.resource && m.resource.category ? m.resource.category.categoryFullName : null,
										unit: (m: ProcessOperationResource) => m.unit,
										quantity: (m: ProcessOperationResource) => m.requiredQuantity,
										partType: (m: ProcessOperationResource) => m.resource ? ({
											value: m.resource.materialType,
											text: MaterialTypeEnum.textOf(m.resource.materialType),
										}) : null,
										partNo: (m: ProcessOperationResource) => m.resourceID,
										materialPic: (m: ProcessOperationResource) => m.resource ? m.resource.materialPic : null,
										outputRate: () => 0,
										specs: (m: ProcessOperationResource) => m.resource ? m.resource.specs : null,
										modelType: (m: ProcessOperationResource) => m.resource ? m.resource.modelType : null,
										texture: (m: ProcessOperationResource) => m.resource ? m.resource.texture : null,
										weight: (m: ProcessOperationResource) => m.resource ? m.resource.unitWeight : null,
										brand: (m: ProcessOperationResource) => m.resource ? m.resource.brand : null,
									},
								});
							}
						}
					} else {
						// 清除制程：只软删除制程带入的对应子表行，保留手工添加的其它物料
						const resourceIds = resources.value.length
							? resources.value.map((r: ProcessOperationResource) => r.resourceID)
							: collectEquipToolResourceIds(resolveProcessEntity(context, oldVal));
						removeProcessResourceItems(context, model, resourceIds);
						resources.value = [];
					}
				}),
			// 制品标识存在时锁
			this.field('productName').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('productCode').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('productCategoryID')
				.lockIf(model => !isNullOrUndefined(model.productID))
				.setSearchParam(() => ({
					materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
				})).setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
				const fldVal = ctx.getFieldValue(fld);
				return h('div', { style: { width: '100%', overflow: 'hidden' } }, !isNullOrUndefined(fldVal) ? fldVal.categoryName : '')
			}),
			this.field('productPic')
				.setCustomRenderer(renderBomProductPic)
				.lockIf(model => !isNullOrUndefined(model.productID)),
			// this.field('specs').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('specs').lockIf(model => !isNullOrUndefined(model.refID) && !isNullOrUndefined(model.refName) && model.refName === 'ProductionOrder'),
			// this.field('modelType').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('modelType').lockIf(model => !isNullOrUndefined(model.refID) && !isNullOrUndefined(model.refName) && model.refName === 'ProductionOrder'),
			this.field('texture').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('unit').lockIf(model => !isNullOrUndefined(model.productID)),
			// this.field('baseQuantity').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('tracingMode').lockIf(model => !isNullOrUndefined(model.productID)),
			this.field('revision').hideIf(model => MetaModel.created(model)),
			this.field('totalQuantity').hideIf(model => isNullOrUndefined(model.totalQuantity)).lock(),
			this.field('revisedDesc').hideIf(model => MetaModel.created(model)).lockIf(t => t.status !== BomStatus.REVISING)
		);
	}
	if (groups.length == 0) {
		groups.push(
			this.group<BomItem>('items')
				.editIf((m, ctx) => isCurrentBomRow(m, ctx))
				.deleteIf((m, ctx) =>  isCurrentBomRow(m, ctx))
				.onChange((ctx: UiViewContext<any>, model, items) => {
					setSubBomItemsEditable(items, model.bomID);
					// 拦截被标记为删除的物料，同步清除其下挂载的子件BOM数据
					model.items.forEach(item => {
						if (MetaModel.deleted(item)) {
							item.children = undefined;
						}
					});
					forBomMaterialID.value = (model.items ?? []).filter((value: BomItem) => !MetaModel.deleted(value)).map((v: BomItem) => v.materialID)
				})
				.defaultAdder(this.addBomItems)
				// .addCustomAction({
				// 	name: 'createBomItem',
				// 	label: '添加虚拟件',
				// 	icon: 'far fa-plus-circle',
				// 	role: 'info',
				// 	onAction: this.Addingvirtualcomponents,
				// 	view: UiViewOne.Edit,
				// })
				.addCustomAction({
					name: 'createBomItem',
					label: 'action.create',
					icon: 'far fa-plus-circle',
					role: 'info',
					onAction: this.NewBomItem,
					view: UiViewOne.Edit,
					visible: model => !!model?.projectID,
				})
				.addCustomAction({
					name: 'addBomItemsForLinesideInventory',
					label: 'bom.linesideInventory',
					icon: 'far fa-plus-circle',
					role: 'success',
					onAction: this.addBomItemsForLinesideInventory,
					view: UiViewOne.Edit,
					visible: model => !!model?.projectID,
				})
				.addCustomAction({
					name: 'addBomItemsForBom',
					label: 'bom.inHouseProduct',
					icon: 'far fa-plus-circle',
					role: 'success',
					onAction: this.addBomItemsForBom,
					view: UiViewOne.Edit,
				})
				.field('materialCode')
				.inPlaceEdit()
				.nextField('materialID')
				.inPlaceEdit()
				.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
					if (isNullOrUndefined(newVal)) {
						// 物料被清空时，同步清空关联的子件 BOM 等信息
						ctx.setFieldValue('partBomID', null);
						model.children = undefined;
						(model as any).leaf = true;
					}
				})
				.nextField('materialName')
				.inPlaceEdit()
				.nextField('brand')
				.inPlaceEdit()
				.nextField('specs')
				.inPlaceEdit()
				.nextField('modelType')
				.inPlaceEdit()
				.nextField('unit')
				.inPlaceEdit()
				.nextField('texture')
				.inPlaceEdit()
				.nextField('sourcingMode')
				.inPlaceEdit()
				.nextField('sourcingUrl')
				.inPlaceEdit()
				.nextField('materialCategory')
				.inPlaceEdit()
				.nextField('materialPic')
				.setCustomRenderer(renderBomItemMaterialPic)
				.setCustomCellRenderer(renderBomItemMaterialPic)
				.nextField('quantity')
				.inPlaceEdit()
				.nextField('partType')
				.inPlaceEdit()
				.nextField('partBomID')
				.inPlaceEdit()
				.nextField('partLeadTime')
				.inPlaceEdit()
				.nextField('tracingMode')
				.inPlaceEdit()
				.nextField('drawingNo')
				.inPlaceEdit().parent
		);
	}
	return { fields, groups, customActions };
}
