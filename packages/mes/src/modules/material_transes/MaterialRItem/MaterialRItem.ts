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
                ui.factory.column({ header: '物料类别', field: 'materialCategory', style: 'width: 100px' }),
                ui.factory.column({ header: '物料编码', field: 'materialCode', style: 'width: 100px' }),
                ui.factory.column({ header: '物料名称', field: 'materialName', style: 'width: 100px' }),
                ui.factory.column({ header: '数量', field: 'quantity', style: 'width: 100px' }),
                ui.factory.column(
                    { header: '实到数量', style: 'width: 240px' },
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
                                        detail: '实到数量不能小于等于0',
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
                ui.factory.column({ header: '单位', field: 'unit', style: 'width: 100px' }),
                ui.factory.column({ header: '品牌', field: 'brand', style: 'width: 100px' }),
                ui.factory.column({ header: '规格', field: 'specs', style: 'width: 100px' }),
                ui.factory.column({ header: '材质', field: 'modelType', style: 'width: 100px' }),
                ui.factory.column({ header: '用途', field: 'usage', style: 'width: 100px' }),
                ui.factory.column({ header: '剩余数量', field: 'leftOverQuantity', style: 'width: 100px' }),
                ui.factory.column({ header: '单价', field: 'unitPrice', style: 'width: 100px' }),
                ui.factory.column({ header: '金额', field: 'amount', style: 'width: 100px' }),
                ui.factory.column({ header: '重量', field: 'weight', style: 'width: 100px' }),
                ui.factory.column({ header: '质量状态', field: 'qaStatus', style: 'width: 100px' }),
                ui.factory.column({ header: '包装尺寸', field: 'packSize', style: 'width: 100px' }),
                ui.factory.column({ header: '备注', field: 'remark', style: 'width: 100px' }),
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
