# MMDA React 前端架构设计（规划稿）

> **定位**：`@mmda/rui` 是 MMDA 的 React UI 运行时，对标 `@mmda/vui`（Vue）。
> **分层真源**仍是 [ARCHITECTURE.md](../../ARCHITECTURE.md)——产品横向分层只在那一处写全。
> **与 vui 的关系**：共用 `@mmda/core` 的 `UiProps` / `UiRenderProps` / `UiSlot` / `UiBuilder` / `UiContext` / `MmdaApplication` 契约，不共享一行实现代码（「不要从 vui 抄组件」—— [naming.md](../naming.md)）。
> **面向接口编程**：程序员只认 core 的 `UiContext` 接口，不依赖也不转换 `ReactUiContextBase` / `VueUiContextBase` 等运行时类型。`ctx.with()` 返回的就是 `UiContext`，直接调 `getFieldValue` / `setFieldValue` / `validate` 等——不需要知道下面是 Vue 还是 React。
> **状态**：规划期（尚无代码）。本文记录实测数字、决策与分阶段路线。
> **跨框架判定**见 [`cross-framework-render-compat`](../../../skills/cross-framework-render-compat/SKILL.md)（Vue `h` / React `createElement` 对照探针）。

---

## 0. 实测基座（core 侧零框架）

`packages/core` 对 vue/react 的提及 **5 处**，全是注释/字符串（`grep -rn "vue" packages/core/src --include='*.ts' | grep -v __tests__ | wc -l` → 5）。

| 事实 | 位置 |
|---|---|
| `UiProps` 无索引签名，只留 `class`/`style`/`role`/`for`/`htmlAttributes` + `data-*`/`aria-*` | `packages/core/src/ui/props.ts:63` |
| 拆袋唯一出口 `uiRenderProps`（`class` 收成串、`style` 收成对象、`htmlAttributes` 压平，函数/对象不进 DOM 属性通道） | `packages/core/src/ui/props.ts:126` |
| **已写 rui 侧怎么译**：「`for`：vui 直传；**rui 侧译成 `htmlFor`**」 | `packages/core/src/ui/props.ts:80` |
| 区域是惰性函数 `UiSlot<TNode> = () => TNode \| TNode[]` | `packages/core/src/ui/slots.ts:16` |
| `UiBuilder<TNode>` 契约 38 个成员 | `packages/core/src/ui/builder.ts:76-343` |
| `MmdaApplication` 是框架无关 abstract class | `packages/core/src/mmda_app.ts:97` |
| 设计文档已预留 rui 适配层一行：`createElement(Comp, {...std.props, ...std.attributes, className, htmlFor})` | `docs/design/vui_architecture.md` §1.4 |
| 架构文档已点名：另写 `ReactUiBuilder implements UiBuilder`，**不要从 vui 抄 `VueUiBuilder`** | `ARCHITECTURE.md`「Builder」末段 |

---

## 1. 要新造的（vui 实测拆解）

`packages/vui/src` = **128 个 .ts / 20,801 行**（不含测试/assets）。

| 目录 | 行数 | import vue 的文件 |
|---|---|---|
| `ui/`（builder 18 文件 5,330 行、factory 65 文件） | 12,024 | 39 |
| `components/` | 3,558 | 15 |
| `contexts/`（`vue_ui_context.ts` 835 行 + mixins 1,813 行） | 2,984 | 6 |
| `i18n/` | 1,068 | 1（+ vue-i18n 2 文件） |
| `app/` | 616 | 3 |
| `logic/` / `utils/` / `rx.ts` | 110 | 1 / 1 / 1 |

Vue 专有 API 用量：`h(` **534**、`render(` 42、`defineComponent(` 39、`nextTick(` 32、`ref(` 31、`reactive(` 14、`inject(` 13、`watch(` 12、`computed(` 12、`createApp(` 8、`toRaw(` 5、`provide(` 4、`shallowReactive(` 3、`defineAsyncComponent(` 2；另有 vue-router 4 文件。

**分布极不均**：`ui/factory/` 65 个文件里 **49 个是纯 TS**（只再导出 core 逻辑 + 一层 `emitXxxChange`），只有 16 个真需要 `h`。

### 逐块对照（rui 要造什么）

| vui 概念 | 用量 | rui 对应物 | 难度 |
|---|---|---|---|
| `reactive/ref/computed/watch/shallowReactive` | 31+14+12+12+3 | 外部 store + `useSyncExternalStore` | **最大设计点**，见 §4 待拍 D1 |
| `inject/provide` | 13/4 | React Context + `use()` | 中 |
| `h(...)` | 534 | `createElement` / JSX | 机械 |
| 插槽（工厂第二参惰性函数） | 全族 | 直接当 render prop 调 | **零适配**：形态本就一致 |
| `nextTick` | 32 | `flushSync` / microtask | 低 |
| `defineAsyncComponent` | 2 | `React.lazy` + `Suspense` | 低 |
| `createApp/mount` | app/playground main.ts | `createRoot(createElement(...))` | 低 |
| vue-i18n | `app/app.ts`、`i18n/i18n.ts` | react-i18next | 低，词条 1,068 行是纯数据可搬 |
| vue-router | 4 文件 | react-router | 低 |
| `VuePluginHost`（112 行，已纯 TS） | 11 插件 | `RuiPluginHost` | 低，形状可对齐 |

皮肤侧：三家都是 `extends VueUiBuilder`。规模参考：Syncfusion **124 文件/18,422 行**、AgNaive 81/10,899、PrimeVue 76/7,511。一个皮肤就是一轮独立工程。

---

## 2. 真正的拦路石：业务层 142 处从 vui 取 core 的东西

`packages/base/src` + `packages/mes/src` 共 **142 处** `from '@mmda/vui'`：

| 名字 | 次数 | 家在哪 |
|---|---|---|
| `EntityLogic` / `EntityLogicInit` / `UiLogicFnResult` / `SubEntityLogic` | 101 / 98 / 96 / 90 | **core**：`packages/core/src/logic/entity_logic.ts:132 / :41 / :73 / :784` |
| `UiViewOne` / `UiViewMany` / `UiAction` / `UiDialogProps` / `UiContext` / `UiSearchField` | 26+2+2+1+1+1 | core |
| `VueUiContext` / `VueUiBuilder` / `UI_APP_KEY` / `UI_BUILDER_KEY` / `Rx` | 6 / 1 / 3 / 3 / 1 | **vui 专有** |
| `label` / `getFileInfo` / `CustomColumn` / `setGroupWatermark` | 各 1–2 | 待查归属 |

`packages/base/src/keys.ts:1-6` 里 `UI_APP_KEY` + `vue` 的 `InjectionKey<MmdaApplication>` —— **Vue 注入键已渗进业务模块骨架**。

业务层的真实 UI 面：

- base：212 个 TS，**4** 个 import vue、6 处 `defineComponent`、`components/`+`views/` 共 4 个文件
- mes：343 个 TS/TSX，**40** 个 import vue、65 处 `defineComponent`、**8 个 `.tsx` 其实是 Vue JSX**
- app/playground：48 个文件，18 个 import vue

→ **P0 不是写 React，是先把这 142 处里属于 core 的换回 `@mmda/core`**（ARCHITECTURE 本来就要求「业务 Logic 只认 core `UiContext`」）。做完后：base/mes 的 Logic 层与运行时脱钩，换壳业务零改动；剩下的 44 个 import vue 文件 + 8 个 Vue JSX 组件才是 rui 迁移面。

---

## 3. 阶段划分

### P0 解耦前置（不写 React）

1. base/mes 142 处 `@mmda/vui` → 按归属改成 `@mmda/core`（core 缺名字才补 core）
2. `UI_APP_KEY` / `UI_BUILDER_KEY` 收进 vui 内部；业务拿 app 走 `context.app`，不要 injection key
3. 补架构门禁：业务包（base/mes/app）不得 import 运行时包（vui/rui）
4. 修文档漂移：`docs/naming.md:124` 还写着旧口径（`for` 规范成 `htmlFor`、`className`、`vueRenderProps` 映射），已被 `docs/design/vui_architecture.md` §1.7 取代

### P1 `@mmda/rui` 契约合规层（薄）

`ReactUiBuilder implements UiBuilder<ReactNode>` + rui 适配（只做 `className` / `htmlFor` 两处键名映射）。把跨框架对照探针固化成回归测试。产出：core 的 100+ `UiXxxProps` 在 React 下逐个渲一遍，DOM 逐字节一致 + 零告警。

适配层（框架无关层已定，rui 侧只此一处薄映射）：

```ts
// rui 适配层：core UiRenderProps → React createElement
const std = uiRenderProps(props)
createElement(Comp, {
  ...std.props,
  ...std.attributes,
  className: std.props.class as string,   // class 已由 uiRenderProps 收成字符串
  htmlFor: std.props.for,                  // 平台原名 → React 名
})
```

### P2 rui 主体（工作量大头）

- `ReactUiContext`（对标 vui 835 行 + mixins 1,813 行）：响应式状态 + 派生上下文缓存
- `ReactUiLayout extends AbstractUiLayout<ReactNode>`
- `ReactUiFactory` + `ReactUiFieldFactory`（形态对齐 vui 的 49 个纯 TS factory 文件 + 16 个带渲染的）
- `RuiPluginHost`（对标 112 行 host.ts，纯 TS）
- i18n（react-i18next 薄封装，词条直接搬 vui 的 zh/en/zh-Hant，也可能抽为共用包——待拍 D4）

### P3 应用壳 + 首个皮肤

- `MmdaRuiApp extends MmdaApplication`
- `createRoot` + react-router + playground
- 首个皮肤：React 生态同源优先（`@syncfusion/ej2-react-*` / PrimeReact），对标 vui-syncfusion

### P4 插件 + 业务迁移

- `@mmda/ruix-*`（echarts-for-react、gantt/kanban/scheduler 各自的 React 版插件）
- **首个已落地：`@mmda/ruix-tempis-timeline`**（Tempis 二维画布轴，`builder.buildTempisTimeline`，2026-09-22）
- mes 的 40 个 import vue 文件 + 8 个 Vue JSX 组件迁移为 React 组件

### 命名家族

已由 `docs/naming.md:62` 定名：`@mmda/rui` → `@mmda/rui-*`（皮肤）→ `@mmda/ruix-*`（插件）。`pnpm-workspace.yaml` 是 `packages/*` 通配，新包直接建子目录即可。

---

## 4. 待拍

| # | 决策 | 选项 | 倾向 |
|---|---|---|---|
| **D1** | 响应式模型 | (a) rui 自带最小 store（可变状态 + 订阅，`useSyncExternalStore`）；(b) 抽成 core 框架无关信号；(c) 引现成库（valtio/signals） | **(a)**：不给 core 增型，代价是 vui/rui 各一份会话状态 |
| **D2** | 首个皮肤 | 同源（Syncfusion React）vs 轻量（PrimeReact/MUI）vs 键康（Ant Design） | 同源优先，能复用现有皮肤的心智与文档 |
| **D3** | 是否做 app 壳 | 对标 `@mmda/app`（React 版）vs 先只出库 + playground | 先 playground，P3 再做壳 |
| **D4** | i18n 词条归属 | vui zh/en/zh-Hant 直接搬到 rui vs 抽成 `@mmda/i18n` 共用包 | 先搬，重复后抽包 |

---

## 5. 架构约束（rui 须守的 PASS/FAIL）

| 规则 | 来源 |
|---|---|
| rui 不得 import `@mmda/vui`（不抄组件） | naming.md |
| rui 不得在 `core/src/` 写入 vue/react 类型 | architecture_gate.test.ts |
| 整袋 spread 到 DOM 在 rui 侧必须走 `uiRenderProps` 的两段展开（`props` + `attributes`），不得直接 `{...props}` | 跨框架探针 |
| `UiXxxProps` 里的函数型成员在实现侧必须有显式消费点 | 跨框架探针（函数落 DOM 路径的静默污染） |
| `class` / `for` 译成 `className` / `htmlFor` 只有 rui 适配层一处做 | vui_architecture.md §1.4 |

---

对照源码：`packages/core/src/ui/`（契约）、`packages/vui/src/`（Vue 落地，rui 的对标）、`packages/vui-*/src/`（皮肤，rui 对标的参照）。