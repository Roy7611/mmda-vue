import { MetaUi } from './metaui_group'
import {
  type LocalAsyncDb,
  supportLocalStorage,
  supportIndexedDb,
  useLocalAsyncDb,
} from '../utils/localdb'
import { ApiClient, type EntityUrlParam } from '../net/api_client'
import type { MetaUiFilter } from './metaui_filter'
import type { MetaUiSortSet } from './metaui_sort'
import { type Module, ModuleFactory } from '../models/module'
import type { ReportTemplate } from '../models/file'

export interface MetaUiFilterNSorts {
  filters?: MetaUiFilter[]
  sorts?: MetaUiSortSet[]
}

export interface MetaUiPack extends MetaUiFilterNSorts {
  metaui: MetaUi
}

/**
 * 元界面服务接口
 *
 * @remarks
 *
 * 复杂获取用户界面元数据，包括{@link Module|模块}、{@link MetaUi|元界面}、{@link MetaUiFilter|元过滤器}以及{@link MetaUiSortSet|元排序设置}
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
   * @param reload 为true时指示服务器刷新缓存
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
   * 获取元界面数据包，包含过滤器和排序设置
   * @param repository 仓储，通常是实体名称的复数形式，比如Warehouses
   * @param service 服务，例如`mes`, `wms`
   * @param reload 是否从远端数据源重新加载
   *
   * @remark
   *
   * 默认实现会尝试从本地缓存加载，若不成功则尝试从远端服务器加载。
   *
   * @example
   * ```ts
   * const service = defaultMetaUiService;
   * const {metaui,filters,sorts} = await service.get('Warehouses', false);
   * ```
   */
  getPack(
    params?: EntityUrlParam,
    reload?: boolean,
  ): Promise<MetaUiPack>

  /**
   * 获取过滤器和排序设置
   * @param repository
   * @param service
   * @param reload
   */
  getFilterNSorts(
    repository: string,
    service?: string,
    reload?: boolean
  ): Promise<MetaUiFilterNSorts>
  /**
   * 获取元界面数据
   * @param repository 仓储，通常是实体名称的复数形式，比如Warehouses
   * @param service 服务，例如`mes`, `wms`
   * @param reload 是否从远端数据源重新加载
   */
  get(repository: string, service?: string, reload?: boolean): Promise<MetaUi>
  updateForCache(repository: string, meta: MetaUi): Promise<void>
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
  private _cache: LocalAsyncDb
  private _moduleFactory: ModuleFactory
  private _otherSystemModuleFactory: Record<string, ModuleFactory>
  constructor(public readonly apiClient: ApiClient) {
    this._otherSystemModuleFactory = {}
    this._cache = useLocalAsyncDb(
      apiClient.config.service,
      apiClient.config.locale
    )
  }

  get localDb() {
    return this._cache
  }
  get locale() {
    return this.apiClient.config.locale
  }
  changeLocale(locale: string) {
    this.apiClient.config.locale = locale
    this._cache = useLocalAsyncDb(this.apiClient.config.service, locale)
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
        .then((m: any) => this._moduleFactory = new ModuleFactory(m.list as Module[]))

    }
    return this._moduleFactory.modules
  }

  async getOtherSystemModules(service: string, reload: boolean = false) {
    if (!this._otherSystemModuleFactory[service] || reload) {
      const modules = await this.apiClient.getAll({ service, repository: 'ModuleAuths', queryParams: { asTree: 1 } })
      this._otherSystemModuleFactory[service] = new ModuleFactory(modules.list as Module[])
    }

    return this._otherSystemModuleFactory[service].modules
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

  private async assemble(metaRepo: string, meta: any) {
    if (meta) {
      const manyGroups: any[] = meta.groups.filter((g: any) => g.many)
      if (manyGroups.length > 0) {
        const manyGroupKeys: string[] = manyGroups.map(
          (g: any) => `${metaRepo}/${g.groupName}`
        )
        const assemblies = await this._cache.getMany(manyGroupKeys)
        assemblies.forEach((a, i) => (manyGroups[i].groupUi = a))
      }
    }
    return meta
  }
  private async assemblePack(metaRepo: string, metaPack: any[]) {
    const metaui = await this.assemble(metaRepo, metaPack[0])
    return {
      metaui,
      filters: metaPack[1],
      sorts: metaPack[2],
    }
  }
  private getFromCache(repository: string) {
    const metaRepo = `meta/${repository}`
    return this._cache.get(metaRepo).then(meta => this.assemble(metaRepo, meta))
  }
  private getFilterNSortsFromCache(repository: string) {
    const metaRepos = [`meta/${repository}/filters`, `meta/${repository}/sorts`]
    return this._cache.getMany(metaRepos).then(meta => {
      return {
        filters: meta[0],
        sorts: meta[1],
      }
    })
  }
  private getPackFromCache(repository: string) {
    const metaRepo = `meta/${repository}`
    const metaRepos = [metaRepo, `${metaRepo}/filters`, `${metaRepo}/sorts`]
    return this._cache
      .getMany(metaRepos)
      .then(meta => this.assemblePack(metaRepo, meta))
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
   * 将元界面对象缓存在 _cache 中
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param meta 元界面对象
   * @returns 一个Promise对象，resolve时返回当前缓存的元界面对象
   */
  private putToCache(repository: string, meta: any) {
    const metaui = new MetaUi(meta)
    const assemblies = this.disassemble(`meta/${repository}`, meta)
    return this._cache.putMany(assemblies).then(() => metaui)
  }
  /**
   * 将元界面数据包（包含过滤器和排序设置）缓存在 _cache 中
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param metaPack 元界面数据包
   * @returns 一个Promise对象，resolve时返回当前缓存的元界面数据包
   */
  private putPackToCache(repository: string, metaPack: any) {
    const { metaui, filters, sorts } = metaPack
    const metaUiPack: MetaUiPack = {
      metaui: new MetaUi(metaui),
      filters,
      sorts,
    }
    const assemblies = this.disassemble(`meta/${repository}`, metaui)
    assemblies.push([`meta/${repository}/filters`, filters])
    assemblies.push([`meta/${repository}/sorts`, sorts])

    return this._cache.putMany(assemblies).then(() => metaUiPack)
  }
  /**
   * 从服务器获取元界面数据（不包含过滤器和排序设置）
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param service 服务，例如`mes`, `wms`
   * @param reload 是否重新加载，`true`的时候服务器清除缓存并从数据库中加载和组装，默认为`false`
   * @returns
   */
  getFromServer(repository: string, service?: string, reload: boolean = false) {
    return this.apiClient
      .getMetaUi(reload, { repository, service })
      .then(meta => this.putToCache(repository, meta))
  }

  getPackFromServer(
    reload: boolean = false,
    params: EntityUrlParam
  ) {
    const { repository, redirection } = params
    return this.apiClient
      .getMetaUiPack(reload, params)
      .then(meta => this.putPackToCache(redirection ?? repository, meta)) // 支持redirection参数指定重定向的repository
  }
  /**
   * 获取元界面，
   * 先尝试从本地缓存获取元数据，如果没有缓存则从服务器获取
   * @param repository 仓储一般为实体的复数形式，例如`Putaways`
   * @param service 服务，例如`mes`, `wms`，默认为当前app配置
   * @param reload 是否重新加载，`true`的时候服务器清除缓存并从数据库中加载和组装，默认为`false`
   * @returns Promise<MetaUi>
   */
  get(
    repository: string,
    service?: string,
    reload: boolean = false
  ): Promise<MetaUi> {
    if (reload)
      return this.getPackFromServer(reload, { repository, service, }).then(
        metaPack => metaPack.metaui
      )

    return this.getFromCache(repository).then(meta => {
      if (meta) return new MetaUi(meta)
      return this.getPackFromServer(reload, { repository, service, }).then(
        metaPack => metaPack.metaui
      )
    })
  }
  updateForCache(repository: string, meta: MetaUi) {
    return this.putPackToCache(repository, meta).then(
      (updateMeta: MetaUiPack) => {
        updateMeta.metaui.getListedFields(true)
      }
    )
  }
  getFilterNSorts(
    repository: string,
    service?: string,
    reload?: boolean
  ): Promise<MetaUiFilterNSorts> {
    if (reload) return this.getPackFromServer(reload, { repository, service, })

    return this.getFilterNSortsFromCache(repository)
  }

  getPack(
    params: EntityUrlParam = {},
    reload: boolean = false,
  ): Promise<MetaUiPack> {
    const { repository, redirection } = params
    if (reload) return this.getPackFromServer(reload, params)

    // 支持redirection参数指定重定向的repository
    return this.getPackFromCache(redirection ?? repository).then(meta => {
      if (meta.metaui)
        return {
          module: this.findModule(repository), // redirection不影响模块查找，模块依然通过repository查找，因为redirection只是替换了repository来查找元界面数据，并不影响模块的repository
          metaui: new MetaUi(meta.metaui),
          filters: meta.filters,
          sorts: meta.sorts,
        }
      return this.getPackFromServer(true, params)
    })
  }

  getOtherSystemPack(
    repository: string,
    service: string,
    reload?: boolean
  ): Promise<MetaUiPack> {
    if (reload) return this.getPackFromServer(reload, { repository, service, })

    return this.getPackFromCache(repository).then(meta => {
      if (meta.metaui)
        return {
          module: this.findOtherSystemModule(service, repository),
          metaui: new MetaUi(meta.metaui),
          filters: meta.filters,
          sorts: meta.sorts,
        }
      return this.getPackFromServer(true, { repository, service, })
    })
  }

  private getSystemsCache() {
    const metaRepo = `meta/systems`
    return this._cache
      .get(metaRepo)
      .then((systems: any[]) => systems)
  }

  getSystemsServer(
    repository: string,
    service?: string,
    reload: boolean = false
  ) {
    return this.apiClient.getAll({ service, repository, queryParams: { reload } })
      .then((res: any) => res.list)
      .then(systems => this._cache.put(`meta/systems`, systems).then(() => systems))
      .catch(() => {
        throw new Error('获取系统失败')
      })

  }

  async getSystems(repository: string,
    service: string,
    reload?: boolean,) {
    if (reload) return this.getSystemsServer(repository, service, reload)

    return this.getSystemsCache().then(systems => {
      if (systems?.length)
        return systems
      return this.getSystemsServer(repository, service, reload)
    })

  }
}
