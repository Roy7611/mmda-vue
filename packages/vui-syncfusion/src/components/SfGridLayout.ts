import { defineComponent, h, ref, type PropType } from 'vue'
import type { MetaUi, MetaUiField } from '@mmda/core'
import { DialogComponent } from '@syncfusion/ej2-vue-popups'
import { ListBoxComponent } from '@syncfusion/ej2-vue-dropdowns'

export type SfGridLayoutFieldState = {
  fieldName: string
  displayLabel: string
  listed: boolean
  frozen: '' | 'left' | 'right'
  listPos: number
}

/**
 * 表格布局伴侣（非 Grid 模块 / 非 ColumnChooser）。
 * 页面菜单调用 `open(metaUi)`；确认后写 listed / frozen / listPos。
 */
export const SfGridLayout = defineComponent({
  name: 'SfGridLayout',
  emits: {
    confirm: (_metaUi: MetaUi) => true,
  },
  setup(_, { emit, expose }) {
    const visible = ref(false)
    const metauiRef = ref<MetaUi | null>(null)
    const items = ref<SfGridLayoutFieldState[]>([])

    const open = (metaUi: MetaUi) => {
      metauiRef.value = metaUi
      const fields =
        metaUi.getListedFields?.(true) ??
        metaUi.groups
          ?.filter((group: any) => !group.many)
          .flatMap((group: any) => group.fields) ??
        []
      items.value = (fields as MetaUiField[])
        .slice()
        .sort(
          (a, b) =>
            (a.listPos ?? a.fieldIdx) - (b.listPos ?? b.fieldIdx),
        )
        .map((field, index) => ({
          fieldName: field.fieldName,
          displayLabel: field.displayLabel,
          listed: field.listed !== false && field.hidden !== true,
          frozen: (String(field.frozen ?? '').toLowerCase() || '') as
            | ''
            | 'left'
            | 'right',
          listPos: field.listPos ?? index,
        }))
      visible.value = true
    }

    const apply = () => {
      const metaUi = metauiRef.value
      if (!metaUi) return
      items.value.forEach((item, index) => {
        const field = metaUi.getField?.(item.fieldName)
        if (!field) return
        field.listed = item.listed
        field.listPos = index
        ;(field as any).frozen = item.frozen || ''
      })
      metaUi.getListedFields?.(true)
      visible.value = false
      emit('confirm', metaUi as MetaUi)
    }

    expose({ open })

    return () =>
      h(DialogComponent as any, {
        header: '表格设置',
        visible: visible.value,
        width: '420px',
        showCloseIcon: true,
        isModal: true,
        'onUpdate:visible': (value: boolean) => {
          visible.value = value
        },
        close: () => {
          visible.value = false
        },
        buttons: [
          {
            click: () => {
              visible.value = false
            },
            buttonModel: { content: '取消' },
          },
          {
            click: apply,
            buttonModel: { content: '确定', isPrimary: true },
          },
        ],
        default: () =>
          h('div', { class: 'mmda-sf-grid-layout' }, [
            h('p', { class: 'mmda-sf-grid-layout__hint' }, '拖动调整列顺序；勾选控制显隐。'),
            h(ListBoxComponent as any, {
              dataSource: items.value,
              fields: { text: 'displayLabel', value: 'fieldName' },
              allowDragAndDrop: true,
              selectionSettings: { showCheckbox: true, mode: 'Multiple' },
              value: items.value
                .filter(item => item.listed)
                .map(item => item.fieldName),
              change: (args: any) => {
                const selected = new Set(
                  (args.value as string[]) ?? [],
                )
                items.value = items.value.map(item => ({
                  ...item,
                  listed: selected.has(item.fieldName),
                }))
              },
              drop: (args: any) => {
                const next = (args.items ?? args.source ?? items.value) as
                  | SfGridLayoutFieldState[]
                  | undefined
                if (Array.isArray(next) && next.length) {
                  items.value = next.map((item, index) => ({
                    ...item,
                    listPos: index,
                  }))
                }
              },
            }),
          ]),
      })
  },
})
