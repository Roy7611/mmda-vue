/*
 * @Author: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @Date: 2026-04-27 10:58:15
 * @LastEditors: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @LastEditTime: 2026-06-18 15:13:31
 * @FilePath: \mmda\packages\mes\src\modules\material_transes\MaterialRItem\MaterialRItem.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isNullOrUndefined, MetaModel } from '@mmda/core';
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
        const { $toast: toast, $ui: ui, $router: router, $t: t, $confirm: confirm } = getCurrentInstance()?.app.config?.globalProperties as any;
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

        return () => props.ctx.uiBuilder.buildSearchForRelativeContent(
            [
                ui.factory.column({ header: '#', field: 'rowNum', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.materialCategory'), field: 'materialCategory', style: 'width: 100px' }),
                ui.factory.column({ header: t('view.materialCode'), field: 'materialCode', style: 'width: 100px' }),
                ui.factory.column({ header: t('view.materialName'), field: 'materialName', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.quantity'), field: 'quantity', style: 'width: 100px' }),
                ui.factory.column(
                    { header: t('inventory.arrivedQuantity'), style: 'width: 240px' },
                    {
                        body: ({ data }: any, frozenRow: any, index: any) => ui.factory.numberInput({
                            style: { width: '140px' },
                            min: 0,
                            maxFractionDigits: 2, // 最大小数位数
                            modelValue: data.arrivedQuantity,
                            onUpdate:(value:number) => {
                               if (!isNullOrUndefined(value) && Number(value) <= 0) {
                                    toast.add({
                                        severity: 'warn',
                                        summary: t('dialog.title.warning'),
                                        detail: t('inventory.arrivedQuantityPositive'),
                                        group: 'br',
                                        life: 3000,
                                    });
                                    return
                                }
                                 data.arrivedQuantity = value;
                                 submitFun()
                            }
                        })
                    }
                ),
                ui.factory.column({ header: t('inventory.unit'), field: 'unit', style: 'width: 100px' }),
                ui.factory.column({ header: t('bom.brand'), field: 'brand', style: 'width: 100px' }),
                ui.factory.column({ header: t('bom.specification'), field: 'specs', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.materialTexture'), field: 'modelType', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.usage'), field: 'usage', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.remainingQuantity'), field: 'leftOverQuantity', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.unitPrice'), field: 'unitPrice', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.amount'), field: 'amount', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.weight'), field: 'weight', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.qualityStatus'), field: 'qaStatus', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.packageSize'), field: 'packSize', style: 'width: 100px' }),
                ui.factory.column({ header: t('inventory.remark'), field: 'remark', style: 'width: 100px' }),
            ],
            {
                dataKey: unref(tableDataKey),
                paginator: false,
                selectionMode: 'none',
                onSearch: ({ searchParams, reload, pager }: any) => {
                    return {
                        list: submitData.data.filter(item => item.materialName.includes(searchParams.searchWord) || (!isNullOrUndefined(item.materialCode) ? item.materialCode.includes(searchParams.searchWord) : '')), pager: searchParam.pager
                    }
                },
            }
        )
    }
})
