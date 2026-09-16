import {
  assembleViewUi,
  joinListRelationName,
  MetaUi,
} from './metaui_group'
import {
  type LocalAsyncDb,
  useLocalAsyncDb,
} from '../utils/localdb'
import { ApiClient, type EntityUrlParam } from '../net/api_client'
import { type Module, ModuleFactory } from './module'
import type { MetaUiFieldAlignment, MetaUiFieldFrozen } from './metaui_field'

export interface TableColumnSettings {
  fieldName: string
  listSize?: number
  listed?: boolean
  frozen?: MetaUiFieldFrozen | string
  listPos?: number
  align?: MetaUiFieldAlignment | string
}

/**
 * 元界面服务：模块目录、MetaUi 缓存、联查列视图。
 */
export interface MetaUiService {
  get localDb(): LocalAsyncDb
  get locale(): string
  changeLocale(locale: string): void
  getApiClient(repository: string): ApiClient
  getModules(reload?: boolean): Promise<Module[]>
  getSystems: (
    repository: string,
    service?: string,
    reload?: boolean,
  ) => Promise<Module[]>
  findModule(nameOrUrl: string): Module | undefined
  /**
   * 获取元界面。先本地缓存，没有或子表未齐则 GET `{service}/{repository}/metaui`。
   */
  get(repository: string, service?: string, reload?: boolean): Promise<MetaUi>
  assembleViewUi(metaUi: MetaUi, relationName: string): MetaUi
  /** 联查列界面。本地 assembleViewUi，缓存 `meta/{repository}/{relationName}View`。 */
  getViewUi(
    params?: EntityUrlParam & { relationName?: string },
    reload?: boolean,
  ): Promise<MetaUi>
  /** 把 MetaUi 写入 IndexedDB。`service` 选本地库。 */
  updateToCache(
    repository: string,
    metaUi: MetaUi,
    service?: string,
  ): Promise<void>
}

export const defaultMetaUiService = (apiClient: ApiClient): MetaUiService =>
  new MetaUiServiceImpl(apiClient)

class MetaUiServiceImpl implements MetaUiService {
  #caches = new Map<string, LocalAsyncDb>()
  #moduleFactory?: ModuleFactory
  constructor(public readonly apiClient: ApiClient) {}

  private cacheFor(service?: string): LocalAsyncDb {
    const name = service || this.apiClient.config.service
    let db = this.#caches.get(name)
    if (!db) {
      db = useLocalAsyncDb(name, this.apiClient.config.locale)
      this.#caches.set(name, db)
    }
    return db
  }

  get localDb() {
    return this.cacheFor()
  }
  get locale() {
    return this.apiClient.config.locale
  }
  changeLocale(locale: string) {
    this.apiClient.config.locale = locale
    this.#caches.clear()
  }
  getApiClient(repository: string) {
    return this.apiClient.repository(repository)
  }

  async getModules(reload: boolean = false) {
    if (!this.#moduleFactory || reload) {
      await this.apiClient.getAll({ repository: 'ModuleAuths', queryParams: { asTree: 1 } })
        .then((m: any) => {
          const list = (m?.list ?? []) as Module[]
          this.logModuleTree('ModuleAuths?asTree=1', list)
          this.#moduleFactory = new ModuleFactory(list)
          this.logModuleTree('ModuleFactory.modules', this.#moduleFactory.modules)
        })
    }
    return this.#moduleFactory.modules
  }

  private logModuleTree(tag: string, list: Module[]) {
    const sample = (list ?? []).slice(0, 3).map((m: any) => ({
      moduleCode: m.moduleCode,
      moduleType: m.moduleType,
      moduleLabel: m.moduleLabel,
      allowOps: m.allowOps,
      authorityAllowRead: m.authority?.allowRead,
      subModulesLen: m.subModules?.length ?? 0,
      child0: m.subModules?.[0]
        ? {
            moduleCode: m.subModules[0].moduleCode,
            moduleType: m.subModules[0].moduleType,
            allowOps: m.subModules[0].allowOps,
            kids: m.subModules[0].subModules?.length ?? 0,
          }
        : null,
    }))
    let featureCount = 0
    const walk = (nodes: Module[] = []) => {
      for (const n of nodes as any[]) {
        if (n.moduleType === 'FEATURE' || n.moduleType === 2) featureCount++
        walk(n.subModules ?? [])
      }
    }
    walk(list)
    console.info(`[mmda:modules] ${tag}`, {
      topCount: list?.length ?? 0,
      featureCount,
      sample,
      rawFirst: list?.[0],
    })
  }

  findModule(nameOrUrl: string): Module | undefined {
    if (!this.#moduleFactory) return undefined
    return nameOrUrl.includes('/')
      ? this.#moduleFactory.findModuleByUrl(nameOrUrl)
      : this.#moduleFactory.findModuleByName(nameOrUrl)
  }

  private async assemble(metaRepo: string, meta: any, service?: string) {
    if (meta) {
      const manyGroups: any[] = meta.groups.filter((g: any) => g.many)
      if (manyGroups.length > 0) {
        const manyGroupKeys: string[] = manyGroups.map(
          (g: any) => `${metaRepo}/${g.groupName}`,
        )
        const assemblies = await this.cacheFor(service).getMany(manyGroupKeys)
        assemblies.forEach((a, i) => {
          if (a) manyGroups[i].groupUi = a
        })
      }
    }
    return meta
  }

  private getFromCache(repository: string, service?: string) {
    const metaRepo = `meta/${repository}`
    return this.cacheFor(service)
      .get(metaRepo)
      .then(meta => this.assemble(metaRepo, meta, service))
  }

  private viewUiCacheKey(repository: string, relationName: string) {
    return `meta/${repository}/${relationName}View`
  }

  private viewUiCacheKeys(repository: string, metaUi?: MetaUi | { groups?: any[] }) {
    return (metaUi?.groups ?? [])
      .filter((group: any) => group.many)
      .map((group: any) => this.viewUiCacheKey(repository, group.groupName))
  }

  private invalidateViewUiCache(
    repository: string,
    metaUi: MetaUi | { groups?: any[] } | undefined,
    service?: string,
  ) {
    const keys = this.viewUiCacheKeys(repository, metaUi)
    if (!keys.length) return Promise.resolve()
    return this.cacheFor(service).deleteMany(keys)
  }

  assembleViewUi(metaUi: MetaUi, relationName: string) {
    return assembleViewUi(metaUi, relationName)
  }

  private disassemble(metaRepo: string, meta: any) {
    const assemblies: [string, any][] = []
    meta.groups.forEach((g: any) => {
      if (g.many) {
        assemblies.push([`${metaRepo}/${g.groupName}`, g.groupUi])
        g.groupUi = null
      }
    })
    assemblies.push([metaRepo, meta])
    return assemblies
  }

  private putToCache(repository: string, meta: any, service?: string) {
    const write = () => {
      const metaUi = new MetaUi(meta)
      const assemblies = this.disassemble(`meta/${repository}`, meta)
      return this.cacheFor(service).putMany(assemblies).then(() => metaUi)
    }
    return this.invalidateViewUiCache(repository, meta, service).then(write, write)
  }

  private snapshotMeta(meta: any) {
    if (meta == null) return meta
    return JSON.parse(
      JSON.stringify(meta, (key, value) => {
        if (typeof value === 'function') return undefined
        if (String(key).startsWith('_')) return undefined
        if (key === 'reference') return undefined
        return value
      }),
    )
  }

  private fetchMetaUiJson(
    repository: string,
    service?: string,
    reload = false,
  ) {
    const url = this.apiClient.buildEntityURL({
      repository,
      path: 'metaui',
      queryParams: { reload },
      service,
    })
    return this.apiClient.http.getJson(url)
  }

  private getFromServer(repository: string, service?: string, reload: boolean = false) {
    return this.fetchMetaUiJson(repository, service, reload).then(meta =>
      this.putToCache(repository, meta, service),
    )
  }

  private applyViewListLayout(view: MetaUi, cached: any) {
    const cachedUi = cached instanceof MetaUi ? cached : new MetaUi(cached)
    for (const field of view.getListLayoutFields()) {
      const src = cachedUi.getField(field.fieldName)
      if (!src) continue
      if (src.listed != null) field.listed = src.listed
      if (src.listSize != null) field.listSize = src.listSize
      if (src.listPos != null) field.listPos = src.listPos
      if (src.frozen != null) field.frozen = src.frozen
      if (src.align != null) field.align = src.align
      if (src.hidden != null) field.hidden = src.hidden
    }
  }

  async getViewUi(
    params: EntityUrlParam & { relationName?: string } = {},
    reload = false,
  ): Promise<MetaUi> {
    const repository = params.redirection ?? params.repository
    if (!repository) throw new Error('getViewUi requires repository')
    const metaUi = await this.get(repository, params.service)
    const relationName = params.relationName ?? joinListRelationName(metaUi)
    if (!relationName) {
      throw new Error('getViewUi: no join-list relation')
    }
    const key = this.viewUiCacheKey(repository, relationName)
    const db = this.cacheFor(params.service)
    if (reload) await db.delete(key)
    const view = assembleViewUi(metaUi, relationName)
    if (!reload) {
      const cached = await db.get(key)
      if (cached) this.applyViewListLayout(view, cached)
    }
    await db.put(key, this.snapshotMeta(view))
    return view
  }

  get(
    repository: string,
    service?: string,
    reload: boolean = false,
  ): Promise<MetaUi> {
    if (reload) return this.getFromServer(repository, service, reload)

    return this.getFromCache(repository, service).then(meta => {
      if (meta) {
        const metaUi = new MetaUi(meta)
        if (metaUi.hasSubGroupUis()) return metaUi
      }
      return this.getFromServer(repository, service, reload)
    })
  }

  updateToCache(
    repository: string,
    metaUi: MetaUi,
    service?: string,
  ) {
    const snapshot = this.snapshotMeta(metaUi)
    const assemblies = this.disassemble(`meta/${repository}`, snapshot)
    return this.cacheFor(service).putMany(assemblies).then(() => {
      metaUi.getListedFields(true)
    })
  }

  private getSystemsFromCache(service?: string) {
    return this.cacheFor(service)
      .get(`meta/systems`)
      .then((systems: Module[]) => systems)
  }

  private getSystemsFromServer(
    repository: string,
    service?: string,
    reload: boolean = false,
  ) {
    return this.apiClient.getAll({ service, repository, queryParams: { reload } })
      .then((res: any) => (res.list ?? []) as Module[])
      .then(systems =>
        this.cacheFor(service)
          .put(`meta/systems`, systems)
          .then(() => systems),
      )
      .catch(() => {
        throw new Error('获取系统失败')
      })
  }

  async getSystems(
    repository: string,
    service: string,
    reload?: boolean,
  ): Promise<Module[]> {
    if (reload) return this.getSystemsFromServer(repository, service, reload)

    return this.getSystemsFromCache(service).then(systems => {
      if (systems?.length) return systems
      return this.getSystemsFromServer(repository, service, reload)
    })
  }
}
