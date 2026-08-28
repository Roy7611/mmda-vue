/*
 * @Author: mmda codebot
 * @Date: 2026-06-30
 * @Description: 指定器具弹窗 — 支持多物流单批量指定器具
 */
import { computed, defineComponent, h, onMounted, reactive, ref, watch, type PropType } from 'vue';
import type { UiBuildContext } from '@mmda/vui';
import { ToolStatusEnum } from '@/enums/ToolStatus';
import { type MaterialTrans } from '@/models/MaterialTrans';
import './ToolsPicking.less';

interface ToolItem {
	toolID: string;
	toolNo?: string;
	serialNo?: string;
	toolName?: string;
	specs?: string;
	materialID?: string;
	status?: string;
	transID?: string;
	transNo?: string;
	materialTransID?: string;
	materialTransNo?: string;
	bindTransID?: string;
	bindTransNo?: string;
	assignedTransID?: string;
	assignedTransNo?: string;
	materialTrans?: Partial<MaterialTrans>;
}

interface ToolRow extends ToolItem {
	id: string;
	/** 行选中态，随勾选变化以驱动表格行刷新*/
	__checked?: boolean;
}

interface TransState {
	trans: MaterialTrans;
	selectedItemID: string;
	selectedToolsMap: Record<string, ToolRow[]>;
	originalToolIDsMap: Record<string, Set<string>>;
}

interface ToolAssignment {
	transID: string;
	transNo: string;
}

const toToolRow = (tool: ToolItem): ToolRow => ({
	...tool,
	id: tool.toolID,
	toolNo: tool.toolNo ?? tool.serialNo ?? tool.toolID,
	toolName: tool.toolName ?? '',
});

const getToolAssignment = (tool: ToolItem): ToolAssignment | null => {
	const transID = tool.transID
		?? tool.materialTransID
		?? tool.bindTransID
		?? tool.assignedTransID
		?? tool.materialTrans?.transID;
	if (!transID) return null;

	return {
		transID: String(transID),
		transNo: tool.transNo
			?? tool.materialTransNo
			?? tool.bindTransNo
			?? tool.assignedTransNo
			?? tool.materialTrans?.transNo
			?? String(transID),
	};
};

const getToolIDs = (map: Record<string, ToolRow[]>) =>
	Object.values(map).flatMap(tools => tools.map(tool => tool.toolID));

const getSelectionKeys = (map: Record<string, ToolRow[]>) =>
	Object.entries(map).flatMap(([itemID, tools]) =>
		tools.map(tool => `${itemID}:${tool.toolID}`),
	).sort();

const hasSelectionChanged = (state: TransState) => {
	const current = getSelectionKeys(state.selectedToolsMap);
	const original = Object.entries(state.originalToolIDsMap).flatMap(([itemID, ids]) =>
		[...ids].map(toolID => `${itemID}:${toolID}`),
	).sort();
	return current.length !== original.length || current.some((id, index) => id !== original[index]);
};

const syncOriginalSelection = (state: TransState) => {
	state.originalToolIDsMap = Object.fromEntries(
		Object.entries(state.selectedToolsMap).map(([itemID, tools]) => [
			itemID,
			new Set(tools.map(tool => tool.toolID)),
		]),
	);
};

export const ToolsPicking = defineComponent({
	name: 'ToolsPicking',
	props: {
		ctx: { type: Object as PropType<UiBuildContext<any>>, default: null },
		onReady: { type: Function as any, default: null },
	},
	setup: (props) => {
		const { $ui: ui, $api: apiBox, $toast: toast } = props.ctx.globalProps;
		const { uiBuilder } = props.ctx;

		const transStates = reactive<Record<string, TransState>>({});
		const selectedTransIDs = ref<string[]>([]);
		const currentTransID = ref('');
		const transSearchWord = ref('');
		const transSearchLoading = ref(false);
		const apiTools = ref<ToolItem[]>([]);
		const toolsLoading = ref(false);
		const submitLoading = ref(false);
		const pendingTransIDs = new Set<string>();
		let toolsRequestID = 0;

		const currentState = computed(() => transStates[currentTransID.value] ?? null);
		const currentTrans = computed(() => currentState.value?.trans ?? null);
		const currentItems = computed(() => currentTrans.value?.items ?? []);
		const currentItem = computed(() => currentItems.value.find(
			item => String(item.itemID) === currentState.value?.selectedItemID,
		));
		const selectedItemID = computed(() => currentState.value?.selectedItemID ?? '');
		const currentSelectedTools = computed<ToolRow[]>(() =>
			currentState.value?.selectedToolsMap[selectedItemID.value] ?? [],
		);
		const currentSelectedIDs = computed(() => new Set(currentSelectedTools.value.map(tool => tool.id)));

		const selectedTranses = computed(() => selectedTransIDs.value
			.map(transID => transStates[transID]?.trans)
			.filter(Boolean) as MaterialTrans[]);

		const totalSelectedCount = computed(() => selectedTransIDs.value.reduce((total, transID) =>
			total + getToolIDs(transStates[transID]?.selectedToolsMap ?? {}).length, 0));

		const itemCountWithSelections = computed(() => selectedTransIDs.value.reduce((total, transID) =>
			total + Object.values(transStates[transID]?.selectedToolsMap ?? {})
				.filter(tools => tools.length > 0).length, 0));

		const findSelectedByOtherTrans = (toolID: string): MaterialTrans | null => {
			for (const transID of selectedTransIDs.value) {
				if (transID === currentTransID.value) continue;
				const state = transStates[transID];
				if (state && getToolIDs(state.selectedToolsMap).includes(toolID)) return state.trans;
			}
			return null;
		};

		const getDisabledReason = (tool: ToolRow): string => {
			const selectedBy = findSelectedByOtherTrans(tool.toolID);
			if (selectedBy) return `已选择给物流单 ${selectedBy.transNo ?? selectedBy.transID}`;

			const assignment = getToolAssignment(tool);
			if (assignment && assignment.transID !== currentTransID.value) {
				return `已指定给物流单 ${assignment.transNo}`;
			}
			return '';
		};

		// 器具列表仅展示 getAllOptTool 接口返回
		const filteredTools = computed<ToolRow[]>(() => {
			if (!selectedItemID.value) return [];
			return apiTools.value.map(toToolRow);
		});

		// 勾选态写入行数据
		const tableTools = computed<ToolRow[]>(() => {
			const selectedIDs = currentSelectedIDs.value;
			return filteredTools.value.map(row => ({
				...row,
				__checked: selectedIDs.has(row.id),
			}));
		});

		const editableTools = computed(() =>
			tableTools.value.filter(tool => !getDisabledReason(tool)),
		);

		const allEditableSelected = computed(() => {
			const editable = editableTools.value;
			return editable.length > 0 && editable.every(tool => tool.__checked);
		});

		const showToast = (severity: string, detail: string, summary = '提示') => {
			toast.add({ severity, detail, summary, group: 'br', life: 3000 });
		};

		const createTransState = (detail: MaterialTrans): TransState => {
			const selectedToolsMap: Record<string, ToolRow[]> = {};
			const originalToolIDsMap: Record<string, Set<string>> = {};
			for (const tool of detail.tools ?? []) {
				const itemID = String(tool.itemID);
				const row = toToolRow(tool as ToolItem);
				selectedToolsMap[itemID] ??= [];
				originalToolIDsMap[itemID] ??= new Set<string>();
				if (!selectedToolsMap[itemID].some(item => item.id === row.id)) selectedToolsMap[itemID].push(row);
				originalToolIDsMap[itemID].add(row.id);
			}

			return {
				trans: detail,
				selectedItemID: '',
				selectedToolsMap,
				originalToolIDsMap,
			};
		};

		const addTranses = async (transes: MaterialTrans[]) => {
			const uniqueTranses = transes.filter((trans, index, list) =>
				trans.transID && list.findIndex(item => item.transID === trans.transID) === index,
			);
			if (!uniqueTranses.length) return;

			transSearchLoading.value = true;
			const failed: string[] = [];
			for (const trans of uniqueTranses) {
				const transID = String(trans.transID);
				if (transStates[transID] || pendingTransIDs.has(transID)) continue;
				pendingTransIDs.add(transID);
				try {
					const detail = await apiBox.getOne(transID, {
						repository: 'MaterialTranses',
						service: 'mes',
					}) as MaterialTrans;
					if (transStates[transID]) continue;
					transStates[transID] = createTransState(detail);
					selectedTransIDs.value = [...selectedTransIDs.value, transID];
				} catch (error: any) {
					failed.push(trans.transNo ?? transID);
				} finally {
					pendingTransIDs.delete(transID);
				}
			}
			transSearchLoading.value = false;
			if (!currentTransID.value && selectedTransIDs.value.length) {
				currentTransID.value = selectedTransIDs.value[0];
			}
			if (failed.length) showToast('error', `以下物流单加载失败：${failed.join('、')}`, '错误');
		};

		const removeTrans = (transID: string) => {
			const index = selectedTransIDs.value.indexOf(transID);
			selectedTransIDs.value = selectedTransIDs.value.filter(id => id !== transID);
			delete transStates[transID];
			if (currentTransID.value === transID) {
				currentTransID.value = selectedTransIDs.value[Math.min(index, selectedTransIDs.value.length - 1)] ?? '';
			}
		};

		const clearTranses = () => {
			for (const transID of selectedTransIDs.value) delete transStates[transID];
			selectedTransIDs.value = [];
			currentTransID.value = '';
			transSearchWord.value = '';
		};

		const selectItem = (itemID: string) => {
			if (currentState.value) currentState.value.selectedItemID = itemID;
		};

		// 按物料行查询可选器具（含该行已指定器具）
		const loadToolsForItem = async (materialID: string, itemID: string, transID: string) => {
			const requestID = ++toolsRequestID;
			toolsLoading.value = true;
			apiTools.value = [];
			try {
				const res = await apiBox.getAll({
					repository: 'Tools',
					path: 'getAllOptTool',
					service: 'mes',
					queryParams: {
						materialID,
						siteID: transStates[transID]?.trans.fromSiteID,
						transID,
						itemID,
					},
				});
				if (requestID !== toolsRequestID || currentTransID.value !== transID || selectedItemID.value !== itemID) return;
				apiTools.value = (res.list as ToolItem[]) ?? [];
			} catch (error: any) {
				if (requestID === toolsRequestID) showToast('error', error.message ?? '加载器具列表失败', '错误');
			} finally {
				if (requestID === toolsRequestID) toolsLoading.value = false;
			}
		};

		watch([currentTransID, selectedItemID], ([transID, itemID]) => {
			const materialID = currentItem.value?.materialID;
			if (transID && itemID && materialID) {
				loadToolsForItem(materialID, itemID, transID);
			} else {
				toolsRequestID++;
				toolsLoading.value = false;
				apiTools.value = [];
			}
		});

		const handleToggleOne = (tool: ToolRow) => {
			const state = currentState.value;
			const itemID = selectedItemID.value;
			if (!state || !itemID || getDisabledReason(tool)) return;

			const current = state.selectedToolsMap[itemID] ?? [];
			const selected = current.some(item => item.id === tool.id);
			state.selectedToolsMap[itemID] = selected
				? current.filter(item => item.id !== tool.id)
				: [...current, tool];
		};

		const handleToggleAll = () => {
			const state = currentState.value;
			const itemID = selectedItemID.value;
			if (!state || !itemID) return;

			const editableTools = filteredTools.value.filter(tool => !getDisabledReason(tool));
			const selectedIDs = currentSelectedIDs.value;
			const allSelected = editableTools.length > 0 && editableTools.every(tool => selectedIDs.has(tool.id));
			const disabledSelected = currentSelectedTools.value.filter(tool => getDisabledReason(tool));
			state.selectedToolsMap[itemID] = allSelected ? disabledSelected : [
				...disabledSelected,
				...editableTools.filter(tool => !disabledSelected.some(item => item.id === tool.id)),
			];
		};

		const submitFn = async (): Promise<boolean> => {
			if (!selectedTransIDs.value.length) {
				showToast('error', '请先选择物流单', '错误');
				return false;
			}

			const changedStates = selectedTransIDs.value
				.map(transID => transStates[transID])
				.filter(state => state && hasSelectionChanged(state));
			if (!changedStates.length) {
				showToast('warn', '器具指定没有发生变化');
				return false;
			}

			submitLoading.value = true;
			// 批量提交：一次请求更新多个物流单的器具指定
			const transes = changedStates.map(state => ({
				transID: state.trans.transID,
				items: Object.entries(state.selectedToolsMap).flatMap(([itemID, tools]) =>
					tools.map(tool => ({ itemID, toolID: tool.toolID })),
				),
			}));
			try {
				await apiBox.http.postJson('/mes/Tools/bindKitCheckTools', { transes });
				changedStates.forEach(syncOriginalSelection);
				showToast('success', `已更新 ${changedStates.length} 个物流单的器具指定`, '成功');
				return true;
			} catch (error: any) {
				showToast('error', error.message ?? '器具指定失败', '错误');
				return false;
			} finally {
				submitLoading.value = false;
			}
		};

		onMounted(() => props.onReady?.(submitFn));

		const normalizeTransSelection = (selection: unknown, row: unknown): MaterialTrans[] => {
			if (Array.isArray(selection)) return selection as MaterialTrans[];
			if (Array.isArray(row)) return row as MaterialTrans[];
			if (row && typeof row === 'object') return [row as MaterialTrans];
			if (selection && typeof selection === 'object') return [selection as MaterialTrans];
			return [];
		};

		const openTransSearch = async () => {
			const { metaui } = await props.ctx.logic.loadMetadata('MaterialTranses', 'mes');
			const columns = await uiBuilder.buildColumns(metaui, props.ctx, {
				cacheKey: `transID/SearchRelative/${metaui.primaryKey}`,
			});
			const pendingTranses = ref<MaterialTrans[]>([]);
			return new Promise(resolve => {
				uiBuilder.confirmDialog(
					(uiBuilder as any).buildSearchForRelativeContent(columns, {
						dataKey: 'transID',
						selectionMode: 'multiple',
						onSearch: async (params: any) => {
							const result = await apiBox.getAll({
								repository: 'MaterialTranses',
								service: 'mes',
								queryParams: {
									searchWord: params?.searchParams?.searchWord ?? '',
									pageSize: params?.pager?.pageSize ?? 20,
									pageNo: params?.pager?.pageNo ?? 1,
									isKitCheckToolLend: true,
								},
							});
							return { list: result.list, pager: result.pagination };
						},
						onSelect: (selection: unknown, row: unknown) => {
							pendingTranses.value = normalizeTransSelection(selection, row);
						},
						onSelectAll: (selection: unknown) => {
							pendingTranses.value = normalizeTransSelection(selection, null);
						},
					}),
					props.ctx,
					{
						name: 'materialTransSearchForRelative',
						title: '选择物流单（可多选）',
						style: { width: '68vw' },
						accept: async () => {
							if (!pendingTranses.value.length) {
								showToast('error', '请至少选择一个物流单', '错误');
								return false;
							}
							await addTranses(pendingTranses.value);
							resolve(pendingTranses.value);
							return true;
						},
						reject: async () => {
							resolve(null);
							return true;
						},
					},
				);
			});
		};

		const searchTransDirectly = async () => {
			const searchWord = transSearchWord.value.trim();
			if (!searchWord) {
				showToast('warn', '请输入物流单号');
				return;
			}
			transSearchLoading.value = true;
			try {
				const result = await apiBox.getAll({
					repository: 'MaterialTranses',
					service: 'mes',
					queryParams: { searchWord, pageSize: 20, pageNo: 1, isKitCheckToolLend: true },
				});
				const rows = (result.list as MaterialTrans[]) ?? [];
				const matched = rows.find(trans => trans.transNo?.toLowerCase() === searchWord.toLowerCase())
					?? (rows.length === 1 ? rows[0] : null);
				if (!matched) {
					showToast('warn', '未找到唯一匹配的物流单，请输入完整物流单号');
					return;
				}
				await addTranses([matched]);
				transSearchWord.value = '';
			} catch (error: any) {
				showToast('error', error.message ?? '查询物流单失败', '错误');
			} finally {
				transSearchLoading.value = false;
			}
		};

		const renderHeader = () => h('div', { class: 'tools-picking__header' }, [
			h('div', { class: 'tools-picking__search' }, [
				h('span', { class: 'tools-picking__label' }, '物流单'),
				ui.factory.input(transSearchWord.value, {
					id: 'toolsPickingTransNo',
					name: 'toolsPickingTransNo',
					placeholder: '输入物流单号',
					class: 'tools-picking__search-input',
					onUpdate: (value: string) => { transSearchWord.value = value ?? ''; },
					onKeydown: (event: KeyboardEvent) => {
						if (event.key === 'Enter') searchTransDirectly();
					},
				}),
				ui.factory.button({
					id: 'toolsPickingSearch', icon: 'pi pi-search', label: '添加', size: 'small',
					loading: transSearchLoading.value, onAction: searchTransDirectly,
				}),
				ui.factory.button({
					id: 'toolsPickingOpenList', icon: 'pi pi-list', label: '批量选择', size: 'small',
					severity: 'secondary', outlined: true, onAction: openTransSearch,
				}),
			]),
			selectedTranses.value.length
				? h('div', { class: 'tools-picking__trans-tabs' }, [
					...selectedTranses.value.map(trans => h('button', {
						type: 'button',
						class: ['tools-picking__trans-tab', { 'is-active': currentTransID.value === String(trans.transID) }],
						onClick: () => { currentTransID.value = String(trans.transID); },
					}, [
						h('i', { class: 'pi pi-truck' }),
						h('span', trans.transNo ?? String(trans.transID)),
						h('i', {
							class: 'pi pi-times tools-picking__trans-remove',
							onClick: (event: MouseEvent) => {
								event.stopPropagation();
								removeTrans(String(trans.transID));
							},
						}),
					])),
					button({ type: 'button', class: 'tools-picking__clear', onClick: clearTranses }, '清空'),
				])
				: h('span', { class: 'tools-picking__header-hint' }, '可添加多个物流单后统一指定器具'),
		]);

		function button(props: Record<string, unknown>, text: string) {
			return h('button', props, text);
		}

		const getItemClass = (selectedCount: number, quantity: number, active: boolean) => ({
			'tools-picking__item': true,
			'is-active': active,
			'is-complete': selectedCount >= quantity && selectedCount > 0,
			'has-selection': selectedCount > 0,
		});

		const renderLeftPanel = () => h('div', { class: 'tools-picking__left' }, [
			h('div', { class: 'tools-picking__panel-title' }, [
				h('span', currentTrans.value ? `物料清单 · ${currentTrans.value.transNo}` : '物料清单'),
				currentTrans.value ? h('span', `${currentItems.value.length} 项`) : null,
			]),
			h('div', { class: 'tools-picking__item-list' }, [
				!currentTrans.value
					? renderEmpty('pi pi-truck', '请先添加物流单')
					: currentItems.value.length === 0
						? renderEmpty('pi pi-inbox', '该物流单没有物料项')
						: currentItems.value.map(item => {
							const itemID = String(item.itemID);
							const selectedCount = currentState.value?.selectedToolsMap[itemID]?.length ?? 0;
							const quantity = Number(item.quantity) || 0;
							return h('button', {
								type: 'button',
								class: getItemClass(selectedCount, quantity, selectedItemID.value === itemID),
								onClick: () => selectItem(itemID),
							}, [
								h('span', { class: 'tools-picking__item-code' }, `#${item.itemID}`),
								h('span', { class: 'tools-picking__item-name' }, item.materialName || item.materialCode || '(无名称)'),
								h('span', { class: 'tools-picking__item-meta' }, item.materialCode ?? ''),
								h('span', { class: 'tools-picking__item-count' }, [
									h('strong', String(selectedCount)),
									` 已选 / ${quantity} 需求`,
								]),
							]);
						}),
		]),
	]);

		function renderEmpty(icon: string, text: string) {
			return h('div', { class: 'tools-picking__empty' }, [h('i', { class: icon }), h('span', text)]);
		}

		const buildColumns = () => [
				ui.factory.column(
					{ header: ' ', style: { width: '48px', textAlign: 'center' as const } },
					{
						body: ({ data }: { data: ToolRow }) => {
							const reason = getDisabledReason(data);
							return h('span', { title: reason || undefined }, [ui.factory.checkbox(Boolean(data.__checked), {
								binary: true,
								disabled: Boolean(reason),
								onUpdate: () => handleToggleOne(data),
							})]);
						},
					},
				),
				ui.factory.column({ header: '器具编号', field: 'toolNo', style: { width: '150px' } }),
				ui.factory.column({ header: '序列号', field: 'serialNo', style: { width: '140px' } }),
				ui.factory.column({ header: '器具名称', field: 'toolName', style: { width: '180px' } }),
				ui.factory.column({ header: '规格', field: 'specs', style: { width: '130px' } }),
				ui.factory.column(
					{ header: '状态', field: 'status', style: { width: '90px' } },
					{ body: ({ data }: { data: ToolRow }) => h('span', { class: 'tools-picking__status' },
						String(data.status ? ToolStatusEnum[`${data.status}_TEXT` as keyof typeof ToolStatusEnum] ?? data.status : '-')) },
				),
				ui.factory.column(
					{ header: '可用性', style: { width: '210px' } },
					{ body: ({ data }: { data: ToolRow }) => {
						const reason = getDisabledReason(data);
						return h('span', { class: ['tools-picking__availability', { 'is-disabled': Boolean(reason) }] },
							reason || (data.__checked ? '已选择' : '可选择'));
					} },
				),
			];

		const renderRightPanel = () => {
			if (!currentTrans.value) return renderEmpty('pi pi-truck', '从上方添加并选择物流单');
			if (!selectedItemID.value) return renderEmpty('pi pi-arrow-left', '从左侧选择一个物料项');

			const selectedCount = currentSelectedTools.value.length;
			const quantity = Number(currentItem.value?.quantity) || 0;
			return h('div', { class: 'tools-picking__right' }, [
				h('div', { class: 'tools-picking__context' }, [
					h('div', [
						h('span', { class: 'tools-picking__context-label' }, '当前物料'),
						h('strong', `#${currentItem.value?.itemID} ${currentItem.value?.materialName || currentItem.value?.materialCode || ''}`),
					]),
					h('div', { class: 'tools-picking__selection-count' }, [
						ui.factory.checkbox(allEditableSelected.value, {
							binary: true,
							disabled: editableTools.value.length === 0,
							label: '全选',
							onUpdate: handleToggleAll,
						}),
						h('strong', String(selectedCount)),
						h('span', `已选 · ${quantity} 需求（不限制数量）`),
					]),
			]),
				h('div', { class: 'tools-picking__table', key: `${currentTransID.value}-${selectedItemID.value}` }, [
					toolsLoading.value
						? h('div', { class: 'tools-picking__loading' }, [ui.factory.loading({}), h('span', '器具加载中…')])
						: tableTools.value.length
							? ui.factory.primeVueTable(tableTools.value as any, buildColumns() as any, {
								scrollable: true,
								scrollHeight: 'flex',
								dataKey: 'id',
								emptyMessage: '没有匹配的器具',
								rowClass: (data: ToolRow) => getDisabledReason(data) ? 'tools-picking__disabled-row' : '',
							} as any)
							: renderEmpty('pi pi-wrench', '该物料没有匹配的器具'),
			]),
		]);
		};

		const renderFooter = () => h('div', { class: 'tools-picking__footer' }, [
			h('span', [h('strong', String(selectedTransIDs.value.length)), ' 个物流单']),
			h('span', [h('strong', String(itemCountWithSelections.value)), ' 个物料项']),
			h('span', [h('strong', String(totalSelectedCount.value)), ' 个器具']),
			submitLoading.value ? h('span', { class: 'tools-picking__submitting' }, '正在批量提交…') : null,
		]);

		return () => h('div', { class: 'tools-picking' }, [
			renderHeader(),
			uiBuilder.buildContainer([
				uiBuilder.buildAside(renderLeftPanel(), { width: '320px', class: 'tools-picking__aside' }),
				uiBuilder.buildMain(renderRightPanel(), { class: 'tools-picking__main' }),
			], { class: 'tools-picking__body' }),
			renderFooter(),
		]);
	},
});

export default ToolsPicking;
