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
import type { MetaUiFilter } from './metaui_filter'
import { type Module, ModuleFactory } from './module'
import type { ReportTemplate } from '../models/file'
import type { MetaUiFieldFrozen } from './metaui_field'
import type { EntityQuery } from '../models/entity_search'

export interface MetaUiFilters {
  filters?: MetaUiFilter[]
}

export interface MetaUiPack extends MetaUiFilters {
  metaUi: MetaUi
  /** 联查列定义；勾选后才拉，不控制菜单 */
  metaVui?: MetaUi
  /** 本地上次查询定义（含 pager.sorts），不来自服务器 pack */
  lastQuery?: EntityQuery
}

export interface ListSettingsField {
  fieldName: string
  listSize?: number
  listed?: boolean
  frozen?: MetaUiFieldFrozen | string
  listPos?: number
}

export interface ListSettingsPayload {
  service: string
  repository: string
  fields: ListSettingsField[]
}

/**
 * 元界面服务接口
 *
 * @remarks
 *
 * 复杂获取用户界面元数据，包括{@link Module|模块}、{@link MetaUi|元界面}、{@link MetaUiFilter|元过滤器}。查询排序只在 Pager.sorts。
 */
export interface MetaUiService {
  /**
   * 本地数据存储
   */
  get localDb(): LocalAsyncDb

  get locale(): string
  /**
   * 修改语言区域设置
   * @param locale 语言区域，如`zh`,`en`
   */
  changeLocale(locale: string): void
  /**
   * 获取API访问客户端，专属于实体
   * @param repository 仓储，通常是实体名称的复数形式，比如Warehouses
   *
   * @example
   * 可这么使用
   * ```ts
   * const service = defaultMetaUiService;
   * const apiClient = service.getApiClient('Warehouses');
   * const warehouse = apiClient.getOne(whId); //repository='Warehouses'
   * ```
   */
  getApiClient(repository: string): ApiClient

  /**
   * 获取当前系统模块，需先身份认证后才可调用
   * @param reload 为 true 时请求服务器从数据库重新组装；Redis 为 readThru，默认为 false
   */
  getModules(reload?: boolean): Promise<Module[]>

  getOtherSystemModules: (service: string, reload?: boolean) => Promise<Module[]>
  
  getTodoCount: (params: EntityUrlParam) => Promise<number>
  getSystems: (repository: string,
    service?: string,
    reload?: boolean) => Promise<any[]>
  getAllTemplate?: (repository: string) => Promise<ReportTemplate[] | null>
  /**
   * 查找模块
   * @param nameOrUrl 以moduleUrl或者实体名
   */
  findModule(nameOrUrl: string): Module | undefined

  findOtherSystemModule?: (service: string, nameOrUrl: string) => Module | undefined
  /**
   * 获取元界面数据包，包含过滤器。排序不进包缓存，只在查询 Pager.sorts。
   * @param repository 仓储，通常是实体名称的复数形式，比如Warehouses
   * @param service 服务，例如`mes`, `wms`
   * @param reload `true` 时作为查询参数传给服务器：从数据库重新组装；Redis 为 readThru。不是先清 Redis。
   *
   * @remark
   *
   * 默认实现会尝试从本地缓存加载，若不成功则尝试从远端服务器加载。
   *
   * @example
   * ```ts
   * const service = defaultMetaUiService;
   * const {metaUi,filters} = await service.getPack({ repository: 'Warehouses' });
   * ```
   */
  getPack(
    params?: EntityUrlParam,
    reload?: boolean,
  ): Promise<MetaUiPack>
  /**
   * 跳过本地 IndexedDB，从服务器拉取 pack 并写回本地缓存。
   * @param reload `false` 走服务端 Redis；`true` 强制从数据库 readThru 后写 Redis
   */
  fetchPackFromServer(
    params?: EntityUrlParam,
    reload?: boolean,
  ): Promise<MetaUiPack>

  /**
   * 获取过滤器（排序不缓存，只在查询 Pager.sorts）
   * @param repository
   * @param service
   * @param reload
   */
  getFilters(
    repository: string,
    service?: string,
    reload?: boolean
  ): Promise<MetaUiFilters>
  /**
   * 获取元界面数据
   * @param repository 仓储，通常是实体名称的复数形式，比如Warehouses
   * @param service 服务，例如`mes`, `wms`
   * @param reload `true` 时请求服务器从数据库重新组装（Redis readThru）
   */
  get(repository: string, service?: string, reload?: boolean): Promise<MetaUi>
  /**
   * 用主表 + 子表 groupUi 本地拼联查列。字段新实例，reference 共用。
   */
  assembleViewUi(metaUi: MetaUi, relationName: string): MetaUi
  /**
   * 联查列界面。本地 assembleViewUi，缓存 `meta/{repository}/{relationName}View`。
   */
  getMetaVui(
    params?: EntityUrlParam & { relationName?: string },
    reload?: boolean,
  ): Promise<MetaUi>
  /**
   * 将当前元数据包写入 IndexedDB（metaUi / filters）。排序不缓存。
   * `repository` 为实体复数名；`service` 选本地库（一微服务一库），key 为 `meta/{repository}/…`。
   */
  updateForCache(
    repository: string,
    pack: MetaUiPack,
    service?: string,
  ): Promise<void>
  /**
   * 将列表列设置永久保存到服务器（跨设备）。
   * POST `{baseUrl}meta/listSettings/save`
   */
  saveListSettings(payload: ListSettingsPayload): Promise<unknown>
}

/**
 * 默认元界面服务{@link MetaUiServiceImpl}
 * @param apiClient API访问客户端
 * @param locale 语言区域，如zh-Hans,zh-Hant,en
 * @returns MetaUiService
 */
export const defaultMetaUiService = (apiClient: ApiClient): MetaUiService =>
  new MetaUiServiceImpl(apiClient)

/**
 * 元界面服务默认实现
 */
class MetaUiServiceImpl implements MetaUiService {
  /** 按微服务名池化：IDB 库名 = service；key 为 meta/{repository}/… */
  private _caches = new Map<string, LocalAsyncDb>()
  private _moduleFactory: ModuleFactory
  private _otherSystemModuleFactory: Record<string, ModuleFactory>
  constructor(public readonly apiClient: ApiClient) {
    this._otherSystemModuleFactory = {}
  }

  /** 一微服务一 IndexedDB；缺省用宿主 apiClient.config.service */
  private cacheFor(service?: string): LocalAsyncDb {
    const name = service || this.apiClient.config.service
    let db = this._caches.get(name)
    if (!db) {
      db = useLocalAsyncDb(name, this.apiClient.config.locale)
      this._caches.set(name, db)
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
    this._caches.clear()
  }
  getApiClient(repository: string) {
    return this.apiClient.repository(repository)
  }

  async getTodoCount(params: EntityUrlParam) {
    const todoCount = await this.apiClient.getAll(params).then((res: any) => res.list).catch(() => 0);
    return todoCount
  }

  async getModules(reload: boolean = false) {
    if (!this._moduleFactory || reload) {
      await this.apiClient.getAll({ repository: 'ModuleAuths', queryParams: { asTree: 1 } })
        .then((m: any) => {
          const list = (m?.list ?? []) as Module[]
          this.logModuleTree('ModuleAuths?asTree=1', list)
          this._moduleFactory = new ModuleFactory(list)
          this.logModuleTree('ModuleFactory.modules', this._moduleFactory.modules)
        })

    }
    return this._moduleFactory.modules
  }

  async getOtherSystemModules(service: string, reload: boolean = false) {
    if (!this._otherSystemModuleFactory[service] || reload) {
      const modules = await this.apiClient.getAll({ service, repository: 'ModuleAuths', queryParams: { asTree: 1 } })
      const list = (modules?.list ?? []) as Module[]
      this.logModuleTree(`ModuleAuths?asTree=1&service=${service}`, list)
      this._otherSystemModuleFactory[service] = new ModuleFactory(list)
    }

    return this._otherSystemModuleFactory[service].modules
  }

  /** Dev diagnostic: ModuleAuths tree (subModules / allowOps). */
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

  async getAllTemplate(repository: string): Promise<ReportTemplate[] | null> {
    const allTemplate = await this.apiClient.getAll({
      repository,
      action: 'getAllTemplate',
    }).then((res: any) => res.list as ReportTemplate[]).catch((): null => null);
    return allTemplate
  }

  findModule(nameOrUrl: string): Module | undefined {
    if (!this._moduleFactory) return undefined
    return nameOrUrl.includes('/')
      ? this._moduleFactory.findModuleByUrl(nameOrUrl)
      : this._moduleFactory.findModuleByName(nameOrUrl)
  }

  /**
   * 查找其他系统的模块
   * @param service 服务名称，用于标识不同的系统
   * @param nameOrUrl 模块的实体名称或URL
   * @returns 如果找到，则返回模块；否则返回 undefined
   */
  findOtherSystemModule(service: string, nameOrUrl: string): Module | undefined {
    if (!this._otherSystemModuleFactory[service]) return undefined
    return nameOrUrl.includes('/')
      ? this._otherSystemModuleFactory[service].findModuleByUrl(nameOrUrl)
      : this._otherSystemModuleFactory[service].findModuleByName(nameOrUrl)
  }

  private async assemble(metaRepo: string, meta: any, service?: string) {
    if (meta) {
      const manyGroups: any[] = meta.groups.filter((g: any) => g.many)
      if (manyGroups.length > 0) {
        const manyGroupKeys: string[] = manyGroups.map(
          (g: any) => `${metaRepo}/${g.groupName}`
        )
        const assemblies = await this.cacheFor(service).getMany(manyGroupKeys)
        assemblies.forEach((a, i) => {
          if (a) manyGroups[i].groupUi = a
        })
      }
    }
    return meta
  }
  private async assemblePack(
    metaRepo: string,
    metaPack: any[],
    service?: string,
  ) {
    const metaUi = await this.assemble(metaRepo, metaPack[0], service)
    let metaVui: MetaUi | undefined
    if (metaUi) {
      const relation = joinListRelationName(new MetaUi(metaUi))
      if (relation) {
        const repository = metaRepo.startsWith('meta/')
          ? metaRepo.slice('meta/'.length)
          : metaRepo
        const raw = await this.cacheFor(service).get(
          this.viewUiCacheKey(repository, relation),
        )
        if (raw) metaVui = raw instanceof MetaUi ? raw : new MetaUi(raw)
      }
    }
    return {
      metaUi,
      filters: metaPack[1],
      lastQuery: metaPack[2] ?? undefined,
      metaVui,
    }
  }
  private getFromCache(repository: string, service?: string) {
    const metaRepo = `meta/${repository}`
    return this.cacheFor(service)
      .get(metaRepo)
      .then(meta => this.assemble(metaRepo, meta, service))
  }
  private getFiltersFromCache(repository: string, service?: string) {
    const metaRepos = [`meta/${repository}/filters`]
    return this.cacheFor(service).getMany(metaRepos).then(meta => {
      return {
        filters: meta[0],
      }
    })
  }
  private getPackFromCache(repository: string, service?: string) {
    const metaRepo = `meta/${repository}`
    const metaRepos = [metaRepo, `${metaRepo}/filters`, `${metaRepo}/query`]
    return this.cacheFor(service)
      .getMany(metaRepos)
      .then(meta => this.assemblePack(metaRepo, meta, service))
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

  /**
   * 将元界面拆分成多个子对象
   * @param metaRepo 元界面存储的key
   * @param meta 元界面对象
   * @returns 一个数组，数组的每个元素是一个数组，包含了key和value
   *          key是metaRepo字符串，value是元界面对象
   *          如果groupUi.many为true，则将groupUi拆分成多个子对象
   *          如果groupUi.many为false，则groupUi不做拆分
   */
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

  /**
   * 将元界面对象写入对应微服务本地库
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param meta 元界面对象
   * @returns 一个Promise对象，resolve时返回当前缓存的元界面对象
   */
  private putToCache(repository: string, meta: any, service?: string) {
    const write = () => {
      const metaUi = new MetaUi(meta)
      const assemblies = this.disassemble(`meta/${repository}`, meta)
      return this.cacheFor(service).putMany(assemblies).then(() => metaUi)
    }
    return this.invalidateViewUiCache(repository, meta, service).then(write, write)
  }
  /**
   * 写入前对 metaUi 做 JSON 快照，避免 disassemble 拆掉内存中正在用的 groupUi。
   */
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

  /**
   * 将元界面数据包（metaUi / filters）写入对应微服务本地库。
   * lastQuery 仅在 pack 显式带该字段时写入，避免服务器 pack 冲掉本地查询定义。
   */
  private putPackToCache(
    repository: string,
    metaPack: any,
    service?: string,
  ) {
    const { filters, lastQuery } = metaPack
    const snapshot = this.snapshotMeta(metaPack.metaUi)
    const metaUiPack: MetaUiPack = {
      metaUi: new MetaUi(snapshot),
      filters,
    }
    const assemblies = this.disassemble(`meta/${repository}`, snapshot)
    assemblies.push([`meta/${repository}/filters`, filters])
    if ('lastQuery' in metaPack) {
      assemblies.push([`meta/${repository}/query`, lastQuery ?? null])
      if (lastQuery) metaUiPack.lastQuery = lastQuery
    }
    if (metaPack.metaVui) {
      const relation = joinListRelationName(metaUiPack.metaUi)
      if (relation) {
        assemblies.push([
          this.viewUiCacheKey(repository, relation),
          this.snapshotMeta(metaPack.metaVui),
        ])
        metaUiPack.metaVui = metaPack.metaVui
      }
    }

    const db = this.cacheFor(service)
    return db.putMany(assemblies).then(async () => {
      if (metaUiPack.lastQuery) return metaUiPack
      const query = await db.get(`meta/${repository}/query`)
      if (query) metaUiPack.lastQuery = query
      return metaUiPack
    })
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

  private fetchMetaUiPackJson(reload = false, params: EntityUrlParam) {
    const { repository, service, queryParams } = params
    const url = this.apiClient.buildEntityURL({
      repository,
      path: 'metaUiPack',
      queryParams: Object.assign({}, { reload }, queryParams),
      service,
    })
    return this.apiClient.http.getJson(url)
  }

  /**
   * 从服务器获取元界面数据（不包含过滤器和排序设置）
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param service 服务，例如`mes`, `wms`
   * @param reload `true` 时请求服务器从数据库重新组装；Redis 为 readThru。不是先清 Redis。
   * @returns
   */
  getFromServer(repository: string, service?: string, reload: boolean = false) {
    return this.fetchMetaUiJson(repository, service, reload).then(meta =>
      this.putToCache(repository, meta, service),
    )
  }

  getPackFromServer(
    reload: boolean = false,
    params: EntityUrlParam
  ) {
    const { repository, redirection } = params
    const repo = redirection ?? repository!
    const load = () =>
      this.fetchMetaUiPackJson(reload, params).then((raw: any) => {
        const metaUi = raw.metaUi ?? raw['metaui']
        const write = () =>
          this.putPackToCache(
            repo,
            { filters: raw.filters, metaUi },
            params.service,
          )
        return this.invalidateViewUiCache(repo, metaUi, params.service).then(
          write,
          write,
        )
      })
    return load()
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
      if (src.hidden != null) field.hidden = src.hidden
    }
  }

  async getMetaVui(
    params: EntityUrlParam & { relationName?: string } = {},
    reload = false,
  ): Promise<MetaUi> {
    const repository = params.redirection ?? params.repository
    if (!repository) throw new Error('getMetaVui requires repository')
    const pack = await this.getPack(params)
    const metaUi =
      pack.metaUi instanceof MetaUi ? pack.metaUi : new MetaUi(pack.metaUi)
    const relationName = params.relationName ?? joinListRelationName(metaUi)
    if (!relationName) {
      throw new Error('getMetaVui: no join-list relation')
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
  /**
   * 获取元界面，
   * 先尝试从本地缓存获取元数据，如果没有缓存则从服务器获取
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param service 服务，例如`mes`, `wms`，默认为当前app配置
   * @param reload `true` 时请求服务器从数据库重新组装；Redis 为 readThru。不是先清 Redis。
   * @returns Promise<MetaUi>
   */
  get(
    repository: string,
    service?: string,
    reload: boolean = false
  ): Promise<MetaUi> {
    if (reload)
      return this.getPackFromServer(reload, { repository, service, }).then(
        metaPack => metaPack.metaUi
      )

    return this.getFromCache(repository, service).then(meta => {
      if (meta) {
        const metaUi = new MetaUi(meta)
        if (metaUi.hasSubGroupUis()) return metaUi
      }
      return this.getPackFromServer(reload, { repository, service, }).then(
        metaPack => metaPack.metaUi
      )
    })
  }
  updateForCache(
    repository: string,
    pack: MetaUiPack,
    service?: string,
  ) {
    return this.putPackToCache(repository, pack, service).then(
      (updateMeta: MetaUiPack) => {
        updateMeta.metaUi.getListedFields(true)
      },
    )
  }

  saveListSettings(payload: ListSettingsPayload) {
    const url = this.apiClient.buildEntityURL({
      service: 'meta',
      repository: 'listSettings',
      action: 'save',
    })
    return this.apiClient.http.postJson(url, payload)
  }
  getFilters(
    repository: string,
    service?: string,
    reload?: boolean
  ): Promise<MetaUiFilters> {
    if (reload) return this.getPackFromServer(reload, { repository, service, })

    return this.getFiltersFromCache(repository, service)
  }

  getPack(
    params: EntityUrlParam = {},
    reload: boolean = false,
  ): Promise<MetaUiPack> {
    const { repository, redirection } = params
    if (reload) return this.getPackFromServer(reload, params)

    // 支持redirection参数指定重定向的repository
    return this.getPackFromCache(
      redirection ?? repository!,
      params.service,
    ).then(meta => {
      if (meta.metaUi) {
        const metaUi = new MetaUi(meta.metaUi)
        if (metaUi.hasSubGroupUis()) {
          return {
            module: this.findModule(repository),
            metaUi,
            filters: meta.filters,
            lastQuery: meta.lastQuery,
            metaVui: meta.metaVui,
          }
        }
      }
      return this.getPackFromServer(false, params)
    })
  }

  fetchPackFromServer(
    params: EntityUrlParam = {},
    reload: boolean = false,
  ): Promise<MetaUiPack> {
    return this.getPackFromServer(reload, params)
  }

  getOtherSystemPack(
    repository: string,
    service: string,
    reload?: boolean
  ): Promise<MetaUiPack> {
    if (reload) return this.getPackFromServer(reload, { repository, service, })

    return this.getPackFromCache(repository, service).then(meta => {
      if (meta.metaUi) {
        const metaUi = new MetaUi(meta.metaUi)
        if (metaUi.hasSubGroupUis()) {
          return {
            module: this.findOtherSystemModule(service, repository),
            metaUi,
            filters: meta.filters,
            lastQuery: meta.lastQuery,
            metaVui: meta.metaVui,
          }
        }
      }
      return this.getPackFromServer(false, { repository, service, })
    })
  }

  private getSystemsCache(service?: string) {
    return this.cacheFor(service)
      .get(`meta/systems`)
      .then((systems: any[]) => systems)
  }

  getSystemsServer(
    repository: string,
    service?: string,
    reload: boolean = false
  ) {
    return this.apiClient.getAll({ service, repository, queryParams: { reload } })
      .then((res: any) => res.list)
      .then(systems =>
        this.cacheFor(service)
          .put(`meta/systems`, systems)
          .then(() => systems),
      )
      .catch(() => {
        throw new Error('获取系统失败')
      })

  }

  async getSystems(repository: string,
    service: string,
    reload?: boolean,) {
    if (reload) return this.getSystemsServer(repository, service, reload)

    return this.getSystemsCache(service).then(systems => {
      if (systems?.length)
        return systems
      return this.getSystemsServer(repository, service, reload)
    })

  }
}
