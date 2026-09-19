# `UiLayout`（core）

契约源码：[`src/ui/layout.ts`](../../src/ui/layout.ts)。四职总设计：[ui_four_roles_design.md](./ui_four_roles_design.md)。程序员怎么写：[ui_four_roles_usage.md](./ui_four_roles_usage.md)。vui 落地与样式：[vui layout.md](../../../vui/docs/layout.md)、[layout_usage.md](../../../vui/docs/layout_usage.md)。

## 一层

| 接口 | 范围 | 谁调用 |
|---|---|---|
| **`UiLayout`** | 页内排法 + 应用壳 `scaffold` | Builder / fieldFactory / **AppShell** 直接调 `scaffold` |

不要在此引入 Vue。不要把壳脚手架写回 Builder（无 `buildAppScaffold`）。

## UiLayout 能力

- 横排 flex：`cell` / `row` — `nCol` / `nCols[i]` 为 **flex 权重**（`flex: N 1 0`，`minWidth: 0`）；`row` 可 wrap
- CSS grid：`grid` — 字段组装箱用；`nCols` 为各列 `fr`，与 `row` 的 flex 权重不是一回事
- 列：`column`
- 字段方向：`fieldVertical`（默认 `false` = 横排）；赋值时把 `layoutFieldHorz` / `layoutFieldVert` 挂到 `layoutField`。单次调用也可经 props `fieldVertical: true` 走 Vert（vui Builder 的字段行）
- 字段：`layoutField`（入参 `UiFieldSlots`：标签 + 控件；可选 `gridColumn` / `gridRow` 占格坐标）。校验文案由皮肤控件自绘
- 组：`layoutFieldGroup`（入参只 `fields`；排法用 `fieldGroupLayout: { type, gridCols? }`）；组是 N 列网格，一格一 field
- 页：`layoutPage`（入参 `UiPageSlots`：toolbar / banner / `pageLayout?` / `emphasis?` / primary / summary / tails / footer）
- 列表条：`listTile` — **nowrap 三槽**（leading 按内容 | body `flex:1`+`minWidth:0` | trailing 按内容）；**不是**加权 `row`
- 应用壳：`scaffold({ variant, topBar, nav, page, bottomBar })`；变体 `sidebarLeft` \| `topBarFull`
- MetaUi 字段占格：`colSpan` / `rowSpan`（默认 1）；不存起始 row/col。组列数切换时用 `placeFields` 重排。tabs 强调条里 `colSpan` 还作 `row` 的 flex 权重
- 字段测控 class：**只**用 `uiCssClass` / `uiCssClasses` 拼（见 [`css.ts`](../../src/ui/css.ts)）；禁止写死 `mmda-` 字符串
- 栅格间距：`gap`（默认 `0.75rem`），供 `row` / `column` / `grid` / `listTile` 使用

`AbstractUiLayout` 提供页内默认实现（`layoutPage` 缺省铺平）；vui `VueUiLayout` 覆写 `layoutPage` 落地 cards/tabs 壳。core **没有** `pageBody` 钩子。

`UiLayout.pageLayout`（`cards` | `tabs`）可由 Vue 皮肤从本地偏好 `mmda/pageLayout` 初始化并写回；详情「更多」菜单可切换。

### cards / tabs（vui FormBuilder）

| 壳 | 组内字段 | 强调条 |
|---|---|---|
| `cards` | 默认横排（与全局 `fieldVertical` 一致） | 无 |
| `tabs` | 默认横排 | `layout.row(…, fields.map(f => max(1, f.colSpan ?? 1)))`；字段仍横排；`.mmda-page__emphasis` 定 `--mmda-field-label-col` |

常用类型：`UiOrientation`、`UiHorzAlign`、`UiVertAlign`、`UiFieldGroupType`、`UiFieldGroupLayout`、`UiFieldSlots`、`UiFieldSpan`、`UiFieldCell`、`UiPageLayout`、`UiPageSlots`、`UiAppScaffoldSlots`。

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

页面壳 class（`mmda-view` / `mmda-page` / `mmda-section`）写在 vui [layout.md 页面 CSS](../../../vui/docs/layout.md#页面-cssbem)。
