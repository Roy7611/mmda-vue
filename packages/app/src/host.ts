import type { Component, InjectionKey } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MmdaApplication, UiLogic } from '@mmda/vui'

export interface AppPlugin {
  name: string
  service: string
  routePrefix: string
  home: Component
  placeholderView?: Component
  placeholders?: string[]
  logicLoaders?: Record<string, () => Promise<any>>
  routes?: RouteRecordRaw[]
  resolveCustomView?: (repository: string) => Component | undefined
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
}

export const APP_PLUGIN_REGISTRY_KEY: InjectionKey<AppPluginRegistry> =
  Symbol('MmdaAppPluginRegistry')

export async function registerPluginLogic(
  app: MmdaApplication,
  registry: AppPluginRegistry,
  router: unknown,
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
          router,
          module,
          apiService: plugin.service,
        }) as UiLogic<any>
      })
    }
  }
}
