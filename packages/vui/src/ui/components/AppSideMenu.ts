import { type Module } from '@mmda/core'
import {
  computed,
  defineComponent,
  h,
  inject,
  ref,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { UI_APP_KEY } from '../ui_keys'
import type { MmdaApplication } from '../ui_app'

/** A top-level system uses a code such as `B` or `M`, without a dot. */
export function hasSystemModules(modules: Module[] = []): boolean {
  return modules.some(module => !module.moduleCode.includes('.'))
}

export interface AppMenuItem {
  key: string
  label: string
  icon?: string
  moduleCode: string
  moduleType?: Module['moduleType']
  route: string
  url?: string
  /** Feature leaf with create permission — show quick-create affordance. */
  allowCreate?: boolean
  items?: AppMenuItem[]
}

/**
 * Turns the authorized Module tree (`ModuleAuths?asTree=1`, nested via
 * `subModules`) into a menu model: drop unauthorized leaves, keep group nodes
 * that still have visible descendants, attach `route`/`url` for FEATURE links.
 * Skins (Html / Prime / Syncfusion) only render this model.
 */
export function assembleMenuItems(modules: Module[] = []): AppMenuItem[] {
  return modules.flatMap(module => {
    const kids = module.subModules ?? []
    const items = assembleMenuItems(kids)
    const isGroup = !!kids.length
    const isSystem = !module.moduleCode.includes('.')

    if (isGroup) {
      // Keep SYSTEM nodes even when children are still empty/unauthorized,
      // so the system rail can render while ModuleAuths tree catches up.
      if (!items.length && !isSystem) return []
    } else if (!module.authority?.allowRead) {
      return []
    }

    const route = module.moduleUrl ?? ''
    const isLeaf = !items.length
    return [{
      key: module.moduleCode,
      label: module.moduleLabel ?? (module as { moduleName?: string }).moduleName ?? '',
      icon: module.moduleIcon,
      moduleCode: module.moduleCode,
      moduleType: module.moduleType,
      route,
      url: route && isLeaf ? route : undefined,
      allowCreate: isLeaf && !!route && !!module.authority?.allowCreate,
      items: items.length ? items : undefined,
    }]
  })
}

/** Module codes that should be expanded for the active route. */
export function activeAncestorKeys(modules: Module[], path: string): string[] {
  for (const module of modules) {
    const children = module.subModules ?? []
    const route = module.moduleUrl
    const matches =
      !!route && (path === route || path.startsWith(`${route}/`))
    const nested = activeAncestorKeys(children, path)
    if (nested.length) return [module.moduleCode, ...nested]
    if (matches) return [module.moduleCode]
  }
  return []
}

/** Skin-neutral, recursively expandable navigation for Module trees. */
export const AppSideMenu = defineComponent({
  name: 'AppSideMenu',
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: (): Module[] => [],
    },
  },
  setup(props) {
    const app = inject(UI_APP_KEY, null as MmdaApplication | null)
    const route = useRoute()
    const expandedKeys = ref<Record<string, boolean>>({})

    const menuModules = computed(() =>
      props.modules.length ? props.modules : (app?.modules ?? []),
    )
    const currentModuleCode = computed(
      () => (route.meta?.module as Module | undefined)?.moduleCode,
    )

    watch(
      () => [route.path, menuModules.value] as const,
      () => {
        const keys = activeAncestorKeys(menuModules.value, route.path)
        if (keys.length) {
          expandedKeys.value = {
            ...expandedKeys.value,
            ...Object.fromEntries(keys.map(key => [key, true])),
          }
        }
      },
      { immediate: true, deep: true },
    )

    const renderItem = (item: AppMenuItem): VNode => {
      const children = item.items ?? []
      const active = item.moduleCode === currentModuleCode.value
      if (item.route && !children.length) {
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
                  class: ['fas', 'fa-plus'],
                  'aria-hidden': 'true',
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
            key: item.moduleCode,
          },
          [
            h(
              RouterLink,
              {
                role: 'app-module-feature',
                class: {
                  'mmda-side-menu__link': true,
                  'mmda-side-menu__link--active': active,
                },
                id: item.moduleCode,
                to: item.route,
              },
              () => [
                item.icon
                  ? h('i', { class: [item.icon, 'mmda-side-menu__icon'] })
                  : null,
                h('span', { class: 'mmda-side-menu__label' }, item.label),
              ],
            ),
            createLink,
          ],
        )
      }

      const open = Boolean(expandedKeys.value[item.key])
      return h(
        'div',
        {
          class: {
            'mmda-side-menu__panel': true,
            'mmda-side-menu__panel--open': open,
          },
          key: item.key,
        },
        [
          h(
            'button',
            {
              type: 'button',
              role: 'app-module',
              class: {
                'mmda-side-menu__group': true,
                'mmda-side-menu__link--active': active,
              },
              id: item.moduleCode,
              'aria-expanded': open,
              onClick: () => {
                expandedKeys.value = {
                  ...expandedKeys.value,
                  [item.key]: !open,
                }
              },
            },
            [
              item.icon
                ? h('i', { class: [item.icon, 'mmda-side-menu__icon'] })
                : null,
              h('span', { class: 'mmda-side-menu__label' }, item.label),
              h('span', {
                class: [
                  'fas',
                  open ? 'fa-chevron-up' : 'fa-chevron-down',
                  'mmda-side-menu__chevron',
                ],
                'aria-hidden': 'true',
              }),
            ],
          ),
          open
            ? h(
                'div',
                { class: 'mmda-side-menu__children' },
                children.map(renderItem),
              )
            : null,
        ],
      )
    }

    return () => {
      const items = assembleMenuItems(menuModules.value)
      return items.length
        ? h('nav', { class: 'mmda-side-menu' }, items.map(renderItem))
        : null
    }
  },
})
