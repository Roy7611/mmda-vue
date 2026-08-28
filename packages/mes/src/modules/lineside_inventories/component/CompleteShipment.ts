/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2026-01-15 10:07:29
 * @LastEditors: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @LastEditTime: 2026-02-06 11:58:58
 * @FilePath: /mmda-vue/packages/mes/src/modules/lineside_inventories/component/CompleteShipment.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineComponent, type SlotsType, inject, ref, type Ref, watch, reactive, h, onBeforeMount, getCurrentInstance, type PropType, VNode, computed, toRaw } from 'vue';
import type { EntitySearchParam, Pager, Pagination, PagedList, MetaUi, } from "@mmda/core";
import { isRefNone, isFunction, isArray, isObject, MetaUiFieldAlignmentEnum, debounce, MetaUiFieldAlignment, MetaModel, emptyPagedList, } from '@mmda/core';
import { UiBuildContext, type UiSearchField, type UiCustomSearchField, type CustomColumn } from '@mmda/vui';
import { defaultSummaryMethod } from '@/compat/primevue_legacy'
import { useRouter, useRoute } from 'vue-router';
import { MES_KEY } from '@/keys';
import type { Bom } from '@/models/Bom';
import { BomLogic, BomLogicCtor } from '@/modules/boms/BomLogic';
import type { Worksite } from "@/models/Worksite";

export default defineComponent({
    name: 'CompleteShipment',
    props: {
        context: { type: Object as PropType<UiBuildContext<any>>, default: null },
    },
    setup(props, ctx) {
        const { uiBuilder, globalProps, apiClient } = props.context;
        const { $t } = globalProps;
        const mes = inject(MES_KEY);
        const { meta: metaUiService, di, i18n, ui } = mes;
        const router = useRouter();
        const route = useRoute();
        const bomLogic = di.inject<BomLogic>('BomLogic', {
            ctor: () => BomLogicCtor(metaUiService, router),
            options: { lifetime: 'scoped' }
        })
        const bomCtx = new UiBuildContext<any>({
            model: emptyPagedList<Bom>(),
            metaui: bomLogic.meta.metaui,
            view: props.context.view,
            logic: bomLogic,
            app: props.context.app,
        });
        bomCtx.isEditDialog = true


        const panelLoading = ref(false)

        const bomList = ref()
        const getBomList = async () => {
            panelLoading.value = true;
            const projectID = bomLogic.searchParams.projectID ?? props.context.logic.searchParams.projectID // 获取线边库存的搜索参数
            return await apiClient
                .getAll({
                    repository: 'Boms',
                    service: 'mes',
                    queryParams: {
                        searchWord: bomLogic.searchParams.searchWord,
                        bomType: bomLogic.searchParams.bomType,
                        status: 'IN+APPROVED',
                        projectID,
                    },
                })
                .then((res: PagedList<any>) => {
                    bomList.value = res.list;
                    res.list.forEach((bom: Bom) => {
                        completeSetOfData.value.push({
                            refName: 0,
                            refID: bom.bomID,
                        })
                    })
                }).catch((err: any) => {
                    uiBuilder.toast(bomCtx, {
                        severity: 'error',
                        summary: bomCtx.t('dialog.title.error'),
                        detail: err.message ?? err,
                        group: 'br',
                        life: 3000
                    })
                }).finally(() => {
                    panelLoading.value = false;
                })
        };

        onBeforeMount(async () => {
            panelLoading.value = true;
            await bomCtx.init().then(() => {
                if (bomCtx.searchFields) {
                    const revokeSeachFileds = ['status', 'bomUsage',]; // 在原始搜索条件中移除的搜索条件
                    bomCtx.searchFields = bomCtx.searchFields.filter((sf: UiSearchField) => !revokeSeachFileds.includes(sf.field.fieldName))
                    bomCtx.searchFields.forEach((sf: UiSearchField) => {
                        // 默认值取自线边库存的搜索参数
                        if (sf.field.fieldName === 'projectID') {
                            const defaultValue = props.context.customSearchFields.filter((sf: UiCustomSearchField) => sf.searchParam === 'projectID').map((sf: UiCustomSearchField) => sf.searchVal.value)[0]
                            if (isObject(defaultValue)) {
                                sf.searchVal.value = defaultValue
                                const fldOptions = bomCtx.getFieldOptions(sf.field)
                                // fldOptions.cachedSelectOption = defaultValue
                                fldOptions.selectOptions.push(defaultValue)
                                sf.searchWord = defaultValue
                                sf.valueFn = (value) => sf.field.reference.valueOf(value)
                            }
                        }
                    })
                }
            })
        })

        // 对话框
        const dialogRef: any = inject('dialogRef')

        //#region 选择
        // 齐套数据
        const completeSetOfData = ref<{
            refName: string | number; // 需齐套数量
            refID: number | string; // bomID
        }[]>([])
        // 选择的齐套数据
        const selectedCompleteSetOfData = computed(() => {
            return completeSetOfData.value.filter((cs: any) => cs.refName != 0)
        })

        // 选中数据
        const selectedData = ref<string[]>([])

        const kitCompleteness = ref<any[]>([])
        // 监听选择的Bom数据，获取齐套数据
        watch(() => selectedData.value, (newVal) => {
            if (newVal.length) kitCompletenessFn()
            else {
                kitCompleteness.value = []
                kittingResults.value = [] 
            }
        }, { deep: true, immediate: true })

        const kitCompletenessLoading = ref(false)
        const kitCompletenessFn = async () => {
            kitCompletenessLoading.value = true
            if (!selectedCompleteSetOfData.value.length) {
                kitCompletenessLoading.value = false
                return uiBuilder.toast(bomCtx, {
                    severity: 'error',
                    summary: bomCtx.t('dialog.title.error'),
                    detail: '请选择齐套数据',
                    group: 'br',
                    life: 3000
                })
            }
            await apiClient.http.postJson('/mes/LinesideInventories/shipKitting', {
                refItemKeys: selectedCompleteSetOfData.value
            }).then(async (res: any) => {
                kitCompleteness.value = res.bomKittings
                if (!kittingResults.value.length) {
                    kittingResults.value = res.bomKittings.map((item: any) => {
                        return {
                            bomID: item.refID,
                            kitQty: item.kitQty,
                            lessQty: item.lessQty,
                            siteID: '',
                        }
                    })
                } else {
                    const refIDs = new Set(res.bomKittings.map((b: any) => String(b.refID)))
                    res.bomKittings.forEach((item: any) => {
                        const ktIndex = kittingResults.value.findIndex((kit: KittingResult) => String(kit.bomID) === String(item.refID))
                        if (ktIndex != -1) {
                            kittingResults.value[ktIndex].kitQty = item.kitQty
                            kittingResults.value[ktIndex].lessQty = item.lessQty
                        } else {
                            kittingResults.value.push({
                                bomID: item.refID,
                                kitQty: item.kitQty,
                                lessQty: item.lessQty,
                                siteID: '',
                            })
                        }
                    })
                    // 移除已取消选择的制品对应的齐套结果
                    kittingResults.value = kittingResults.value.filter((kt: KittingResult) => refIDs.has(String(kt.bomID)))
                }
                // 齐套数据加载后，为每行拉取站点列表，仅一条时会在 getAllWorkSites 中自动选中
                siteSearchword.value = '';
                worksitePager.pageNo = 1;
                for (let i = 0; i < kitCompleteness.value.length; i++) {
                    const rowData = kitCompleteness.value[i];
                    const ktIdx = kittingResults.value.findIndex(kt => String(kt.bomID) === String(rowData?.refID));
                    if (ktIdx !== -1) await getAllWorkSites(rowData, ktIdx);
                }
            }).finally(() => {
                kitCompletenessLoading.value = false
            })
        }

        // 搜索栏
        const searchBar: () => VNode = () => uiBuilder.buildModuleSearchbar(bomCtx);

        // 选择面板
        const selectPanel = () => {
            return h('div', { class: 'w-full h-full flex flex-col p-4 gap-4' }, [
                // 制品列表
                uiBuilder.factory.dataViewBox({
                    value: bomList.value,
                    showLayout: false,
                    paginator: false,
                    // max-h-[45vh]
                    class: 'flex-1 overflow-y-auto p-2!',
                    listStyle: { background: 'var(--ground-background)' }
                }, {
                    item: (item: any, index: number) => {
                        const isSelected = selectedData.value.includes(item.bomID);

                        return h('div', {
                            class: `bg-white rounded-xl shadow-md mb-4 p-3 transition-all duration-300 ease-in-out transform hover:translate-y-1 ${isSelected ? 'border-2 border-blue-500 bg-[#F0F7FF]' : 'bg-white border border-gray-200'}`
                        }, [
                            // 卡片内容：左图右文布局
                            h('div', { class: 'flex items-start' }, [
                                // 图片区域
                                h('div', { class: 'w-16 h-16 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg mr-4 relative' }, [
                                    // 如果有图片则显示图片，否则显示产品图标
                                    item.productPic
                                        ? uiBuilder.factory.image(item.productPic, {
                                            width: '64',
                                            height: '64',
                                            preview: false,
                                            class: 'object-cover rounded-md'
                                        })
                                        : h('i', {
                                            class: 'pi pi-box text-2xl text-gray-400',
                                            style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }
                                        }),
                                    // 选中状态的对勾图标
                                    isSelected && h('div', {
                                        class: 'absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10',
                                    }, [
                                        h('i', { class: 'pi pi-check' })
                                    ])
                                ]),

                                h('div', { class: 'flex-1 min-w-0 break-words pr-2' }, [
                                    h('div', { class: 'font-semibold text-gray-800 text-base leading-tight' }, [
                                        `${item.productName}`
                                    ]),
                                    h('div', { class: 'text-sm text-gray-600 mt-1' }, [
                                        `(${item.productCode})`
                                    ]),
                                    h('div', { class: 'text-sm text-gray-500 mt-1' }, [
                                        `项目: ${item?.project?.projectName ?? '-'}`
                                    ]),
                                ]),

                                // 操作区域
                                h('div', { class: 'ml-2 flex flex-col items-end justify-center' }, [
                                    isSelected ? h('div', { class: 'flex items-center space-x-2' }, [
                                        // 数量输入框
                                        uiBuilder.factory.numberInput({
                                            //通过 bomID 找到对应的数据
                                            modelValue: completeSetOfData.value.find((sd: any) => sd.refID === item.bomID)?.refName || 0,
                                            min: 0,
                                            class: 'w-32',
                                            onUpdate: (val: number) => {
                                                const dataIndex = completeSetOfData.value.findIndex((sd: any) => sd.refID === item.bomID);
                                                if (val == completeSetOfData.value[dataIndex].refName) return;
                                                if (dataIndex !== -1) {
                                                    if (val > 0) {
                                                        completeSetOfData.value[dataIndex].refName = val;
                                                    } else {
                                                        // 如果数量变为0，取消选择该项目
                                                        completeSetOfData.value[dataIndex].refName = 0;
                                                        selectedData.value = selectedData.value.filter((sd: any) => sd !== item.bomID);
                                                    }
                                                    kitCompletenessFn();
                                                }
                                            }
                                        }),
                                    ])
                                        : h('div', { class: 'flex items-center' }, [
                                            uiBuilder.factory.button({
                                                id: `select-${item.bomID}`,
                                                name: `select-${item.bomID}`,
                                                icon: 'pi pi-plus',
                                                label: '选择',
                                                severity: 'secondary',
                                                outlined: true,
                                                class: 'hover:bg-gray-50 transition-colors duration-200 rounded-lg',
                                                onAction: () => {
                                                    selectedData.value.push(item.bomID);
                                                    const dataIndex = completeSetOfData.value.findIndex((sd: any) => sd.refID === item.bomID);
                                                    if (dataIndex !== -1) {
                                                        completeSetOfData.value[dataIndex].refName = 1;
                                                    }
                                                },
                                                role: `select-action`,
                                            }),
                                        ])
                                ])
                            ])
                        ]);
                    }
                }),
            ])
        }
        //#endregion

        //#region 齐套结果
        const kittingResultColumns: CustomColumn[] = [
            {
                field: 'materialCode',
                header: '物料编码',
                width: 200,
            },
            {
                field: 'materialName',
                header: '物料名称',
                width: 150,
            },
            // {
            //     field: 'projectName',
            //     header: '项目名称',
            //     width: 240,
            //     maxWidth: 300,
            // },
            {
                field: 'unit',
                header: '单位',
                width: 50,
            },
            // {
            //     field: 'specs',
            //     header: '规格',
            //     width: 300,
            //     maxWidth: 300,
            // },
            {
                field: 'kitQty',
                header: '齐套数量',
                aggregation: true,
                frozen: 'right',
            },
            {
                field: 'lessQty',
                header: '缺失数量',
                aggregation: true,
                frozen: 'right',
            },
            {
                field: 'needQty',
                header: '需求数量',
                aggregation: true,
                frozen: 'right',
            },
        ]; // 齐套结果列

        interface KittingResult {
            bomID: string,
            kitQty: number | string,
            lessQty: number | string,
            siteID: string,
            searchVal?: any,
            workSites?: Worksite[], // 工作中心
        }
        const kittingResultExpandedRow = ref<any>({}); // 展开行
        const kittingResults = ref<KittingResult[]>([]); // 选中的齐套结果
        // 选择的发货数据
        const selectedKittingResult = computed(() => {
            return kittingResults.value.filter((kr: any) => kr.siteID)
        })
        const dataKeyFn = (data: any) => `${data.siteID},${data.partNo},${data.qaStatus}` // 数据key
        const selectedSite = ref<any>(null); // 选中的站点
        const worksitePager = reactive({ // 分页
            pageSize: 10,
            pageNo: 1,
            recordCount: 0
        });
        const siteSearchword = ref<string>('');
        const getAllWorkSites = async (kitCompletenes: any, index: number) => {
            return await apiClient.getAll({
                repository: 'Worksites',
                service: 'mes',
                queryParams: {
                    searchWord: siteSearchword.value,
                    pageNo: worksitePager.pageNo,
                    pageSize: worksitePager.pageSize,
                    siteType: 8, // 项目工地
                    siteID: kitCompletenes?.projectID ?? ''
                },
            }).then((res: PagedList<any>) => {
                if (index < 0 || index >= kittingResults.value.length) return;
                kittingResults.value[index].workSites = res.list;
                worksitePager.recordCount = res.pagination.recordCount;
                // 仅有一条可选站点时默认选中（需为完整站点对象且含 siteID，避免显示 [object Object]）
                const single = res.list?.[0];
                if (res.list?.length === 1 && single && single.siteID != null) {
                    kittingResults.value[index].searchVal = single;
                    kittingResults.value[index].siteID = single.siteID;
                }
            }).catch((error: any) => {
                uiBuilder.toast(bomCtx, {
                    severity: 'error',
                    summary: bomCtx.t('dialog.title.error'),
                    detail: error.message ?? error ?? '操作失败',
                    group: 'br',
                    life: 3000
                })
            })
        }
        /**
         * 发货
         * @returns {Promise<boolean>} 是否成功
         */
        const shipmentFn = async () => {
            if (!selectedKittingResult.value.length) {
                return uiBuilder.toast(bomCtx, {
                    severity: 'error',
                    summary: bomCtx.t('dialog.title.error'),
                    detail: '发货数量不能为0',
                    group: 'br',
                    life: 3000
                });
            }
            if (selectedKittingResult.value.filter((kr: any) => kr.lessQty > 0).length) {
                return uiBuilder.toast(bomCtx, {
                    severity: 'error',
                    summary: bomCtx.t('dialog.title.error'),
                    detail: `库存不足，无法完成发货!`,
                    group: 'br',
                    life: 3000
                });
            }
            // 发货
            return await apiClient.http.postJson('/mes/MaterialTranses/shipKittes', selectedKittingResult.value).then((res: any) => {
                if (res) {
                    uiBuilder.toast(bomCtx, {
                        severity: 'success',
                        summary: bomCtx.t('dialog.success'),
                        detail: '发货成功',
                        group: 'br',
                        life: 3000
                    });
                    kitCompleteness.value = [];
                    dialogRef.value.close();
                }
            }).catch((error: any) => {
                uiBuilder.toast(bomCtx, {
                    severity: 'error',
                    summary: bomCtx.t('dialog.title.error'),
                    detail: error.message ?? error ?? '操作失败',
                    group: 'br',
                    life: 3000
                })
                return false
            })
        }
        // 齐套结果面板
        const kittingResultPanel = () => kitCompletenessLoading.value ? uiBuilder.factory.loading() : h('div', { class: 'w-full h-full flex flex-col gap-4 overflow-hidden' }, [
            h('div', {
                class: 'flex-1 min-h-0 overflow-auto',
                style: { maxHeight: 'calc(100% - 60px)' }
            }, [
                uiBuilder.factory.primeVueTable(
                    kitCompleteness.value,
                    [
                        // 展开：仅当该行有子项数据时显示展开按钮，无数据时隐藏
                        uiBuilder.factory.column(
                            {
                                header: '',
                                style: {
                                    width: '3rem',
                                },
                            },
                            {
                                body: ({ data }: any) => {
                                    const hasChildren = data.childKittings?.length > 0;
                                    if (!hasChildren) return h('span');
                                    const key = dataKeyFn(data);
                                    const isExpanded = !!kittingResultExpandedRow.value[key];
                                    return h('button', {
                                        type: 'button',
                                        class: 'p-link p-button-text p-button-rounded',
                                        onClick: () => {
                                            const next = { ...kittingResultExpandedRow.value };
                                            if (isExpanded) {
                                                delete next[key];
                                            } else {
                                                next[key] = true;
                                            }
                                            kittingResultExpandedRow.value = next;
                                        },
                                    }, [
                                        h('i', { class: isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right' }),
                                    ]);
                                },
                            }
                        ),
                        // 内容
                        ...kittingResultColumns.map((col: CustomColumn) =>
                            uiBuilder.factory.column(
                                {
                                    header: col.header,
                                    field: col.field,
                                    columnKey: col.field,
                                    key: col.field,
                                    frozen: col.frozen ? true : false,
                                    alignFrozen: col.frozen ? col.frozen : null,
                                    style: {
                                        'z-index': 99,
                                        width: `${col.width ?? 100}px`,
                                        maxWidth: `${col.maxWidth ?? 200}px`,
                                        'text-align': 'center',
                                    },
                                },
                                {
                                    footer: col.aggregation
                                        ? ({ column }: any) => {
                                            // 判断是否是列表页（判断原因：展示合计的数据结构不同）
                                            return uiBuilder.factory.textSpan(
                                                kitCompleteness.value
                                                    .reduce((prev: any, curr: any) => {
                                                        return Number(isObject(prev) ? prev[col.field] : prev) + Number(curr[col.field]);
                                                    }, 0)
                                                    .toPrecise()
                                                    .thousandDigitFormat()
                                                    .toString(),
                                                {
                                                    class: `${column.key === 'lessQty' ? 'text-red-600 font-bold' : column.key === 'kitQty' ? 'text-green-600 font-bold' : 'font-bold'}`,
                                                    style: {
                                                        width: '100%',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                    },
                                                }
                                            );
                                        }
                                        : null,
                                }
                            )
                        ),
                        // 选择至站点
                        uiBuilder.factory.column(
                            {
                                header: '选择至站点',
                                field: 'worksite',
                                columnKey: 'worksite',
                                key: 'worksite',
                                frozen: true,
                                alignFrozen: 'right',
                                style: {
                                    'z-index': 99,
                                    width: `200px`,
                                    'text-align': 'center',
                                },
                            },
                            {
                                body: ({ column, data, index }: any) => {
                                    const ktIndex = kittingResults.value.findIndex(kt => String(kt.bomID) === String(data?.refID));
                                    if (ktIndex === -1) return h('span', { class: 'text-gray-400' }, '-');
                                    const row = kittingResults.value[ktIndex];
                                    // 站点显示文案：仅当 v 为站点对象时用 siteName，避免显示 [object Object]
                                    const optionLabel = (v: any) => {
                                        if (v == null) return '';
                                        if (typeof v === 'object' && v.siteName != null) return String(v.siteName);
                                        if (typeof v === 'string') return v;
                                        return '';
                                    };
                                    return uiBuilder.factory.searchForRelative({
                                        modelValue: row.searchVal,
                                        dataKey: 'siteID',
                                        optionLabel,
                                        class: 'w-full',
                                        options: row.workSites,
                                        toSearch: async (event: Event) => {
                                            // 打开弹窗时同步当前行的已选站点，避免沿用其他行的选中值
                                            selectedSite.value = kittingResults.value[ktIndex]?.searchVal ?? null;
                                            // 获取元数据字段
                                            const { metaui } = await props.context.logic!.loadMetadata('Worksites', 'mes');                                        
                                            const Columns = await uiBuilder.buildColumns(metaui, props.context, { cacheKey: metaui.primaryKey, });
                                            
                                            // 只自定义站点编码列
                                            const customSiteCodeColumn = uiBuilder.factory.column({
                                                header: '站点编码',
                                                field: 'siteCode',
                                                style: { width: '120px', textAlign: 'left' },
                                                body: (slotProps: any) => {
                                                    const siteData = slotProps.data;
                                                    return h('span', siteData.siteCode || '无编码');
                                                }
                                            });
                                            
                                            const columns = Columns.map((col:VNode) => {
                                                // 通过字段名找到站点编码列
                                                if (col.props?.field === 'siteCode') {
                                                    return customSiteCodeColumn;
                                                }
                                                return col;
                                            });
                                            uiBuilder.confirmDialog(
                                                uiBuilder.buildSearchForRelativeContent(columns, {
                                                    dataKey: metaui.primaryKey,
                                                    onSearch: async (params: any) => {
                                                        const { searchParams, reload, pager } = params;
                                                        siteSearchword.value = searchParams.searchWord;
                                                        await getAllWorkSites(data, ktIndex);
                                                        return { list: kittingResults.value[ktIndex].workSites, pager: worksitePager };
                                                    },
                                                    onPage: ({ pageNo, pageSize }: any) => {
                                                        worksitePager.pageNo = pageNo;
                                                        worksitePager.pageSize = pageSize;
                                                    },
                                                    onSelect: (selection: any, row: any) => {
                                                        selectedSite.value = selection;
                                                    },
                                                }),
                                                props.context,
                                                {
                                                    title: '至站点选择',
                                                    style: { width: '80vw', maxHeight: '95%' },
                                                    accept: async () => {
                                                        // 未选择至站点数据时给出明确提示，并阻止关闭弹窗
                                                        if (!selectedSite.value) {
                                                            uiBuilder.toast(bomCtx, {
                                                                severity: 'error',
                                                                summary: props.context.t('dialog.title.error'),
                                                                detail: '请选择至站点数据',
                                                                group: 'br',
                                                                life: 3000,
                                                            });
                                                            return false;
                                                        }

                                                        if (ktIndex === -1) return false;
                                                        kittingResults.value[ktIndex].searchVal = selectedSite.value;
                                                        kittingResults.value[ktIndex].siteID = selectedSite.value.siteID;
                                                    },
                                                }
                                            );
                                        },
                                        onUpdate: (value: any) => {
                                            if (!value) {
                                                kittingResults.value[ktIndex].siteID = '';
                                                kittingResults.value[ktIndex].searchVal = null;
                                            } else {
                                                kittingResults.value[ktIndex].searchVal = selectedSite.value = value || null;
                                                kittingResults.value[ktIndex].siteID = selectedSite.value.siteID;
                                            }
                                        },
                                        onInput: (value: string) => {
                                            debounce(async () => {
                                                siteSearchword.value = value;
                                                await getAllWorkSites(data, ktIndex);
                                            }, 500)();
                                        },
                                    });
                                }
                            }
                        )
                    ],
                    {
                        dataKey: dataKeyFn,
                        expandedRows: kittingResultExpandedRow.value,
                        tableId: `kittingResultTable`,
                        scrollable: true,
                        scrollHeight: 'calc(100% - 80px)',
                        rowClassName: (data: any, options: any) => {
                            const isSelected = selectedKittingResult.value.some((kr: any) =>
                                kr.bomID === data.bomID
                            );
                            return isSelected ? 'bg-[#F0F7FF]' : '';
                        },
                        lazy: false,
                        class: 'col-span-full',
                    },
                    {
                        expansion: ({ data, index }: any) => {
                            const columns = kittingResultColumns.map((col: CustomColumn) =>
                                uiBuilder.factory.column(
                                    {
                                        header: col.header,
                                        field: col.field,
                                        columnKey: col.field,
                                        key: col.field,
                                        style: {
                                            'z-index': 99,
                                            width: `${col.width ?? 100}px`,
                                            maxWidth: `${col.maxWidth ?? 200}px`,
                                            'text-align': 'center',
                                        },

                                    },
                                    {
                                        footer: col.aggregation && data.childKittings
                                            ? ({ column }: any) => {
                                                // 判断是否是列表页（判断原因：展示合计的数据结构不同）
                                                return uiBuilder.factory.textSpan(
                                                    data.childKittings
                                                        .reduce((prev: any, curr: any) => {
                                                            return Number(isObject(prev) ? prev[col.field] : prev) + Number(curr[col.field]);
                                                        }, 0)
                                                        .toPrecise()
                                                        .thousandDigitFormat()
                                                        .toString(),
                                                    {
                                                        class: `${column.key === 'lessQty' ? 'text-red-600 font-bold' : column.key === 'kitQty' ? 'text-green-600 font-bold' : 'font-bold'}`,
                                                        style: {
                                                            width: '100%',
                                                            textAlign: 'center',
                                                            fontWeight: 'bold',
                                                        },
                                                    }
                                                );
                                            }
                                            : null,
                                    }
                                )
                            )

                            return data.childKittings ? uiBuilder.factory.primeVueTable(data.childKittings, columns, {
                                dataKey: dataKeyFn,
                                scrollHeight: '220px',
                                scrollable: true, // 启用滚动
                                virtualScrollerOptions: {
                                    id: 'id',
                                    itemSize: 50,
                                    numToleratedItems: 10,
                                }
                                // todo 子表现未做选择，目前只允许选择父表
                            }) : h(
                                'div',
                                {
                                    class: 'flex_content_start flex_item_center',
                                },
                                uiBuilder.factory.textSpan(props.context.globalProps.$t('state.noData'))
                            );
                        },
                        empty: () => {
                            return h(
                                'div',
                                {
                                    class: 'flex_content_start flex_item_center',
                                },
                                uiBuilder.factory.textSpan(props.context.globalProps.$t('state.noData'))
                            );
                        },
                    }
                )
            ]),
            h('div', { class: 'flex justify-end items-center p-2 h-16 shrink-0 border-t border-gray-200' }, [
                uiBuilder.factory.button({
                    id: 'shipment',
                    name: 'shipment',
                    icon: 'pi pi-check',
                    label: '发货',
                    severity: 'success',
                    badge: (selectedKittingResult.value.length ?? 0).toString(),
                    // style: { width: '50px' },
                    style: {
                        minWidth: '100px',
                        height: '40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    onAction: () => shipmentFn(),
                    role: `shipment-action`,
                })
            ])
        ])


        //#endregion

        const main: () => VNode = () => uiBuilder.buildContainer(
            [
                uiBuilder.buildAside(
                    selectPanel(),
                    {
                        width: '450px',
                        class: 'p-4 h-full flex flex-col overflow-hidden',
                    }
                ),
                uiBuilder.buildMain(
                    kittingResultPanel(),
                    {
                        class: 'p-4 h-full flex flex-col',
                    }
                ),
            ],
            {
                class: 'flex-1 min-h-0',
            }
        )

        return () => panelLoading.value ? uiBuilder.factory.loading() : uiBuilder.buildContainer([searchBar(), main()], {
            role: 'complete-shipment',
            "data-module": props.context.module?.moduleCode,
            class: "flex_column",
        });
    },
})