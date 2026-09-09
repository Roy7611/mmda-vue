/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */

import { MetaUiService, Module, MetaUiField, ApiClient, type UiContext, MetaModel, isRefNone, debounce, isNullOrUndefined, isObject, triggerEscKey, EntityAction } from '@mmda/core';
import { type EntityLogicInit, EntityLogic, SubEntityLogic, type UiLogicFnResult } from '@mmda/vui';
import { type EquipmentSparePart, defineEquipmentSparePart } from '@/models/EquipmentSparePart';
/**
 * 备品备件交互逻辑
 * @author mmda codebot
 * @since 2024-09-01 08:45:28.0
 * @revision 2024-09-01 10:02:28.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 备品备件交互逻辑
 */
const tableDataProject = { value: [] }
const tablecolumnsProject = { value: [] }
const tableDataKeyProject = { value: 'id' }
const searchParamProject = {
	pager: {
		pageSize: 10,
		pageNo: 1
	},
	searchWord: '',
	searchParams: {}
});
// 接口参数
const params = {
	// 请购单
	PurchaseRequests: {
		refName: 'EquipmentSparePart',
		refItemKeys: [],
	},
	// 详情请购单
	detailPurchaseRequests: {
		refName: 'EquipmentSparePart',
		refItemKeys: [],
	},
	// 领料单
	withdrawMaterials: {
		refName: 'EquipmentSparePart',
		refItemKeys: [],
	}
})
// 定义接口参数
const propsData = {
	// 付款单
	PurchaseRequests: {
		action: 'create',
		repository: 'PurchaseRequests',
		queryParams: {
			cache: true
		},
		service: 'srm',
	},
	// 物流单
	MaterialTranses: {
		action: 'create',
		repository: 'MaterialTranses',
		queryParams: {
			cache: true
		},
		service: 'mes',
	},
})
/**
 *  请购（跳转到请购单）
 */
const beforeRequest = async (context: UiContext, model: EquipmentSparePart, action: EntityAction) => {
	const { $t: t} = context.globalProps
	params.detailPurchaseRequests.refItemKeys = [{
		refID: model.partID
	}]
	try {
		const res = await context.apiClient.doAction(propsData.PurchaseRequests, params.detailPurchaseRequests)
		window.open(`/SRM/PurchaseRequests/Create?id=${res.requestID}`, '_blank')
	} catch (error: any) {
		context.uiBuilder.toast(context, {
			severity: 'error',
			title: t('dialog.title.error'),
			message: error.message ?? context.t('invalid.requestFailed'),
			life: 3000
		})
	}
	return false
}
export class EquipmentSparePartLogic extends EntityLogic<EquipmentSparePart> {
	constructor(init: EntityLogicInit) {
		super(defineEquipmentSparePart, init);
		this.beforeAction = (context: UiContext, model: EquipmentSparePart, action: EntityAction) => {
			try {
				if (action.name == 'request') return beforeRequest(context, model, action);
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		}
	}
	async getAllProject(context: UiContext, value?: any) {
		await this.getAllOf<Record<string, unknown>>('Equipments', {
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
				}
			})
		})
	}
	async request(context: UiContext<EquipmentSparePart>) {
		const { $t: t} = context.globalProps
		if (!context.selectedItems || !context.selectedItems.length) {
			context.uiBuilder.toast(context, {
				severity: 'warning',
				title: t("dialog.title.warning"),
				message: t("invalid.requiredSelectAny"),
				life: 3000
			});
			return Promise.reject(false);
		} else {
			params.PurchaseRequests.refItemKeys = context.selectedItems.map((item: EquipmentSparePart) => ({
				refID: item.partID
			}))
			try {
				const res = await this.apiClient.doAction(propsData.PurchaseRequests, params.PurchaseRequests)
				window.open(`/SRM/PurchaseRequests/Create?id=${res.requestID}`, '_blank')
			} catch (error: any) {
				context.uiBuilder.toast(context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: error.message ?? context.t('invalid.requestFailed'),
					life: 3000
				})
			}
		}
	}
	async withdrawMaterials(context: UiContext<EquipmentSparePart>) {
		const { $t: t} = context.globalProps
		if (!context.selectedItems || !context.selectedItems.length) {
			context.uiBuilder.toast(context, {
				severity: 'warning',
				title: t("dialog.title.warning"),
				message: t("invalid.requiredSelectAny"),
				life: 3000
			});
			return Promise.reject(false);
		} else {
			params.withdrawMaterials.refItemKeys = context.selectedItems.map((item: EquipmentSparePart) => ({
				refID: item.partID
			}))
			try {
				const res = await this.apiClient.doAction(propsData.MaterialTranses, params.withdrawMaterials)
				window.open(`/MES/MaterialTranses/Create?id=${res.transID}`, '_blank')
			} catch (error: any) {
				context.uiBuilder.toast(context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: error.message ?? context.t('invalid.requestFailed'),
					life: 3000
				})
			}
		}
	}
	beforeSearch() {
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
		if (customSearchFields.length == 0) {
			customSearchFields.push(
				{
					searchLabel: 'view.equipment',
					searchParam: 'equipID',
					valueFn: (v: any) => !isRefNone(v) ? v.equipID : '',
					renderer: (ctx: UiContext & any, csf) => {
						if (!tableDataProject.value.length && isObject(csf.searchVal.value)) {
							tableDataProject.value.push(csf.searchVal.value)
						}
						return ctx.uiBuilder.factory.searchForRelative({
							modelValue: csf.searchVal.value,
							dataKey: 'equipID',
							optionLabel: (v: any) => v.equipName,
							class: 'w-full',
							options: tableDataProject.value,
							toSearch: async () => {
								const picked = await ctx.select({
									repository: 'Equipments',
									service: 'mes',
									selectionMode: 'single',
								})
								if (!Array.isArray(picked) || !picked.length) return false
								const data = picked[0]
								csf.searchVal.value = csf.searchWord = data
								ctx.model.equipID = data.equipID ?? ctx.model.equipID
								ctx.app.localDb.put(`search/${ctx.logic.repository}/equipID`, JSON.parse(JSON.stringify(data)))
								return true
							},
							onUpdate: (value: any) => {
								csf.searchVal.value = value || null;
								ctx.app.localDb.put(`search/${ctx.logic.repository}/equipID`, value);
							},
							onInput: (value: string) => {
								debounce(async () => {
									await this.getAllProject(ctx, value);
								}, 500)();
							},
						})
					}
				},
			)
		}
		return { searchParam, searchFields, customSearchFields }
	}
	beforeIndex(): UiLogicFnResult<EquipmentSparePart> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (customActions.length == 0) {
			customActions.push({
				name: 'request',
				icon: 'pi pi-file-import',
				label: 'equipmentSparePart.purchaseRequest',
				group: 'selectMany',
				role: 'primary',
				onAction: async (context: UiContext<EquipmentSparePart>) => {
					// 切换到多选模式
					context.toSelectManyIndex('request', () => this.request(context));
				},
			}, {
				name: 'withdrawMaterials',
				icon: 'pi pi-file-import',
				label: 'stationlabel.requisition',
				group: 'selectMany',
				role: 'primary',
				onAction: async (context: UiContext<EquipmentSparePart>) => {
					// 切换到多选模式
					context.toSelectManyIndex('withdrawMaterials', () => this.withdrawMaterials(context));
				},
			});
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
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造备品备件交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const EquipmentSparePartLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) => new EquipmentSparePartLogic({
	metaUiService: metaUiService,
	repository: 'EquipmentSpareParts',
	
	module: module || metaUiService.findModule('EquipmentSparePart'),
})
//#endregion ~GENERATED PARTS END
