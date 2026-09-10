# `UiLayout` / `UiAppLayout`（core）

契约源码：[`src/ui/layout.ts`](../../src/ui/layout.ts)。四职总设计：[ui_four_roles_design.md](./ui_four_roles_design.md)。程序员怎么写：[ui_four_roles_usage.md](./ui_four_roles_usage.md)。vui 落地与样式：[vui layout.md](../../../vui/docs/layout.md)、[layout_usage.md](../../../vui/docs/layout_usage.md)。

## 两层

| 接口 | 范围 | 谁调用 |
|---|---|---|
| **`UiLayout`** | 页内排法：字段行、组、page、语义块 | Builder / fldFactory / 自定义拼屏 |
| **`UiAppLayout`** | 应用壳 `scaffold` | **AppShell** 直接调；**不进** `UiBuilder` |

不要在此引入 Vue。不要把壳脚手架写回 Builder（无 `buildAppScaffold`）。

## UiLayout 能力

- 栅格：`cell` / `row` / `column` / `grid`
- 字段：`layoutField`（标签 + 控件 + 可选 message）、`layoutFieldGroup`
- 页：`layoutPage`（toolbar / banner / primary / summary / tails / footer）
- 列表条：`listTile`
- 语义块（替代旧 `buildContainer*`）：`container` / `header` / `aside` / `main` / `footer`

`AbstractUiLayout` 提供上述默认实现；vui `VueUiLayout` 覆写 `layoutPage` 等与 `PageBody` 对接。

常用类型：`UiOrientation`、`UiHorzAlign`、`UiVertAlign`、`UiFieldGroupOrientation`、`UiFieldLayout`。

## UiAppLayout

```ts
scaffold({
  variant?: 'sidebarLeft' | 'topBarFull',
  topBar?, nav?, page?, bottomBar?,
  props?,
})
```

- 外壳不滚动；`nav` / `page` 各自管滚动
- `nav` 通常来自 `uiBuilder.buildAppSideMenu(...)`
- vui：`AppLayout` 实现本接口；`render(...)` 为兼容旧名，新代码用 `scaffold`

## 与 fldFactory

`fldFactory.render` / `editFor` / `displayFor` 默认调 `layout.layoutField`。vui 在 Builder 构造时把同一 `layout` 实例注入 `fldFactory.layout`。
