# UiRenderer + RxFactory + UiRouter 抽象计划

## 目标

把当前散布在 vui / rui 中的响应式实现和渲染函数统一到 core，让 `WithData` / `WithReference` / `WithSubgroup` / `WithForm` / `WithList` 等 ~2000 行拼屏逻辑只写一份。

---

## 术语

渲染器按粒度分三层，本文的 `UiRenderer` 指最底层：

```text
UiRenderer        core  最底层渲染：render(tag, props, children)，只拼 HTML 壳（div/span/section）
UiFieldRenderer   core  字段级渲染：一个 MetaUiField 的裸控件渲染函数
UiGroupRenderer   core  组级渲染：字段组合 / 子表（一个 MetaUiGroup）
```

- vui 现有“值渲染器” `UiRenderer<T>`（`vui/src/ui/factory.ts`）改名 `VueUiRenderer`，不与本文 `UiRenderer` 撞名。
- `UiFieldRenderer` / `UiGroupRenderer` 都已在 core（`ui/field_factory.ts` / `ui/group_factory.ts`），泛型 `TNode`；vui 侧只留 `VNode` 收窄别名（`VueFieldRenderer` / `VuiGroupRenderer`）。

---

## 一、三个核心接口

### UiRenderer（渲染函数）—— `core/src/ui/renderer.ts`

```ts
interface UiRenderer<TNode, TProps = unknown> {
  render(tag: string, props?: TProps, children?: TNode[]): TNode
}
```

即 `AbstractUiLayout.render`（已由 `wrap` 改名）。只拼 HTML 壳（div/span/section），组件调用走 factory。

### RxFactory（响应式工厂）—— `core/src/ui/rx.ts`

```ts
interface Ref<T> { value: T }

interface RxFactory {
  /** 值 → 响应式：基本类型走 Ref，对象走 reactive proxy。自动判断。 */
  rx<T>(val: T): T extends object ? T : Ref<T>
  /** 派生值 */
  computed<T>(fn: () => T): Ref<T>
  /** 值变化监听。返回 stop 函数。 */
  watch(source: Ref<any> | (() => any), cb: (val: any) => void): () => void
}
```

| 方法 | Vue 实现 | React 实现（valtio） |
|---|---|---|
| `rx(false)` | `ref(false)` | `proxy({ value: false })` |
| `rx(obj)` | `shallowReactive(obj)` | `proxy(obj)` |
| `computed(fn)` | `computed()` | `derive(fn)` |
| `watch(src, cb)` | `watch()` | `subscribe(src, cb)` |

`rx` 刻意保留单方法自动分发：程序员不用在 `ref` / `reactive` 之间选择；条件返回类型覆盖常用场景（基本类型 → `Ref<T>`，对象/数组 → 代理），可空联合等边角由实现侧 `typeof` 分发处理。

### AbstractUiContext 便捷方法

`AbstractUiContext`（实现侧）直接挂三个薄方法，内部委托 `rxFactory`；公开的 `UiContext` 契约**不加**，Logic 不管响应式：

```ts
abstract class AbstractUiContext<M> {
  constructor(protected rxFactory: RxFactory) {}

  rx<T>(val: T) { return this.rxFactory.rx(val) }
  computed<T>(fn: () => T) { return this.rxFactory.computed(fn) }
  watch(source: any, cb: any) { return this.rxFactory.watch(source, cb) }
}
```

会话实现（`WithData` / `WithForm` 等 mixin）用 `this.rx(false)` / `this.watch(...)`，不感知 `rxFactory`；业务 Logic 只读 `context`，不调用这三个方法。

---


### UiRouter（路由）—— `core/src/ui/router.ts`

```ts
interface UiRouter {
  push(path: string): void
  resolve(path: string): string
}
```

| 方法 | Vue 实现 | React 实现 |
|---|---|---|
| `push(path)` | `router.push(path)` | `navigate(path)` |
| `resolve(path)` | `router.resolve(path).href` | `generatePath` + 拼接 |

`AbstractUiContext` 收 `router: UiRouter`，`routeTo*` 方法直接写在 Context 上——所需参数（`metaUi` / `model` / `app`）全在 Context 自身，URL 拼接为纯字符串操作，框架无关：

```ts
abstract class AbstractUiContext<M> {
  constructor(
    protected rxFactory: RxFactory,
    protected router: UiRouter,
  ) {}

  routeToIndex() {
    const path = this.resolveRoute('index')
    this.router.push(path)
  }
  routeToDetails(id: string) { ... }
  routeToEdit(id: string) { ... }
  routeToCreate() { ... }
  routeToSearch(params?) { ... }
  routeToRelative(field, item?) { ... }
}
```

不需要 `UiViewRouter` 中间层。

---
## 二、UiRenderer 嵌入设计

`{ render }` 只一个方法，按需切片注入各层，层间不互耦合。

```
UiRenderer<TNode>              ← core 契约
  { render(tag, props?, children?) }

AbstractUiLayout              ← 实现 render（wrap → render 改名）
  render(tag, props, children)   // 内部 cell/row/column/grid 也用 this.render(...)

Builder                        ← 持有 renderer（从 layout 来，也可独立注入）
  this.renderer = this.layout   // layout 本身就是 UiRenderer

AbstractUiFactory(renderer)    ← 工厂基类只依赖 { render }，不依赖 Layout
  textSpan(props) → renderer.render('span', ...)

Overlay                        ← 通过 builder.renderer 间接使用
  renderer.render('div', ...)   // toast / dialog 壳
```

**依赖链：**

```text
Layout ──实现──→ UiRenderer
                   ↑
Builder ──持有──┤
                   │ 注入
AbstractUiFactory ─┘
Overlay ←── builder.renderer
```

---

## 三、构造顺序

```
① Renderer + RxFactory + Router   三个平台原语，最早
     ↓
② Layout                          实现 UiRenderer（不依赖 Rx/Router）
     ↓
③ Factory / fieldFactory          依赖 renderer（不依赖 Rx/Router）
     ↓
④ Builder                         new Builder(factory, fieldFactory, layout, rxFactory)
     │                               ↑ rxFactory 直入 Builder
     ├── WithData/WithForm…        rx() + watch()
     ├── overlay                   renderer + factory.button
     └── createContext() → new Context(opts, rxFactory, router)
           ↓
⑤ Context                         loading = rx(false) / model = rx(data)
                                   routeTo* → router.push/resolve
                                   bindLogics → watch()
```

RxFactory + Router 只进 Builder → Context，Layout / Factory 不感知。

---

## 四、实施步骤

**状态：P4.1–P4.6 已完成**（P4.1：core 三个接口 + `wrap → render` + `AbstractUiContext` 的 `rx/computed/watch/navigate/routeTo*` 上移；vui 经 `vueRouter` 适配 `UiRouter`。P4.2：rui 删手写 signals，`ReactUiContext._state = proxy(...)`，`useReactUiContext` 走 `useSnapshot`，实现 `createReactRxFactory()`。P4.3：vui 实现 `createVueRxFactory()` 并注入 `VueUiContextBase`。P4.4：`loading/error/initializedState` 走 `this.rx()` 收进 `AbstractUiContext`，`load()` 上移；vui/rui 各删重复声明与覆写。P4.5：core 增加 `AbstractUiFactory`（constructor 注入 `UiRenderer`，提供 5 个纯 HTML 壳方法），`UiRenderer.render` 的 children 放宽为 `Array<TNode | string>` 支持文本子节点）。P4.6：将 `save()` / `delete()` / `refresh()` / `searchRelative()` 的通用逻辑壳上移 `AbstractUiContext`；删除 vui `mixins/data.ts` 重复的 `save()` / `refresh()` 与 `mixins/reference.ts` 重复的 `searchRelative()`；`delete()` 保留 Vue 侧副作用的薄覆写；`UiFactory` 补充 `timeline?` 可选成员。P4.7：`loadReferenceOptions` 上移 `AbstractUiContext`。P4.8：9 个子表方法（`getSelectedGroupItems` / `subGroupContext` / `subGroupItemContext` / `addSubGroupItem(s)` / `createSubGroupItems` / `removeSubGroupItem(s)` / `subGroupItem` / `newSubGroupItem`）上移 core；`createChild` 增加可选 `logic` 参数。已建 `AbstractUiBuilder` 前置基类，并收敛新代码 `any`（架构门禁 300/300 全绿）。P4.9（壳迁移完成，`@ts-nocheck` 已摘）：`VueUiBuilderBase` 已改为 `extends AbstractUiBuilder<VNode>`（`renderer` 复用 `layout`）；`form.ts` 的壳方法（`labelFor` / `groupWrapClass` / `wrapGroupContent` / `buildGroupFieldSet`）已删并走 base，`editFor` / `displayFor` / `buildField` / `buildResponsiveField` 改为委托 base，删除 5 个自由函数与 `FieldRowHost`；vui `layoutDomProps` 补压平 `htmlAttributes`；`buildGroup` 隐藏 span / `wrapGroup` 的 `none` div / 页根 `form` 也已改走 `renderer.render`。P4.10（完成）：`AbstractUiBuilder` 已承接 MetaUi 驱动的列表族（`list` / `table` / `grid` / `treeGrid` + `tableColumnWidth`），vui `list_view.ts` 的重复实现已删；`listViewParts` / `buildListView` 列表壳（toolbar/searchbar/分页装配）仍在 vui（强依赖 Vue 组件与 runtime）；`form.ts` / `list_view.ts` 已摘除 `@ts-nocheck` 并补齐类型。

> 注：valtio v2 已移除 `derive`，`createReactRxFactory` 的 `computed` / getter 版 `watch` 暂用 `valtio/utils` 的 deprecated `watch` 做依赖追踪，后续引入 `valtio-reactive` 再替换。
>
> P4.3 中「`VueUiContextBase` 可消除」依赖 P4.4 的响应式初始化上移，故并入 P4.4 一并处理。P4.4 后 `VueUiContextBase` 已删除 `loading/error/initializedState` 声明、`ref()` 初始化、`load()` / `initialized` 覆写。

### P4.1 — core 定义接口

- `core/src/ui/renderer.ts`：`UiRenderer<TNode>` 接口
- `core/src/ui/rx.ts`：`Ref<T>` + `RxFactory` 接口
- `core/src/ui/router.ts`：`UiRouter` 接口（`push` + `resolve`）
- `AbstractUiLayout.wrap` → `render` 改名
- `AbstractUiContext` 新增 `this.rxFactory` + `this.router` + 便捷方法 `rx()`/`computed()`/`watch()`/`navigate(path)`
- `routeTo*` 系列方法上移 `AbstractUiContext`

### P4.2 — rui 换 valtio

- 删手写 signals（`_subscribe` / `_getSnapshot` / `_notify`）
- `ReactUiContext._state = proxy({ model, loading, error, initializedState })`
- `useReactUiContext(ctx)` → `useSnapshot(ctx._state)`
- 实现 `createReactRxFactory()`

### P4.3 — vui 实现 RxFactory

- `createVueRxFactory()`：薄封装 Vue API，`rx()` 内 `typeof` 分发
- `VueUiContextBase` 可消除（响应式初始化上移后中间层为空）

### P4.4 — AbstractUiContext 接入 RxFactory

- `this.loading` / `this.error` / `this.initializedState` 走 `this.rx()`
- `bindLogics` 的 handler 解析逻辑上移 core，watch 调用留 `this.watch()`
- vui / rui 各删 ~30 行

### P4.5 — AbstractUiFactory(renderer)

core 增加 `AbstractUiFactory`（`factory_base.ts`）：constructor 注入 `UiRenderer`，
基类提供 5 个纯 HTML 壳方法，皮肤类继承并补齐平台控件：

- `textSpan(props)` → `renderer.render('span', { attributes }, [text])`
- `label(props)` → `renderer.render('label', { attributes }, [text])`
- `title(props)` → `renderer.render('h3', { attributes }, [text])`
- `subtitle(props)` → `renderer.render('small', { attributes }, [text])`
- `icon(props)` → `renderer.render('i', { class: props.iconClass, attributes }, [])`

为支持文本子节点，`UiRenderer.render` 的 `children` 放宽为 `Array<TNode | string>`。
皮肤类分层：core `AbstractUiFactory<TNode>` → rui 抽象类 `ReactUiFactory extends AbstractUiFactory<ReactNode>`（承载 React 通用默认实现与控件存根）→ 皮肤 `SfReactUiFactory extends ReactUiFactory`（只写厂商真实控件 / 图标表 / 弹层）。

### P4.6 — WithData mixin 上移（~500 行 → core）

- `save()` / `delete()` / `refresh()` / `searchRelative()` 的逻辑壳
- `_setLoading(v)` / `setModel(m)` / `setError(e)`
- 全部走 `this.rx()` / `this.watch()`

### P4.7 — WithReference mixin 上移（~200 行 → core）

- `loadReferenceOptions`：rx + computed 配合

### P4.8 — WithSubgroup mixin 上移（~300 行 → core）

- `subGroupContext` / `subGroupItemContext` / `addSubGroupItem` / `removeSubGroupItem` / `newSubGroupItem`
- 依赖 `this.rx(model)` 做行级响应式

### P4.9 — WithForm 的 `h()` → `renderer.render`（~400 行 → core）

- `labelFor` / `editFor` / `displayFor` / `buildFieldGroup` 中拼壳部分
- Vue 组件调用（GroupCard、GroupTab）留 vui
- 前置：修 `@ts-nocheck`

### P4.10 — WithList 的 `h()` → `renderer.render`（~500 行 → core）

- 列表视图壳、列配置、分页器包装
- 前置：修 `@ts-nocheck`；建 `AbstractUiBuilder` 抽象类

---

## 五、总量估算

| 层 | 变化 |
|---|---|
| core | **+~2000 行**（接口 + 上移的业务逻辑） |
| vui | **-~1950 行**（删 mixin + 删 VueUiContextBase） |
| rui | **-~1950 行**（白得，本来就没实现） |

vui 最终只留：Vue 组件（GroupCard、IndexPage）、router 集成、i18n 封装、皮肤 CSS。rui 同理只留 React 对应物。

---

## 六、前置条件

- P4.2 前确认 valtio `subscribe` 能覆盖 `watch` 的两种用法
- P4.6–P4.8 前修 `WithForm`/`WithList` 的 `@ts-nocheck`（两个文件共 2360 行）
- P4.9–P4.10 前建 `AbstractUiBuilder` 抽象类（承接 mixin 链 + 注入 RxFactory + Renderer）
