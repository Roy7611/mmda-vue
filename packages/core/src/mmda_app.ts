import { FetchApi } from './net/fetch_api'
import { OAuth2ApiClient, type OAuthUser } from './net/oauth_api_client'
import {
  defaultMetaUiService,
  type MetaUiService,
} from './metaui/metaui_service'
import type { Module } from './metaui/module'
import {
  createDependencyContainer,
  type DependencyContainer,
} from './di/dependency'
import { isString } from './utils/is'
import { useMmdaSsoDb, type LocalAsyncDb } from './utils/localdb'
import type { UiBuilder } from './ui/builder'
import type { UiContext } from './ui/context'

export interface ClientProps {
  clientId?: string
  clientSecret?: string
  redirectUris?: string
}

/** 应用壳构造选项；第 4 参也可继续传 `envMode` 字符串。 */
export interface MmdaApplicationOptions {
  envMode?: string
  locale?: string
  clientId?: string
  clientSecret?: string
  redirectUris?: string
  /** 未登录 / 401 跳转路径。默认 `/${service}/Signin`。 */
  signinPath?: string
}

/**
 * 壳内存状态。不是 `UiContext`。业务读 `app.state.modules` / `app.state.user`。
 */
export interface MmdaApplicationState {
  user: OAuthUser
  modules: Module[]
  /** 当前路由管着的前缀，例如 BASE / MES。 */
  localAppPrefixes?: string[]
  authenticated?: boolean
  expandSidebar?: boolean
  expandUserMenu?: boolean
  envMode?: string
  isDark?: boolean
  colorPalette: string
  systemList?: any[]
  todoCount?: number
  theLatestTodoList?: any[]
}

function isInvalidTokenError(error: unknown): boolean {
  const status = Number((error as { status?: number })?.status ?? 0)
  if (status === 401) return true
  const text = [
    (error as { message?: string })?.message,
    (error as { title?: string })?.title,
    (error as { detail?: string })?.detail,
  ]
    .filter(Boolean)
    .join(' ')
  return /jwt|access.?token|invalid.?token|token.*(expired|rejected|invalid)|unauthorized|unauthenticated/i.test(
    text,
  )
}

function resolveFetchBaseUrl(baseUrl: string): string | URL {
  if (/^[a-z][a-z\d+\-.]*:/i.test(baseUrl) || baseUrl.startsWith('//')) {
    return baseUrl
  }
  if (typeof globalThis.location !== 'undefined') {
    return new URL(baseUrl, globalThis.location.origin)
  }
  return baseUrl
}

function readFlag(key: string, fallback: boolean) {
  if (typeof localStorage === 'undefined') return fallback
  const raw =
    key === 'isDark' ? localStorage.getItem(`mmda/${key}`) : localStorage.getItem(key)
  if (raw == null) return fallback
  try {
    return JSON.parse(raw) as boolean
  } catch {
    return fallback
  }
}

/**
 * MMDA 应用壳（框架无关 abstract class）。
 * vui 实现为 `MmdaVueApp extends MmdaApplication`。
 * 弹层走 `ui`（`app.ui.confirm`），不要在壳上再转发 toast/confirm/dialog。
 */
export abstract class MmdaApplication {
  readonly name: string
  readonly api: OAuth2ApiClient
  readonly meta: MetaUiService
  readonly di: DependencyContainer
  state: MmdaApplicationState
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUris?: string
  readonly signinPath: string
  /** 启动恢复会话期间抑制 401→强制跳登录，交给 signinAuto 自行 refresh */
  protected restoringAuth = false
  /** Prevent concurrent 401 / bad-JWT redirects. */
  private redirectingToSignin = false
  /** 公共 SSO 库：仅 user / config，与模块 localDb 分离 */
  protected readonly ssoDb: LocalAsyncDb

  get user() {
    return this.state.user
  }

  get modules() {
    return this.state.modules
  }

  get authenticated() {
    return this.state.authenticated
  }

  get canAccess() {
    const expiry = this.resolveAuthExpiry()
    return !!this.authenticated && !!this.user?.userId && expiry > Date.now()
  }

  get locale() {
    return this.meta.locale
  }

  get localDb() {
    return this.meta.localDb
  }

  constructor(
    baseUrl: string,
    service: string,
    public readonly ui: UiBuilder,
    options?: string | MmdaApplicationOptions,
  ) {
    const opts: MmdaApplicationOptions =
      typeof options === 'string' ? { envMode: options } : (options ?? {})
    this.clientId = opts.clientId ?? ''
    this.clientSecret = opts.clientSecret ?? ''
    this.redirectUris = opts.redirectUris
    this.name = service
    this.signinPath = opts.signinPath ?? `/${service.toUpperCase()}/Signin`
    const locale = opts.locale ?? 'zh'
    this.api = new OAuth2ApiClient(
      new FetchApi({
        baseUrl: resolveFetchBaseUrl(baseUrl),
        credentials: 'include',
      }),
      {
        service,
        locale,
      },
    )
    this.api.setUnauthorizedErrorHandler(() => {
      this.redirectToSignin()
    })
    const prevErrorHandler = this.api.http.errorHandler
    this.api.http.errorHandler = (err, req) => {
      if (!this.restoringAuth && isInvalidTokenError(err)) {
        this.redirectToSignin()
      }
      if (prevErrorHandler) return prevErrorHandler(err, req)
      throw err
    }
    this.meta = defaultMetaUiService(this.api)
    this.ssoDb = useMmdaSsoDb()
    this.di = createDependencyContainer()
    this.state = {
      user: { username: '', userId: '', userType: 0, expiryOn: Date.now() },
      modules: [],
      authenticated: false,
      envMode: opts.envMode,
      expandSidebar: readFlag('expandSidebar', true),
      isDark: readFlag('isDark', false),
      colorPalette:
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('mmda/colorPalette')
          : null) ?? 'purple',
      expandUserMenu: false,
      todoCount: 0,
      theLatestTodoList: [],
      systemList: [],
    }
  }

  /** 将当前内存中的登录态写入公共 SSO 库（mmda），供同域各应用恢复会话 */
  async syncAuthState(): Promise<void> {
    if (!this.canAccess) return
    const user = this.user
    const expiryOn = this.resolveAuthExpiry(null, user)
    if (expiryOn) user.expiryOn = expiryOn
    await this.persistAuthSession(user)
  }

  findModule(nameOrUrl: string) {
    return this.meta.findModule(nameOrUrl)
  }

  async signin(
    username: string,
    password: string,
    keepLogin = true,
    clientProps: ClientProps = {},
  ) {
    const clientId = clientProps.clientId ?? this.clientId
    const clientSecret = clientProps.clientSecret ?? this.clientSecret
    const redirectUris = clientProps.redirectUris ?? this.redirectUris
    const user = await this.api.authenticate(
      username,
      password,
      clientId,
      clientSecret,
      redirectUris,
    )
    user.username = decodeURIComponent(user.username)
    const modules = await this.meta.getModules(true)
    if (keepLogin) {
      await this.persistAuthSession(user)
    }
    await this.getSystems(true)
    this.state.user = user
    this.state.modules = modules
    this.state.authenticated = true
    return this.user
  }

  /** Clear in-memory session + API tokens; IndexedDB cleanup can be async. */
  clearAuthMemory() {
    this.state.user = {
      username: '',
      userId: '',
      userType: 0,
      expiryOn: Date.now(),
    }
    this.state.modules = []
    this.state.authenticated = false
    this.api.config.accessToken = ''
    this.api.config.refreshToken = ''
  }

  /**
   * JWT/session invalid: jump to sign-in immediately.
   * Do not await IndexedDB first — that left a blank protected page when IDB stalled.
   */
  redirectToSignin(returnPath?: string) {
    if (this.restoringAuth || this.redirectingToSignin) return
    if (typeof window === 'undefined') return
    const current = window.location.pathname
    if (
      current === this.signinPath ||
      current.endsWith('/Signin') ||
      current.endsWith('/signin')
    ) {
      this.clearAuthMemory()
      return
    }
    this.redirectingToSignin = true
    this.clearAuthMemory()
    void Promise.allSettled([
      this.ssoDb.deleteMany(['user', 'config']),
      this.localDb.deleteMany(['user', 'config', 'meta/systems']),
    ])
    const redirect = encodeURIComponent(
      returnPath ?? `${current}${window.location.search}`,
    )
    window.location.assign(`${this.signinPath}?redirect=${redirect}`)
  }

  async signOut() {
    this.clearAuthMemory()
    await Promise.allSettled([
      this.ssoDb.deleteMany(['user', 'config']),
      this.localDb.deleteMany(['user', 'config', 'meta/systems']),
    ])
    return true
  }

  afterSignOut?: () => Promise<boolean>

  /** 从公共 SSO 库恢复登录态（不读写 Cookie） */
  async signinAuto() {
    if (typeof document === 'undefined') return this.canAccess
    this.restoringAuth = true
    try {
      let user: any
      let config: any
      try {
        ;[user, config] = await this.ssoDb.getMany(['user', 'config'])
      } catch (error) {
        console.error(error)
      }
      if (!user?.userId || !config?.accessToken) {
        try {
          const fromApp = await this.localDb.getMany(['user', 'config'])
          user = fromApp[0]
          config = fromApp[1]
          if (user?.userId && config?.accessToken) {
            await this.ssoDb.putMany([
              ['user', user],
              ['config', config],
            ])
            await this.localDb.deleteMany(['user', 'config'])
          }
        } catch (error) {
          console.error(error)
        }
      }
      if (!user?.userId || !config?.accessToken) {
        await this.signOut()
        return false
      }

      user.username = decodeURIComponent(user.username)
      this.state.user = user

      const expiryOn = this.resolveAuthExpiry(config, user)
      if (expiryOn) {
        user.expiryOn = expiryOn
        this.state.user = user
      }

      this.state.authenticated = !!(user.userId && expiryOn > Date.now())
      if (!this.canAccess) {
        await this.signOut()
        return false
      }

      Object.assign(this.api.config, {
        locale: config.locale ?? this.api.config.locale,
        accessToken: config.accessToken,
        refreshToken: config.refreshToken ?? this.api.config.refreshToken,
        expiryInterval:
          config.expiryInterval ?? this.api.config.expiryInterval,
        expiresIn: config.expiresIn ?? this.api.config.expiresIn,
      })
      if (expiryOn) this.api.config.expiresIn = expiryOn

      try {
        this.state.modules = await this.meta.getModules(false)
        await this.getSystems()
      } catch (error) {
        console.error(error)
        const refreshed = await this.api.refreshToken()
        if (!refreshed) {
          await this.signOut()
          return false
        }
        try {
          this.state.modules = await this.meta.getModules(true)
          await this.getSystems(true)
          await this.persistAuthSession(this.user)
        } catch (retryError) {
          console.error(retryError)
          await this.signOut()
          return false
        }
      }
      return this.canAccess
    } catch (error) {
      console.error(error)
      await this.signOut()
      return false
    } finally {
      this.restoringAuth = false
    }
  }

  /** core 只改元数据 locale。Vue i18n 由 MmdaVueApp override。 */
  changeLocale(locale: string) {
    this.meta.changeLocale(locale)
  }

  repository(name: string) {
    return this.api.repository(name)
  }

  getRefSystemAddress(
    systemInfo: string | Record<string, any>,
    props?: Record<string, any>,
  ) {
    const { http } = this.api
    const address = isString(systemInfo)
      ? `/${systemInfo.toUpperCase()}`
      : systemInfo.moduleUrl ||
        `/${String(systemInfo.shortLabel ?? systemInfo.service ?? '').toUpperCase()}`
    const apiBase = String(http.baseUrl || '')
    let origin = ''
    if (apiBase.startsWith('/')) {
      origin = ''
    } else {
      try {
        const parsed = new URL(apiBase)
        origin =
          typeof window !== 'undefined' &&
          parsed.origin !== window.location.origin
            ? ''
            : parsed.origin
      } catch {
        origin = apiBase.replace(/\/api\/?$/, '')
      }
    }
    let url = `${origin}${address}`
    if (props?.repository) url += `/${props.repository}`
    if (props?.action) url += `/${props.action}`
    return url
  }

  async getSystems(reload = false) {
    try {
      const res = await this.meta.getSystems(
        'getSystemModules',
        'base',
        reload,
      )
      this.state.systemList = (res ?? []).map((item: any) => ({
        ...item,
        label: item.moduleLabel,
        service: String(item.shortLabel ?? '').toLowerCase(),
        href: this.getRefSystemAddress(item),
      }))
    } catch (err) {
      console.error(err)
    }
  }

  getSystem(moduleCode: string, systemList: any[]) {
    return systemList.find((item: any) => item.moduleCode === moduleCode) ?? {}
  }

  async getTodoCount() {
    this.state.todoCount = await this.meta.getTodoCount({
      service: 'base',
      repository: 'Notifications',
      action: 'getTodoCount',
      queryParams: { userID: this.user.userId },
    })
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'mmda/todoCount',
        JSON.stringify(this.state.todoCount),
      )
    }
  }

  protected async persistAuthSession(user: OAuthUser) {
    try {
      await this.ssoDb.putMany([
        ['user', user],
        [
          'config',
          {
            accessToken: this.api.config.accessToken,
            refreshToken: this.api.config.refreshToken,
            expiryInterval: this.api.config.expiryInterval,
            expiresIn: this.api.config.expiresIn,
            locale: this.api.config.locale,
            expiryOn: user.expiryOn,
          },
        ],
      ])
      await this.localDb.deleteMany(['user', 'config'])
    } catch (error) {
      console.error(error)
    }
  }

  protected resolveAuthExpiry(
    config?: Record<string, any> | null,
    user?: OAuthUser | null,
  ): number {
    const targetUser = user ?? this.user
    const targetConfig = config ?? null
    const raw =
      targetConfig?.expiryOn ??
      targetConfig?.expiresIn ??
      targetUser?.expiryOn ??
      this.api.config.expiresIn ??
      0
    return Number(raw) || 0
  }
}

