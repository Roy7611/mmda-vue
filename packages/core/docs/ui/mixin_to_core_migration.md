# VuiContext mixin 上移 core 执行计划

## 背景

`VuiContext` 现在用 mixin 链组装：

```text
VuiContextBase
  → WithSubgroup
    → WithReference
      → WithData
        → WithNavigate
          = VuiContextRuntime
```

其中大部分逻辑是「框架无关的会话行为」，却仍住在 `packages/vui/src/contexts/mixins/` 里，导致 rui 拿不到同等能力，vui 也要维护 `VuiContextBase` + `VuiContextRuntime` + type alias 三层壳。

core 已具备响应式抽象（`UiRenderer` / `RxFactory` / `UiRouter`）与 `AbstractUiContext` 的字段读写、校验、子表、搜索行、路由基础方法。本次把这些 mixin 的剩余能力上收到 `AbstractUiContext`，vui 收敛成单类 `VuiContext extends AbstractUiContext`，对齐 `RuiContext`。

> 状态：P0 / P1 / P2 / P3 已落地，typecheck 三包全绿，vui 411/411、rui 33/33 测试通过。Builder 类名（`SfVuiBuilder` / `PrimeVuiBuilder` / `AgNaiveVuiBuilder` / `SfRuiBuilder`）与 README / 文档 / PlantUML 图已同步。

## 已确认的契约

- core 新增 `ModuleContext`，承载 Index/One 之间的保活列表同步（`beginCreate` / `setCurrent` / `applyCurrentRow` / `removeById` …）。
- `UiRouter` 增加 `parse()` 与 `back()`。
- `UiBuilder` 暴露 `overlay: UiOverlay<TNode>`（core 契约；vui `VuiBuilderBase.overlay` 已是 `VuiOverlay`，直接满足）。
- 搜索页 `buildSearchView` 已重构进 core；本次只迁移 vui `WithData` 的「列表搜索态」及 `VuiFilter` / `VuiCustomSearchField` / `quickFiltersToSQL` 上提。
- 命名约定（优先级最高，P3 一并落地）：
  - Vue: `UiBuilder → VuiBuilder → SfVuiBuilder | PrimeVuiBuilder | AgNaiveVuiBuilder`
  - React: `UiBuilder → RuiBuilder → SfRuiBuilder | PrimeRuiBuilder | AgNaiveRuiBuilder`

## 目标终态

```text
core
  AbstractUiContext            ← 字段/校验/子表/搜索/路由 + 本次上移的 data/navigate/reference/subgroup
  ModuleContext                ← Index↔One 保活同步
  UiRouter { push/resolve/parse/back }
  UiBuilder { …, overlay: UiOverlay }
  ui/filter                    ← UiFilter / UiCustomSearchField / quickFiltersToSQL（从 vui 上提）

vui
  VuiContext extends AbstractUiContext   ← 单类，只留 Vue 响应式/路由注入/i18n
  VuiBuilder extends AbstractUiBuilder   ← 只留 VNode 收窄 + 皮肤无关的 Vue 拼屏
  VueModuleContext = ModuleContext + Vue 注入键/WeakMap 绑定
```

## 阶段拆解

### P0 — 只加契约 + 薄适配（不动 mixin 行为）

目标：把 core 缺的契约补齐，让后续上移有地方落，且现有实现兼容。

- `core/src/ui/router.ts`：`UiRouter` 加 `parse(path: string): unknown` 与 `back(): void`。
- 三个路由适配器补 `parse/back`：
  - `packages/vui/src/contexts/vue_ui_context.ts`（Vue `router.resolve` / `router.back`）
  - `packages/vui/src/components/hosted_view.ts`
  - `packages/rui/src/contexts/react_ui_context.ts`（React `navigate(path)` / `navigate(-1)`）
- `core/src/ui/builder.ts`：`UiBuilder` 加 `readonly overlay: UiOverlay<TNode>`。
- 新增 `core/src/ui/module_context.ts`：
  - `ModuleContext` 接口（框架无关，方法签名用 `UiContext` + `UiIndexTableHost`）
  - `createModuleContext()` 工厂（从 vui `createModuleContext` 平移，去掉 Vue 类型）
- `core/src/ui/context.ts`：`UiContext` 加 `moduleContext?: ModuleContext`；`core/src/ui/context_base.ts` 加字段与 getter/setter。
- vui `vue_module_context.ts`：
  - `VueModuleContext` 改为 `ModuleContext` 的 Vue 侧别名/收窄，或直接复用 core 接口
  - 保留 `MODULE_CONTEXT_KEY`、`bindModuleContext`、`getModuleContext` 的 WeakMap 绑定
  - `getModuleContext` 改为从 `context.moduleContext` 读，或继续 WeakMap（迁移期过渡，二选一写死）
- 上提 core（薄平移，先不删 vui 原文件，保持双源一致）：
  - `UiFilter` / `UiCustomSearchField` / `UiSearchForm` + `quickFiltersToSQL` → `core/src/ui/filter/`（或 `core/src/logic/`）
  - `UiColorRole`、`canDoFromExecutableExpression`、文件信息 resolver 钩子、`readStoredPageSize` / 最近查询 / 列表度量钩子
- 验收：`pnpm --filter @mmda/core test`、`pnpm --filter @mmda/vui test` 全绿；`tsc` 三包无新错。

### P1 — mixin 上移（依赖少到多）

按依赖顺序逐个把 vui mixin 的框架无关部分搬进 `AbstractUiContext`，把 Vue 专属点拆成可注入钩子：

1. `WithReference` → `select` 全量上移（依赖 `uiBuilder.selectDialog` + `ModuleContext`）。
2. `WithSubgroup` → `getGroupActions` / `setupGroupActions` / `runGroupAdd` 上移（`canDoFromExecutableExpression`、`UiColorRole` 随 P0 进 core）。
3. `WithNavigate` → `routeToIndex` 的当前 URL 剥段、`cancel` / `confirmAction`、`routeToEdit/Create/Details` 的 `moduleContext` 写回上移；`isInDialog` 的 `openNestEntityDialog` 分支保留在 core（该方法已是 `UiBuilder` 契约）。
4. `WithData` → `configureSearch` / `toggleQuickFilter` / `syncQuickFilters` / `syncSearchState` / `applySearchParam` / `clearFilters` / `init` / `initMetadata` / `afterDeleteCleanup` / 列表搜索前后钩子上移；列表度量 `logListPaint` 用可注入钩子（默认 noop）。

每步验收：`@mmda/core`、`@mmda/vui` 测试绿；rui 因只读 `AbstractUiContext` 自动获得能力，跑 rui 测试确认无回归。

### P2 — vui 收敛单类

- 删除 `packages/vui/src/contexts/mixins/{data,navigate,reference,subgroup,session,types}.ts`。
- 删除 `ContextHost` 中间层与 `createSession` 工厂（子 context 直接 `new VuiContext(...)`）。
- `VuiContext` 改为 `class VuiContext extends AbstractUiContext`，构造器只负责 Vue 响应式初始化、`rxFactory`、`vueRouter → UiRouter` 适配、i18n `translateFn`。
- 对齐 `RuiContext` 的构造形状；`setSessionFactory` 调用点删除。

### P3 — 命名与文档同步

- 按命名约定改皮肤 Builder 类名（含导出、测试、README）：
  - `packages/vui-syncfusion/src/builder/index.ts`：`SfUiBuilder` → `SfVuiBuilder`
  - `packages/vui-agnaive/src/agnaive_builder.ts`：`AgNaiveUiBuilder` → `AgNaiveVuiBuilder`
  - `packages/rui-syncfusion/src/builder.ts`：`SfReactUiBuilder` → `SfRuiBuilder`
  - 已符合：`VuiBuilder`、`RuiBuilder`、`PrimeVuiBuilder`
- 更新 `ARCHITECTURE.md`：
  - Builder/Context 类名对齐代码与命名约定
  - `mes`「只认 core」措辞改为如实反映 Vue 依赖，或把 mes 违规引用列成后续清理项
  - 补 `@mmda/rui`、`@mmda/rui-syncfusion`、`@mmda/ruix-*`、`@mmda/vuix-*` 的落层
- 同步受影响皮肤 READMEs 与 `packages/core/docs/index.md` 链接。

## 风险与边界

- mixin 上移时禁止破坏 `UiContext` 接口对 Logic 的可见面：Logic 仍只认 `@mmda/core` 的 `UiContext`，不做 `VueUiContext`/`ReactUiContext` 向下转型。
- 列表搜索态（`WithData`）与搜索页（`buildSearchView`）是两个范围，不重做已进 core 的搜索页。
- 所有含中文文件保持 UTF-8 无 BOM；改文档/源码用编辑器 `StrReplace` / `apply_patch` 或 Python `write_text(encoding='utf-8')`。
- 不做 `git commit`；本计划是工作稿，落地完成后按仓库现有风格决定是否折叠进 `docs/index.md`。
