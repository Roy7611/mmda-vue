# VuiContext 设计

vui 一屏会话的实现设计。产品分层真源仍是仓库 [ARCHITECTURE.md](../../../ARCHITECTURE.md)。程序员怎么写见 [context.md](./context.md)；Logic 钩子见 core [ui_context_usage.md](../../core/docs/logic/ui_context_usage.md)。

## 现状

会话的框架无关能力（字段读写 / 校验 / 子表 / 路由 / 列表搜索 / 选择 / 多选动作）已经上移到 core `AbstractUiContext`。vui 只留 **一个类 `VuiContext extends AbstractUiContext`**，不再用 `WithXxx` mixin 链，也不再维护 `VuiContextBase` / `VuiContextRuntime` / type alias 三层壳。

```text
业务 *Logic.ts  ──►  core UiContext（接口）
                           ▲
                           │ implements
                     AbstractUiContext（core，框架无关行为）
                           ▲
                           │ extends
                     vui VuiContext（只补 Vue 收窄）
```

## 一个类

- 公开实现类只有 **`VuiContext<E>`**。行为由运行时 `view` + 可选 `logic` 门控，**不**按 Index / Edit / Details 建子类或文件夹。
- 子表集合、子表行、选择器弹层都是**同一类**的子实例：`createChild` 里直接 `new VuiContext(...)`，不再经过 `createSession` 工厂。
- Logic / base / mes 钩子只认 core **`UiContext`**（从 `@mmda/core` 导入）。`VuiContext` 给 vui 构造、拼屏、少数 mes **Vue 组件**。
- `new` 只出现在 vui（`EntityView`、选择弹层、树对话框）和少数 mes Vue 组件。不要在 Logic 里 `new`。
- 旧名 `UiViewContext` / `UiBuildContext` 已删除，**不是**产品契约，新代码禁止再写。

## VuiContext 只做什么

- 构造期注入 `createVueRxFactory()`，`model` / `validationState` / `actionLoadings` 用 Vue `reactive` / `shallowReactive` 包裹。
- `vueRouter` → core `UiRouter`（`push` / `resolve` / `parse` / `back`），并覆写 `currentRoutePath()`。
- `translateFn` 接 `app.i18n.global.t`；无 app 时回落到 identity。
- 覆写 core 皮肤工厂 / 工具钩子：
  - `createUiFilter` → `VuiFilter`（Vue `ref` 收窄）
  - `createCustomSearchField` → `VuiCustomSearchField`
  - `getFileInfo` / `readStoredPageSize` / `loadLastQuery` / `saveLastQuery` / `logListPaint` / `resetListPaintCount`

## 文件

```text
packages/vui/src/contexts/
  vue_ui_context.ts   VuiContext（单类）+ VuiContextOptions
  view.ts             UiViewOne / UiViewMany（运行时门控，不是文件轴）
  vue_module_context.ts  VueModuleContext = core ModuleContext 的 Vue 注入键 / WeakMap 绑定
```

## 类型边界

| 谁 | 类型 | 从哪导入 |
|---|---|---|
| 业务 `*Logic.ts` 钩子 | core `UiContext` | `@mmda/core` |
| `new`、Vue `PropType`、屏级拼装 | `VuiContext` | `@mmda/vui` |
| `context.uiBuilder` | core `UiBuilder` | 值为 `app.ui`（`VuiBuilder`） |

rui 对等实现为 `RuiContext extends AbstractUiContext`，两边不互相 import。
