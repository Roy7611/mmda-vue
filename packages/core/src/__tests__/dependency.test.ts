import { describe, expect, it } from 'vitest'
import {
  createDependencyContainer,
  createInjectionToken,
} from '../di/dependency'

class Service {
  constructor(public readonly id: number) {}
}

describe('createDependencyContainer', () => {
  it('两个容器互不污染', () => {
    const a = createDependencyContainer()
    const b = createDependencyContainer()
    a.provide('s', () => new Service(1))
    expect(a.inject<Service>('s').id).toBe(1)
    expect(b.tryInject('s')).toBeUndefined()
  })
})

describe('singleton', () => {
  it('默认 lifetime 是单例', () => {
    const di = createDependencyContainer()
    let n = 0
    di.provide('s', () => new Service(++n))
    expect(di.inject<Service>('s')).toBe(di.inject<Service>('s'))
    expect(n).toBe(1)
  })

  it('可直接 provide 实例', () => {
    const di = createDependencyContainer()
    const s = new Service(9)
    di.provide('s', s)
    expect(di.inject<Service>('s')).toBe(s)
  })
})

describe('transient', () => {
  it('每次 inject 新建', () => {
    const di = createDependencyContainer()
    let n = 0
    di.provide('s', () => new Service(++n), 'transient')
    const a = di.inject<Service>('s')
    const b = di.inject<Service>('s')
    expect(a).not.toBe(b)
    expect(n).toBe(2)
  })
})

describe('scoped', () => {
  it('同一作用域内复用实例', () => {
    const di = createDependencyContainer()
    let n = 0
    di.provide('s', () => new Service(++n), 'scoped')
    const a = di.inject<Service>('s')
    const b = di.inject<Service>('s')
    expect(a).toBe(b)
    expect(n).toBe(1)
  })

  it('release 归零后保留注册并新建实例', () => {
    const di = createDependencyContainer()
    let n = 0
    di.provide('s', () => new Service(++n), 'scoped')
    di.inject('s')
    di.release('s')
    const next = di.inject<Service>('s')
    expect(next.id).toBe(2)
    expect(n).toBe(2)
  })

  it('未归零时 release 不清实例', () => {
    const di = createDependencyContainer()
    di.provide('s', () => new Service(1), 'scoped')
    const first = di.inject<Service>('s')
    di.inject('s')
    di.release('s')
    expect(di.inject<Service>('s')).toBe(first)
  })
})

describe('inject / tryInject', () => {
  it('未注册时 inject 抛错', () => {
    const di = createDependencyContainer()
    expect(() => di.inject('missing')).toThrow(/missing has not been provided/)
  })

  it('未注册时 tryInject 返回 undefined', () => {
    const di = createDependencyContainer()
    expect(di.tryInject('missing')).toBeUndefined()
  })

  it('工厂返回 Promise 时 inject 提示 injectAsync', () => {
    const di = createDependencyContainer()
    di.provide('s', async () => new Service(1))
    expect(() => di.inject('s')).toThrow(/injectAsync/)
  })
})

describe('injectAsync', () => {
  it('解析异步工厂并单例缓存', async () => {
    const di = createDependencyContainer()
    let n = 0
    di.provide('s', async () => new Service(++n))
    const a = await di.injectAsync<Service>('s')
    const b = await di.injectAsync<Service>('s')
    expect(a).toBe(b)
    expect(n).toBe(1)
  })
})

describe('createInjectionToken', () => {
  it('按 token 注入并保留类型', () => {
    const di = createDependencyContainer()
    const ServiceToken = createInjectionToken<Service>('Service')
    di.provide(ServiceToken, () => new Service(3))
    const s = di.inject(ServiceToken)
    expect(s.id).toBe(3)
  })
})
