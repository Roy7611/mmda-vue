import { defineComponent, type SlotsType, ref, type Ref, reactive, h, onBeforeMount, getCurrentInstance, type PropType, VNode } from 'vue';
import type { Entity, EntitySearchParam, Pager, Pagination, PagedList, UiContext } from "@mmda/core";
import { isRefNone, isFunction, isArray, isObject, MetaUiFieldAlignment, MetaModel, toPrecise, thousandDigitFormat } from '@mmda/core';
import { CustomColumn, type VuiContext } from "@mmda/vui";
import { useRouter } from 'vue-router';
import { defaultSummaryMethod } from '@/compat/primevue_legacy'
import { plainTableColumn, renderPlainTable } from '@/components/plain_table'


const InventoryDialog = defineComponent({
    name: 'InventoryDialog',
    props: {
        context: { type: Object as PropType<VuiContext<any>>, default: null },
    },
    setup(props, ctx) {
        const { uiBuilder } = props.context;
        const t = props.context.t.bind(props.context);
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
            return await (props.context.logic?.apiClient ?? props.context.app?.api)
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
                header: t('view.materialCode'),
                width: 150,
            },
            {
                field: 'materialName',
                header: t('view.materialName'),
            },
            {
                field: 'unit',
                header: t('inventory.unit'),
                width: 50,
            },
            {
                field: 'lockQty',
                header: t('inventory.lockedQuantity'),
                aggregation: true,
            },
            {
                field: 'unLockQty',
                header: t('inventory.availableQuantity'),
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
                        uiBuilder.factory.formField({
                            role: 'dlg-searchWord',
                            label: t('action.searchFuzzy'),
                            placeholder: t('action.input'),
                            value: lockMsgSearchParams.searchWord,
                            style: {
                                width: 'auto',
                                flex: 'none',
                            },
                            onChange: (val: string) => (lockMsgSearchParams.searchWord = val),
                            onKeydown: async (e: KeyboardEvent) => {
                                if (e.key === 'Enter') await getLockMsg();
                            },
                        }),
                        uiBuilder.factory.buttonGroup(
                            { role: 'dlg-search-button-group' },
                            {
                                default: () => [
                                    uiBuilder.factory.actionButton(
                                        {
                                            name: 'search',
                                            colorRole: 'primary',
                                            onAction: async () => {
                                                await getLockMsg();
                                            },
                                        },
                                        t,
                                        true,
                                        { id: `dlg-search-button` }
                                    ),
                                ],
                            }
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
                        : renderPlainTable(
                            lockMsgTree.value,
                            [
                                plainTableColumn({
                                    header: '',
                                    expander: true,
                                    style: {
                                        width: '3rem',
                                    },
                                }),
                                ...lockMsgColumns.map((col: CustomColumn) =>
                                    plainTableColumn(
                                        {
                                            header: col.header,
                                            field: col.field,
                                            style: {
                                                'z-index': 99,
                                                width: `${col.width ?? 100}px`,
                                                maxWidth: `${col.maxWidth ?? 200}px`,
                                                'text-align': 'center',
                                            },
                                        },
                                        {
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
                                    const columns = props.context.metaUi.getListedFields().map(f =>
                                        plainTableColumn(
                                            {
                                                header: f.displayLabel,
                                                field: f.fieldName,
                                                style: {
                                                    'z-index': f.frozen ? 99 : 1,
                                                    width: `${(f as { width?: number }).width ?? 100}px`,
                                                    maxWidth: `${(f as { width?: number }).width ?? 100}px`,
                                                    'text-align': (f.align ?? MetaUiFieldAlignment.LEFT).toLowerCase(),
                                                },
                                            },
                                            {
                                                body: props.context.getFieldLogic(f)?.customRenderer
                                                    ? (slotProps: any) => props.context.getFieldLogic(f)?.customRenderer?.(f, props.context.with(slotProps.data, props.context.metaUi.primaryKey))
                                                    : (slotProps: any) => props.context.displayField(f, slotProps.data),
                                            }
                                        )
                                    );

                                    return renderPlainTable(data.inventories, columns, {
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
                                        uiBuilder.factory.textSpan({ text: props.context.t('state.noData') })
                                    );
                                },
                            }
                        )
                ),
                h(
                    'div',
                    { class: 'mmda-paginator-record-count' },
                    props.context.t('view.recordCount', { it: recordCount.value })
                ),
                uiBuilder.factory.paginator({
                    pagination: {
                        pageNo: lockMsgSearchParams.pager.pageNo,
                        pageSize: lockMsgSearchParams.pager.pageSize,
                        recordCount: recordCount.value,
                    },
                    onPage(pager: any) {
                        pageFn(pager);
                    },
                }),
            ]);
    },
})

export default InventoryDialog

export function inventoryDialogNode(props?: Record<string, any>) {
    return h(InventoryDialog, props as any)
}
