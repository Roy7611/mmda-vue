import { isNullOrUndefined, MetaModel, MetaUiBuilder } from '@mmda/core';
import { defineComponent, h, getCurrentInstance, unref, ref, onMounted, reactive, onBeforeMount } from 'vue'

export const MaterialRItem = defineComponent({
    name: 'MaterialRItem',
    emits: ['getTepModel'],
    props: {
        proModel: Array as any,
        ctx: Object as any
    },
    setup: (props, { emit }) => {
        //最终提交的数据
        const submitData = reactive({
            data: []
        });
        const searchParam = reactive({
            pager: {
                pageSize: 10,
                pageNo: 1
            },
            searchWord: null,
            searchParams: {}
        })
        const tableDataKey = ref('id')
        const { $ui: ui, $router: router, $t: t, $confirm: confirm} = getCurrentInstance()?.app.config?.globalProperties as any;
        onBeforeMount(() => {
            // 实到数量默认值计算
            submitData.data = props.proModel.map((item: any) => (
                {
                    ...item,
                    arrivedQuantity: isNullOrUndefined(item.arrivedQuantity) ?  !isNullOrUndefined(props.ctx.model.reason) && props.ctx.model.reason.reasonName === '退料' ? Number(item.quantity - item.returnQuantity) :item.quantity : (item.arrivedQuantity > item.quantity ? 1 : Number(item.quantity - item.arrivedQuantity)),
                    qaStatus: MetaModel.getRefProp(item, 'qaStatus')
                }));
            submitFun()
        })
        //最终提交前处理的方法
        const submitFun = () => emit('getTepModel', submitData.data);

        const metaUi = MetaUiBuilder.create('MaterialRItem')
            .rowNumber('#')
            .field('materialCategory', t('inventory.materialCategory'))
            .field('materialCode', t('view.materialCode'))
            .field('materialName', t('view.materialName'))
            .field('quantity', t('inventory.quantity'))
            .field('arrivedQuantity', t('inventory.arrivedQuantity'))
            .field('unit', t('inventory.unit'))
            .field('brand', t('bom.brand'))
            .field('specs', t('bom.specification'))
            .field('modelType', t('inventory.materialTexture'))
            .field('usage', t('inventory.usage'))
            .field('leftOverQuantity', t('inventory.remainingQuantity'))
            .field('unitPrice', t('inventory.unitPrice'))
            .field('amount', t('inventory.amount'))
            .field('weight', t('inventory.weight'))
            .field('qaStatus', t('inventory.qualityStatus'))
            .field('packSize', t('inventory.packageSize'))
            .field('remark', t('inventory.remark'))
            .build();

        return () => props.ctx.uiBuilder.factory.table(
            submitData.data,
            metaUi,
            {
                tableId: 'material-r-item-table',
                fieldCellRenderers: {
                    arrivedQuantity: (_field: any, data: any) => ui.factory.numberInput({
                        style: { width: '140px' },
                        min: 0,
                        maxFractionDigits: 2,
                        modelValue: data.arrivedQuantity,
                        onUpdate: (value: number) => {
                            if (!isNullOrUndefined(value) && Number(value) <= 0) {
                                ctx.uiBuilder.toast(ctx, {
                                    severity: 'warning',
                                    title: t('dialog.title.warning'),
                                    message: t('inventory.arrivedQuantityPositive'),
                                    life: 3000,
                                });
                                return
                            }
                            data.arrivedQuantity = value;
                            submitFun()
                        }
                    }),
                },
            },
        )
    }
})

export function materialRItemNode(props?: Record<string, any>) {
    return h(MaterialRItem, props as any)
}
