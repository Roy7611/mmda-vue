import type { Component, InjectionKey, VNode } from 'vue'
import type { UiEntityViewFn } from '@mmda/core'
import type { RouteRecordRaw } from 'vue-router'
import type { MmdaApplication, EntityLogic } from '@mmda/vui'

export interface AppPlugin {
  name: string
  service: string
  routePrefix: string
  home: Component
  placeholderView?: Component
  placeholders?: string[]
  logicLoaders?: Record<string, () => Promise<any>>
  routes?: RouteRecordRaw[]
  /** 老的实体屏自定义页（Vue 组件，待搬迁）。 */
  resolveCustomView?: (repository: string) => Component | undefined
  /** 实体屏自定义页（**框架无关**）：业务包给 `UiEntityViewFn`，宿主包成组件。优先于上面那个。 */
  resolveEntityView?: (repository: string) => UiEntityViewFn<VNode> | undefined
}

export class AppPluginRegistry {
  private readonly plugins = new Map<string, AppPlugin>()

  register(plugin: AppPlugin) {
    const normalized = {
      ...plugin,
      name: plugin.name.toLowerCase(),
      service: plugin.service.toLowerCase(),
      routePrefix: `/${plugin.routePrefix.replace(/^\/+|\/+$/g, '')}`,
    }
    this.plugins.set(normalized.name, normalized)
    return normalized
  }

  all() {
    return [...this.plugins.values()]
  }

  get(name: string) {
    return this.plugins.get(name.toLowerCase())
  }

  resolve(path: string) {
    const normalized = path.toLowerCase()
    return this.all()
      .sort((a, b) => b.routePrefix.length - a.routePrefix.length)
      .find(
        plugin =>
          normalized === plugin.routePrefix.toLowerCase() ||
          normalized.startsWith(`${plugin.routePrefix.toLowerCase()}/`),
      )
  }

  service(path: string, fallback = 'base') {
    return this.resolve(path)?.service ?? fallback
  }

  logicToken(path: string, repository: string) {
    return `${this.service(path)}:${repository}Logic`
  }

  customView(path: string, repository: string) {
    return this.resolve(path)?.resolveCustomView?.(repository)
  }

  /** 插件声明的框架无关自定义页（优先于 `customView`）。 */
  entityView(path: string, repository: string) {
    return this.resolve(path)?.resolveEntityView?.(repository)
  }
}

export const APP_PLUGIN_REGISTRY_KEY: InjectionKey<AppPluginRegistry> =
  Symbol('MmdaAppPluginRegistry')

export async function registerPluginLogic(
  app: MmdaApplication,
  registry: AppPluginRegistry,
  
) {
  for (const plugin of registry.all()) {
    for (const [repository, load] of Object.entries(
      plugin.logicLoaders ?? {},
    )) {
      const token = `${plugin.service}:${repository}Logic`
      app.di.provide(token, async () => {
        const Ctor = await load()
        const module =
          app.findModule(`${plugin.routePrefix}/${repository}`) ??
          app.findModule(repository)
        return new Ctor({
          metaUiService: app.meta,
          repository,
          module,
          apiService: plugin.service,
        }) as EntityLogic<any>
      })
    }
  }
}
