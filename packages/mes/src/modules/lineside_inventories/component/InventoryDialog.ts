import { defineComponent, type SlotsType, ref, type Ref, reactive, h, onBeforeMount, getCurrentInstance, type PropType, VNode } from 'vue';
import type { Entity, EntitySearchParam, Pager, Pagination, PagedList, UiContext } from "@mmda/core";
import { isRefNone, isFunction, isArray, isObject, MetaUiFieldAlignmentEnum, MetaUiFieldAlignment, MetaModel, } from '@mmda/core';
import { CustomColumn, type UiBuildContext } from "@mmda/vui";
import { useRouter } from 'vue-router';
import { defaultSummaryMethod } from '@/compat/primevue_legacy'


export default defineComponent({
    name: 'InventoryDialog',
    props: {
        context: { type: Object as PropType<UiBuildContext<any>>, default: null },
    },
    setup(props, ctx) {
        const { uiBuilder, globalProps } = props.context;
        const { $t } = globalProps;
        const lockMsgSearchParams = reactive({
            pager: {
                pageSize: 10,
                pageNo: 1,
            },
            searchWord: '',
            searchParams: {},
        });
        const recordCount = ref(0); //记录总数0
        const pageFn = (pager: Pager) => {
            lockMsgSearchParams.pager = Object.assign({}, lockMsgSearchParams.pager, pager);
            lockMsgTreeLoading.value = true;
            getLockMsg();
        };

        const lockMsgTree: Ref<any[]> = ref([]);
        const lockMsgExpandedRow = ref<any>({});
        const lockMsgTreeLoading: Ref<boolean> = ref(false);
        const getLockMsg = async () => {
            lockMsgTreeLoading.value = true;
            return await props.context.apiClient
                .getAll({
                    repository: 'LinesideInventories',
                    service: 'mes',
                    path: 'lockMsg',
                    queryParams: {
                        lockMsg: true,
                        searchWord: lockMsgSearchParams.searchWord,
                        ...lockMsgSearchParams.pager,
                        ...lockMsgSearchParams.searchParams,
                        // siteID: this.selectedWorksite.value?.siteID ?? '',
                        // projectID: this.searchParams.projectID ?? ''
                    },
                })
                .then((res: PagedList<any>) => {
                    lockMsgTreeLoading.value = false;
                    lockMsgTree.value = res.list;
                    recordCount.value = res.pagination.recordCount;
                });
        };

        onBeforeMount(() => {
            getLockMsg();
        });

        const lockMsgColumns: CustomColumn[] = [
            {
                field: 'materialCode',
                header: $t('view.materialCode'),
                width: 150,
            },
            {
                field: 'materialName',
                header: $t('view.materialName'),
            },
            {
                field: 'unit',
                header: $t('inventory.unit'),
                width: 50,
            },
            {
                field: 'lockQty',
                header: $t('inventory.lockedQuantity'),
                aggregation: true,
            },
            {
                field: 'unLockQty',
                header: $t('inventory.availableQuantity'),
                aggregation: true,
            },
        ];

        return () =>
            h('div', { class: 'w-full flex_column', style: { height: '100%' } }, [
                h(
                    'div',
                    {
                        class: 'flex_content_start flex_item_center h-auto',
                    },
                    [
                        uiBuilder.factory.formItem({
                            role: 'dlg-searchWord',
                            id: 'dlg-searchWord',
                            label: $t('action.searchFuzzy'),
                            name: 'searchWord',
                            placeholder: $t('action.input'),
                            modelValue: lockMsgSearchParams.searchWord,
                            style: {
                                width: 'auto',
                                flex: 'none',
                            },
                            onUpdate: (val: string) => (lockMsgSearchParams.searchWord = val),
                            onEnterDown: async (e: KeyboardEvent) => {
                                await getLockMsg();
                            },
                        }),
                        uiBuilder.factory.buttonGroup(
                            () => [
                                uiBuilder.factory.actionButton(
                                    {
                                        name: 'search',
                                        colorRole: 'primary',
                                        onAction: async () => {
                                            await getLockMsg();
                                        },
                                    },
                                    $t,
                                    true,
                                    { id: `dlg-search-button` }
                                ),
                            ],
                            { role: 'dlg-search-button-group' }
                        ),
                    ]
                ),
                h(
                    'div',
                    {
                        class: 'flex-1 overflow-y-scroll',
                    },
                    lockMsgTreeLoading.value
                        ? uiBuilder.factory.loading()
                        : uiBuilder.factory.primeVueTable(
                            lockMsgTree.value,
                            [
                                uiBuilder.factory.column({
                                    header: '',
                                    expander: true,
                                    style: {
                                        width: '3rem',
                                    },
                                }),
                                ...lockMsgColumns.map((col: CustomColumn) =>
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
                                            pt: {
                                                columnHeaderContent: (o: any) => {
                                                    return {
                                                        style: {
                                                            justifyContent: 'center',
                                                        },
                                                    };
                                                },
                                                bodyCell: (o: any) => {
                                                    const { attrs, parent, props, context: ctx } = o;

                                                    return {
                                                        class: `${props.field}`,
                                                        style: {
                                                            width: `${col.width ?? 100}px`,
                                                            maxWidth: `${col.maxWidth ?? 200}px`,
                                                        },
                                                    };
                                                },
                                            },
                                        },
                                        {
                                            footer: col.aggregation
                                                ? ({ column }: any) => {
                                                    // 判断是否是列表页（判断原因：展示合计的数据结构不同）
                                                    return uiBuilder.factory.textSpan(
                                                        lockMsgTree.value
                                                            .reduce((prev: any, curr: any) => {
                                                                return Number(isObject(prev) ? prev[col.field] : prev) + Number(curr[col.field]);
                                                            }, 0)
                                                            .toPrecise()
                                                            .thousandDigitFormat()
                                                            .toString(),
                                                        {
                                                            class: `${column.key === 'lockQty' ? 'text-red-600' : column.key === 'unLockQty' ? 'text-green-600' : ''}`,
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
                            ],
                            {
                                dataKey: (data: any) => (data.id ? data : props.context.logic.createEntity(data)).id,
                                expandedRows: lockMsgExpandedRow.value,
                                tableId: `lockMsg`,
                                scrollable: true,
                                lazy: false,
                                class: 'col-span-full',
                            },
                            {
                                expansion: ({ data, index }: any) => {
                                    const columns = props.context.metaui.getListedFields().map(f =>
                                        uiBuilder.factory.column(
                                            {
                                                header: f.displayLabel,
                                                field: f.fieldName,
                                                frozen: !!props.context.getFieldLogic(f)?.frozen,
                                                alignFrozen: props.context.getFieldLogic(f)?.frozen,
                                                columnKey: f.fieldName,
                                                key: f.fieldName,
                                                sortable: f.sortable ?? true,
                                                style: {
                                                    'z-index': props.context.getFieldLogic(f)?.frozen ? 99 : 1,
                                                    width: `${uiBuilder._tableColumnWidth(f)}px`,
                                                    maxWidth: `${uiBuilder._tableColumnWidth(f)}px`,
                                                    'text-align': MetaUiFieldAlignmentEnum.valueOf(f.align ?? MetaUiFieldAlignment.LEFT),
                                                },
                                                pt: {
                                                    columnHeaderContent: (o: any) => {
                                                        return {
                                                            style: {
                                                                justifyContent: MetaUiFieldAlignmentEnum.valueOf(f.align ?? MetaUiFieldAlignment.LEFT),
                                                            },
                                                        };
                                                    },
                                                    bodyCell: (o: any) => {
                                                        const { attrs, parent, props, context: ctx } = o;

                                                        return {
                                                            class: `${props.field}`,
                                                            style: {
                                                                width: `${uiBuilder._tableColumnWidth(f)}px`,
                                                                maxWidth: `${uiBuilder._tableColumnWidth(f)}px`,
                                                            },
                                                        };
                                                    },
                                                },
                                            },
                                            {
                                                body: props.context.getFieldLogic(f)?.customRenderer
                                                    ? (slotProps: any) => props.context.getFieldLogic(f)?.customRenderer?.(f, props.context.with(slotProps.data, props.context.metaui.primaryKey))
                                                    : (slotProps: any) => uiBuilder._tableCell(f, props.context.with(slotProps.data, props.context.metaui.primaryKey)),
                                                footer: f.aggregationSet ? ({ column }: any) => {

                                                    return uiBuilder.factory.textSpan(
                                                        (isFunction(props.context.getFieldLogic(f)?.aggregateFn) ? props.context.getFieldLogic(f)?.aggregateFn(props.context as unknown as UiContext<Entity>, f, data.inventories).toPrecise().thousandDigitFormat() : defaultSummaryMethod(f, data.inventories.filter((item: any) => !MetaModel.deleted(item)))).toString(), {
                                                        style: {
                                                            width: '100%',
                                                            textAlign: 'center',
                                                            fontWeight: 'bold'
                                                        }
                                                    })
                                                } : null
                                            }
                                        )
                                    );

                                    return uiBuilder.factory.primeVueTable(data.inventories, columns, {
                                        virtualScrollerOptions: {
                                            id: 'id',
                                            itemSize: 50,
                                            numToleratedItems: 10,
                                        },
                                        scrollHeight: '180px',
                                    });
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
                ),
                uiBuilder.factory.paginator(
                    lockMsgSearchParams.pager,
                    {
                        totalRecords: recordCount.value,
                        onPage(pager: any) {
                            pageFn(pager);
                        },
                    },
                    {
                        start: (slotProps: any) =>
                            h(
                                'div',
                                {},
                                props.context.globalProps.$t('view.recordCount', {
                                    it: recordCount.value,
                                })
                            ),
                    }
                ),
            ]);
    },
})