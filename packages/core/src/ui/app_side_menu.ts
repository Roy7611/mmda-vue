import type { Module } from '../metaui/module'

/** 应用侧栏菜单节点（由 Module 树组装，无 Vue）。 */
export interface UiAppMenuItem {
  key: string
  label: string
  icon?: string
  moduleCode: string
  moduleType?: Module['moduleType']
  route: string
  url?: string
  /** 叶节点且有创建权限时给出快捷创建入口。 */
  allowCreate?: boolean
  items?: UiAppMenuItem[]
}

/**
 * 侧栏菜单拼屏参数。不是原子控件，走 {@link import('./builder').UiBuilder.buildAppSideMenu}。
 */
export interface UiAppSideMenuProps<TNode = any> {
  modules?: Module[]
  items?: UiAppMenuItem[]
  /** 便于单测；省略时实现可用 matchMedia。 */
  compact?: boolean
  logo?: () => TNode
  footer?: () => TNode
  class?: unknown
  onSelectL1?: (item: UiAppMenuItem) => void
  onDrawerChange?: (open: boolean) => void
  onSelectLeaf?: (item: UiAppMenuItem) => void
}

/** 顶级系统码如 `B` / `M`，不含点。 */
export function hasSystemModules(modules: Module[] = []): boolean {
  return modules.some((module) => !module.moduleCode.includes('.'))
}

/**
 * 宿主可管一个或多个路由前缀。其它服务的绝对路径仍走整页跳转。
 */
export function isLocalAppModuleUrl(
  appName: string | string[],
  url = '',
): boolean {
  if (!url || !url.startsWith('/')) return true
  const names = (Array.isArray(appName) ? appName : [appName])
    .map((name) => String(name).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
  if (!names.length) return true
  return names.some((name) => {
    const prefix = `/${name.toUpperCase()}`
    return url === prefix || url.startsWith(`${prefix}/`)
  })
}

/**
 * 授权 Module 树 → 菜单模型：丢掉无权叶，保留仍有可见后代的组。
 */
export function assembleMenuItems(modules: Module[] = []): UiAppMenuItem[] {
  return modules.flatMap((module) => {
    const kids = module.subModules ?? []
    const items = assembleMenuItems(kids)
    const isGroup = !!kids.length
    const isSystem = !module.moduleCode.includes('.')

    if (isGroup) {
      if (!items.length && !isSystem) return []
    } else if (!module.authority?.allowRead) {
      return []
    }

    const route = module.moduleUrl ?? ''
    const isLeaf = !items.length
    return [
      {
        key: module.moduleCode,
        label:
          module.moduleLabel ??
          (module as { moduleName?: string }).moduleName ??
          '',
        icon: module.moduleIcon,
        moduleCode: module.moduleCode,
        moduleType: module.moduleType,
        route,
        url: route && isLeaf ? route : undefined,
        allowCreate: isLeaf && !!route && !!module.authority?.allowCreate,
        items: items.length ? items : undefined,
      },
    ]
  })
}

/** 当前路由应展开的祖先 moduleCode。 */
export function activeAncestorKeys(modules: Module[], path: string): string[] {
  for (const module of modules) {
    const children = module.subModules ?? []
    const route = module.moduleUrl
    const matches = !!route && (path === route || path.startsWith(`${route}/`))
    const nested = activeAncestorKeys(children, path)
    if (nested.length) return [module.moduleCode, ...nested]
    if (matches) return [module.moduleCode]
  }
  return []
}
