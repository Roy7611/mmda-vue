import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  Teleport,
  type PropType,
  type VNode,
} from 'vue'
import { ButtonComponent } from '@syncfusion/ej2-vue-buttons'

export type DropupPlacement = 'top' | 'top-end'

export interface DropupMenuItem {
  id?: string
  label?: string
  icon?: string
  disabled?: boolean
  divider?: boolean
  onAction?: () => void
  command?: () => void
}

/**
 * 自研向上弹出菜单（Dropup）。
 * Syncfusion DropDownButton 无可靠 upward API，侧栏 footer 第一次打开会错位，
 * 这里用 Button + Teleport 固定定位，避开 EJ2 Popup。
 */
export const SfDropupMenuButton = defineComponent({
  name: 'SfDropupMenuButton',
  props: {
    label: { type: String, default: undefined },
    icon: { type: String, default: undefined },
    cssClass: { type: String, default: '' },
    title: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
    hideCaret: { type: Boolean, default: false },
    placement: {
      type: String as PropType<DropupPlacement>,
      default: 'top-end',
    },
    items: {
      type: Array as PropType<DropupMenuItem[]>,
      default: () => [],
    },
  },
  setup(props) {
    const open = ref(false)
    const rootEl = ref<HTMLElement | null>(null)
    const menuEl = ref<HTMLElement | null>(null)
    const style = ref<Record<string, string>>({
      top: '0px',
      left: '0px',
      visibility: 'hidden',
    })

    const getTrigger = (): HTMLElement | null => {
      const root = rootEl.value
      if (!root) return null
      return (
        (root.querySelector('button.e-btn, button, .e-btn') as HTMLElement | null) ??
        root
      )
    }

    const getAnchor = (btn: HTMLElement): HTMLElement =>
      (btn.closest('.mmda-sf-sidebar__footer') as HTMLElement | null) ||
      (btn.closest('.mmda-user-footer') as HTMLElement | null) ||
      btn

    const getPanel = (btn: HTMLElement, anchor: HTMLElement): HTMLElement => {
      const chrome = btn.closest('.mmda-sf-system-chrome') as HTMLElement | null
      return (
        (chrome?.querySelector('.mmda-sf-system-modules') as HTMLElement | null) ||
        (anchor.closest('#mmda-sf-dock-sidebar') as HTMLElement | null) ||
        (btn.closest('.mmda-sf-aside') as HTMLElement | null) ||
        anchor
      )
    }

    const placeMenu = () => {
      const btn = getTrigger()
      const menu = menuEl.value
      if (!btn || !menu) return

      const pad = 8
      const btnRect = btn.getBoundingClientRect()
      const anchor = getAnchor(btn)
      const panel = getPanel(btn, anchor)
      const anchorRect = anchor.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const height = menu.offsetHeight
      const width = menu.offsetWidth

      const top = Math.max(pad, anchorRect.top - height - 4)
      let left =
        props.placement === 'top'
          ? btnRect.left
          : btnRect.right - width
      const maxRight = panelRect.right - pad
      const minLeft = panelRect.left + pad
      if (left + width > maxRight) left = maxRight - width
      if (left < minLeft) left = minLeft

      style.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        maxWidth: `${Math.max(120, panelRect.width - pad * 2)}px`,
        zIndex: '1400',
        visibility: 'visible',
      }
    }

    const close = () => {
      open.value = false
      style.value = { ...style.value, visibility: 'hidden' }
    }

    const toggle = async (event?: Event) => {
      event?.preventDefault()
      event?.stopPropagation()
      if (open.value) {
        close()
        return
      }
      open.value = true
      style.value = {
        position: 'fixed',
        top: '0px',
        left: '0px',
        visibility: 'hidden',
        zIndex: '1400',
      }
      await nextTick()
      requestAnimationFrame(() => {
        placeMenu()
        requestAnimationFrame(placeMenu)
      })
    }

    const onDocPointer = (event: Event) => {
      if (!open.value) return
      const target = event.target as Node | null
      if (!target) return
      if (rootEl.value?.contains(target)) return
      if (menuEl.value?.contains(target)) return
      close()
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open.value) close()
    }

    if (typeof document !== 'undefined') {
      onMounted(() => {
        document.addEventListener('mousedown', onDocPointer, true)
        document.addEventListener('touchstart', onDocPointer, true)
        document.addEventListener('keydown', onKey, true)
      })
      onBeforeUnmount(() => {
        document.removeEventListener('mousedown', onDocPointer, true)
        document.removeEventListener('touchstart', onDocPointer, true)
        document.removeEventListener('keydown', onKey, true)
      })
    }

    const runItem = (item: DropupMenuItem) => {
      if (item.disabled || item.divider) return
      close()
      item.onAction?.()
      item.command?.()
    }

    const renderItems = (): VNode[] => {
      const nodes: VNode[] = []
      for (const item of props.items) {
        if (item.divider) {
          nodes.push(h('li', { class: 'mmda-sf-dropup__separator', role: 'separator' }))
          continue
        }
        nodes.push(
          h(
            'li',
            {
              class: [
                'mmda-sf-dropup__item',
                item.disabled ? 'is-disabled' : '',
              ]
                .filter(Boolean)
                .join(' '),
              role: 'menuitem',
              tabindex: item.disabled ? -1 : 0,
              onClick: (e: MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                runItem(item)
              },
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  runItem(item)
                }
              },
            },
            [
              item.icon
                ? h('span', {
                    class: ['mmda-sf-dropup__icon', item.icon]
                      .filter(Boolean)
                      .join(' '),
                    'aria-hidden': 'true',
                  })
                : null,
              h('span', { class: 'mmda-sf-dropup__label' }, item.label ?? ''),
            ],
          ),
        )
      }
      return nodes
    }

    return () =>
      h(
        'span',
        {
          class: 'mmda-sf-dropup-host',
          ref: (el: any) => {
            rootEl.value = (el as HTMLElement) ?? null
          },
        },
        [
          h(ButtonComponent as any, {
            content: props.label,
            iconCss: props.icon,
            cssClass: [
              props.cssClass,
              props.hideCaret ? 'e-caret-hide' : '',
              open.value ? 'e-active' : '',
            ]
              .filter(Boolean)
              .join(' '),
            title: props.title,
            type: 'button',
            'aria-label': props.ariaLabel ?? props.title,
            'aria-haspopup': 'menu',
            'aria-expanded': open.value ? 'true' : 'false',
            onClick: toggle,
          }),
          open.value
            ? h(
                Teleport,
                { to: 'body' },
                [
                  h(
                    'div',
                    {
                      class: 'mmda-sf-dropup',
                      role: 'menu',
                      ref: (el: any) => {
                        menuEl.value = (el as HTMLElement) ?? null
                      },
                      style: style.value,
                      onMousedown: (e: Event) => e.stopPropagation(),
                    },
                    [h('ul', { class: 'mmda-sf-dropup__list' }, renderItems())],
                  ),
                ],
              )
            : null,
        ],
      )
  },
})
