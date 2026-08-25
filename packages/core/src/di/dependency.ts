import { isFunction, isPromise } from '../utils/is'

/**
 * 依赖生命周期：
 * - singleton 全局同一实例（默认）
 * - scoped 引用计数，release 归零后丢弃实例、保留注册
 * - transient 每次 inject 新建
 */
export type DependencyLifetime = 'singleton' | 'scoped' | 'transient'

export type DependencyConstructor<T> = () => T | Promise<T>

declare const tokenType: unique symbol

/** 带类型的注入令牌 */
export interface InjectionToken<T> {
  readonly id: string | symbol
  readonly [tokenType]?: T
}

/** provide / inject 可接受的门牌 */
export type InjectionTokenLike<T = unknown> = string | symbol | InjectionToken<T>

/** @deprecated 使用 InjectionTokenLike */
export type TokenLike<T = unknown> = InjectionTokenLike<T>

export function createInjectionToken<T>(id: string | symbol): InjectionToken<T> {
  return { id }
}

function tokenKey(token: InjectionTokenLike): string | symbol {
  if (typeof token === 'string' || typeof token === 'symbol') return token
  return token.id
}

function tokenLabel(token: InjectionTokenLike): string {
  const key = tokenKey(token)
  return typeof key === 'symbol' ? key.description ?? String(key) : String(key)
}

function isFactory<T>(value: T | DependencyConstructor<T>): value is DependencyConstructor<T> {
  return isFunction(value)
}

interface Dependency<T = unknown> {
  ctor: T | DependencyConstructor<T>
  lifetime: DependencyLifetime
  cache?: T
  scopes: number
}

/**
 * 依赖容器：登记服务并按 token 解析。
 *
 * ```ts
 * import { createDependencyContainer, createInjectionToken } from '@mmda/core'
 *
 * const MetaUiToken = createInjectionToken<MetaUiService>('MetaUiService')
 * const di = createDependencyContainer()
 *
 * di.provide(MetaUiToken, () => new MetaUiServiceImpl())
 * di.provide('wmsDb', () => new LocalStorageDb('wms'), 'singleton')
 * di.provide('RowLogic', () => new RowLogic(), 'scoped')
 * di.provide('Scratch', () => ({ n: Math.random() }), 'transient')
 *
 * const meta = di.inject(MetaUiToken)
 * const maybe = di.tryInject('optional')
 * await di.injectAsync(AsyncToken)
 * di.release('RowLogic')
 * ```
 */
export interface DependencyContainer {
  provide<T>(
    token: InjectionTokenLike<T>,
    impl: T | DependencyConstructor<T>,
    lifetime?: DependencyLifetime,
  ): DependencyContainer

  /** 未注册或工厂返回 undefined 时抛错 */
  inject<T>(token: InjectionTokenLike<T>): T

  /** 未注册时返回 undefined，不打日志 */
  tryInject<T>(token: InjectionTokenLike<T>): T | undefined

  /** 解析可能返回 Promise 的工厂 */
  injectAsync<T>(token: InjectionTokenLike<T>): Promise<T>

  /** scoped：减少引用；归零后清除实例、保留 provide */
  release(token: InjectionTokenLike): void
}

/** @deprecated 使用 DependencyContainer */
export type DependencyFactory = DependencyContainer

class DependencyContainerImpl implements DependencyContainer {
  private readonly dependencies = new Map<string | symbol, Dependency>()

  provide<T>(
    token: InjectionTokenLike<T>,
    impl: T | DependencyConstructor<T>,
    lifetime?: DependencyLifetime,
  ): DependencyContainer {
    this.dependencies.set(tokenKey(token), {
      ctor: impl,
      lifetime: lifetime ?? 'singleton',
      scopes: 0,
    })
    return this
  }

  private lookup<T>(token: InjectionTokenLike<T>): Dependency<T> | undefined {
    return this.dependencies.get(tokenKey(token)) as Dependency<T> | undefined
  }

  private cacheIfNeeded<T>(d: Dependency<T>, value: T): T {
    if (d.lifetime === 'transient') return value
    d.cache = value
    if (d.lifetime === 'scoped') {
      d.scopes = d.scopes === 0 ? 1 : d.scopes + 1
    }
    return value
  }

  private readCache<T>(d: Dependency<T>): T | undefined {
    if (d.lifetime === 'transient' || d.cache === undefined) return undefined
    if (d.lifetime === 'scoped') {
      d.scopes += 1
    }
    return d.cache
  }

  private resolveSync<T>(token: InjectionTokenLike<T>, d: Dependency<T>): T {
    const cached = this.readCache(d)
    if (cached !== undefined) return cached

    if (isFactory(d.ctor)) {
      const created = d.ctor()
      if (isPromise(created)) {
        throw new Error(
          `${tokenLabel(token)} factory returned a Promise; use injectAsync().`,
        )
      }
      if (created === undefined) {
        throw new Error(`${tokenLabel(token)} factory returned undefined.`)
      }
      return this.cacheIfNeeded(d, created)
    }

    return this.cacheIfNeeded(d, d.ctor)
  }

  inject<T>(token: InjectionTokenLike<T>): T {
    const d = this.lookup<T>(token)
    if (!d) {
      throw new Error(`${tokenLabel(token)} has not been provided.`)
    }
    return this.resolveSync(token, d)
  }

  tryInject<T>(token: InjectionTokenLike<T>): T | undefined {
    const d = this.lookup<T>(token)
    if (!d) return undefined
    try {
      return this.resolveSync(token, d)
    } catch {
      return undefined
    }
  }

  async injectAsync<T>(token: InjectionTokenLike<T>): Promise<T> {
    const d = this.lookup<T>(token)
    if (!d) {
      throw new Error(`${tokenLabel(token)} has not been provided.`)
    }

    const cached = this.readCache(d)
    if (cached !== undefined) return cached

    if (isFactory(d.ctor)) {
      const created = await d.ctor()
      if (created === undefined) {
        throw new Error(`${tokenLabel(token)} factory returned undefined.`)
      }
      return this.cacheIfNeeded(d, created)
    }

    return this.cacheIfNeeded(d, d.ctor)
  }

  release(token: InjectionTokenLike): void {
    const d = this.lookup(token)
    if (!d || d.lifetime !== 'scoped') return

    d.scopes = Math.max(0, d.scopes - 1)
    if (d.scopes === 0) {
      d.cache = undefined
    }
  }
}

export function createDependencyContainer(): DependencyContainer {
  return new DependencyContainerImpl()
}
