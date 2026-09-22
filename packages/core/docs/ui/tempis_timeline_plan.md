# Tempis 时间轴画布（二维）落地计划

> **状态**：计划已定，待实施（P0–P5）。本文是 Tempis 体系的真源；实施过程中若与代码分叉，以本文为设计依据、以代码为事实依据，并回改本文。
> **拍定立场**（用户）：Tempis 是**二维**（时间 × 泳道）画布、支持 item 之间的关系（依赖箭头），**不当作标准 timeline**；**标准时间轴不是插件**——回到 chrome `factory.timeline`，**不进 Builder**（原 `buildTimeline` 整体取消）；Tempis 独立成体系，Builder 具名入口 **`builder.buildTempisTimeline`**，契约用 `UiTempisTimelineProps extends UiTimelineProps`（**共享契约只留普通 timeline 有的东西**：控制器 / 事件 / tooltip 模板 / `range` 全归 Tempis 层）。
> **契约主人**：`@mmda/core`（`src/ui/plugins/tempis_timeline.ts`）。
> **引擎宿主**：`@mmda/vuix-tempis-timeline`（Vue）、`@mmda/ruix-tempis-timeline`（React）。
> 相关文档：[`timeline.md`](../../../vui/docs/timeline.md)（列表时间轴）、[`naming.md`](../../../../docs/naming.md)（命名）、[`ui_four_roles_design.md`](./ui_four_roles_design.md)（插件位置）。

---

## 0. 为什么另立一档

| | 列表时间轴（`factory.timeline`） | Tempis 画布 |
|---|---|---|
| 维度 | 一维事件序列 | 时间 × 泳道（分组） |
| 形状 | 点（时间戳 + 文案） | 点 + 区间条，自动堆叠 |
| 关系 | 无 | `dependencies`（source → target 箭头） |
| 轴 | 无 | 可平移 / 缩放 / 固定范围 / 上下轴 / 小地图 |
| 渲染 | DOM 列表 | canvas 虚拟化（千级条目） |
| 数据 | 行数据 | 行数据 + **轴级数据**（categories / bands / dependencies） |
| 类比 | 审批流、日志 | 甘特、排程 |

共同点只有 `items` + `*Field` 绑定 + `UiProps` 壳三键。所以共用接口只能共用这层，其余各归各家（见 §3.3 的下沉表）。

---

## 1. 现状实测（基线，2026-09-22 在本机跑过）

| 事实 | 证据 |
|---|---|
| `@mmda/vuix-tempis-timeline` v1.2.0 已存在，是骨架 | `packages/vuix-tempis-timeline/src/`，3 源文件 162 行 + 55 行测试 |
| 该包 `vitest run` **3 passed**（实测） | `cd packages/vuix-tempis-timeline && ./node_modules/.bin/vitest run --reporter=dot` |
| `@tempis/timeline` 1.3.0 已装（optional peer，pnpm 自动装） | `node_modules/.pnpm/@tempis+timeline@1.3.0/.../dist/*.d.ts` |
| 插件当前只接线 8 个键 | 映射 `tempis_map.ts:12-17`（responsive/items/range/rtl）+ `tempis_plugin.ts:79-88`（3 回调） |
| 插件现在**覆盖** `factory.timeline` | `vui/src/ui/plugins/timeline.ts:63-72` 的 `timelineAsPlugin`；`core/src/ui/plugins/plugin_host.ts:89-96` 的回落特例 |
| 标准时间轴被当插件挂在 Builder 上（**本次取消**） | `core/src/ui/builder.ts:305` 的 `UiBuilder.buildTimeline` + `plugin_host.ts:44,89-96`；调用点仅 2 个测试（`vui/src/__tests__/timeline.test.ts:83,99`、`rui/src/__tests__/plugin_host.test.ts:34-36`），业务 **0 处** |
| `createTempisTimelinePlugin` 业务调用 **0 处**（只有 6 处文档提及） | `grep -rn createTempisTimelinePlugin packages/{app,base,mes,playground}` 为空 |
| `UiPluginName.timeline` 只有 1 处使用 | 即上面的 `timelineAsPlugin` |
| rui 侧零基础：`rui-syncfusion` 没有 `factory/timeline` | `packages/rui-syncfusion/src/factory/` 无 timeline 文件 → 摘掉 `buildTimeline` 后，rui 的**列表**时间轴等于没有实现（本计划不补；Tempis 走自己的入口） |
| core 契约字段 29 个，三个皮肤合计真正消费 3 个，四者公共字段 **0 个** | §1.1 |
| core 非测试源码 `any` 计数 **238**，门禁上限 **265** | `core/src/__tests__/architecture_gate.test.ts`（留 27 余量） |

### 1.1 「共用接口、零共用字段」的证据

| 消费者 | 真正消费 | 显式解构丢弃 |
|---|---|---|
| Syncfusion 皮肤 | 6：`reverse` `locale` `rtl` `persist` `template` `onReady` | 23 |
| PrimeVue 皮肤 | 2：`reverse` `onReady` | 25 |
| Naive 皮肤 | 2：`reverse` `onReady` | 25 |
| Tempis 插件 | 8：`items` `range` `rtl` `height` + 3 回调 + 字段绑定 | — |
| **交集** | **∅** | |

即：今天 `UiTimelineProps` 是个「谁的字段都往里塞、谁都不全用」的共用袋子（`packages/vui/docs/timeline.md:26-35` 那张表的「忽略」列就是这个症状）。这是本次要拆的东西。

---

## 2. 与 Tempis 1.3.0 的差距（逐项对过 d.ts）

| 对象 | Tempis | 现契约能表达 | 缺 |
|---|---|---|---|
| `TempisTimelineOptions` | 24 | 6 | **18** |
| item 键 | 9 | 6（用 `key` 替 `id`，缺 `style` / `selected`） | 3 |
| 实例方法（公开） | 17 | 5 | **12** |
| `categories` / `bands` / `dependencies` | 三种子结构 | 无对应类型 | 3 |

缺的具体项：`responsive` `accessibility` `verticalFill` `legend` `tooltip` `style` `scrollbar` `minimap` `grouping` `stackMode` `selection` `categories` `bands` `dependencies` `onItemDoubleClick` `onItemContextClick` `onItemHover` `onGroupToggle`；方法侧缺 `getSelection` `clearSelection` `getItems` `setItems` `getCategories` `setCategories` `setBands` `setDependencies` `setGroupCollapsed` `isGroupCollapsed`。

---

## 3. 契约设计

### 3.1 入口：标准时间轴回 `factory.timeline`，Tempis 另立 `buildTempisTimeline`

**一、标准时间轴摘掉插件外壳**

时间轴本来就是 chrome 控件（三个皮肤都实现了 `factory.timeline`），却被额外包了一层 Builder 具名方法 + 插件回落。全部删除：

| 位置 | 处置 |
|---|---|
| `core/src/ui/builder.ts:305` | 删 `UiBuilder.buildTimeline` 声明 |
| `core/src/ui/plugins/plugin_host.ts:44,89-96` | 删 `PLUGIN_HOST_METHODS` 里的 `'buildTimeline'`；删 `buildTimeline` 方法（含「插件优先 → 回落 factory」特例） |
| `core/src/ui/plugins/plugin_host.ts:26` | 删 `NOT_INSTALLED['timeline']` |
| `core/src/ui/plugins/plugin.ts` | 删 `UiPluginName.timeline`（删掉 `timelineAsPlugin` 后是死名字） |
| `vui/src/ui/plugins/timeline.ts:63-72` | 删 `timelineAsPlugin` |
| `vui/src/__tests__/timeline.test.ts:83,99`、`rui/src/__tests__/plugin_host.test.ts:34-36` | 删相关用例（时间轴不再有 Builder 入口） |

→ 调用点就是 `factory.timeline`（皮肤内部 / Builder 拼屏）或 `context.uiBuilder.factory.timeline(...)`（业务）。Builder 上**不再有** timeline 门户。

**二、Tempis 是独立插件，Builder 具名入口 `buildTempisTimeline`**

| 位置 | 改动 |
|---|---|
| `core/src/ui/plugins/plugin.ts` | `UiPluginName` 增 `tempisTimeline: 'tempis-timeline'` |
| `core/src/ui/plugins/plugin_host.ts` | `NOT_INSTALLED['tempis-timeline'] = TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED`；`PLUGIN_HOST_METHODS` 增 `'buildTempisTimeline'`；新增 `buildTempisTimeline(context, props?): TNode` → `requirePlugin('tempis-timeline').buildUi(context, props)`（**无回落**，见 §4.5） |
| `core/src/ui/builder.ts:305`（原位替换） | `UiBuilder` 声明 `buildTempisTimeline`，与 `buildGantt` / `buildScheduler` / `buildKanban` / `buildDiagram` 同族 |
| `core/src/ui/builder_base.ts:46` | `AbstractUiBuilder extends PluginHost` → vui/rui 的 Builder **自动获得**该方法，无需各写一份 |

命名理由：Tempis 是**视图级插件**（二维画布），与既有分工一致——标准控件在 `factory`，视图级插件在 Builder（`docs/naming.md:181`）。两个入口名不撞：`factory.timeline`（列表）vs `buildTempisTimeline`（画布）。

### 3.2 三层归属（本次拆分的核心）

```text
① 列表语义   留在 UiTimelineProps        皮肤（SF / Prime / Naive）真吃得下的
② 轴通用     UiTempisTimelineProps       两维画布的行数据与轴级数据
③ 引擎开关   UiTempisTimelineProps       只有画布引擎有意义（legend / minimap / …）
```

**判定规则（用户拍定 D2 / D4 / D5）**：**普通 timeline 不支持的，共享契约里不放** —— 一律下沉到 `UiTempisTimelineProps`，在 Tempis 层实现。据此基础层是**纯数据入参、零回调**：三套皮肤一个事件都不派发，也没有任何命令式 API（现在全返回 `noopTimelineController`）。

### 3.3 `UiTempisTimelineProps extends UiTimelineProps`（core `src/ui/plugins/tempis_timeline.ts`）

**基础层 `UiTimelineProps`（列表时间轴，收窄到真消费者）**

保留（**纯数据入参，无回调**）：`items`、`keyField` `labelField` `contentField` `oppositeContentField` `iconField` `disabledField` `cssClassField` `timeField`、`orientation` `align` `reverse` `timeDisplay` `timeFormat` `locale` `rtl` `persist` `height`、`template`（列表逐项内容模板，SF 皮肤在用）。

下沉（基础层删除）：`startField` `endField` `groupingField` `categoryField` `progressField`、`range`、`onItemClick` `onSelectionChange` `onRangeChange` `onReady`、`UiTimelineController` / `noopTimelineController`、`UiTimelineRange`。

**Tempis 层新增（含从基础层下沉的项）**

| 字段 | 来源 | 含义 / 约束 |
|---|---|---|
| `startField` | 下沉 | 条/点起点；**缺省回落 `timeField`**（只给 `time` 的点事件也能落在轴上） |
| `endField` | 下沉 | 有 = 区间条；无 = 时间点标记 |
| `groupingField` | 下沉 | 泳道名 |
| `categoryField` | 下沉 | 类别名（配色 / 图例 / 点击筛选的键） |
| `progressField` | 下沉 | 0–1，区间条内填充（契约注释写明单位） |
| `styleField` | 新增 | 逐项样式覆盖（行 → `UiTempisItemStyle`） |
| `selectedField` | 新增 | 行级受控选中；与 `selectedIds` 冲突时 **`selectedIds` 优先** |
| `categories?: UiTempisCategory[]` | 新增 | 轴级：`{ name, label, style? }`，`name` 对应行的 `category` |
| `bands?: UiTempisBand[]` | 新增 | 轴级：`{ start, end?, style?: { color, borderColor, borderThickness, opacity } }` |
| `dependencies?: UiTempisDependency[]` | 新增 | 轴级：`{ source, target, style? }`（source/target 指行的 `key`） |
| `responsive?: boolean` | 新增 | 画布跟随容器尺寸（默认 `true`）；宿主不再写死 |
| `range?: UiTempisRange` | 扩展下沉 | `start` `end` `position` `fixed` `min` `max` `zoom{ enabled, min, max, wheelSensitivity, pinchSensitivity, requireModifier }` |
| `selectionMode?: 'none' \| 'single' \| 'multi'` | 新增 | 默认 `'none'`。Tempis 叫 `selection`，此处消歧为「模式」，受控值另给 `selectedIds` |
| `selectedIds?: Array<string \| number>` | 新增 | **给值 = 受控**（引擎不自管，靠 `onSelectionChange` + `setSelection` 回写）；不给 = 非受控 |
| `grouping?: { sort?: (a, b) => number; collapsible?: boolean }` | 新增 | 泳道排序 / 点击折叠 |
| `verticalFill?: 'content' \| 'fill-canvas' \| 'grow-canvas'` | 新增 | 高度策略 |
| `stackMode?: 'compact' \| 'stable'` | 新增 | 堆叠策略 |
| `minimap?: { height?; backgroundColor?; viewportColor? }` | 新增 | 出现即开启 |
| `legend?: { position?; alignment?; markerStyle?; isHighlightOnHover?; isFilterOnClick?; gap? }` | 新增 | 交互图例 |
| `tooltip?: { enabled?; delay?; dateFormat?; overflowBehavior?; template?; shouldShow? }` | 新增 | 见 §4.4 |
| `scrollbar?: { visibility?; color? }` | 新增 | |
| `accessibility?: { ariaLabel?; keyboard?; keyboardPanStep?; keyboardZoomStep? }` | 新增 | |
| `font?` / `itemStyle?` / `gridColor?` | 新增 | **拆自 Tempis 的 `style`**，见下 |
| `onItemClick?(id)` `onItemDoubleClick?(id)` `onItemContextClick?(id, position)` `onItemHover?(id \| null)` `onGroupToggle?(group, collapsed)` `onSelectionChange?(changes)` `onRangeChange?(start, end)` `onReady?(controller)` | 下沉 + 新增 | 见 §3.4；基础层不再有任何事件 |

**不用 `style` 装 Tempis 样式（撞名）**：Tempis 的 `style` 是 `{ font, item, gridColor }`，而 `UiProps.style` 是 CSS（`core/src/ui/props.ts:63`），跨框架标准形态里 `style` 只能是 CSS 对象。摊平成三个顶层字段，语义与 Tempis 一一对应，不造新词。

**不进契约的一类**：`registerDateAdapter` / `getDateAdapter` / `setGlobalPalette` / `getGlobalPalette`（静态全局，由插件包 re-export，不进控件契约）。

### 3.4 item / controller / 事件

**`UiTempisTimelineItem extends UiTimelineItem`**：基础 item 收窄为列表字段 `{ key, label, content, oppositeContent, icon, disabled, cssClass, time, timeText }`（**`key` 不改名**，用户拍定 D3）；Tempis 层加 `{ start, end, grouping, category, progress, style, selected }`。插件把它交给 Tempis 时映射 `id: item.key ?? index`（同今天 `tempisItemsOf` 的做法，`timeline.ts:280`）。

**`UiTempisTimelineController`**（基础层不再有 controller —— 列表引擎没有命令式 API，三个皮肤现在都返回 noop）：

```text
focus(options?)        getRange()             redraw()              toImage(options?)
getSelection()         setSelection(ids)      clearSelection()      getItems()   setItems(items)
getCategories()        setCategories(cs)      setBands(bands)       setDependencies(deps)
setGroupCollapsed(g, c?)                      isGroupCollapsed(g)
```

15 个方法。`destroy` 不进契约（宿主生命周期自管）；`focus(options?)` 由现在的 `(target?: unknown) => void` 收窄为显式 `UiTempisFocusOptions | string | number`。

**事件族**：`onSelectionChange` 实参从 `ids[]` 改为 `changes: UiTempisSelectionChange[]`（`{ id, selected }`）——现有 `ids[]` 折掉了「这次点了哪个、选还是取消」；受控值由业务从 changes + `selectedIds` 自行推出。事件基座续用 core 既有 `UiEventArgs` 家族约定。

### 3.5 删除 / 简化项

| 对象 | 处置 | 理由 |
|---|---|---|
| `core` 的 `tempisItemsOf`（`timeline.ts:267`） | **删** | 厂商映射不该住无框架层；`UiTempisTimelineItem` 形状对齐后，插件侧只剩 `filter(hasStart)` |
| `vui` 的 `timelineAsPlugin`（`vui/src/ui/plugins/timeline.ts:63-72`）+ `UiPluginName.timeline` | **删** | 二者是「Tempis 抢占 `factory.timeline`」这套做法的全部载体：标准时间轴回 `factory.timeline`，Tempis 走 `buildTempisTimeline` → 机制整体取消（全仓仅 1 处使用） |
| `UiBuilder.buildTimeline`（`builder.ts:305`）、`PluginHost.buildTimeline`（`plugin_host.ts:44,89-96`）、`NOT_INSTALLED['timeline']` | **整体删除** | 标准时间轴不是插件：入口就是 `factory.timeline`，Builder 不该有这一层 |
| `UiTimelineController` / `noopTimelineController` | 下沉为 `UiTempisTimelineController` / `noopTempisTimelineController` | 5 个方法全是画布语义，皮肤只用来 return noop |
| `UiTimelineProps.template?: unknown`（`:80`） | **基础层保留原名**（列表逐项内容模板，SF 皮肤在用）；Tempis 的 tooltip 模板是**另一件事**，只放 `UiTempisTimelineProps.tooltip.template` | 普通 timeline 没有「tooltip 模板」这回事（D4）；两处不再同名同义纠缠 |
| 基础层的 `onItemClick` / `onSelectionChange` / `onRangeChange` / `onReady` / `range` / `UiTimelineRange` | **下沉** `UiTempisTimelineProps` | 三套皮肤一个事件都不派发、`range` 也不消费（D2 / D5）；基础层因此成为**纯数据入参** |
| `keyField` / `UiTimelineItem.key` | **保留，不改名**；Tempis 插件映射 `id: item.key ?? index` | 用户拍定 D3 |

**影响面**：`grep UiTimelineProps` 命中 9 个文件（core 4 / vui 3 / rui 1 / 测试 1），业务代码 0 处 → 拆分破坏面只在框架内。

### 3.6 不引厂商类型：一致性靠插件包的编译期断言

core 不 import `@tempis/timeline`（否则每个 app 都被拖上厂商包）。做法：

- core 自己声明结构等价的契约类型（`UiTempisCategory` / `UiTempisBand` / `UiTempisDependency` / `UiTempisItemStyle` / `UiTempisFocusOptions` / `UiTempisSelectionChange`）。
- 插件包（有 `@tempis/timeline`）写一处**编译期断言**：`const _conformance: TempisTimelineOptions = tempisOptionsOf(props)`，由该包的 `tsconfig.vitest.json` / lib 配置覆盖。core 的形状一旦漂移，插件包**编译就红**，不会静默。
- 不写 `type UiTempisOptions = TempisTimelineOptions` 之类的别名搬进 core（契约层多一个名字就多一处漂移）。

### 3.7 前置修复：三个皮肤的 `...rest` 整袋透传

现状：三个皮肤都是「解构关键词 + `...rest` 透传给厂商组件」——`vui-syncfusion/src/factory/timeline.ts:73`、`vui-primevue/src/factory/timeline.ts:71`、`vui-agnaive/src/factory/timeline.ts:60`。**基础层收窄后**，`rest` 里剩下的是「调用方多传的键」：静态调用有 TS 挡着，动态拼的 props 挡不住——对象值会被 Vue fallthrough 写成 `bands="[object Object]"`（实测结论：对象值走 `setAttribute` 被 String 化），函数值被写成一串源码文本。

→ 收紧为显式白名单（只 spread 皮肤真消费的键），并加防漏测试：喂一个对象键 + 一个函数键，断言渲染后的 DOM 里没有 `[object Object]`、没有函数字符串残渣。

### 3.8 `any` 预算

门禁是「非测试源码 `any` ≤ 265」，当前 **238**（留 27）。新契约文件**不要**用 `any` 消错：`UiTempisTimelineProps<T = unknown>`，泛型默认值一个都不加。

---

## 4. 两个包的设计

### 4.1 `@mmda/vuix-tempis-timeline` v2（Vue）

```text
packages/vuix-tempis-timeline/src/
  tempis_options.ts        # 契约 props → TempisTimelineOptions（含 categories/bands/dependencies/tooltip 转换）
  tempis_items.ts          # 行 → TempisTimelineItem（filter 掉无 start 的行）
  TempisTimelineView.ts    # 宿主组件（原 tempis_plugin.ts 里的 host 拆出来）
  tempis_plugin.ts         # createTempisTimelinePlugin(): UiPlugin
  index.ts
  __tests__/canvas_stub.ts # 共享 2D ctx stub（见 §5.1）
  __tests__/*.test.ts
  __tests__/conformance.ts # §3.6 的编译期断言
```

要点：

- 插件名用 `UiPluginName.tempisTimeline`，`buildUi` 返回 `h(TempisTimelineView, { source: props })`。
- **宿主组件只声明一个 prop `source`**（保持现状）：props 声明几十个字段只会造出第二份契约、并且未声明的键会进 `attrs` fallthrough 落 DOM；单参 `source` 把这条坑堵死。壳样式由组件自己拼（`timelineModifierClasses` 同族 → `mmda-tempis-timeline` 钩子类）。
- 实例生命周期：`onMounted` 创建 → `watch` 数据变化走 `setItems/setCategories/setBands/setDependencies` → `onBeforeUnmount` `destroy()`。
- 结构型选项（range/legend/tooltip/selection/verticalFill/... 这类构造期参数）变化时**重建实例**（Tempis 只在构造时读它们）；数据型变化走 setter，不重建。

### 4.2 `@mmda/ruix-tempis-timeline`（React，仓库第一个 `ruix-*` 包）

命名已定：`docs/naming.md:62`「`@mmda/rui` → `@mmda/rui-*`（皮肤）→ `@mmda/ruix-*`（插件）」，`docs/rui_plan.md:130` 已把它列进 P4。

骨架照抄 `ruix-syncfusion` 的 tsconfig 家族（`tsconfig.base.json` 带 `@mmda/core` / `@mmda/rui` → 源码 paths，`tsconfig.typecheck.json` 再写一遍 + `composite:false`；两处不同步则报 TS2307），vite `external: ['react', 'react-dom', '@mmda/core', '@mmda/rui', /^@tempis\//]`，vitest 环境 `jsdom` + `@testing-library/react`。

```text
packages/ruix-tempis-timeline/src/
  tempis_options.ts        # 与 vuix 同逻辑，独立一份（rui 不得 import vui）
  TempisTimelineView.tsx   # React FC
  tempis_plugin.ts         # createTempisTimelinePlugin(): UiPlugin<ReactNode>
  index.ts
```

React 宿主要点：

- `useRef<HTMLCanvasElement>` + `useEffect(创建/销毁)`；**React 19 StrictMode 的 effect 双跑**要求 create→destroy→create 幂等（实测 `destroy()` 后可在同一 canvas 上重新构造）。
- `useRef` 持有实例与**稳定的 controller**，`onReady(controller)` 只调一次；props 里的回调经 ref 转发最新引用，避免闭包读旧值。
- `source` 仍是唯一 prop（同上理由）；壳样式走 `className` / `style`。
- React 侧翻译只有一处：`ruiRenderProps`（`class` → `className`）。

### 4.3 两个宿主的行为对称表

| 行为 | Vue 宿主 | React 宿主 |
|---|---|---|
| 创建 | `onMounted` | `useEffect(…, [])` |
| 数据同步 | `watch(items…)` → `setItems` | `useEffect(…, [items])` |
| 结构选项变化 | `watch(结构键)` → 重建 | 同上 |
| 卸载 | `onBeforeUnmount` → `destroy()` | effect cleanup → `destroy()` |
| 命令式 API | `onReady(controller)` | `onReady(controller)` |
| 缺引擎 | 渲染 `TEMPIS_MISSING` 文案 | 同 |

### 4.4 tooltip 模板（TNode → `HTMLElement | string`）

Tempis 只接受 `(id) => HTMLElement | string | null`。

- 契约里 `tooltip.template?: (id: string | number) => unknown`，注释写明「节点渲染委托：vui 给 VNode、rui 给 ReactNode，也可直接给 HTML 字符串」——core 不能引框架类型，`unknown` 在这一处是**必须**的（不是偷懒）。
- 宿主侧转换：Vue `createApp(component).mount(detachedDiv)` 取 `detachedDiv`；React `createRoot(detachedDiv).render(...)` + `flushSync` 取 `detachedDiv`。每显示一次 tooltip 挂一次，用完不复用（Tempis 会把节点塞进自己的 tooltip 层）。
- 只给字符串时零开销，直接透传。

### 4.5 缺引擎（`@tempis/timeline` 未安装）

- `buildTempisTimeline` **不回落**到 `factory.timeline`：调用点明确要的是二维画布，回落成事件列表是语义错误。未装插件 → `requirePlugin` 抛 `TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED`；装了插件但 peer 没装 → 宿主渲染缺失文案（沿用现有 `TEMPIS_MISSING`，实测该分支今天就是这么走的）。
- peer 依赖与现状一致：`@tempis/timeline` 为 **optional peer**，动态 `import()`，不静态引。

---

## 5. 测试与验证

### 5.1 本机实测过的 jsdom 事实（决定测试分层）

1. **jsdom 里 `canvas.getContext('2d')` 返回 `null`** → `new TempisTimeline(...)` 直接抛 `TypeError: Cannot read properties of null (reading 'scale')`（`@tempis/timeline/dist/index.esm.js:3650`，构造期就做 DPR 缩放）。**这就是现有插件测试只测纯函数、从不挂载宿主的原因。**
2. **补约 20 行 2D ctx stub 后，Tempis 全量 API 在 jsdom 跑通**（实测）：构造（items/categories/bands/dependencies/selection/legend/minimap/grouping.collapsible/tooltip.template 全传）→ `setItems`→`setCategories`→`setBands`→`setDependencies`→`setSelection`→`redraw`→`setGroupCollapsed`→`isGroupCollapsed`→`focus`→`toImage`（返回 Blob）→ `destroy`，`onRangeChange` 正常触发。渲染只用到 **16 个 ctx 方法**：`beginPath clearRect clip drawImage fill fillRect fillText lineTo moveTo rect restore roundRect save scale setLineDash stroke` + `measureText`。
   - stub 的三个必须项：`ctx.canvas` 必须是**真实 canvas 元素**（否则 legend 视图读 `clientWidth` 崩）；`measureText` 返回 `{ width }`；`ResizeObserver` 要垫桩（`responsive: true` 时构造器会建它）。
3. **`responsive: true` 时 canvas 尺寸来自 `canvas.clientWidth`**，jsdom 无布局 → 画布 0×0。→ jsdom 只能验「接线正确」，像素/交互（平移、缩放、命中、tooltip 位置）**必须真浏览器**。

### 5.2 三层测试

| 层 | 测什么 | 手段 |
|---|---|---|
| core 契约 | `tempisTimelineItemsOf` 纯函数（start 回落 time、无 start 剔除、style/selected 绑定）、字段完整性快照 | `cd packages/core && ./node_modules/.bin/vitest run --reporter=dot`（含架构门禁） |
| 插件映射 | `tempisOptionsOf` 24 个选项含子结构、受控/非受控分支、`tooltip.template` 透传 | vitest 纯函数，无需 DOM |
| 宿主接线 | 构造参数、数据变化调用 setter、回调转发到 props、卸载 `destroy`、缺引擎文案、结构选项变化触发重建 | jsdom + §5.1 的 ctx stub（`vitest.setup.ts`） |
| 真浏览器 | 平移/缩放/点击命中/依赖箭头/图例筛选/小地图/导出 | playground 示例页人工 + 需要时再加 Playwright |

### 5.3 命令

```bash
cd packages/core && ./node_modules/.bin/vitest run --reporter=dot && ./node_modules/.bin/tsc -p tsconfig.lib.json --noEmit
cd packages/vui  && ./node_modules/.bin/tsc -p tsconfig.lib.json --noEmit
cd packages/vuix-tempis-timeline && ./node_modules/.bin/vitest run --reporter=dot && ./node_modules/.bin/tsc -p tsconfig.lib.json --noEmit
cd packages/ruix-tempis-timeline && ./node_modules/.bin/vitest run --reporter=dot && ./node_modules/.bin/tsc -p tsconfig.typecheck.json --noEmit
```

（git-bash 里裸 `pnpm` 不可用；需要 workspace 级时用 `pnpm.cmd`。）

---

## 6. 阶段（一个阶段一个 commit，可 revert）

| 阶段 | 内容 | 产物 | 验证 |
|---|---|---|---|
| **P0** 皮肤可靠性 ✅ 2026-09-22 | 三个皮肤 `...rest` 收紧为显式白名单 + 防漏测试（对象键 / 函数键） | 3 工厂文件 + 3 测试 | **已完成**：三包全量 vitest 绿（200 / 70 / 106），`tsc -p tsconfig.typecheck.json` 与 `node.json` 零错误。详见 §9 |
| **P1** 契约 | 新建 `core/src/ui/plugins/tempis_timeline.ts`；收窄 `timeline.ts`；**摘掉标准时间轴的插件外壳**（删 `UiBuilder.buildTimeline` / `PluginHost.buildTimeline` / `PLUGIN_HOST_METHODS` 里的 `'buildTimeline'` / `NOT_INSTALLED['timeline']` / `UiPluginName.timeline` / `timelineAsPlugin` / `tempisItemsOf`）；**增** `buildTempisTimeline`（`plugin.ts` / `plugin_host.ts` / `builder.ts`）；vui re-export 同步；改 2 个测试 | core 2 文件 + vui 1 文件 + 2 测试 | core 门禁 + 单测；vui tsc；`grep -rn "buildTimeline"` 只剩 `buildTempisTimeline` |
| **P2** vuix v2 ✅ 2026-09-22 | §4.1 文件清单；`source` 单参宿主；结构选项重建 vs 数据 setter；tooltip 模板转换；`vitest.setup.ts` 的 ctx stub | 插件包 5 源文件 + 4 测试 + 1 conformance + `tsconfig.typecheck.json` | **已完成**：jsdom 挂载真引擎 17/17 通过，typecheck/node 各 0 错误，真浏览器跑通命中/缩放/导出/重建/tooltip。详见 §9 |
| **P3** ruix | 新建 `packages/ruix-tempis-timeline`（骨架抄 `rui-syncfusion`）；React 宿主（StrictMode 幂等）；映射逻辑独立一份 | 新包 9 文件 | 该包 vitest + `tsc -p tsconfig.typecheck.json` |
| **P4** 入口 | 根 `package.json` 的 `build` / `test` / `typecheck` 过滤器加 `@mmda/ruix-tempis-timeline` | 1 文件 | `pnpm.cmd test` |
| **P5** 文档 | §8 的影响面逐条 | 8 处文档 | 人工核对链接 |

**顺序**：P0 与 P1 互不依赖，建议 P0 先做（改动面独立、便于单独回滚）；P1 一落地，`UiTimelineProps` 的破坏性收窄会带着三个皮肤一起改，所以 P0 的测试要在 P1 之前先把「DOM 干净」这条底线钉住。

**并发在途（2026-09-22 实测工作区）**：另有一个会话正在铺 React 侧插件——`packages/rui-syncfusion/src/plugins/`（gantt / scheduler / kanban / chart / ribbon / pivot_table / ai_assistant / image_editor / diagram_editor，**尚无 timeline**）是未跟踪新目录，`packages/rui/src/ui/builder.ts`（+177）与 `packages/rui-syncfusion/src/builder.ts`（+478）正在改。P1 要动 `core/src/ui/plugins/plugin_host.ts` + `core/src/ui/builder.ts`，与该在途工作在 `PluginHost` / Builder 上有交叠 → **动手前先 `git status` 确认那批已落地**，或把本计划的改动限制在新建的 `tempis_timeline.ts` 与 `plugin.ts` 的 `UiPluginName` 常量上，压缩冲突面。

---

## 7. 决策

### 7.1 已拍（用户 2026-09-22）

| # | 决策 | 拍定结论 |
|---|---|---|
| D1 | 时间轴不作为插件 | `UiBuilder.buildTimeline` / `PluginHost.buildTimeline` / `PLUGIN_HOST_METHODS` 里的 `'buildTimeline'` / `NOT_INSTALLED['timeline']` / `UiPluginName.timeline` / `timelineAsPlugin` / `tempisItemsOf` 全删，标准时间轴回 `factory.timeline` |
| D8 | Builder 具名入口 | 保留 **`builder.buildTempisTimeline`**（与 `buildGantt` 同族；不改用 `builder.plugin('tempis-timeline')?.buildUi`） |
| D2 | 控制器与命令式 API 归 Tempis | 三套皮肤不支持 → 基础层**取消** `UiTimelineController` / `noopTimelineController` / `onReady` / `range`；Tempis 层实现 `UiTempisTimelineController`（15 方法） |
| D3 | `keyField` 保留 | 基础层 `keyField` / `UiTimelineItem.key` **不改名**；Tempis 插件映射 `id: item.key ?? index` |
| D4 | 共享契约不放 tooltip 模板 | 普通 timeline 没有 tooltip 模板这回事 → 基础层沿用原 `template`（列表逐项内容模板）；`tooltip.template` 只属 Tempis 层（宿主挂真实 Vue/React 组件取 `HTMLElement`，字符串仍可用） |
| D5 | 同 D4 | 事件一律不进共享契约（三皮肤一个都不派发）：`onItemClick` / `onSelectionChange` / `onRangeChange` 下沉 Tempis；选择语义用 Tempis 原生 `changes: { id, selected }[]` |
| D6 | 缺引擎不回落 | 未装 `tempis-timeline` 插件 → `buildTempisTimeline` **抛错**，不回落 `factory.timeline` |
| D7 | `responsive` 进契约 | `UiTempisTimelineProps.responsive?: boolean`（默认 `true`），宿主不写死 |

### 7.2 待拍

无 —— P0 可以开工。

---

## 8. 文档影响面（P5）

| 文件 | 处 | 改什么 |
|---|---|---|
| `docs/naming.md` | 56 | `@mmda/vuix-tempis-timeline` 的说明改为 `buildTempisTimeline`（不再「替换 `factory.timeline`」） |
| `docs/naming.md` | 181 | 插件薄封装清单加 `buildTempisTimeline`；删「Tempis 用 `builder.use` 覆盖」一句 |
| `docs/naming.md` | 202 | 时间轴条目：区分 `factory.timeline`（列表）与 `buildTempisTimeline`（画布） |
| `packages/vui/docs/timeline.md` | 全文 | 重写为「列表时间轴」单主题；Tempis 内容迁到新文档 |
| `packages/vui/docs/timeline_usage.md` | 21-23 | 用法改为 `ui.buildTempisTimeline(ctx, props)` |
| `packages/vui/docs/vui.md` | 113 | 同上 |
| `packages/vui/docs/factory.md` | 110 | 「不要写进皮肤」的表述保留，调用方式更正 |
| `packages/core/docs/ui.md` / `ui/ui_four_roles_design.md` / `ui/ui_four_roles_usage.md` | 20 / 66,92,124 / 180,186 | 插件清单**去掉 `buildTimeline`**（`ui_four_roles_design.md:92` 与 `ui_four_roles_usage.md:180` 那两行删掉；`:66` 的 `gantt/timeline/… → buildXxxView` 去掉 timeline；`:124`、`:186` 改成「时间轴走 `factory.timeline`」）；再加 `buildTempisTimeline` |
| `packages/vui/src/__tests__/timeline.test.ts` / `packages/rui/src/__tests__/plugin_host.test.ts` | 83,99 / 34-36 | 删 `buildTimeline` 相关断言（时间轴不再有 Builder 入口）；rui 的「无插件时抛错」用例随 `buildTimeline` 一起删 |
| `packages/rui/docs/rui_plan.md` | 130 | `ruix-tempis-timeline` 落地状态更新 |
| 根 `package.json` | scripts | 三个过滤器加新包 |

---

## 9. 实施记录

### P0 皮肤可靠性（2026-09-22 完成，未提交）

**改动**：三处皮肤工厂删掉 `...rest` 整袋透传 —— 解构处与 spread 处各删一处：

| 文件 | 删的位置 |
|---|---|
| `packages/vui-syncfusion/src/factory/timeline.ts` | 解构 `...rest`（原 `:62`）+ `h(TimelineComponent, { ...rest, … })`（原 `:73`） |
| `packages/vui-primevue/src/factory/timeline.ts` | 解构（原 `:59`）+ `h(Timeline, { ...rest, … })`（原 `:71`） |
| `packages/vui-agnaive/src/factory/timeline.ts` | 解构（原 `:48`）+ `h(NTimeline, { ...rest, … })`（原 `:60`） |

**新增测试**：三包各 `src/__tests__/timeline.test.ts`，两条断言 —— ① `createTimeline(带未知键的 props)` 的 **vnode props 里不含契约外键**；② 挂到 DOM 后 **`innerHTML` 不含 `[object Object]` / `=>`**。

**证伪（实测，不是推测）**：临时把 SF 皮肤的 `...rest` 还原 → 两条测试双红，真实 DOM 原文即

```html
<div bands="[object Object]" dependencies="[object Object]" legend="[object Object]" class="e-control e-timeline …">
```

—— 印证了 §3.7 的判断（对象值被 Vue fallthrough `setAttribute` String 化）。还原修复后双绿。

**验证命令与结果**：

| 命令 | 结果 |
|---|---|
| `cd packages/vui-syncfusion && ./node_modules/.bin/vitest run --reporter=dot` | 17 文件通过 / 1 skip，200 通过 / 1 skip |
| `cd packages/vui-primevue && ./node_modules/.bin/vitest run --reporter=dot` | 5 文件，70 通过 |
| `cd packages/vui-agnaive && ./node_modules/.bin/vitest run --reporter=dot` | 9 文件，106 通过 |
| 三包 `tsc -p tsconfig.typecheck.json --noEmit`、`tsc -p tsconfig.node.json --noEmit` | 各 0 错误 |
| 三包 `tsc -p tsconfig.vitest.json --noEmit` | 140 / 206 / 175 条**既有**错误（集中在 `field_factory/index.ts`、`builder/index.ts`、`time_picker.ts` 与其他测试文件的属性断言），**我改/新增的文件 0 条** |

**回滚**：三处删的都是「一行为 `...rest`」，`git checkout -- <三处工厂>` 即回滚；测试文件单独删亦可。

### P1 契约（2026-09-22 完成，未提交）

**新增**

- `packages/core/src/ui/plugins/tempis_timeline.ts`（新）：`UiTempisTimelineProps<T = unknown> extends UiTimelineProps<T>`，加轴级数据（category / band / dependency）、行绑定（start/end/grouping/category/progress/style/selected）、视图开关（responsive / verticalFill / stackMode / range+zoom / grouping / legend / tooltip / scrollbar / minimap / accessibility / font / itemStyle / gridColor）、选中（selectionMode / selectedIds）、8 个事件、`UiTempisTimelineController`（15 方法）、`tempisTimelineItemsOf`、`noopTempisTimelineController`、`TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED`。
- `core/src/ui/plugins/index.ts` 增一行导出。

**收窄 / 改名（core `ui/plugins/timeline.ts`）**

- 只剩列表档，**纯数据入参**：删 `UiTimelineController` / `noopTimelineController` / `UiTimelineRange` / `tempisItemsOf`、`startField` `endField` `groupingField` `categoryField` `progressField`、`range`、`onItemClick` `onSelectionChange` `onRangeChange` `onReady`；`UiTimelineItem` 收窄为列表字段。
- 内部绑定读取器导出为 `timelineFieldValueOf` / `timelineKeyOf` / `timelineStringOf` / `timelineBoolOf`，两档共用（不复制第二份）。

**入口**

- `UiPluginName.timeline` → `tempisTimeline: 'tempis-timeline'`；`PluginHost.buildTimeline`（含「插件优先 → 回落 factory」特例）→ `buildTempisTimeline`（`requirePlugin`，**不回落**）；`UiBuilder` 声明与 `NOT_INSTALLED` 同步。
- 删 `vui` 的 `timelineAsPlugin` 与 `emitTimelineRangeChange`（后者 0 调用点）；`vui/src/ui/plugins/timeline.ts` 改为两档契约的再导出 + 保留 `timelinePropsFromField`。

**跟改**

- 三个皮肤工厂：删掉已下沉字段的解构与 `onReady?.(noopTimelineController)`，直接读 `props.xxx`（P0 删 `...rest` 后那段解构已是死代码）。
- `vui` / `rui` 的 builder 导入换成 `UiTempisTimelineProps`。
- 测试：`vui/src/__tests__/timeline.test.ts` 重写（列表行不再有 start/end；新增画布行解析 3 条 + 插件路由 2 条）；`rui/src/__tests__/plugin_host.test.ts` 的 buildTimeline 用例换成 buildTempisTimeline（委托 + 无插件抛错）。
- `vuix-tempis-timeline` 最小跟改（v2 留 P2）：`tempis_map.ts` 换 `tempisTimelineItemsOf` + 新增 `tempisItemsForEngine`（`key → id` 的唯一一处翻译）；`tempis_plugin.ts` 换 15 方法控制器与 `uiPlugin(UiPluginName.tempisTimeline, …)`；测试同步。

**验证（实测）**

| 命令 | 结果 |
|---|---|
| core `vitest run` | 299 通过 / 1 失败（见下「既有红」） |
| core `tsc -p tsconfig.lib.json` | 0 错误 |
| vui `vitest run` | 78 文件 / 411 通过 |
| vui `tsc -p tsconfig.typecheck.json` | 0 错误 |
| rui `vitest run` | 4 文件 / 23 通过 |
| rui `tsc -p tsconfig.typecheck.json` | 0 错误 |
| 三皮肤 `vitest run` | 200 / 70 / 106 通过 |
| 三皮肤 `tsc -p tsconfig.typecheck.json` | 各 0 错误 |
| vuix `vitest run` | 3 通过 |

**与本次改动无关的既有红（已实测定位，不要算在 P1 头上）**

1. **core 架构门禁 `any ≤ 265`**：按门禁口径（`\bany\b` 出现次数、排除 `__tests__`）——HEAD 抽取计数 **271**，工作区 **272**，差的那 1 个来自另一会话新增的未跟踪文件 `packages/core/src/ui/field_factory_base.ts`；**本次 P1 的 diff 新增与删除 `any` 均为 0**。即该门禁在动手前就是红的。
2. **`packages/*/dist` 陈旧且不完整**：`vui` 的 `tsc -p tsconfig.build.json`（生成 dist）在本工作区跑不通（TS6059 rootDir 一大片，早于本次改动），core 的 dist 里也缺引用文件。后果是**凡是以 dist 解析 `@mmda/*` 的包（`vuix-*` 一族）typecheck 本来就红**；P1 之后 vuix 的 lib typecheck 多出 5 条「`@mmda/vui` 没有新导出」，属于改名的必然结果，dist 恢复可构建（或 P2 给它补 `tsconfig.typecheck.json` 走源码路径）即消。

### P2 vuix v2（2026-09-22 完成，未提交）

**文件（§4.1 的清单，落地时按仓库既有习惯拆成 map + 组件 + 插件）**

```
packages/vuix-tempis-timeline/src/
  tempis_items.ts          契约行 ↔ 引擎行（`key ↔ id` 只在 `tempisItemForEngine` 一处翻译，进出两个方向共用）
  tempis_options.ts        契约 props → TempisTimelineOptions（24 项全量）+ tempisStructureOf（重建签名）
  TempisTimelineView.ts    宿主组件（单 prop `source`）
  tempis_plugin.ts         createTempisTimelinePlugin()：插件名 + 宿主，仅此两件事
  index.ts
  __tests__/canvas_stub.ts     2D ctx / ResizeObserver / Path2D / 固定尺寸 兜底
  __tests__/conformance.ts     契约 ↔ 引擎的编译期断言（不跑，只给 tsc 看）
  __tests__/tempis_options.test.ts / tempis_view.test.ts / tempis_missing.test.ts / tempis_plugin.test.ts
vitest.setup.ts            装上 canvas_stub（vitest.config.ts 的 setupFiles）
tsconfig.typecheck.json    新增：composite:false + `@mmda/*` → ../core/src、../vui/src（这包终于能真查自己的源码）
package.json               typecheck 脚本改为 typecheck + vitest + node 三份
```

**实现要点**

- 数据（`items` / `categories` / `bands` / `dependencies` / `selectedIds`）→ setter，不重建；
  构造期选项 → `tempisStructureOf` 深比较，变了 `destroy()` + 重建（Tempis 只在构造时读它们）。
- 回调与 `tooltip.template` / `shouldShow` 每次触发都读**最新** props；`grouping.sort` 只在构造时读一次（函数不参与重建签名）。
- tooltip 模板：字符串直传，Vue 节点用 `createApp` 挂到游离 div（每次显示挂一次，卸载时统一 `unmount`）。
- 引擎构造失败（装了但起不来）不再静默：`console.error` + `mmda-timeline--failed` + noop 控制器。
- `tooltip.template` 的节点转换抽成 `tempisTooltipNodeOf`，React 侧可复用同一套判定。

**验证（实测）**

| 项 | 结果 |
|---|---|
| `vitest run`（jsdom 挂载真引擎） | 4 文件 / 17 通过（含：构造 + 控制器、数据 setter 不重建、结构变化重建、卸载 destroy、受控选中、缺引擎） |
| `tsc -p tsconfig.typecheck.json` | 0 错误 |
| `tsc -p tsconfig.node.json` | 0 错误 |
| `tsc -p tsconfig.vitest.json` | 8 错误（全部是「dist 陈旧」类：`@mmda/vui` 走 `packages/vui/dist`，看不到新的 `minorUnit` / `easing`），与 P1 同源，非本次引入 |
| core `tsc -p tsconfig.lib.json` / vui `tsc -p tsconfig.typecheck.json` | 各 0 错误（契约加 `minorUnit`/`majorUnit`/`UiTempisEasing` 后回归） |

**证伪（两道，都跑过）**

1. 契约漂移能被编译期抓到：把 `tempisItemForEngine` 里行的 `start` 去掉 → `tsc -p tsconfig.typecheck.json` 报
   `src/tempis_items.ts(25,9): error TS2741: Property 'start' is missing ... but required in type 'TempisTimelineItem'`；还原后 0 错误。
2. 宿主行为测试不空跑：把结构变化的 `void rebuildEngine()` 改掉 → `rebuilds the engine when a construction time option changes` 失败
   （`expected 1 to be 2`）；还原后 17/17 通过。

**真浏览器验证（`$LOCALAPPDATA/Temp/tempis-demo`，vite 构建静态产物 + 本机 http 服务 + 桌面预览窗格，非仓库文件）**

页面自驱动跑完一轮（合成 pointer / wheel 事件 + 命令式 API），面板回读：

| 测什么 | 实测 |
|---|---|
| 响应式尺寸 | CSS 820×410 → canvas `1106×553`（DPR 缩放生效） |
| 真渲染 | canvas 非透明像素 `168445`（条 / 泳道 / 图例 / 小地图 / 网格 / 时间带 / 依赖箭头） |
| 行映射 | `getItems()` → `design,build,qa,api,launch`（`id → key` 回译正确） |
| 命中 + 事件 | 扫描到条目坐标 → `onItemHover('design')`、`onItemClick('design')`、`onItemDoubleClick('design')` |
| 滚轮缩放 | `2026-01-01→02-10` → `2026-01-12→01-29`（`zoomedIn: true`），`onRangeChange` 同步回调 |
| 命令式 API | `setSelection(['build','qa'])` → `getSelection()` 回读一致；`focus({id:'qa'})` → `01-22→02-08`；`setGroupCollapsed('前端')` → `isGroupCollapsed` true；`setCategories` 生效 |
| 导出 | `toImage({dpr:2, backgroundColor:'#ffffff'})` → `image/png 91348B` |
| 结构变化重建 | `legend` 改 position → `onReady` 再次触发（1 → 2）+ 重画正常 |
| **tooltip 模板** | 引擎 tooltip 层里出现 `<div data-v-app=""><div class="tip">#1 自定义 tooltip</div></div>`（Vue 节点 → 元素转换在真浏览器成立，`tooltipDom: 4`） |

**本阶段踩到的坑（都写进技能了）**

1. **`import(/* @vite-ignore */ '@tempis/timeline')` 是错的**：裸 specifier 会原样留在产物里，浏览器解析不了 → 装没装都走「缺引擎」。
   去掉 ignore 后，消费者侧（Vite 预构建 / 生产打包）会正常解析并把引擎切成独立 chunk。**已改**。
2. jsdom 缺 `Path2D`（点条目的连线标记用），且 `getContext('2d')` 返回 null —— stub 要连 `Path2D`、`ResizeObserver`、`toBlob`、canvas 尺寸一起补。
3. **块注释里不能写「两个星号紧跟斜杠」那种通配路径**（`src` 下的 `**` + `/` 会提前闭合注释 → 整个文件变成语法错误）。
4. 往 `tsconfig.base.json` 加 `@mmda/*` 的 paths 会让 **composite 的 lib/vitest 配置爆 281 条 TS6307**；正确做法是新开 `tsconfig.typecheck.json`（`composite:false` + paths）。
5. 宿主构造期异常的诊断留在 **DOM class（`mmda-timeline--failed`）+ console.error**：预览窗格里没有 devtools 时，这是唯一能看到失败的入口。

---

## 附：探针脚本

本机临时探针（仓库外，未入库）：`$LOCALAPPDATA/Temp/probe-tempis-jsdom.mjs`（证明 jsdom 无 ctx 时构造即抛）、`probe-tempis-jsdom2.mjs`（证明加 stub 后全量 API 跑通 + 16 个 ctx 方法清单）。P2 落地时把 stub 提炼进插件包 `__tests__/canvas_stub.ts`。
