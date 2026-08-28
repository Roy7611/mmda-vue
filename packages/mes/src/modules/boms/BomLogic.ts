/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { defineComponent, h, reactive, ref, type Ref } from 'vue';
import { Router, useRouter } from 'vue-router';
import { ApiError, EntityState, defaultPager, isNullOrUndefined, isRefNone, isApiErrorPayload, MetaModel, pluralize, defaultSearchOps, getSearchOp, encodeUriAndFix, toApiError } from '@mmda/core';
import type { MetaUiService, Module, MetaUiField, UiContext, EntityAction, UiValidation, EntitySearchParam, PagedList, EntityUrlParam } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne, defineInputProps, UiLogicBeforeFn } from '@mmda/vui';
import { type Bom, defineBom } from '@/models/Bom';
import { type BomItem, defineBomItem } from '@/models/BomItem';
import { type BomItemOperation, defineBomItemOperation } from '@/models/BomItemOperation';
import { type LinesideInventory, defineLinesideInventory } from '@/models/LinesideInventory';
import { Material, defineMaterial } from '@mmda/base/src/models/Material';
import { MaterialType, MaterialTypeEnum } from '@mmda/base/src/enums/MaterialType';
import { TaskLevel } from '@mmda/base/src/enums/TaskLevel';
import { ChangeType } from '@mmda/base/src/enums/ChangeType';
import { CuttingMode } from '@mmda/base/src/enums/CuttingMode';
import { FormulaType } from '@mmda/base/src/enums/FormulaType';
import { SourcingMode, SourcingModeEnum } from '@mmda/base/src/enums/SourcingMode';
import { type MaterialCat } from '@mmda/base/src/models/MaterialCat';
import { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { ResourceType } from '@/enums/ResourceType';
import { ProcessOperationResource } from '@/models/ProcessOperationResource';
import type { UiBuildContext } from '@mmda/vui';

const tableData = ref([]);
const tablecolumns = ref([]);
const tableDataKEY = ref('id');
// 存放bom自制品的物料id(array)
export const forBomMaterialID = ref([])
const searchParamTask = reactive({
	pager: {
		pageSize: 10,
		pageNo: 1,
	},
	searchWord: '',
	searchParams: {
		taskPhase: 'MAKE',
		taskLevel: TaskLevel.TASK,
	},
});
//匹配标准件
const bomitemquery = reactive({
	materialID: '',
	materialData: null,
	tableData: [],
	tablecolumns: [],
	tableDataKey: '',
	searchParam: {
		pager: {
			pageSize: 10,
			pageNo: 1,
		},
		searchWord: '',
		searchParams: {},
	},
});
export const resources: any = ref([])
export const getmaterial = async (context: UiBuildContext<any>, value?: any) => {
	await context.globalProps.$api
		.getAll({
			repository: 'Materials',
			service: 'base',
			queryParams: {
				pageSize: bomitemquery.searchParam.pager.pageSize,
				pageNo: bomitemquery.searchParam.pager.pageNo,
				sort: '',
				status: getSearchOp('IN').toSQL('USED'),
				materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
				searchWord: value,
			},
		})
		.then((res: any) => {
			bomitemquery.searchParam.pager = res.pagination;
			bomitemquery.tableData = res.list;
		});
};
/**
 * 获取项目任务
 * @param context
 * @param value
 */
export const getProjectTask = async (context: UiContext<Bom>, value?: any) => {
	await context.globalProps.$api
		.getAll({
			repository: 'ProjectTasks',
			service: 'mes',
			queryParams: {
				pageSize: searchParamTask.pager.pageSize,
				pageNo: searchParamTask.pager.pageNo,
				sort: '',
				searchWord: value,
				taskPhase: 'MAKE',
				taskLevel: TaskLevel.TASK,
				projectID: context.model.projectID ?? '',
			},
		})
		.then((res: any) => {
			searchParamTask.pager = res.pagination;
			tableData.value = res.list.map((it: any) => {
				return {
					...it,
					status: it.customProperties.$status,
					taskLevel: it.customProperties.$taskLevel,
					taskPhase: it.customProperties.$taskPhase,
					riskLevel: it.customProperties.$riskLevel,
					constraintType: it.customProperties.$constraintType,
					critical: it.critical == false ? '否' : '是',
					milestone: it.milestone == false ? '否' : '是',
				};
			});
		});
};

// 物料图片展示配置（改回灰底+边框+42：SIZE=42, EMPTY_SHOW_FRAME=true）
const BOM_ITEM_PIC_SIZE = 64;
const BOM_ITEM_PIC_EMPTY_SHOW_FRAME = false;
const BOM_ITEM_PIC_EMPTY_ICON_SIZE = 40;
const BOM_ITEM_PIC_ICON_SIZE = BOM_ITEM_PIC_EMPTY_SHOW_FRAME
	? Math.round(35 * (BOM_ITEM_PIC_SIZE / 70))
	: BOM_ITEM_PIC_EMPTY_ICON_SIZE;
const BOM_ITEM_PIC_EMPTY_BG = '#fafbfc';
const BOM_ITEM_PIC_EMPTY_BORDER = '#e4e7ed';
const BOM_ITEM_PIC_BORDER_RADIUS = '4px';
const BOM_ITEM_PIC_CLASS = 'bom-item-material-pic-box';

const bomItemPicEmptyFrameStyle = BOM_ITEM_PIC_EMPTY_SHOW_FRAME
	? {
		backgroundColor: BOM_ITEM_PIC_EMPTY_BG,
		border: `1px solid ${BOM_ITEM_PIC_EMPTY_BORDER}`,
		borderRadius: BOM_ITEM_PIC_BORDER_RADIUS,
	}
	: {};

const bomItemPicCommonStyle = {
	width: `${BOM_ITEM_PIC_SIZE}px`,
	height: `${BOM_ITEM_PIC_SIZE}px`,
	minWidth: `${BOM_ITEM_PIC_SIZE}px`,
	minHeight: `${BOM_ITEM_PIC_SIZE}px`,
	maxWidth: `${BOM_ITEM_PIC_SIZE}px`,
	maxHeight: `${BOM_ITEM_PIC_SIZE}px`,
	display: 'inline-block',
	verticalAlign: 'middle',
	boxSizing: 'border-box' as const,
	overflow: 'hidden',
};

const renderBomItemMaterialPicContent = (picUrl: string) => {
	if (!picUrl) {
		return h(
			'span',
			{
				class: `${BOM_ITEM_PIC_CLASS} ${BOM_ITEM_PIC_CLASS}--empty${BOM_ITEM_PIC_EMPTY_SHOW_FRAME ? ` ${BOM_ITEM_PIC_CLASS}--framed` : ''}`,
				style: {
					...bomItemPicCommonStyle,
					display: 'inline-flex',
					justifyContent: 'center',
					alignItems: 'center',
					color: 'gray',
					...bomItemPicEmptyFrameStyle,
				},
			},
			[
				h('i', {
					class: 'fas fa-image',
					style: {
						fontSize: `${BOM_ITEM_PIC_ICON_SIZE}px`,
						width: `${BOM_ITEM_PIC_ICON_SIZE}px`,
						height: `${BOM_ITEM_PIC_ICON_SIZE}px`,
						lineHeight: `${BOM_ITEM_PIC_ICON_SIZE}px`,
						display: 'inline-block',
						textAlign: 'center',
					},
				}),
			]
		);
	}

	return h('img', {
		class: `${BOM_ITEM_PIC_CLASS} ${BOM_ITEM_PIC_CLASS}--img`,
		src: encodeUriAndFix(picUrl),
		alt: 'material',
		style: {
			...bomItemPicCommonStyle,
			objectFit: 'contain',
			objectPosition: 'center center',
			...(BOM_ITEM_PIC_EMPTY_SHOW_FRAME ? { borderRadius: BOM_ITEM_PIC_BORDER_RADIUS } : {}),
			cursor: 'pointer',
		},
		onClick: (e: Event) => {
			e.stopPropagation();
			window.open(`${encodeUriAndFix(picUrl)}?a=${Date.now()}`, '_blank');
		},
	});
};

const getBomItemMaterialPicUrl = (fld: MetaUiField, ctx: UiContext<BomItem>) => {
	const model = ctx.model as BomItem;
	const raw = ctx.getFieldValue(fld) || model.material?.materialPic || '';
	return typeof raw === 'string' ? raw.trim() : '';
};

/** 树形子表与普通子表一致：桥接 items 组字段逻辑，使 customRenderer 生效 */
const patchBomItemMaterialPicFieldLogic = (groupCtx: UiContext<any> & { _fieldLogicMap?: Record<string, unknown> }) => {
	if (!groupCtx?._fieldLogicMap) return;

	const materialPicField = groupCtx.metaui?.getField?.('materialPic');
	if (!materialPicField) return;

	const existing = groupCtx._fieldLogicMap.materialPic as
		| { field?: MetaUiField; customRenderer?: typeof renderBomItemMaterialPic; customCellRenderer?: typeof renderBomItemMaterialPic }
		| undefined;
	if (existing) {
		existing.customRenderer = renderBomItemMaterialPic;
		existing.customCellRenderer = renderBomItemMaterialPic;
	} else {
		groupCtx._fieldLogicMap.materialPic = {
			field: materialPicField,
			customRenderer: renderBomItemMaterialPic,
			customCellRenderer: renderBomItemMaterialPic,
		} as never;
	}
};
/** 统一取出引用字段上的业务 ID（兼容 string / 对象） */
export const resolveRefId = (val: any, idKey = 'materialID') => {
	if (isNullOrUndefined(val) || val === '') return '';
	if (typeof val === 'object') return val[idKey] ?? val.materialID ?? val.id ?? '';
	return String(val);
};
/**
 * 从制程工序资源中收集机具设备的 resourceID
 */
export const collectEquipToolResourceIds = (process: any): string[] => {
	const ids = new Set<string>();
	(process?.operations ?? []).forEach((op: any) => {
		(op?.resources ?? [])
			.filter((r: ProcessOperationResource) => r.resourceType === ResourceType.EQUIP_TOOLS)
			.forEach((r: ProcessOperationResource) => {
				if (r.resourceID) ids.add(r.resourceID);
			});
	});
	return [...ids];
};
/** 解析制程对象（兼容 ID / 引用对象 / 字段选项缓存） */
export const resolveProcessEntity = (context: UiContext<Bom>, processOrId: any) => {
	if (!processOrId) return null;
	if (typeof processOrId === 'object') return processOrId;
	const option = context.getFieldCurrentOption('processID');
	if (option && typeof option === 'object' && (option as any).processID === processOrId) {
		return option;
	}
	const fieldOpts = context.getFieldOptions('processID') as any;
	const list = fieldOpts?.options ?? fieldOpts?.list ?? [];
	if (Array.isArray(list)) {
		return list.find((p: any) => p?.processID === processOrId) ?? null;
	}
	return null;
};
/**
 * 软删除子表中与制程机具资源对应的 BomItem（不影响手工添加的其它行）
 */
export const removeProcessResourceItems = (context: UiContext<Bom>, model: Bom, resourceIds: string[]) => {
	const excludeSet = new Set((resourceIds ?? []).filter(Boolean));
	if (!excludeSet.size || !model.items?.length) return;
	[...model.items]
		.filter((item: BomItem) => {
			if (MetaModel.deleted(item)) return false;
			const mid = resolveRefId(item.materialID);
			return !!mid && excludeSet.has(mid);
		})
		.forEach((item: BomItem) => context.removeSubGroupItem('items', item));
};
export const bridgeBomItemsSubGroupFieldLogic = (context: UiContext<Bom>) => {
	const root = (context.root ?? context) as UiContext<Bom> & {
		metaui?: { getGroup?: (name: string) => unknown };
		model?: Bom;
		_groupLogicMap?: Record<string, { fields?: Array<{ field?: { fieldName?: string } }> }>;
		_cache?: Record<string, UiContext<any> & { _fieldLogicMap?: Record<string, unknown> }>;
	};
	if (!root.metaui?.getGroup || !root.model) return;

	let itemsGroup: { groupName?: string };
	try {
		itemsGroup = root.metaui.getGroup('items') as { groupName?: string };
	} catch {
		return;
	}
	if (!itemsGroup?.groupName) return;

	const grpLogic = root._groupLogicMap?.items;

	let groupCtx: UiContext<any> & { _fieldLogicMap?: Record<string, unknown> };
	try {
		groupCtx = root.subGroupContext('items') as UiContext<any> & {
			_fieldLogicMap?: Record<string, unknown>;
		};
	} catch {
		return;
	}
	if (!groupCtx?._fieldLogicMap) return;

	grpLogic?.fields?.forEach(fl => {
		if (fl?.field?.fieldName === 'materialPic') {
			(fl as { customRenderer?: typeof renderBomItemMaterialPic; customCellRenderer?: typeof renderBomItemMaterialPic }).customRenderer =
				renderBomItemMaterialPic;
			(fl as { customCellRenderer?: typeof renderBomItemMaterialPic }).customCellRenderer = renderBomItemMaterialPic;
		}
		if (fl?.field?.fieldName) {
			groupCtx._fieldLogicMap![fl.field.fieldName] = fl;
		}
	});

	patchBomItemMaterialPicFieldLogic(groupCtx);

	// 同步 patch 已缓存的子表/行 context，避免部分行仍走默认图片渲染
	root._cache &&
		Object.values(root._cache).forEach(cachedCtx => {
			if (cachedCtx?.metaui?.objName === 'BomItem' || cachedCtx.name?.includes('items')) {
				grpLogic?.fields?.forEach(fl => {
					if (fl?.field?.fieldName && cachedCtx._fieldLogicMap) {
						cachedCtx._fieldLogicMap[fl.field.fieldName] = fl;
					}
				});
				patchBomItemMaterialPicFieldLogic(cachedCtx);
			}
		});
};

export const renderBomItemMaterialPic = (fld: MetaUiField, ctx: UiContext<BomItem>) => {
	const picUrl = getBomItemMaterialPicUrl(fld, ctx);
	return renderBomItemMaterialPicContent(picUrl);
};

/** 沟通结果集缩略图：宽度自适应容器，高度上限避免撑破表单 */
const COMMUNICATE_PIC_MAX_HEIGHT = 160;
const COMMUNICATE_PIC_STYLE_ID = 'bom-item-communicate-pic-style';

const ensureBomItemCommunicatePicStyle = () => {
	if (typeof document === 'undefined') return;
	const css = `
.bom-item-communicate-pic {
	width: 100%;
	box-sizing: border-box;
}
.bom-item-communicate-pic .images {
	display: flex !important;
	flex-direction: column;
	flex-wrap: nowrap;
	gap: 8px;
	width: 100%;
	justify-content: flex-start !important;
	align-items: stretch !important;
}
.bom-item-communicate-pic .p-image,
.bom-item-communicate-pic [role$="-image"] {
	width: 100% !important;
	max-width: 100% !important;
	height: auto !important;
	max-height: ${COMMUNICATE_PIC_MAX_HEIGHT}px !important;
	overflow: hidden !important;
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	border: 1px solid #e4e7ed;
	border-radius: 4px;
	background: #fafbfc;
	box-sizing: border-box;
}
.bom-item-communicate-pic .p-image img,
.bom-item-communicate-pic [role$="-image"] img {
	width: 100% !important;
	height: auto !important;
	max-width: 100% !important;
	max-height: ${COMMUNICATE_PIC_MAX_HEIGHT}px !important;
	object-fit: contain !important;
	object-position: center center !important;
	cursor: pointer;
}
`;
	let style = document.getElementById(COMMUNICATE_PIC_STYLE_ID) as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement('style');
		style.id = COMMUNICATE_PIC_STYLE_ID;
		document.head.appendChild(style);
	}
	style.textContent = css;
};

const getBomItemCommunicatePicUrls = (fld: MetaUiField, ctx: UiContext<BomItem>): string[] => {
	const raw = ctx.getFieldValue(fld);
	if (raw == null || raw === '') return [];
	return String(raw)
		.split(';')
		.map(s => s.trim())
		.filter(Boolean);
};

/** 沟通结果集：缩略图 + 点击预览放大；编辑态复用框架上传，宽度自适应容器 */
const renderBomItemCommunicatePic = (fld: MetaUiField, ctx: UiContext<BomItem>, props?: any) => {
	ensureBomItemCommunicatePicStyle();
	const maxH = COMMUNICATE_PIC_MAX_HEIGHT;

	// 编辑态：复用框架 ImageUpload（选择/清除/上传逻辑不变），外层 CSS 约束为缩略图
	if (ctx.editing && ctx.uiBuilder.fldFactory?.imageUpload) {
		return h('div', { class: 'bom-item-communicate-pic' }, [
			ctx.uiBuilder.fldFactory.imageUpload(fld, ctx, props),
		]);
	}

	const urls = getBomItemCommunicatePicUrls(fld, ctx);
	if (!urls.length) return h('span', {}, '');

	return h(
		'div',
		{
			class: 'bom-item-communicate-pic',
			style: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
		},
		urls.map(url =>
			ctx.uiBuilder.factory.image(url, {
				preview: true,
				isEdit: false,
				imageStyle: {
					width: '100%',
					height: 'auto',
					maxWidth: '100%',
					maxHeight: `${maxH}px`,
					objectFit: 'contain',
					objectPosition: 'center center',
					cursor: 'pointer',
				},
				style: {
					width: '100%',
					maxWidth: '100%',
					maxHeight: `${maxH}px`,
					overflow: 'hidden',
					border: '1px solid #e4e7ed',
					borderRadius: '4px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#fafbfc',
					boxSizing: 'border-box',
				},
			})
		)
	);
};

//制品图片自定义居中渲染
export const renderBomProductPic = (fld: MetaUiField, ctx: UiContext<Bom>) => {
	const raw = ctx.getFieldValue(fld);
	const picUrl = typeof raw === 'string' ? raw.trim() : '';
	return h('div', { style: { width: '100%', display: 'flex', justifyContent: 'center' } }, [
		ctx.uiBuilder.factory.image(picUrl, {
			preview: true,
			imageStyle: { maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' },
			style: { display: 'inline-flex', justifyContent: 'center' },
		}),
	]);
};

// 子件 BOM 行保留查看按钮 editIf 控制。
export const setSubBomItemsEditable = (items: BomItem[] | undefined, rootBomID?: string) => {
	const pending = [...(items ?? [])];
	while (pending.length > 0) {
		const row = pending.shift();
		if (!row) continue;
		if (row.bomID !== rootBomID) {
			row.editable = false;
		}
		if (row.children?.length) {
			pending.push(...(row.children as BomItem[]));
		}
	}
};
/** 当前编辑的 BOM。子表/行 context 的 model 是 items 数组或 null，不能当 BOM 用。 */
const getCurrentBom = (ctx: UiContext<any>): Bom | undefined => {
	const candidates = [ctx.root?.model, ctx.model];
	return candidates.find((m): m is Bom => !!m && !Array.isArray(m) && Array.isArray(m.items));
};

/**
 * 物料清单行是否属于当前正在编辑的 BOM。
 * 组级（m 是 Bom）返回 true，保证 inPlaceEdit 仍可用；行级仅本 BOM 子件可编/可删。
 * 不能用 ctx.prev.bomID：根编辑页的 prev 是列表页，没有 bomID，会把整组判成不可编。
 */
export const isCurrentBomRow = (row: { bomID?: string } | null | undefined, ctx: UiContext<any>) => {
	if (!row) return true;
	const currentBomID = getCurrentBom(ctx)?.bomID;
	if (!currentBomID || !row.bomID) return true;
	return row.bomID === currentBomID;
};

/**
 * 变更
 * @param context
 * @param action
 * @returns
 */
export const beforealter = async (context: UiBuildContext<any>, model: Bom, action: EntityAction) => {
	context.globalProps.$router.push({ name: 'BomEdit', params: model.bomID });
	return false;
};

export const checkBomHasTask = async (context: UiBuildContext<any>, model: Bom, action: EntityAction) => {
	if (!isNullOrUndefined(model.bomID)) {
		try {
			const res = await context.globalProps.$api.getOne(`${model.bomID}/hasTask`, {
				repository: 'Boms',
				service: 'mes',
			});
			return res;
		} catch (error: any) {
			context.globalProps.$toast.add({
				severity: 'error',
				summary: context.globalProps.$t('dialog.title.error'),
				group: 'br',
				detail: error.message,
				life: 3000,
			});
			return false;
		}
	}
};

/**
 * 批准
 * @param context
 * @param model
 * @param action
 * @returns
 */
export const beforeapprove = async (context: UiBuildContext<any>, model: Bom, action: EntityAction) => {
	//根据bomID 查询是否存在项目任务，如果存在，弹窗展示项目任务 ProjectTask 多选，过滤 taskPhase=MAKE，taskLevel=TASK
	const metaUiService = context.logic!.metaUiService;
	const { $ui: ui, $api: apiBox, $t: t, $toast: Toast } = context.globalProps;

	const hasTask = await checkBomHasTask(context, model, action);
	if (hasTask) {
		let data = [] as any;
		const metaUi = await metaUiService.get('ProjectTasks', 'mes');
		tablecolumns.value = metaUi.getListedFields().sort((prev: any, curr: any) => {
			return Number(prev.fieldIdx) - Number(curr.fieldIdx);
		});
		tableDataKEY.value = metaUi.primaryKey;
		context.uiBuilder.confirmDialog(
			context.uiBuilder.buildSearchForRelativeContent(
				tablecolumns.value.map((item: MetaUiField) =>
					ui.factory.column({
						header: item.displayLabel,
						field: item.fieldName,
						style: {
							width: `${item.listSize ?? 200}px`,
						},
					})
				),
				{
					dataKey: tableDataKEY.value,
					selectionMode: 'single',
					onSearch: async (params: any) => {
						const { searchParams, reload, pager } = params;
						await getProjectTask(context, searchParams.searchWord);
						return { list: tableData.value, pager: searchParamTask.pager };
					},
					onPage: ({ pageNo, pageSize }: any) => {
						searchParamTask.pager.pageNo = pageNo;
						searchParamTask.pager.pageSize = pageSize;
					},
					onSelect: (selection: any, row: any) => {
						// console.log(selection, '选择')
						data = selection;
					},
					onSelectAll: (selection: any, row: any) => {
						// console.log(selection, '全选')
						data = selection;
					},
				}
			),
			context,
			{
				title: '选择一个项目任务',
				style: { width: '80vw', maxHeight: '95%' },
				accept: async () => {
					let refItemKeys = <any>[];
					//单选情况下,改多选删除 , 多选直接用data
					const dataList = [];
					if (data) {
						dataList.push(data);
					}
					refItemKeys = dataList.map((it: any) => {
						return Object.assign({ refID: it.taskID });
					});

					//多选的情况下
					// refItemKeys = data.map((it: any) => {
					// 	return Object.assign({ refID: it.taskID });
					// });
					await apiBox
						.doAction(
							{
								path: model.bomID,
								service: 'mes',
								repository: 'Boms',
								action: 'approve',
							},
							{ payload: { refItemKeys: refItemKeys } }
						)
						.then((res: any) => {
							if (res) {
								context.reload();
								return true;
							}
						})
						.catch((err: any) => {
							Toast.add({
								severity: 'error',
								summary: t('dialog.title.error'),
								group: 'br',
								detail: err.message,
								life: 3000,
							});
							return true;
						});
					return true;
				},
			}
		);
	} else {
		return true
		// return await context.uiBuilder.confirmMessage(context, {
		// 	header: t('action.confirm'),
		// 	message: t('dialog.areYourSure'),
		// 	type: action.param.hint,
		// 	accept: async () => {
		// 		return await apiBox
		// 			.doAction(
		// 				{
		// 					path: model.bomID,
		// 					service: 'mes',
		// 					repository: 'Boms',
		// 					action: 'approve',
		// 				},
		// 				{}
		// 			)
		// 			.then((res: any) => {
		// 				if (res) {
		// 					return true
		// 					// context.reload();
		// 				}
		// 			})
		// 			.catch((err: any) => {
		// 				const message = err?.validationErrors?.length ? err.validationErrors.map((ve: any) => ve.error).join(';') : err.message ?? err;
		// 				// Toast.add({ severity: 'error', summary: t('dialog.title.error'), group: 'br', detail: err.message, life: 3000 });
		// 				Toast.add({ severity: 'error', summary: t('dialog.title.error'), group: 'br', detail: message, life: 3000 });
		// 				return Promise.reject(false);
		// 			});
		// 	},
		// });
	}
	return false;
};
/**
 * 匹配标准件
 * @param context
 * @param model
 * @param action
 * @returns
 */
export const beforematchStd = async (context: UiBuildContext<any>, model: Bom, action: EntityAction) => {
	// if (context.actionLoadings[action.name]) return false; // 防止重复点击
	const metaUiService = context.logic!.metaUiService;
	const { $ui: ui, $api: apiBox, $t: t, $toast: Toast } = context.globalProps;
	// 获取物料数据
	await getmaterial(context, '');

	// 过滤 减项数据
	const originTableData = model.items || [];
	const tableData = ref(originTableData);

	// 本地分页和搜索参数
	const _searchParam = reactive({
		// recordCount 不传 分页器会无法正常显示
		pager: { pageSize: 10, pageNo: 1, recordCount: originTableData.length },
		searchWord: '',
	});

	// columns 字段名
	const searchFields = ['materialCode', 'materialName', 'brand', 'specs', 'modelType', 'gbNo'];

	// 本地分页和模糊搜索
	function getPagedItems(searchWord: string, isSearch: boolean = false) {
		if (searchWord) {
			tableData.value = originTableData.filter(item => searchFields.some(field => (item[field] || '').toString().toLowerCase().includes(searchWord.toLowerCase())));
		} else {
			tableData.value = originTableData;
		}
		if (isSearch) {
			// 只有搜索时才重置页码
			_searchParam.pager.pageNo = 1;
			_searchParam.pager.pageSize = 10;
			_searchParam.pager.recordCount = tableData.value.length;
		}
	}

	// 构建表格列
	const columns = [
		ui.factory.column({ header: '序号', field: 'rowNum', style: { width: '80px' } }),
		ui.factory.column(
			{
				header: '物料图片',
				field: 'materialPic',
				style: 'width: 100px',
			},
			{
				body: (rowData: any) =>
					ui.factory.image(rowData.data.materialPic || '', {
						width: '50',
						height: '50',
						preview: true,
					}),
			}
		),
		ui.factory.column({ header: '物料编码', field: 'materialCode', style: 'width: 100px' }),
		ui.factory.column({ header: '物料名称', field: 'materialName', style: 'width: 100px' }),
		ui.factory.column({ header: '品牌', field: 'brand', style: 'width: 100px' }),
		ui.factory.column({ header: '规格', field: 'specs', style: 'width: 100px' }),
		ui.factory.column({ header: '型号', field: 'modelType', style: 'width: 100px' }),
		ui.factory.column({ header: '国标号', field: 'gbNo', style: 'width: 100px' }),
		ui.factory.column(
			{
				header: '选择匹配标准件',
				style: 'width: 100px',
			},
			{
				body: (rowData: any) => {
					// 减项不展示选择匹配标准件
					if (rowData.data.amendType === ChangeType.REMOVED) {
						return null;
					}

					return ui.factory.searchForRelative({
						role: `material-search-for-sProject`,
						name: 'material-search-for-sProject',
						id: 'material-search-for-sProject',
						modelValue: rowData.data.material,
						dataKey: 'materialID',
						optionLabel: 'materialName',
						class: 'w-full',
						// 切换页码后bomitemquery.tableData更新了，找不到你选中的数据，所以展示不对，要保证你取的数据在你的可选列表中
						options: [].concat(bomitemquery.tableData, [rowData.data.material]),
						// toSearch 通过搜索 getmaterial 获取数据
						toSearch: async (event: Event) => {
							let data = [] as any;
							// 获取物料列表的列定义
							const materialColumns = [
								ui.factory.column({ header: '物料编码', field: 'materialCode', style: 'width: 100px' }),
								ui.factory.column({ header: '物料名称', field: 'materialName', style: 'width: 100px' }),
								ui.factory.column({ header: '品牌', field: 'brand', style: 'width: 100px' }),
								ui.factory.column({ header: '规格', field: 'specs', style: 'width: 100px' }),
								ui.factory.column({ header: '型号', field: 'modelType', style: 'width: 100px' }),
								ui.factory.column({ header: '国标号', field: 'gbNo', style: 'width: 100px' }),
							];

							context.uiBuilder.confirmDialog(
								context.uiBuilder.buildSearchForRelativeContent(materialColumns, {
									dataKey: 'materialID',
									onSearch: async (params: any) => {
										const { searchParams, reload, pager } = params;
										await getmaterial(context, searchParams.searchWord);
										return { list: bomitemquery.tableData, pager: bomitemquery.searchParam.pager };
									},
									onPage: ({ pageNo, pageSize }: any) => {
										bomitemquery.searchParam.pager.pageNo = pageNo;
										bomitemquery.searchParam.pager.pageSize = pageSize;
									},
									onSelect: (selection: any, row: any) => {
										data = row;
									},
								}),
								context,
								{
									title: '选择物料',
									style: { width: '80vw', maxHeight: '95%' },
									accept: async () => {
										if (data.length === 0) {
											context.uiBuilder.toast(context, {
												severity: 'error',
												summary: context.t('dialog.title.error'),
												detail: context.t('invalid.requiredSelectAny'),
												group: 'br',
												life: 3000,
											});
											return false;
										}
										rowData.data.material = data;
										return true;
									},
								}
							);
						},
						onChange: (value: any) => {
							if (!isRefNone(value)) {
								console.log(value, 'value');
								rowData.data.material = value;
							} else {
								rowData.data.material = null;
							}
						},
					});
				},
			}
		),
	];

	let lastSearchWord = '';

	context.uiBuilder.confirmDialog(
		context.uiBuilder.buildSearchForRelativeContent(columns, {
			dataKey: 'itemID',
			selectionMode: 'none',
			onPage: ({ pageNo, pageSize }: any) => {
				_searchParam.pager.pageNo = pageNo;
				_searchParam.pager.pageSize = pageSize;
			},
			onSearch: async (params: any) => {
				const { searchParams } = params;
				const isNewSearch = searchParams.searchWord !== lastSearchWord;
				lastSearchWord = searchParams.searchWord;
				getPagedItems(searchParams.searchWord, isNewSearch);
				// 分页处理
				const pageNo = _searchParam?.pager?.pageNo ?? 1;
				const pageSize = _searchParam?.pager?.pageSize ?? 10;
				const start = (pageNo - 1) * pageSize;
				const end = start + pageSize;
				const pagedList = tableData.value.slice(start, end);

				return { list: pagedList, pager: _searchParam.pager };
			},
		}),
		context,
		{
			title: '匹配标准件',
			style: { width: '80vw', maxHeight: '95%' },
			accept: async () => {
				const refItemKeys: { refID: string; refItemID: string; refName: string }[] = [];
				// 在确认时更新 model.items
				model.items.forEach((item: BomItem) => {
					refItemKeys.push({
						refID: model.bomID,
						refItemID: item.itemID.toString(),
						refName: item.material?.materialID ?? '',
					});
				});
				console.log(refItemKeys, 'refItemKeys');
				try {
					const res = await apiBox.doAction(
						{
							path: model.bomID,
							service: 'mes',
							repository: 'Boms',
							action: 'matchStd',
						},
						{ payload: { refItemKeys: refItemKeys } }
					);

					if (res) {
						Toast.add({
							severity: 'success',
							summary: t('dialog.success'),
							detail: t('success.operationSuccessful'),
							life: 3000,
						});
						// 成功后隔1s刷新页面
						setTimeout(() => {
							context.reload();
						}, 1000);
						return true;
					}
				} catch (error: any) {
					Toast.add({
						severity: 'error',
						summary: t('dialog.title.error'),
						detail: error.message,
						life: 3000,
					});
					return false;
				}
			},
			reject: () => {
				// 删除 model.items 中 _material 的属性
				// model.items.forEach((item: any) => {
				// 	item.material = null;
				// });
				return true;
			},
		}
	);

	return false;
};

/**
 * 指派设计任务：筛选来源=自制且未绑定子件BOM的项次，弹窗多选后放行给FLOW_TO处理通知
 */
export const beforeAssignDesignTask = async (context: UiBuildContext<any>, model: Bom, action: EntityAction) => {
	const { $ui: ui, $toast: Toast } = context.globalProps;

	// 过滤符合条件的 BomItem：来源=自制 且 未绑定子件BOM
	const targetItems = (model.items || []).filter((item: BomItem) =>
		!MetaModel.deleted(item) &&
		item.sourcingMode === SourcingMode.MAKE &&
		isNullOrUndefined(item.partBomID)
	);

	if (targetItems.length === 0) {
		Toast.add({
			severity: 'warn',
			summary: context.t('dialog.title.warning'),
			detail: '没有可指派的子件，请确认子件来源为"自制"且未绑定子件BOM',
			group: 'br',
			life: 3000,
		});
		return false;
	}

	// 构建表格列定义
	const columns = [
		ui.factory.column({ header: '项次', field: 'itemID', style: { width: '80px' } }),
		ui.factory.column({ header: '物料名称', field: 'materialName', style: { width: '150px' } }),
		ui.factory.column({ header: '规格', field: 'specs', style: { width: '120px' } }),
		ui.factory.column({ header: '用量', field: 'quantity', style: { width: '80px' } }),
	];

	let selectedItems: BomItem[] = [];

	return await context.uiBuilder.confirmDialog(
		context.uiBuilder.buildSearchForRelativeContent(columns, {
			dataKey: 'itemID',
			labelFn: (item: any) => item.materialName,
			selectionMode: 'multiple',
			data: targetItems,
			onSearch: async (params: any) => {
				const searchWord = params.searchParams?.searchWord || '';
				const filtered = searchWord
					? targetItems.filter((item: any) =>
						['materialName', 'specs', 'itemID'].some(field =>
							String(item[field] || '').toLowerCase().includes(searchWord.toLowerCase())
						)
					)
					: targetItems;
				const pageNo = params.pager?.pageNo || 1;
				const pageSize = params.pager?.pageSize || 10;
				const start = (pageNo - 1) * pageSize;
				return {
					list: filtered.slice(start, start + pageSize),
					pager: { pageSize, pageNo, recordCount: filtered.length }
				};
			},
			onSelect: (selection: any) => { selectedItems = selection; },
			onSelectAll: (selection: any) => { selectedItems = selection; },
		}),
		context,
		{
			title: '选择待设计的子件',
			style: { width: '70vw' },
			accept: async () => {
				if (selectedItems.length === 0) {
					Toast.add({
						severity: 'error',
						summary: context.t('dialog.title.error'),
						detail: '请至少选择一项子件',
						group: 'br',
						life: 3000,
					});
					return false;
				}
				// 存储 itemKeys 到 action 对象上（不放在 param 上，因为 FLOW_TO 的 onSubmit 会执行 action.param = data 覆盖）
				(action as any).__itemKeys = selectedItems.map((item: BomItem) => `${item.bomID},${item.itemID}`);
				return true;
			},
		}
	);
};
/**
 * 物料清单交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:14:55.0
 * @revision 2024-09-01 23:02:59.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 物料清单交互逻辑cancelAlter
 */
export class BomLogic extends UiLogic<Bom> {
	constructor(init: UiLogicInit) {
		super(defineBom, init);
		this.addRelativeLogic<BomItem>('items', master => new BomItemLogic(this, master));

		this.beforeAction = (context: UiBuildContext<any>, model: Bom, action: EntityAction) => {
			try {
				if (action.name == 'alter') return beforealter(context, model, action);
				if (action.name == 'approve') return beforeapprove(context, model, action);
				if (action.name == 'matchStd') return beforematchStd(context, model, action);
				if (action.name == 'assignDesignTask') return beforeAssignDesignTask(context, model, action);
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		};
		// 重写 doAction：对指派设计任务，合并 itemKeys 与 FLOW_TO 通知数据到 {payload:{...}} 格式
		const _superDoAction = this.doAction;
		this.doAction = async (model: Bom, action: EntityAction) => {
			if (action.name === 'assignDesignTask') {
				const itemKeys = (action as any).__itemKeys || [];
				const body = {
					payload: {
						...action.param,
						itemKeys,
					},
				};
				return await this.apiClient.doAction(
					{ path: model.bomID, action: 'assignDesignTask', service: 'mes' },
					body
				).then(result => {
					if (result instanceof ApiError || isApiErrorPayload(result)) {
						throw result instanceof ApiError ? result : toApiError(result);
					}
					this.success(result);
					return result;
				}).catch(e => { this.error(e); });
			}
			return _superDoAction.call(this, model, action);
		};
	}

	viewLogicLoaders = {
		index: () => import('./BomIndexLogic'),
		edit: () => import('./BomEditLogic'),
		details: () => import('./BomDetailsLogic'),
	};

	//#region 树形列表逻辑
	categoryName: Ref<string> = ref('');
	treeData: Ref<MaterialCat[]> = ref([]);
	treeLoading: Ref<boolean> = ref(false);

	/**
	 * 搜索制品类别分类
	 * @param {UiContext} ctx - 上下文对象
	 * @param {string} [searchWord=''] - 搜索关键词,默认为空字符串
	 * @returns {Promise<boolean>} - 搜索成功返回true,否则返回false
	 */
	async searchFn(ctx: UiContext, searchWord: string | MaterialCat = '') {
		this.treeLoading.value = true;
		return await new Promise(resolve => {
			resolve(
				this.apiClient.getAll({
					repository: 'MaterialCats',
					service: 'base',
					queryParams: {
						depth: 0,
						materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
						searchWord: searchWord,
					},
				})
			);
		})
			.then((res: any) => {
				this.treeData.value = res.list;
				Promise.resolve(true);
			})
			.finally(() => {
				this.treeLoading.value = false;
			});
	}

	currentCategory: MaterialCat;
	get selectionItem() {
		return this.currentCategory
			? {
				[this.currentCategory.key]: true,
			}
			: {};
	}

	/**
	 * 节点点击事件处理
	 * @param {UiContext} ctx - 上下文对象
	 * @param {MaterialCat} data - 节点数据
	 */
	async onNodeSelectFn(ctx: UiContext<Bom>, data: MaterialCat) {
		this.currentCategory = data;
		ctx.refresh(false);
	}
	//#endregion

	async create(param: any = {}, entityUrlParam?: EntityUrlParam): Promise<Bom> {
		return super.create(param, entityUrlParam).then(res => {
			if (this.currentCategory) {
				res.productCategory = this.currentCategory;
				res.productCategoryID = this.currentCategory.categoryID;

			}
			return res;
		});
	}

	async getAll(param: EntitySearchParam, context?: UiContext): Promise<PagedList<Bom>> {
		param.queryParams = Object.assign({}, param.queryParams, {
			productCategoryID: this.currentCategory?.categoryID ?? '',
		});
		return super.getAll(param, context);
	}

	/**
	 * 添加物料
	 * @param context
	 * @param target
	 */
	addBomItems(context: UiContext<Bom>, target: Bom) {
		context
			.select<Material>({
				service: 'base',
				repository: 'Materials',
				ctor: defineMaterial,
				selectionMode: 'multiple',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						status: getSearchOp('IN').toSQL('USED'),
						materialType: getSearchOp('NOT_IN').toSQL([MaterialType.LABOR]),
					},
				},
				// 不允许绑定与productID相等的物料
				selectableFn: (m: Material) => !(target.productID === m.materialID) && !(target.items && target.items.find((item: BomItem) => !MetaModel.deleted(item) && item.materialID === m.materialID)),
			})
			.then(selection => {
				if (selection) {
					//这么写更简洁
					context.addSubGroupItems<BomItem>({
						target,
						group: 'items',
						source: selection,
						sequenceKey: 'itemID',
						propsMapper: {
							partNo: 'materialID',
							materialCategory: m => m.category?.categoryName ?? '',
							materialPic: m => m.materialPic ?? null,
							materialID: m => m,
							// tracingMode: m => {
							// 	const fld = context.metaui.getField('tracingMode')
							// 	return MetaModel.getFieldValue(m, fld)
							// },
							tracingMode: m => ({ value: m.trackingMode, text: MetaModel.getRefProp(m, 'trackingMode') }),
							outputRate: () => 0,
							partType: m => ({
								value: m.materialType,
								text: MaterialTypeEnum.textOf(m.materialType),
							}),
							weight: m => m.unitWeight,
						},
					});
				}
			});
	}
	/**
	 * 从BOM表中选择自制品，映射到BomItem子表
	 * 用于快速添加已有BOM的自制品，避免先选物料再绑定子件BOM的繁琐操作
	 * @param context
	 * @param target
	 */
	addBomItemsForBom(context: UiContext<Bom>, target: Bom) {
		context
			.select<Bom>({
				repository: 'Boms',
				ctor: defineBom,
				selectionMode: 'multiple',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						status: 'APPROVED',
						productID: 'NOT IN NULL'
					},
				},
				// 排除已在当前BOM子表中存在的物料
				selectableFn: (b: Bom) => {
					return !(target.productID === b.productID) && !(target.items && target.items.find(
						(item: BomItem) => !MetaModel.deleted(item) && item.materialID === b.productID
					))
				},
			})
			.then((selection: any) => {
				if (selection && selection.length > 0) {
					context.addSubGroupItems<BomItem>({
						target,
						group: 'items',
						source: selection,
						sequenceKey: 'itemID',
						propsMapper: {
							partNo: 'productID',
							materialName: 'productName',
							materialCode: 'productCode',
							materialCategory: m => m.productCategory?.categoryName ?? '',
							materialPic: m => m.productPic ?? null,
							materialID: m => ({ materialID: m.productID, materialCode: m.productCode, materialName: m.productName }),
							sourcingMode: () => ({ value: SourcingMode.MAKE, text: SourcingModeEnum.MAKE_TEXT }),
							partBomID: m => m,
							outputRate: () => 0,
							specs: 'specs',
							modelType: 'modelType',
							texture: 'texture',
							unit: 'unit',
							tracingMode: m => ({ value: m.tracingMode, text: MetaModel.getRefProp(m, 'tracingMode') }),
						},
					});
					// 更新对应的子件Bom
					target.items.forEach((item: BomItem) => {
						selection.forEach((value: Bom) => {
							if (item.materialID === value.productID) {
								value.items.forEach(async (v: any) => {
									v.deletable = false
									v.editable = false
									if (v.partBomID) {
										try {
											const partBom = defineBom(await context.apiClient.getOne(v.partBomID, {
												repository: 'Boms',
												service: context.apiClient.config.service || 'mes',
											}));
											const children = (partBom.items ?? []).filter(item => !MetaModel.deleted(item)).map((item: BomItem) => { item.parentKey = value.id; item.deletable = false; return item; });
											setSubBomItemsEditable(children, value?.bomID);
											if (children.length > 0) {
												v.children = children;
												(v as any).leaf = false;
											} else {
												v.children = undefined;
												(v as any).leaf = true;
											}
										} catch (e) {
											console.error('Failed to load subBom items', e);
										}
									} else {
										v.children = undefined;
										(v as any).leaf = true;
									}
								})
								item.children = value.items
							}
						})
					})
				}
			});
	}

	/**
	 * 添加虚拟件
	 */
	Addingvirtualcomponents(context: UiContext<Bom>, target: Bom) {
		context
			.select<Bom>({
				repository: 'Boms',
				ctor: defineBom,
				selectionMode: 'single',
				searchParam: {
					pager: defaultPager(),
					queryParams: {
						status: 'APPROVED',
					},
				},
			})
			.then((selection: any) => {
				if (selection) {
					context.addSubGroupItems<BomItem>({
						target,
						group: 'items',
						source: selection,
						sequenceKey: 'itemID',
						propsMapper: {
							materialName: 'productName',
							materialCode: 'productCode',
							materialCategory: m => m.productCategory?.categoryName,
							materialID: m => m,
							sourcingMode: 'MAKE',
							partBomID: m => m,
						},
					});
				}
			});
	}

	/**
	 * 从线边库存的添加BomItem
	 * @param context
	 * @param target
	 */
	addBomItemsForLinesideInventory(context: UiContext<Bom>, target: Bom) {
		context
			.select<LinesideInventory>({
				repository: pluralize('LinesideInventory'),
				ctor: defineLinesideInventory,
				selectionMode: 'multiple',
				// searchParam: {
				// 	pager: defaultPager(),
				// 	queryParams: {
				// 		status: 'APPROVED',
				// 	},
				// },
			})
			.then((selection: any) => {
				if (selection) {
					context.addSubGroupItems<BomItem>({
						target,
						group: 'items',
						source: selection,
						sequenceKey: 'itemID',
						propsMapper: {
							refName: 'LinesideInventory',
							refID: m => m.siteID,
							materialID: m => m,
							outputRate: () => 0,
						},
					});
				}
			});
	}
	/**
	 * 创建物料
	 * @param context
	 * @param target
	 */
	NewBomItem(context: UiContext<Bom>, target: Bom) {
		context
			.newSubGroupItem<BomItem>({
				group: 'items',
				sequenceKey: 'itemID',
				target,
				propsMapper: {
					partNo: () => '1',
					outputRate: () => 0,
					specs: () => '',
				},
			})
			.then(item => {
				if (item) {
					target.items.push(item);
				}
			})
			.catch(e => {
				console.log(e);
			});
	}

}

/**
 * 构造物料清单交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const BomLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new BomLogic({
		service: metaUiService,
		repository: 'Boms',
		router,
		module: module || metaUiService.findModule('Bom'),
	});
/**
 * 物料清单交互逻辑
 */
export class BomItemLogic extends UiGroupLogic<BomItem, Bom> {
	constructor(parent: BomLogic, master: Bom) {
		super(defineBomItem, parent, master, 'items');
		this.addRelativeLogic<BomItemOperation>('operations', master => new BomItemOperationLogic(this, master));
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();

		if (fields.length == 0) {
			fields.push(
				this.field('altStrategyID').setSearchParam((ctx: UiViewContext<any>, model) => {
					return {
						status: getSearchOp('IN').toSQL('USED'), // 只能选择启用的替代料策略
					};
				}),
				// 产出比率、损耗率可以为0
				this.field('outputRate').onValidate((value, model, ctx: UiViewContext<any>) => {
					const items = this.master.items.filter((items: BomItem) => items.entityState < 4 && model.itemID !== items.itemID)
					const outputRateSum = ((MetaModel.sum(items, item => item.outputRate) * 10000) / 10000) + value;
					if (outputRateSum > 1) {
						return '所有物料的产出比率之和不能超过100%';
					}
				}),
				this.field('scrapPercentage').onValidate(value => {
					if (value == 0) {
						return '';
					}
				}),
				//materialID存在锁定
				this.field('materialCode').lockIf(model => !isRefNone(model.materialID)),
				this.field('materialCategory').lockIf(model => !isRefNone(model.materialID)),
				this.field('materialName').lockIf(model => !isRefNone(model.materialID)),
				this.field('materialID').lockIf(model => !isRefNone(model.materialID)),
				this.field('brand').lockIf(model => !isRefNone(model.materialID)),
				this.field('specs')
					.lockIf(model => !isRefNone(model.materialID))
					.inPlaceEdit(),
				this.field('modelType').lockIf(model => !isRefNone(model.materialID)),
				//this.field('unit').lockIf(model => !isRefNone(model.materialID)),
				this.field('texture').lockIf(model => !isRefNone(model.materialID)),
				this.field('partType').lockIf(model => !isRefNone(model.materialID)),
				this.field('weight').lockIf(model => !isRefNone(model.materialID)),
				this.field('materialPic')
					.setCustomRenderer(renderBomItemMaterialPic)
					.setCustomCellRenderer(renderBomItemMaterialPic)
					.lockIf(model => !isNullOrUndefined(model.materialID)),
				// 沟通结果集：缩略图展示，点击预览放大（不改框架；编辑态走 customEditor）
				this.field('communicatePic').setCustomEditor(renderBomItemCommunicatePic),

				// this.field('tracingMode').lockIf(model => !isRefNone(model.tracingMode)),
				//如果来源为自制，自动填写子部件 partBomID
				this.field('sourcingMode')
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (newVal == SourcingMode.INVENTORY || newVal == SourcingMode.DIRECT_PURCHASE) {
							ctx.setFieldValue('partBomID', null);
							model.children = undefined;
							(model as any).leaf = true;
							const rootModel = ctx.root?.model as Bom;
							if (rootModel?.items) {
								rootModel.items = [...rootModel.items];
							}
						}
					}),
				this.field('partType').onValidate((value, model, ctx: UiViewContext<any>) => {
					if (model.sourcingMode === SourcingMode.MAKE && value === MaterialType.LABOR) {
						return '自制的子件不能为人力';
					}
				}),
				//  当sourcingMode自制MAKE/外协OUTSOURCE
				this.field('partBomID')
					.hideIf(model => model.sourcingMode == SourcingMode.INVENTORY || model.sourcingMode == SourcingMode.DIRECT_PURCHASE)
					.onChange(async (ctx: UiViewContext<any>, model, newVal, oldVal) => {

						// const sourcingModeFld = ctx.metaui.getField('sourcingMode');
						// if (!sourcingModeFld) return;
						// // 校验来源
						// ctx.validateField(sourcingModeFld,
						// 	sourcingModeFld?.reference ?
						// 		sourcingModeFld.reference.valueOf(model) : model[sourcingModeFld.fieldName],
						// 	ctx.model, ctx.validation);

						const partBomOption = ctx.getFieldCurrentOption('partBomID') as Bom | undefined;
						const partBomID = partBomOption?.bomID ?? model.partBomID ?? (newVal as any)?.bomID ?? newVal;
						const oldPartBomID = (oldVal as any)?.bomID ?? oldVal;
						const rootModel = ctx.root?.model as Bom;
						const refreshTree = () => {
							if (rootModel?.items) {
								rootModel.items = [...rootModel.items];
							}
						};

						if (partBomID && partBomID !== oldPartBomID) {
							try {
								const partBom = defineBom(await ctx.apiClient.getOne(partBomID, {
									repository: 'Boms',
									service: ctx.apiClient.config.service || 'mes',
								}));
								const children = (partBom.items ?? []).filter(item => !MetaModel.deleted(item)).map((item: BomItem) => { item.parentKey = model.id; item.deletable = false; return item; });
								setSubBomItemsEditable(children, rootModel?.bomID);
								if (children.length > 0) {
									model.children = children;
									(model as any).leaf = false;
								} else {
									model.children = undefined;
									(model as any).leaf = true;
								}
								refreshTree();
							} catch (e) {
								console.error('Failed to load subBom items', e);
							}
						} else if (!partBomID) {
							model.children = undefined;
							(model as any).leaf = true;
							refreshTree();
						}
					})
					.setSearchParam((ctx: UiViewContext<any>, model) => {
						return {
							productID: model.materialID ?? '',
							status: 'APPROVED',
							bomID: defaultSearchOps.StringFieldSearchOps[7].toSQL(model.bomID),
						};
					})
				// .onValidate((value, model, ctx: UiViewContext<any>) => {
				// 	if (!value && (model.sourcingMode === SourcingMode.MAKE || model.sourcingMode === SourcingMode.OUTSOURCE)) {
				// 		return '当来源为自制/外协时，子件BOM必填';
				// 	}
				// })
				,
				//切割方式=不切割时，隐藏切割规格
				this.field('cuttingSpecs')
					.lockIf(model => model.cuttingMode == 'NONE')
					.onValidate((value, model, ctx: UiViewContext<any>) => {
						if (model.cuttingMode !== CuttingMode.NONE && !value) {
							return '切割规格不能为空';
						}
					}),
				this.field('formula').hideIf(model => model.formulaType !== FormulaType.FORMULA),
				this.field('opCodes').setCustomCellRenderer((fld, ctx, props) => {
					const { uiBuilder } = ctx;
					const text = ctx.getFieldValue(fld) as string;

					return uiBuilder.fldFactory.associationTable(fld, ctx, {
						group: 'operations',
						// onClick: () => this.newBomItemOperation(ctx, ctx.model),
					});
				}),
				this.field('drawingNo').onValidate<string>(value => {
					if (!isNullOrUndefined(value) && value.length > 50) {
						return '个数必须在0和50之间';
					}
					return null;
				})
			);
		}

		if (groups.length == 0) {
			groups.push(
				this.group<BomItemOperation>('operations')
					.hideIf((model, ctx) => (ctx.root ? !ctx.root.model.processID : false))
					.clearIf(model => true)
					.addCustomAction({
						name: 'createBomItemOperation',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newBomItemOperation,
						view: UiViewOne.Edit,
					})
					.onChange((ctx: UiViewContext<any>, model, operations) => {
						model.opCodes = operations
							.filter(operation => !MetaModel.deleted(operation))
							.map(operations => operations.opCode)
							.join(',');
					})
			);
		}
		return { fields, groups, customActions };
	}

	/**
	 * 创建物料清单项工序
	 * @param context
	 * @param target
	 */
	newBomItemOperation(context: UiContext<BomItem>, target: BomItem) {
		context
			.newSubGroupItem<BomItemOperation>({
				group: 'operations',
				// sequenceKey: 'itemID',
				target,
				propsMapper: {
					itemID: () => target.itemID,
				},
			})
			.then(item => {
				if (item) {
					// target.operations.push(item);
					context.addSubGroupItem('operations', item);
				}
			});
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length == 0) {
			fields.push(
				this.field('materialPic')
					.setCustomRenderer(renderBomItemMaterialPic)
					.setCustomCellRenderer(renderBomItemMaterialPic),
				this.field('communicatePic').setCustomRenderer(renderBomItemCommunicatePic),
				// 物料编码，有物料ID时可跳转至base的物料详情，没有则不能跳转
				this.field('materialCode').setCustomRenderer((fld, ctx: UiViewContext<any>, prop) => {
					const fldVal = ctx.getFieldValue(fld);
					if (!isRefNone(ctx.model.materialID)) {
						const baseUrl = ctx.globalProps.$api.http.baseUrl.replace(/api/g, '');
						return h('div', { style: { class: '' } }, [
							h(
								'a',
								{
									style: {
										color: '#409eff',
									},
									href: 'javascript:;',
									onClick: async () => {
										const url = `${baseUrl}BASE/Materials/${ctx.model.materialID}`;
										window.open(url, '_blank');
									},
								},
								fldVal
							),
						]);
					} else {
						return fldVal;
					}
				}),
				// 链接加超链接（跳转其他页面）
				this.field('sourcingUrl').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
					const fldVal = ctx.getFieldValue(fld);
					if (!isNullOrUndefined(fldVal)) {
						return h('div', { style: { class: '' } }, [
							h(
								'a',
								{
									style: {
										color: '#409eff',
									},
									href: 'javascript:;',
									onClick: async () => {
										window.open(fldVal, '_blank');
									},
								},
								fldVal
							),
						]);
					} else {
						return h('div');
					}
				}),
				this.field('partBomID')
					.hideIf(model => model.sourcingMode == SourcingMode.INVENTORY || model.sourcingMode == SourcingMode.DIRECT_PURCHASE),
				this.field('opCodes').setCustomCellRenderer((fld, ctx, props) => {
					const { uiBuilder } = ctx;
					const text = ctx.getFieldValue(fld) as string;

					return uiBuilder.fldFactory.associationTable(fld, ctx, {
						group: 'operations',
						// onClick: () => this.newBomItemOperation(ctx, ctx.model),
					});
				}),
				// 替代料策略，有替代料策略ID时可跳转至详情，没有则不能跳转
				this.field('altStrategyID').setCustomRenderer((fld, ctx: UiViewContext<any>, prop) => {
					const fldVal = ctx.getFieldValue(fld);
					console.log(JSON.stringify(fldVal));
					if (!isRefNone(ctx.model.altStrategyID)) {
						const baseUrl = ctx.globalProps.$api.http.baseUrl.replace(/api/, '');
						return h('div', { style: { class: '' } }, [
							h(
								'a',
								{
									style: {
										color: '#409eff',
									},
									href: 'javascript:;',
									onClick: async () => {
										const url = `${baseUrl}MES/AlternativeStrategies/${ctx.model.altStrategyID}`;
										window.open(url, '_blank');
									},

								},
								fldVal.strategyCode
							),
						]);
					} else {
						return fldVal;
					}
				}),

			);
		}
		return { fields, groups, customActions };
	}
}

export class BomItemOperationLogic extends UiGroupLogic<BomItemOperation, BomItem> {
	constructor(parent: BomItemLogic, master: BomItem) {
		super(defineBomItemOperation, parent, master, 'operations');
	}

	beforeEdit(): UiLogicFnResult<BomItemOperation> {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('opCode')
					.setSearchParam((ctx: UiViewContext<any>, model) => {
						const rootModel = ctx.root.model as Bom;
						return { parentProcessID: rootModel.processID ?? '' };
					})
					.setSelectable((ctx: UiViewContext<any> & any, field, row) => {
						const itemModel = ctx.prev.prev.model as BomItem;
						return !itemModel.operations?.some((r: BomItemOperation) => !MetaModel.deleted(r) && r.opCode === row.opCode);
					})
					.lockIf(model => model.entityState != EntityState.CREATED && model.entityState != EntityState.CREATED_MODIFIED)
					.onChange(async (ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (newVal && newVal !== oldVal) {
							try {
								const rootModel = ctx.root.model as Bom;
								const compositeId = `${rootModel.processID},${newVal}`;
								const processOperation = await ctx.apiClient.getOne(
									compositeId, // 传递复合主键字符串
									{
										repository: 'ProcessOperations',
										service: 'mes',
									}
								);
								if (processOperation) {
									model.setupTime = processOperation.setupTime;
									model.opTime = processOperation.opTime;
									model.opParams = processOperation.opParams;
								}
							} catch (error) {
								console.error('获取工序配置失败:', error);
							}
						}
					})
					.onValidate((value, model, ctx: UiViewContext<any>) => {
						const itemModel = ctx.prev.prev.model as BomItem;
						if (!value) return '工序不能为空';
						const endOprations = itemModel.operations?.filter(op => !MetaModel.deleted(op) && op.id !== model.id);
						if ((MetaModel.createdForModified(model) || MetaModel.created(model)) && endOprations?.filter(op => op.opCode == value).length > 0) {
							return `当前物料已包含此工序，请重新选择`;
						}
						// if (ctx.model.id === model.id && itemModel.operations.length <= 1) return; // 判断是否为自己
						// if ((MetaModel.createdForModified(model) || MetaModel.created(model)) && itemModel.operations?.filter(op => op.opCode == value).length > 0) {
						// 	return `当前物料已包含此工序，请重新选择`;
						// }
					}),
				this.field('setupTime').onValidate((value) => {
					if (!value) return '准备时间不能为空';
				}),
				this.field('opTime').onValidate((value) => {
					if (!value) return '加工工时不能为空';
				})

				// this.field("setupTime").onValidate((value, model) => {
				// 	if (value <= 0) {
				// 		return '准备工时不能小于0';
				// 	}
				// }),
				// this.field("opTime").onValidate((value, model) => {
				// 	if (value <= 0) {
				// 		return '加工工时不能小于0';
				// 	}
				// })
			);
		}
		return { fields, groups, customActions };
	}
}

// function defineMaterialMaster(o?: object) {
// 	throw new Error('Function not implemented.');
// }
//#endregion ~GENERATED PARTS END
