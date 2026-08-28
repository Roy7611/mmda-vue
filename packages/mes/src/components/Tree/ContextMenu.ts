import { defineComponent, h, inject, computed, getCurrentInstance, ref, onUpdated } from 'vue';

export const ContextMenu = defineComponent({
    name: 'ContextMenu',
    props: {
        context: Array as any,
        propsData: Object as any
    },
    emits: ['getData'],
    setup(props, { emit }) {
        const { $api: apiBox, $ui: ui } = props.context.globalProps;
        const materialsName = ref(props.propsData.name ?? '')
        return () => h('div', {
            style: {
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
            }
        }, ui.factory.formItem({
            label: props.propsData.label
        }, {
            default: () => ui.factory.input(materialsName.value, {
                onUpdate: (value: string) => {
                    materialsName.value = value
                    emit('getData', materialsName.value)
                }
            })
        }))
    }
})