# 依赖注入（@mmda/core）

面向业务与框架开发者。这不是 Inversify 那种构造函数注入，而是**按应用持有的服务表**：启动时 `provide`，用的时候 `inject`。

组件树里的 UI 状态继续用 Vue 的 `provide` / `inject`。这里只放跨页面的框架服务：`ApiClient`、`MetaUiService`、页面 Logic、本地库等。

---

## 1. 最小例子

每个应用（MES、WES…）自己建一个容器，挂在 `MmdaApplication.di` 上。不要用模块级单例互相抢。

```ts
import { createDependencyContainer, createInjectionToken } from '@mmda/core'

export const MetaUiToken = createInjectionToken<MetaUiService>('MetaUiService')

export function createAppDi(api: ApiClient) {
  const di = createDependencyContainer()

  di.provide(MetaUiToken, () => new MetaUiServiceImpl(api))
  di.provide('wmsDb', () => new LocalStorageDb('wms')) // 默认单例

  return di
}

const di = createAppDi(api)
const meta = di.inject(MetaUiToken)
```

约定：

- **启动时**（`main` / `MmdaApplication` 构造）集中 `provide`
- **使用时**只 `inject` / `tryInject`，不要在业务函数里临时 `provide`
- 工厂写成 **`() => new Foo()`**，不要把 class 本身丢进去（`provide('X', Foo)` 会当成普通函数调用，没有 `new`）

---

## 2. Token：给服务起门牌

`provide` / `inject` 的第一个参数是门牌，类型是 `InjectionTokenLike<T>`：

```ts
type InjectionTokenLike<T> = string | symbol | InjectionToken<T>
```

三种写法都能用，**新代码只用第一种**。

### 推荐：`createInjectionToken<T>()`

把「名字」和「取出来的类型」绑在一起。`inject` 不用再写泛型。

```ts
const WmsDb = createInjectionToken<LocalStorageDb>('wmsDb')

di.provide(WmsDb, () => new LocalStorageDb('wms'))
const db = di.inject(WmsDb) // LocalStorageDb
```

同一个 token 要**定义一次、到处 import**，不要在两个文件里各 `createInjectionToken('wmsDb')` 一份。内部用 `id` 当 key，字符串相同会进同一货架。更稳妥的是一个模块导出常量：

```ts
// tokens.ts
export const WmsDb = createInjectionToken<LocalStorageDb>('wmsDb')
export const PutawayLogicToken = createInjectionToken<PutawayLogic>('PutawayLogic')
```

`InjectionToken<T>` 运行时只有 `{ id }`。泛型 `T` 只在编译期存在，用来让 `inject(WmsDb)` 推出类型。

### 可以：字符串（旧代码）

```ts
di.provide('wmsDb', () => new LocalStorageDb('wms'))
const db = di.inject<LocalStorageDb>('wmsDb') // 必须自己写类型
```

`'wmsDb'` 和 `LocalStorageDb` 没有关系。拼错名字、写错泛型，编译器都不拦。两包都注册 `'Logger'` 会互相覆盖。

**不要**用 `SomeClass.name` 当 token。生产压缩后类名可能变成 `a`。

### 偶尔：`symbol`

需要隔离、又不想建 `InjectionToken` 时：

```ts
const Logger = Symbol('Logger')
di.provide(Logger, () => new ConsoleLogger())
di.inject<Logger>(Logger)
```

`Symbol('Logger')` 每次调用都是新 key。必须像 token 一样做成模块级常量再导出。

---

## 3. 生命周期

`provide(token, factory, lifetime?)` 第三个参数：

| 值 | 行为 | 典型用途 |
|---|---|---|
| 省略 / `'singleton'` | 第一次 `inject` 建实例，之后一直复用 | ApiClient、MetaUiService、Db |
| `'scoped'` | 引用计数；`release` 归零后丢掉**实例**，注册还在 | 跟一次编辑会话走的 Logic |
| `'transient'` | 每次 `inject` 都 `new` | 无状态小对象、测试桩 |

```ts
di.provide(ApiToken, () => new OAuthApiClient(...))           // 单例
di.provide(EditorLogicToken, () => new EditorLogic(), 'scoped')
di.provide(IdToken, () => ({ id: crypto.randomUUID() }), 'transient')
```

### scoped 怎么配对

```ts
const logic = di.inject(EditorLogicToken)
try {
  await logic.save()
} finally {
  di.release(EditorLogicToken)
}
```

- `inject` 一次，计数 +1；`release` 一次，计数 -1
- 计数到 0：实例扔掉，**下次 `inject` 再 new**
- 漏掉 `release`：实例常驻，等于单例，还可能泄漏订阅
- 对 singleton / transient 调用 `release` 没有效果

这不是「HTTP 请求作用域」，只是手动引用计数。页面销毁时记得 `release`。

---

## 4. 取值：inject / tryInject / injectAsync

| 方法 | 找不到 / 工厂失败 | 适用 |
|---|---|---|
| `inject(token)` | **抛错** | 启动时必有的服务 |
| `tryInject(token)` | `undefined` | 可选插件、尚未注册的扩展 |
| `injectAsync(token)` | 抛错 | 工厂返回 `Promise`（动态 import、远程配置） |

```ts
const meta = di.inject(MetaUiToken)

const extra = di.tryInject(OptionalPluginToken)
if (extra) extra.install()

const heavy = await di.injectAsync(BpmnToken)
```

工厂如果是 `async () => ...`，同步 `inject` 会报错并提示改用 `injectAsync`。单例异步工厂只跑一次，结果会缓存。

不要写：

```ts
// 错误：找不到会抛，不能当可选
const x = di.inject('maybe')
if (!x) { ... }
```

应写成 `tryInject`。

---

## 5. 和 Vue provide / inject 怎么分工

| | `@mmda/core` DI | Vue `provide` / `inject` |
|---|---|---|
| 生命周期 | 跟应用 / 你写的 `release` | 跟组件树 |
| 放什么 | Api、Meta、Logic、Db | 当前页的 `UiContext`、表单 model |
| 谁创建 | `MmdaApplication` 启动时 | `setup()` |

同一功能不要两套都注册。例如 `UiBuilder` 走应用 DI；当前打开的那一行 `UiContext` 走 Vue。

---

## 6. 测试

每个用例新建容器，不要共用。

```ts
import { createDependencyContainer, createInjectionToken } from '@mmda/core'

const ApiToken = createInjectionToken<ApiClient>('Api')

it('保存时调用 api', () => {
  const di = createDependencyContainer()
  const api = { save: vi.fn() } as unknown as ApiClient
  di.provide(ApiToken, api)

  const logic = new PutawayLogic(di.inject(ApiToken))
  logic.save()
  expect(api.save).toHaveBeenCalled()
})
```

需要替换实现时，对同一 token 再 `provide` 一次即可覆盖。

---

## 7. 常见错误

1. **用 `Class.name` 当 key** — 压缩后会坏。改用 `createInjectionToken`。
2. **`provide('X', MyClass)`** — 不会 `new`。写成 `() => new MyClass()`。
3. **业务代码里到处 `provide`** — 注册集中在应用启动；模块只导出 token 和工厂函数。
4. **两个文件各写一个 `createInjectionToken('Foo')` 还当不同服务** — `id` 相同会进同一货架。token 只定义一次并 export。
5. **scoped 不 `release`** — 内存和订阅泄漏。
6. **把 Vue 组件实例放进容器** — 组件会销毁，容器还握着引用。
7. **在 `inject` 的工厂里再 `inject` 尚未注册的依赖** — 没有自动按拓扑排序。先注册被依赖的（Api → Meta → Logic）。

---

## 8. 从旧 API 迁移

| 旧写法 | 新写法 |
|---|---|
| `DependencyFactory` | `DependencyContainer` |
| `createDependencyFactory()` | `createDependencyContainer()` |
| `createToken()` | `createInjectionToken()` |
| `TokenLike` | `InjectionTokenLike` |
| `unuse()` | `release()` |
| `dependencyFactory` 全局一份 | `createDependencyContainer()`，放在 app 上 |
| `inject` 找不到返回 `undefined` | 必选用 `inject`（抛错）；可选用 `tryInject` |
| `MetaUiService.name` | `createInjectionToken<MetaUiService>('MetaUiService')` |
| `'signleton'` | `'singleton'` |

应用侧示例：

```ts
class MmdaApplication {
  readonly di = createDependencyContainer()

  constructor(api: ApiClient) {
    this.di.provide(MetaUiToken, () => defaultMetaUiService(api))
  }
}
```

`DependencyFactory`、`TokenLike` 仍作为类型别名导出，标了 `@deprecated`，便于旧代码编译。没有 `unuse` / `createToken` 的运行时别名。
