import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import { NDropdown } from 'naive-ui'
import type { UiContextMenuProps, UiMenuItem } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { contextMenuItemsOf, contextMenuModifierClasses, htmlAttributesOf, invokeContextMenuItem } from '@mmda/vui'

function mapNaiveItem(
  item: UiMenuItem,
  props: UiContextMenuProps,
  resolveIcon?: IconResolver,
): Record<string, unknown> {
  if (item.divider) return { type: 'divider', key: `divider-${Math.random()}` }
  const key = String(item.name ?? item.id ?? item.label ?? Math.random())
  const icon = item.icon
    ? resolveIcon
      ? resolveIcon(item.icon)
      : item.icon
    : undefined
  return {
    key,
    label: item.label,
    icon: icon ? () => h('i', { class: icon }) : undefined,
    disabled: item.disabled === true,
    children: item.items?.map((child) =>
      mapNaiveItem(child, props, resolveIcon),
    ),
  }
}

const MmdaNaiveContextMenu = defineComponent({
  name: 'MmdaNaiveContextMenu',
  props: {
    menuProps: {
      type: Object as PropType<UiContextMenuProps>,
      required: true,
    },
    resolveIcon: Function as PropType<IconResolver>,
  },
  setup(props) {
    const show = ref(false)
    const x = ref(0)
    const y = ref(0)
    const options = ref<Record<string, unknown>[]>([])
    let targetEl: Element | null = null

    const rebuildOptions = () => {
      const items = contextMenuItemsOf(props.menuProps)
      options.value = items.map((item) =>
        mapNaiveItem(item, props.menuProps, props.resolveIcon),
      )
    }

    const onContextMenu = (event: Event) => {
      const mouse = event as MouseEvent
      if (props.menuProps.disabled) return
      const result = props.menuProps.onBeforeOpen?.({ event })
      if (result === false) return
      event.preventDefault()
      rebuildOptions()
      x.value = mouse.clientX
      y.value = mouse.clientY
      show.value = true
    }

    const bindTarget = () => {
      unbindTarget()
      const selector = props.menuProps.disabled
        ? undefined
        : props.menuProps.target
      if (!selector || typeof document === 'undefined') return
      targetEl = document.querySelector(selector)
      targetEl?.addEventListener('contextmenu', onContextMenu)
    }

    const unbindTarget = () => {
      targetEl?.removeEventListener('contextmenu', onContextMenu)
      targetEl = null
    }

    onMounted(bindTarget)
    onBeforeUnmount(unbindTarget)
    watch(
      () => [props.menuProps.target, props.menuProps.disabled],
      bindTarget,
    )

    return () =>
      h(NDropdown, {
        ...htmlAttributesOf(props.menuProps),
        trigger: 'manual',
        show: show.value,
        x: x.value,
        y: y.value,
        options: options.value,
        class: [...contextMenuModifierClasses(props.menuProps)].flat(),
        onClickoutside: () => {
          show.value = false
        },
        onSelect: (key: string | number) => {
          const items = contextMenuItemsOf(props.menuProps)
          const item = items
            .flatMap(function walk(entry: UiMenuItem): UiMenuItem[] {
              if (entry.divider) return []
              return [entry, ...(entry.items?.flatMap(walk) ?? [])]
            })
            .find(
              (entry) =>
                String(entry.name ?? entry.id ?? entry.label) === String(key),
            )
          if (item) invokeContextMenuItem(props.menuProps, item)
          show.value = false
        },
      })
  },
})

export function createContextMenu(
  props: UiContextMenuProps,
  resolveIcon?: IconResolver,
) {
  return h(MmdaNaiveContextMenu, { menuProps: props, resolveIcon })
}
