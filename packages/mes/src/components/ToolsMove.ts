/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-07-01 15:29:22
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-04-08 13:36:01
 * @FilePath: /mmda-vue/packages/mes/src/components/ToolsMove.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineComponent, h, getCurrentInstance, unref, ref, onMounted, reactive } from 'vue'
import '@mmda/vui-primevue/src/assets/animate.min.css';
export const ToolsMove = defineComponent(
    {
        name: 'ToolsLend',
        props: {
            ctx: Object as any
        },
        emits: ['getMoveData'],
        setup: (props, { emit }) => {
            const { $ui: ui, $t: t, $toast: toast, $api: apiBox } = props.ctx.globalProps
            const ToolsMoveData = reactive({
                moveTo: '',
                remark: ''
            })
            return () => [
                h('div', { class: 'w-full h-full flex pt-2 pb-2 box-border flex-col items-center justify-center ' }, [
                    h('div', { class: 'w-full  flex items-center box-border' }, ui.factory.formItem({
                        class: 'w-full ',
                        name: 'moveTo',
                        label: t('auth.moveTo')
                    }, {
                        default: () => ui.factory.input(ToolsMoveData.moveTo, {
                            class: 'w-full ',
                            placeholder: t('auth.writetMoveTo'),
                            onUpdate: (val: any) => {
                                ToolsMoveData.moveTo = val
                                emit('getMoveData', ToolsMoveData)
                            }
                        })
                    })),
                    h('div', { class: 'w-full  flex items-center box-border' }, ui.factory.formItem({
                        class: 'w-full ',
                        name: 'remark',
                        label: t('auth.remark')
                    }, {
                        default: () => ui.factory.textarea(ToolsMoveData.remark, {
                            class: 'w-full',
                            placeholder: t('auth.writeRemark'),
                            'onUpdate:modelValue': (value: string) => {
                                ToolsMoveData.remark = value
                                emit('getMoveData', ToolsMoveData)
                            },
                        })
                    }))
                ])
            ]
        }
    }
)