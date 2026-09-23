import { type Module, uiCssClass, uiClassModifiers } from '@mmda/core'
import {
  computed,
  defineComponent,
  h,
  inject,
  ref,
  watch,
  type PropType,
  type VNodeChild,
} from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { UiAppMenuItem } from '@mmda/core'
import { NLayout, NLayoutSider, NMenu, type MenuOption } from 'naive-ui'
import {
  assembleMenuItems,
  activeAncestorKeys,
  hasSystemModules,
  isLocalAppModuleUrl,
  UI_APP_KEY,
  useCompactViewport,
  wrapRailLabel,
  type MmdaApplication,
  type MmdaVueApp,
} from '@mmda/vui'

type SlotFn = () => VNodeChild

/** Align with Syncfusion dock: expanded 300px, L1 rail 72px. */
const DOCK_WIDTH = 300
const DOCK_SIZE = 72
/** L2 pane = dock expanded minus L1 rail. */
const L2_WIDTH = DOCK_WIDTH - DOCK_SIZE
/** Compact L2 drawer width ~ dock expanded pane (300 - 72). */
const COMPACT_DRAWER_WIDTH = 228

/**
 * Naive app side menu (`N` = Naive UI; AG Grid pieces stay under `Ag*`).
 * - IA matches Syncfusion (L1 system rail always on + L2 modules collapsible)
 * - L2 uses NMenu; desktop collapse uses NLayoutSider show-trigger
 *
 * @see https://www.naiveui.com/zh-CN/os-theme/components/layout
 * @see https://www.naiveui.com/zh-CN/os-theme/components/menu
 */
export const NaiveAppSideMenu = defineComponent({
  name: 'NaiveAppSideMenu',
  inheritAttrs: false,
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: (): Module[] => [],
    },
    items: {
      type: Array as PropType<UiAppMenuItem[]>,
      default: undefined,
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
  setup(props, { attrs }) {
    const app = inject(UI_APP_KEY, null as MmdaVueApp | null)
    const builder = app?.ui
    const appName = computed(
      () => app?.state.localAppPrefixes ?? app?.name ?? '',
    )
    const route = useRoute()
    const selectedL1 = ref('')
    const expandedKeys = ref<string[]>([])
    const dockOpen = ref(true)
    const drawerOpen = ref(false)
    const mediaCompact = useCompactViewport()
    const compact = computed(() =>
      typeof props.compact === 'boolean' ? props.compact : mediaCompact.value,
    )

    const menuItems = computed(
      () => props.items ?? assembleMenuItems(props.modules),
    )
    const withSystems = computed(
      () =>
        hasSystemModules(props.modules) &&
        menuItems.value.some(item => !item.moduleCode.includes('.')),
    )

    const toMenuOptions = (items: UiAppMenuItem[]): MenuOption[] =>
      items.map(item => {
        const kids = item.items?.length ? toMenuOptions(item.items) : undefined
        const option: MenuOption = {
          key: item.moduleCode,
          label: () => {
            if (!item.route || kids?.length) {
              return h('span', { class: 'mmda-side-menu__label' }, item.label)
            }
            if (isLocalAppModuleUrl(appName.value, item.route)) {
              return h(
                RouterLink,
                { to: item.route, class: 'mmda-side-menu__link' },
                { default: () => item.label },
              )
            }
            return h(
              'a',
              { href: item.route, class: 'mmda-side-menu__link' },
              item.label,
            )
          },
          icon: item.icon
            ? () =>
                h('i', {
                  class: [item.icon, 'mmda-side-menu__icon'],
                  'aria-hidden': true,
                })
            : undefined,
          children: kids,
        }
        return option
      })

    const findActiveKey = (
      items: UiAppMenuItem[],
      path: string,
    ): string | undefined => {
      for (const item of items) {
        const child = item.items?.length
          ? findActiveKey(item.items, path)
          : undefined
        if (child) return child
        if (
          item.route &&
          (path === item.route || path.startsWith(`${item.route}/`))
        ) {
          return item.moduleCode
        }
      }
      return undefined
    }

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
        expandedKeys.value = ancestors.filter(code => code.includes('.'))
        if (compact.value) drawerOpen.value = false
      },
      { immediate: true, deep: true },
    )

    watch(compact, isCompact => {
      if (!isCompact) drawerOpen.value = false
    })

    const renderSystemRail = (
      systems: UiAppMenuItem[],
      selected?: UiAppMenuItem,
    ) =>
      h(
        'nav',
        {
          class: uiCssClass('app-side-menu', 'rail'),
          role: 'tablist',
          'aria-label': '\u7cfb\u7edf',
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
                if (compact.value) drawerOpen.value = true
                else if (!dockOpen.value) dockOpen.value = true
              },
            },
            [
              item.icon
                ? h('i', {
                    class: [
                      item.icon,
                      uiCssClass('app-side-menu', 'rail-icon'),
                    ],
                  })
                : h(
                    'span',
                    { class: uiCssClass('app-side-menu', 'rail-code') },
                    item.moduleCode,
                  ),
              h(
                'span',
                { class: uiCssClass('app-side-menu', 'rail-label') },
                wrapRailLabel(item.label),
              ),
            ],
          ),
        ),
      )

    const renderSelectedTitle = (
      selected?: UiAppMenuItem,
      extraClass?: string,
    ) =>
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
              class: uiCssClass('app-side-menu', 'title-label'),
              title: selected?.label,
            },
            selected?.label ?? '',
          ),
        ],
      )

    const renderNMenu = (items: UiAppMenuItem[], collapsed = false) =>
      h(NMenu, {
        class: uiCssClass('app-side-menu', 'n-menu'),
        options: toMenuOptions(items),
        value: findActiveKey(items, route.path),
        expandedKeys: expandedKeys.value,
        accordion: true,
        collapsed,
        collapsedWidth: DOCK_SIZE,
        indent: 18,
        rootIndent: 12,
        inverted: false,
        'onUpdate:expandedKeys': (keys: string[]) => {
          expandedKeys.value = keys
        },
      })

    const renderL2Body = (
      selected: UiAppMenuItem | undefined,
      panelClass?: string,
    ) => [
      renderSelectedTitle(selected, panelClass),
      h(
        'div',
        {
          class: [uiCssClass('app-side-menu', 'modules'), panelClass].filter(
            Boolean,
          ),
        },
        [renderNMenu(selected?.items ?? [])],
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
    ]

    const renderModulePanel = (
      selected: UiAppMenuItem | undefined,
      panelClass?: string,
    ) =>
      h('div', { class: uiCssClass('app-side-menu', 'compact-panel') }, [
        ...renderL2Body(selected, panelClass),
      ])

    /** Desktop L2: official Naive sider trigger (must live inside NLayout). */
    const renderL2Sider = (
      selected: UiAppMenuItem | undefined,
      panelClass?: string,
    ) =>
      h(
        NLayout,
        {
          hasSider: true,
          class: uiCssClass('app-side-menu', 'sider-host'),
          style: {
            flex: '1 1 auto',
            minWidth: 0,
            height: '100%',
            backgroundColor: 'transparent',
          },
        },
        {
          default: () =>
            h(
              NLayoutSider,
              {
                class: uiCssClass('app-side-menu', 'sider'),
                bordered: true,
                collapseMode: 'width',
                collapsed: !dockOpen.value,
                collapsedWidth: 0,
                width: L2_WIDTH,
                showTrigger: 'arrow-circle',
                // Outer shell fills height; title/footer pin, modules scrolls.
                nativeScrollbar: true,
                contentStyle: {
                  height: '100%',
                  maxHeight: '100%',
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                },
                'onUpdate:collapsed': (collapsed: boolean) => {
                  dockOpen.value = !collapsed
                },
              },
              {
                default: () =>
                  h(
                    'div',
                    { class: uiCssClass('app-side-menu', 'sider-inner') },
                    renderL2Body(selected, panelClass),
                  ),
              },
            ),
        },
      )

    const renderDrawer = (selected?: UiAppMenuItem) => {
      const body = () => renderModulePanel(selected)
      const drawerFn = builder?.factory?.drawer
      if (typeof drawerFn === 'function') {
        return drawerFn(
          {
            isOpen: drawerOpen.value,
            position: 'Left',
            showBackdrop: true,
            closeOnDocumentClick: true,
            width: COMPACT_DRAWER_WIDTH,
            class: uiCssClass('app-side-menu', 'drawer'),
            onChange: (open: boolean) => {
              drawerOpen.value = open
            },
          },
          { default: body },
        )
      }
      return drawerOpen.value
        ? h(
            'div',
            { class: uiCssClass('app-side-menu', 'drawer-fallback') },
            [body()],
          )
        : null
    }

    return () => {
      const items = menuItems.value
      if (!items.length) {
        return h(
          'div',
          {
            class: [
              uiCssClass('app-side-menu'),
              uiCssClass('app-side-menu', 'empty'),
              compact.value
                ? uiCssClass('app-side-menu', undefined, 'compact')
                : undefined,
              attrs.class,
            ],
          },
          [
            props.modules.length
              ? '\u6a21\u5757\u6811\u65e0\u53ef\u8bbf\u95ee\u529f\u80fd\uff08\u68c0\u67e5 ModuleAuths \u6743\u9650\u4e0e asTree\uff09'
              : '\u672a\u52a0\u8f7d\u5230\u6a21\u5757\uff08\u68c0\u67e5 ModuleAuths \u63a5\u53e3\uff09',
          ],
        )
      }

      const systems = items.filter(item => !item.moduleCode.includes('.'))
      const selected =
        systems.find(item => item.moduleCode === selectedL1.value) ??
        systems[0] ??
        items[0]
      const dockPanel = uiCssClass('app-side-menu', 'panel')

      if (compact.value) {
        return h(
          'div',
          {
            class: [
              uiCssClass('app-side-menu'),
              uiCssClass('app-side-menu', undefined, 'compact'),
              attrs.class,
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
            renderDrawer(selected),
          ],
        )
      }

      if (withSystems.value) {
        return h(
          'aside',
          {
            class: [
              uiClassModifiers('sidebar', 'dock'),
              uiCssClass('app-side-menu'),
              dockOpen.value
                ? undefined
                : uiClassModifiers('sidebar', 'dock-closed'),
              attrs.class,
            ],
          },
          [
            h('div', { class: uiCssClass('app-side-menu', 'chrome') }, [
              h('div', { class: uiCssClass('app-side-menu', 'rail-col') }, [
                h('div', { class: uiCssClass('app-side-menu', 'brand') }, [
                  props.logo?.() ?? null,
                ]),
                renderSystemRail(systems, selected),
              ]),
              renderL2Sider(selected, dockPanel),
            ]),
          ],
        )
      }

      return h(
        NLayout,
        {
          hasSider: true,
          class: [
            uiCssClass('sidebar'),
            uiCssClass('app-side-menu'),
            dockOpen.value ? undefined : uiClassModifiers('sidebar', 'collapsed'),
            attrs.class,
          ],
          style: { height: '100%', backgroundColor: 'transparent' },
        },
        {
          default: () =>
            h(
              NLayoutSider,
              {
                class: uiCssClass('app-side-menu', 'sider'),
                bordered: true,
                collapseMode: 'width',
                collapsed: !dockOpen.value,
                collapsedWidth: DOCK_SIZE,
                width: DOCK_WIDTH,
                showTrigger: 'arrow-circle',
                nativeScrollbar: true,
                contentStyle: {
                  height: '100%',
                  maxHeight: '100%',
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                },
                'onUpdate:collapsed': (collapsed: boolean) => {
                  dockOpen.value = !collapsed
                },
              },
              {
                default: () => [
                  props.logo
                    ? h('div', { class: uiCssClass('sidebar', 'header') }, [
                        props.logo(),
                      ])
                    : null,
                  h('div', { class: uiCssClass('sidebar', 'body') }, [
                    renderNMenu(items, !dockOpen.value),
                  ]),
                  props.footer
                    ? h('div', { class: uiCssClass('sidebar', 'footer') }, [
                        props.footer(),
                      ])
                    : null,
                ],
              },
            ),
        },
      )
    }
  },
})
