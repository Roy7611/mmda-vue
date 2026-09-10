import { type Module, uiCssClass, uiCssClasses } from '@mmda/core'
import {
  computed,
  defineComponent,
  h,
  inject,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { SidebarComponent } from '@syncfusion/ej2-vue-navigations'
import { assembleMenuItems, activeAncestorKeys, hasSystemModules, isLocalAppModuleUrl, UI_APP_KEY, useCompactViewport, wrapRailLabel, type AppMenuItem, type MmdaApplication } from '@mmda/vui'

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
/** compact 二级抽屉宽 ≈ Dock 展开区（300 − 72） */
const COMPACT_DRAWER_WIDTH = '228px'
/** 与 VueUiLayout.scaffold / buildAppScaffold 根节点一致。 */
const SHELL_TARGET = `.${uiCssClass('app-layout')}`
const DOCK_SIDEBAR_ID = 'mmda-app-sidebar'

function moduleHref(
  url: string,
  appName: string | string[],
  linkProps: Record<string, unknown>,
  children: () => any,
): VNode {
  if (isLocalAppModuleUrl(appName, url)) {
    return h(RouterLink, { ...linkProps, to: url }, children)
  }
  return h('a', { ...linkProps, href: url }, children())
}

function renderFeatureLink(
  item: AppMenuItem,
  active: boolean,
  appName: string | string[],
): VNode {
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
    ? moduleHref(
        `${item.route}/Create`,
        appName,
        {
          class: 'mmda-side-menu__create',
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

  const children: VNode[] = [
    moduleHref(
      item.route,
      appName,
      {
        class: {
          'mmda-side-menu__link': true,
          'mmda-side-menu__link--active': active,
        },
      },
      () => label,
    ),
  ]
  if (createLink) children.push(createLink)

  return h(
    'div',
    {
      class: {
        'mmda-side-menu__row': true,
        'mmda-side-menu__row--active': active,
      },
    },
    children,
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
 *   .mmda-app-layout
 *     #mmda-app-sidebar | .mmda-app-side-menu--compact
 *     .mmda-app-page.e-main-content   (EJ2 Push 认 e-main-content)
 *
 * AppShell → SyncfusionLayout.scaffold：扁平兄弟，无 .mmda-app-nav 包裹。
 */
export const SfAppSideMenu = defineComponent({
  name: 'SfAppSideMenu',
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: (): Module[] => [],
    },
    compact: { type: Boolean, default: undefined },
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
    const app = inject(UI_APP_KEY, null as MmdaApplication | null)
    const appName = computed(
      () => app?.state.localAppPrefixes ?? app?.name ?? '',
    )
    const route = useRoute()
    const selectedL1 = ref('')
    const expanded = ref<Record<string, boolean>>({})
    /** Mirrors Sidebar open/docked for chevron only; width owned by EJ2. */
    const dockOpen = ref(true)
    /** compact：二级 Over 抽屉是否打开（内容与 Dock 展开区同一套）。 */
    const drawerOpen = ref(false)
    const sidebarRef = ref<unknown>(null)
    const mediaCompact = useCompactViewport()
    const compact = computed(() =>
      typeof props.compact === 'boolean' ? props.compact : mediaCompact.value,
    )

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
          class: uiCssClass('app-side-menu', 'collapse'),
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
        // 路由变化时收起 compact 抽屉（与点叶关闭一致）
        if (compact.value) drawerOpen.value = false
      },
      { immediate: true, deep: true },
    )

    watch(compact, (isCompact) => {
      if (!isCompact) drawerOpen.value = false
    })

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
        return h('div', { class: uiCssClass('app-side-menu', 'acc-empty') }, '暂无功能')
      }
      return h(
        'div',
        { class: 'mmda-side-menu' },
        items.map(item =>
          renderFeatureLink(
            item,
            isActiveRoute(route.path, item.route),
            appName.value,
          ),
        ),
      )
    }

    const renderModuleTree = (items: AppMenuItem[], className: string) => {
      const groups = items.filter(item => item.items?.length)
      const leaves = items.filter(item => !item.items?.length)
      if (!groups.length && !leaves.length) {
        return h('div', { class: uiCssClass('app-side-menu', 'empty') }, '暂无模块')
      }

      return h('div', { class: className }, [
        leaves.length
          ? h('div', { class: uiCssClass('app-side-menu', 'leaves') }, [
              renderFeatureList(leaves),
            ])
          : null,
        ...groups.map(group => {
          const open = isGroupOpen(group.moduleCode)
          return h(
            'div',
            {
              class: {
                [uiCssClass('app-side-menu', 'acc')]: true,
                [uiCssClass('app-side-menu', 'acc', 'open')]: open,
              },
              key: group.moduleCode,
            },
            [
              h(
                'button',
                {
                  type: 'button',
                  class: uiCssClass('app-side-menu', 'acc-header'),
                  'aria-expanded': open,
                  onClick: () => toggleGroup(group.moduleCode),
                },
                [
                  group.icon
                    ? h('i', {
                        class: [group.icon, uiCssClass('app-side-menu', 'acc-icon')],
                        'aria-hidden': true,
                      })
                    : null,
                  h(
                    'span',
                    { class: uiCssClass('app-side-menu', 'acc-title') },
                    group.label,
                  ),
                  h('i', {
                    class: [
                      'e-icons',
                      'e-chevron-down',
                      uiCssClass('app-side-menu', 'acc-chevron'),
                    ],
                    'aria-hidden': true,
                  }),
                ],
              ),
              h('div', { class: uiCssClass('app-side-menu', 'acc-panel') }, [
                h('div', { class: uiCssClass('app-side-menu', 'acc-panel-inner') }, [
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
          class: uiCssClass('app-side-menu', 'rail'),
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
                [uiCssClass('app-side-menu', 'rail-item')]: true,
                [uiCssClass('app-side-menu', 'rail-item', 'active')]:
                  item.moduleCode === selected?.moduleCode,
              },
              id: item.moduleCode,
              title: item.label,
              'aria-selected': item.moduleCode === selected?.moduleCode,
              onClick: () => {
                selectedL1.value = item.moduleCode
                if (compact.value) {
                  drawerOpen.value = true
                } else if (!dockOpen.value) {
                  openDock()
                }
              },
            },
            [
              item.icon
                ? h('i', {
                    class: [item.icon, uiCssClass('app-side-menu', 'rail-icon')],
                  })
                : h(
                    'span',
                    { class: uiCssClass('app-side-menu', 'rail-code') },
                    item.moduleCode,
                  ),
              // 收起后仍显示一级系统名（不用 e-text，避免被 .e-dock.e-close 隐藏）
              h(
                'span',
                { class: uiCssClass('app-side-menu', 'rail-label') },
                wrapRailLabel(item.label),
              ),
            ],
          ),
        ),
      )

    const renderSelectedTitle = (selected?: AppMenuItem, extraClass?: string) =>
      h(
        'div',
        {
          class: [uiCssClass('app-side-menu', 'title'), extraClass].filter(
            Boolean,
          ),
        },
        [
          selected?.icon
            ? h('i', {
                class: [
                  selected.icon,
                  uiCssClass('app-side-menu', 'title-icon'),
                ],
                'aria-hidden': true,
              })
            : null,
          h(
            'span',
            {
              class: [
                'e-text',
                uiCssClass('app-side-menu', 'title-label'),
              ],
              title: selected?.label,
            },
            selected?.label ?? '',
          ),
        ],
      )

    const renderExpandedPanel = (
      selected: AppMenuItem | undefined,
      panelClass?: string,
    ) =>
      h('div', { class: uiCssClass('app-side-menu', 'compact-panel') }, [
        renderSelectedTitle(selected, panelClass),
        renderModuleTree(
          selected?.items ?? [],
          `${uiCssClass('app-side-menu', 'modules')} ${panelClass ?? ''}`.trim(),
        ),
        props.footer
          ? h(
              'div',
              {
                class: [uiCssClass('sidebar', 'footer'), panelClass].filter(
                  Boolean,
                ),
              },
              [props.footer()],
            )
          : null,
      ])

    return () => {
      const items = menuItems.value
      if (!items.length) {
        return h(
          'div',
          {
            class: [
              uiCssClass('app-side-menu'),
              uiCssClass('app-side-menu', 'empty'),
              compact.value ? uiCssClass('app-side-menu', undefined, 'compact') : undefined,
            ],
          },
          [
            props.modules.length
              ? '模块树无可访问功能（检查 ModuleAuths 权限与 asTree）'
              : '未加载到模块（检查 ModuleAuths 接口）',
          ],
        )
      }

      const systems = items.filter(item => !item.moduleCode.includes('.'))
      const selected =
        systems.find(item => item.moduleCode === selectedL1.value) ??
        systems[0] ??
        items[0]
      const dockPanel = uiCssClass('app-side-menu', 'panel')

      // compact：一级轨常驻 + Over 抽屉，抽屉里仍是同一套 title / accordion / footer
      if (compact.value) {
        return h(
          'div',
          {
            class: [
              uiCssClass('app-side-menu'),
              uiCssClass('app-side-menu', undefined, 'compact'),
            ],
          },
          [
            props.logo
              ? h('div', { class: uiCssClass('app-side-menu', 'brand') }, [
                  props.logo(),
                ])
              : null,
            withSystems.value
              ? renderSystemRail(systems, selected)
              : renderSystemRail(items, selected),
            h(
              SidebarComponent as any,
              {
                type: 'Over',
                isOpen: drawerOpen.value,
                position: 'Left',
                width: COMPACT_DRAWER_WIDTH,
                showBackdrop: true,
                closeOnDocumentClick: true,
                enableDock: false,
                enableGestures: false,
                cssClass: [
                  uiCssClass('sidebar'),
                  uiCssClass('sidebar', undefined, 'drawer'),
                  uiCssClass('sidebar', undefined, 'over'),
                  uiCssClass('app-side-menu', 'drawer'),
                ].join(' '),
                open: () => {
                  drawerOpen.value = true
                },
                close: () => {
                  drawerOpen.value = false
                },
                change: (args: { isOpen?: boolean }) => {
                  if (typeof args?.isOpen === 'boolean') {
                    drawerOpen.value = args.isOpen
                  }
                },
              },
              {
                default: () => renderExpandedPanel(selected),
              },
            ),
          ],
        )
      }

      if (withSystems.value) {
        return h(
          SidebarComponent as any,
          {
            ref: sidebarRef,
            id: DOCK_SIDEBAR_ID,
            class: uiCssClasses('sidebar', 'dock'),
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
              h('div', { class: uiCssClass('app-side-menu', 'chrome') }, [
                h('div', { class: uiCssClass('app-side-menu', 'brand') }, [
                  props.logo?.() ?? null,
                ]),
                renderSelectedTitle(selected, dockPanel),
                renderCollapseToggle(),
                renderSystemRail(systems, selected),
                renderModuleTree(
                  selected?.items ?? [],
                  `${uiCssClass('app-side-menu', 'modules')} ${dockPanel}`,
                ),
                props.footer
                  ? h(
                      'div',
                      {
                        class: [
                          uiCssClass('sidebar', 'footer'),
                          dockPanel,
                        ],
                      },
                      [props.footer()],
                    )
                  : null,
              ]),
          },
        )
      }

      return h('aside', { class: uiCssClass('sidebar') }, [
        props.logo
          ? h('div', { class: uiCssClass('sidebar', 'header') }, [props.logo()])
          : null,
        h('div', { class: uiCssClass('sidebar', 'body') }, [
          renderModuleTree(
            items,
            uiCssClasses('app-side-menu', 'accordion'),
          ),
        ]),
        props.footer
          ? h('div', { class: uiCssClass('sidebar', 'footer') }, [props.footer()])
          : null,
      ])
    }
  },
})

/** @deprecated 使用 SfAppSideMenu */
export const SfAppMenu = SfAppSideMenu
