import { type Module } from '@mmda/core'
import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { SidebarComponent } from '@syncfusion/ej2-vue-navigations'
import {
  assembleMenuItems,
  activeAncestorKeys,
  hasSystemModules,
  type AppMenuItem,
} from '@mmda/vui'

type SlotFn = () => VNodeChild

/**
 * Official dock sample:
 *   enableDock: true, dockSize: '72px', width: '220px'
 * Types / Target samples use type Push + target container.
 * 展开总宽 ≈ 原 320px 减去一级轨 72px，二级区更紧凑。
 * @see https://ej2.syncfusion.com/documentation/sidebar/docking-sidebar
 * @see https://ej2.syncfusion.com/documentation/sidebar/custom-context
 */
const DOCK_WIDTH = '300px'
const DOCK_SIZE = '72px'
const SHELL_TARGET = '.mmda-sf-shell'

function renderFeatureLink(item: AppMenuItem, active: boolean): VNode {
  const label = [
    item.icon
      ? h('i', {
          class: [item.icon, 'mmda-side-menu__icon'],
          'aria-hidden': true,
        })
      : null,
    h('span', { class: 'mmda-side-menu__label' }, item.label),
  ]
  if (!item.route) {
    return h('span', { class: 'mmda-side-menu__link' }, label)
  }

  const createLink = item.allowCreate
    ? h(
        RouterLink,
        {
          class: 'mmda-side-menu__create',
          to: `${item.route}/Create`,
          title: '创建',
          'aria-label': `创建${item.label}`,
          onClick: (e: MouseEvent) => e.stopPropagation(),
        },
        () =>
          h('i', {
            class: 'e-icons e-plus',
            'aria-hidden': true,
          }),
      )
    : null

  return h(
    'div',
    {
      class: {
        'mmda-side-menu__row': true,
        'mmda-side-menu__row--active': active,
      },
    },
    [
      h(
        RouterLink,
        {
          class: {
            'mmda-side-menu__link': true,
            'mmda-side-menu__link--active': active,
          },
          to: item.route,
        },
        () => label,
      ),
      createLink,
    ],
  )
}

function isActiveRoute(path: string, route?: string): boolean {
  return !!route && (path === route || path.startsWith(`${route}/`))
}

function getSidebarInstance(refValue: unknown): {
  toggle?: () => void
  show?: () => void
  hide?: () => void
} | null {
  if (!refValue || typeof refValue !== 'object') return null
  const vue = refValue as {
    toggle?: () => void
    show?: () => void
    hide?: () => void
    ej2Instances?: {
      toggle?: () => void
      show?: () => void
      hide?: () => void
    }
  }
  if (typeof vue.toggle === 'function') return vue
  if (vue.ej2Instances) return vue.ej2Instances
  return null
}

/**
 * Syncfusion module menu (systems layout = official Sidebar enableDock).
 *
 * Shell contract (see SyncfusionUiBuilder.buildAppScaffold):
 *   .mmda-sf-shell
 *     #mmda-sf-dock-sidebar  (this component)
 *     .mmda-sf-maincontent   (page — Push sibling)
 */
export const SyncfusionAppMenu = defineComponent({
  name: 'SyncfusionAppMenu',
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: (): Module[] => [],
    },
    logo: {
      type: Function as PropType<SlotFn>,
      default: undefined,
    },
    footer: {
      type: Function as PropType<SlotFn>,
      default: undefined,
    },
  },
  setup(props) {
    const route = useRoute()
    const selectedL1 = ref('')
    const expanded = ref<Record<string, boolean>>({})
    /** Mirrors Sidebar open/docked for chevron only; width owned by EJ2. */
    const dockOpen = ref(true)
    const sidebarRef = ref<unknown>(null)

    const menuItems = computed(() => assembleMenuItems(props.modules))
    const withSystems = computed(
      () =>
        hasSystemModules(props.modules) &&
        menuItems.value.some(item => !item.moduleCode.includes('.')),
    )

    const toggleDock = () => {
      const api = getSidebarInstance(sidebarRef.value)
      api?.toggle?.()
    }

    const openDock = () => {
      const api = getSidebarInstance(sidebarRef.value)
      api?.show?.()
    }

    const renderCollapseToggle = (): VNode =>
      h(
        'button',
        {
          type: 'button',
          class: 'mmda-sf-system-collapse',
          title: dockOpen.value ? '收起菜单' : '展开菜单',
          'aria-label': dockOpen.value ? '收起菜单' : '展开菜单',
          'aria-expanded': dockOpen.value,
          onClick: (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            toggleDock()
          },
        },
        [
          h('i', {
            class: [
              'e-icons',
              dockOpen.value ? 'e-chevron-left' : 'e-chevron-right',
            ],
            'aria-hidden': true,
          }),
        ],
      )

    watch(
      () => [route.path, menuItems.value] as const,
      () => {
        const ancestors = activeAncestorKeys(props.modules, route.path)
        const fromRoute = ancestors.find(code => !code.includes('.'))
        selectedL1.value =
          fromRoute ??
          menuItems.value.find(item => !item.moduleCode.includes('.'))
            ?.moduleCode ??
          menuItems.value[0]?.moduleCode ??
          ''

        const next: Record<string, boolean> = { ...expanded.value }
        for (const code of ancestors) {
          if (code.includes('.')) next[code] = true
        }
        expanded.value = next
      },
      { immediate: true, deep: true },
    )

    const isGroupOpen = (code: string) =>
      expanded.value[code] ??
      activeAncestorKeys(props.modules, route.path).includes(code)

    const toggleGroup = (code: string) => {
      expanded.value = {
        ...expanded.value,
        [code]: !isGroupOpen(code),
      }
    }

    const renderFeatureList = (items: AppMenuItem[] = []): VNode => {
      if (!items.length) {
        return h('div', { class: 'mmda-sf-acc-empty' }, '暂无功能')
      }
      return h(
        'div',
        { class: 'mmda-side-menu' },
        items.map(item =>
          renderFeatureLink(item, isActiveRoute(route.path, item.route)),
        ),
      )
    }

    const renderModuleTree = (items: AppMenuItem[], className: string) => {
      const groups = items.filter(item => item.items?.length)
      const leaves = items.filter(item => !item.items?.length)
      if (!groups.length && !leaves.length) {
        return h('div', { class: 'mmda-sf-app-menu__empty' }, '暂无模块')
      }

      return h('div', { class: className }, [
        leaves.length
          ? h('div', { class: 'mmda-sf-app-menu__leaves' }, [
              renderFeatureList(leaves),
            ])
          : null,
        ...groups.map(group => {
          const open = isGroupOpen(group.moduleCode)
          return h(
            'div',
            {
              class: {
                'mmda-sf-acc-item': true,
                'mmda-sf-acc-item--open': open,
              },
              key: group.moduleCode,
            },
            [
              h(
                'button',
                {
                  type: 'button',
                  class: 'mmda-sf-acc-item__header',
                  'aria-expanded': open,
                  onClick: () => toggleGroup(group.moduleCode),
                },
                [
                  group.icon
                    ? h('i', {
                        class: [group.icon, 'mmda-sf-acc-item__icon'],
                        'aria-hidden': true,
                      })
                    : null,
                  h('span', { class: 'mmda-sf-acc-item__title' }, group.label),
                  h('i', {
                    class: [
                      'e-icons',
                      'e-chevron-down',
                      'mmda-sf-acc-item__chevron',
                    ],
                    'aria-hidden': true,
                  }),
                ],
              ),
              h('div', { class: 'mmda-sf-acc-item__panel' }, [
                h('div', { class: 'mmda-sf-acc-item__panel-inner' }, [
                  renderFeatureList(group.items),
                ]),
              ]),
            ],
          )
        }),
      ])
    }

    const renderSystemRail = (systems: AppMenuItem[], selected?: AppMenuItem) =>
      h(
        'nav',
        {
          class: 'mmda-sf-system-rail',
          role: 'tablist',
          'aria-label': '系统',
        },
        systems.map(item =>
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              class: {
                'mmda-sf-system-rail__item': true,
                'mmda-sf-system-rail__item--active':
                  item.moduleCode === selected?.moduleCode,
              },
              id: item.moduleCode,
              title: item.label,
              'aria-selected': item.moduleCode === selected?.moduleCode,
              onClick: () => {
                selectedL1.value = item.moduleCode
                if (!dockOpen.value) openDock()
              },
            },
            [
              item.icon
                ? h('i', { class: [item.icon, 'mmda-sf-system-rail__icon'] })
                : h(
                    'span',
                    { class: 'mmda-sf-system-rail__code' },
                    item.moduleCode,
                  ),
              // 收起后仍显示一级系统名（不用 e-text，避免被 .e-dock.e-close 隐藏）
              h(
                'span',
                { class: 'mmda-sf-system-rail__label' },
                item.label,
              ),
            ],
          ),
        ),
      )

    return () => {
      const items = menuItems.value
      if (!items.length) {
        return h('div', { class: 'mmda-sf-app-menu mmda-sf-app-menu__empty' }, [
          props.modules.length
            ? '模块树无可访问功能（检查 ModuleAuths 权限与 asTree）'
            : '未加载到模块（检查 ModuleAuths 接口）',
        ])
      }

      if (withSystems.value) {
        const systems = items.filter(item => !item.moduleCode.includes('.'))
        const selected =
          systems.find(item => item.moduleCode === selectedL1.value) ??
          systems[0]

        return h(
          SidebarComponent as any,
          {
            ref: sidebarRef,
            id: 'mmda-sf-dock-sidebar',
            class: 'mmda-sf-sidebar-dock',
            // Docking Sidebar docs
            enableDock: true,
            dockSize: DOCK_SIZE,
            width: DOCK_WIDTH,
            // Types + Target docs: Push sibling content inside shell
            type: 'Push',
            target: SHELL_TARGET,
            position: 'Left',
            isOpen: true,
            closeOnDocumentClick: false,
            showBackdrop: false,
            enableGestures: false,
            open: () => {
              dockOpen.value = true
            },
            close: () => {
              dockOpen.value = false
            },
            change: (args: { isOpen?: boolean }) => {
              if (typeof args?.isOpen === 'boolean') {
                dockOpen.value = args.isOpen
              }
            },
          },
          {
            default: () =>
              h('div', { class: 'mmda-sf-system-chrome' }, [
                h('div', { class: 'mmda-sf-system-header__brand' }, [
                  props.logo?.() ?? null,
                ]),
                h(
                  'div',
                  { class: 'mmda-sf-system-header__title mmda-sf-dock-panel' },
                  [
                    selected?.icon
                      ? h('i', {
                          class: [
                            selected.icon,
                            'mmda-sf-system-header__icon',
                          ],
                          'aria-hidden': true,
                        })
                      : null,
                    h(
                      'span',
                      {
                        class: 'e-text mmda-sf-system-header__label',
                        title: selected?.label,
                      },
                      selected?.label ?? '',
                    ),
                  ],
                ),
                renderCollapseToggle(),
                renderSystemRail(systems, selected),
                renderModuleTree(
                  selected?.items ?? [],
                  'mmda-sf-system-modules mmda-sf-dock-panel',
                ),
                props.footer
                  ? h(
                      'div',
                      {
                        class: 'mmda-sf-sidebar__footer mmda-sf-dock-panel',
                      },
                      [props.footer()],
                    )
                  : null,
              ]),
          },
        )
      }

      return renderModuleTree(
        items,
        'mmda-sf-app-menu mmda-sf-app-menu--accordion',
      )
    }
  },
})
