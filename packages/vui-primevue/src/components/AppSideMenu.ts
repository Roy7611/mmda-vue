import { isArray, type Module } from '@mmda/core'
import {
  computed,
  defineComponent,
  h,
  inject,
  ref,
  watch,
  type PropType,
} from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { UI_APP_KEY, type MmdaApplication } from '@mmda/vui'
import type { PrimeVueUiBuilder } from '../prime_builder'
import { UI_BUILDER_KEY } from '@mmda/vui'

/** 将 Module 树转成 PrimeVue PanelMenu model（对齐旧 assembleMenuItems） */
export function assembleMenuItems(modules: Module[] = []): any[] {
  if (!modules.length) return []
  const items: any[] = []
  for (const item of modules) {
    const children = item.subModules?.length
      ? assembleMenuItems(item.subModules)
      : []
    const isGroup = !!item.subModules?.length
    if (isGroup) {
      if (!children.length) continue
    } else if (!item.authority?.allowRead) {
      continue
    }

    const route = item.moduleUrl ?? ''
    const menuItem: Record<string, any> = {
      key: item.moduleCode,
      label: item.moduleLabel ?? (item as any).moduleName,
      icon: item.moduleIcon,
      moduleCode: item.moduleCode,
      route,
      items: children.length ? children : undefined,
    }
    if (route && !children.length) {
      menuItem.url = route
    }
    items.push(menuItem)
  }
  return items
}

function findExpandKey(
  modules: Module[],
  path: string,
  parent?: Module,
): string | undefined {
  for (const module of modules) {
    const url = module.moduleUrl
    if (url && (path === url || path.startsWith(`${url}/`) || path.startsWith(url))) {
      return parent?.moduleCode ?? module.moduleCode
    }
    if (module.subModules?.length) {
      const found = findExpandKey(module.subModules, path, module)
      if (found) return found
    }
  }
  return undefined
}

const AppSideMenuItem = defineComponent({
  name: 'AppSideMenuItem',
  props: {
    item: { type: Object, required: true },
    label: { type: [String, Object], default: undefined },
    hasSubmenu: { type: Boolean, default: false },
    root: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },
  setup(props) {
    const route = useRoute()
    const currentModuleCode = computed(
      () => (route.meta?.module as Module | undefined)?.moduleCode,
    )
    return () => {
      const item = props.item as Record<string, any>
      const text =
        typeof props.label === 'string'
          ? props.label
          : (item.label ?? '')
      const isLeaf =
        !!item.route &&
        (isArray(item.items) ? !item.items.length : !item.items)
      const isActive = item.moduleCode === currentModuleCode.value

      if (isLeaf) {
        return h(
          RouterLink,
          {
            role: 'app-module-feature',
            class: {
              'mmda-side-menu__link': true,
              'p-panelmenu-header-link': true,
              'mmda-side-menu__link--active': isActive,
            },
            key: item.moduleCode,
            id: item.moduleCode,
            to: item.route,
            onClick: (event: MouseEvent) => event.stopPropagation(),
          },
          {
            default: () => [
              item.icon
                ? h('i', { class: [item.icon, 'mmda-side-menu__icon'] })
                : null,
              h('span', text),
            ],
          },
        )
      }

      return h(
        'div',
        {
          role: 'app-module',
          class: {
            'mmda-side-menu__group': true,
            'p-panelmenu-header-link': true,
            'mmda-side-menu__link--active': isActive,
          },
          key: item.moduleCode,
          id: item.moduleCode,
        },
        [
          item.icon
            ? h('i', { class: [item.icon, 'mmda-side-menu__icon'] })
            : null,
          h('span', text),
        ],
      )
    }
  },
})

/**
 * 侧栏可展开菜单：对齐旧 AppNavMenu（$app.context.modules + buildAppMenu + PanelMenu）。
 */
export const AppSideMenu = defineComponent({
  name: 'AppSideMenu',
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: () => [],
    },
  },
  setup(props) {
    const builder = inject<PrimeVueUiBuilder>(UI_BUILDER_KEY)!
    const app = inject<MmdaApplication>(UI_APP_KEY)
    const route = useRoute()
    const expandedKeys = ref<Record<string, boolean>>({})

    const menuModules = computed(() => {
      const fromApp = app?.modules
      if (fromApp?.length) return fromApp
      return props.modules ?? []
    })

    const syncExpanded = () => {
      const current = route.meta?.module as Module | undefined
      if (current?.parent?.moduleCode) {
        expandedKeys.value = {
          ...expandedKeys.value,
          [current.parent.moduleCode]: true,
        }
        return
      }
      const key = findExpandKey(menuModules.value, route.path)
      if (key) {
        expandedKeys.value = { ...expandedKeys.value, [key]: true }
      }
    }

    watch(
      () => [route.path, route.meta?.module, menuModules.value] as const,
      () => syncExpanded(),
      { immediate: true, deep: true },
    )

    return () => {
      const items = assembleMenuItems(menuModules.value)
      if (!items.length) return null

      return builder.buildAppMenu(menuModules.value, {
        expand: true,
        multiple: true,
        expandedKeys: expandedKeys.value,
        'onUpdate:expandedKeys': (value: Record<string, boolean>) => {
          expandedKeys.value = value
        },
        'onPanel-open': ({ item }: { item: { moduleCode?: string } }) => {
          if (item.moduleCode) {
            expandedKeys.value = {
              ...expandedKeys.value,
              [item.moduleCode]: true,
            }
          }
        },
        'onPanel-close': ({ item }: { item: { moduleCode?: string } }) => {
          if (item.moduleCode) {
            expandedKeys.value = {
              ...expandedKeys.value,
              [item.moduleCode]: false,
            }
          }
        },
        item: (slotProps: Record<string, unknown>) =>
          h(AppSideMenuItem, slotProps),
      })
    }
  },
})
