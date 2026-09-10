# `UiLayout`（core）

契约源码：[`src/ui/layout.ts`](../../src/ui/layout.ts)。四职总设计：[ui_four_roles_design.md](./ui_four_roles_design.md)。程序员怎么写：[ui_four_roles_usage.md](./ui_four_roles_usage.md)。vui 落地与样式：[vui layout.md](../../../vui/docs/layout.md)、[layout_usage.md](../../../vui/docs/layout_usage.md)。

## 一层

| 接口 | 范围 | 谁调用 |
|---|---|---|
| **`UiLayout`** | 页内排法 + 应用壳 `scaffold` | Builder / fieldFactory / **AppShell** 直接调 `scaffold` |

不要在此引入 Vue。不要把壳脚手架写回 Builder（无 `buildAppScaffold`）。

## UiLayout 能力

- 栅格：`cell` / `row` / `column` / `grid`
- 字段方向：`fieldVertical`（默认 `false` = 横排）；赋值时把 `layoutFieldHorz` / `layoutFieldVert` 挂到 `layoutField`
- 字段：`layoutField`（入参 `UiFieldSlots`：标签 + 控件 + 可选 message / `messageKind`；可选 `gridColumn` / `gridRow` 占格坐标）
- 组：`layoutFieldGroup`（入参只 `fields`；排法用 `fieldGroupLayout: { type, gridCols? }`）；组是 N 列网格，一格一 field
- 页：`layoutPage`（入参 `UiPageSlots`：toolbar / banner / primary / summary / tails / footer）
- 列表条：`listTile`
- 应用壳：`scaffold({ variant, topBar, nav, page, bottomBar })`；变体 `sidebarLeft` \| `topBarFull`
- MetaUi 字段占格：`colSpan` / `rowSpan`（默认 1）；不存起始 row/col。组列数切换时用 `placeFields` 重排
- 字段测控 class：`mmda-field` / `mmda-field-label` / `mmda-field-control` / `mmda-field-message error|warning`
- 栅格间距：`gap`（默认 `0.75rem`），供 `row` / `column` / `grid` 使用

`AbstractUiLayout` 提供页内默认实现；`scaffold` 由 vui `VueUiLayout` 落地。

常用类型：`UiOrientation`、`UiHorzAlign`、`UiVertAlign`、`UiFieldGroupType`、`UiFieldGroupLayout`、`UiFieldSlots`、`UiFieldMessageKind`、`UiFieldSpan`、`UiFieldCell`、`UiPageSlots`、`UiAppScaffoldSlots`。

## scaffold

```ts
layout.scaffold({
  variant?: 'sidebarLeft' | 'topBarFull',
  topBar?,
  nav?,   // 通常是 buildAppSideMenu 产物
  page?,  // RouterView 等
  bottomBar?,
})
```

- vui：`VueUiLayout.scaffold`；AppShell 调 `builder.layout.scaffold`
- 旧 `AppLayout` / `UiAppLayout` 已并入本接口
