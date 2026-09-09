# 布局设计

契约在 [`@mmda/core` `src/ui/layout.ts`](../../core/src/ui/layout.ts)。Vue 实现是 [`VueUiLayout`](../src/ui/layout/layout.ts)。程序员用法：[layout_usage.md](./layout_usage.md)。

**不是** `factory.toolbar`（chrome 三栏条）。**不是** 应用脚手架 `AppLayout`（`sidebarLeft` / `topBarFull`）。`UiLayout` 管字段栅格、分组、详情页区域、列表项。

## 分层

能不用 Vue 的算法在 core。vui / 以后的 rui 共用同一套 `TNode` 骨架。

```mermaid
flowchart TB
  iface["interface UiLayout TNode"]
  abs["abstract AbstractUiLayout implements UiLayout"]
  vue["class VueUiLayout extends AbstractUiLayout VNode"]
  skins["sf / naive / prime extends VueUiLayout"]
  rui["将来 RuiUiLayout extends AbstractUiLayout"]
  iface --> abs
  abs --> vue
  abs --> rui
  vue --> skins
```

| 层 | 做什么 |
|---|---|
| core `interface UiLayout<TNode>` | 契约：`cell`/`row`/`column`/`grid`、`layoutField`/`layoutFieldGroup`/`layoutPage`、`listTile` |
| core `abstract AbstractUiLayout<TNode>` | 上移的算法骨架，只调 `wrap`：`cell`/`row`/`column`/`grid`、`layoutField`/`layoutFieldGroup`/`layoutPage`、`listTile`；页体走 `pageBody` |
| vui `class VueUiLayout` | `h()` 实现 `wrap`；`pageBody` → `PageBody` |
| 皮肤 `extends VueUiLayout` | 覆盖 `cell`/`row`/`column`/`grid`，可选覆盖 `listTile` |

不要在 vui 再写一份同名 `interface UiLayout`。不要把 Vue 的 `VNodeChild` / `VNodeChildAtom` 写进 core。子节点就是 **`TNode` / `TNode[]`**。文本先 `factory.textSpan` 再进布局。

## 用词

横竖和布局属性一律 **`orientation`**，类型 **`UiOrientation`**：`'vertical' | 'horizontal'`。

| 要 | 不要 |
|---|---|
| `UiOrientation` | 新代码写 `UiDirection`（已 `@deprecated`） |
| 属性 `orientation` | 属性 `direction` |
| `UiFieldGroupOrientation`：`'row' \| 'column' \| 'table'` | 分组排法不要叫 `direction` |
| `data-orientation` | `data-direction` |
| `UiHorzAlign` / `UiVertAlign` | `UiHorzJustify`、flex `start`/`end` |

CSS class 用 `uiCssClass`：`mmda-field-layout--horizontal`、`mmda-field-group-layout--row`（BEM 修饰符，不是 API 名）。

内容对齐是物理轴，跟 flex/grid 无关：

| 类型 | 靠一侧 / 居中 | 多子项分剩余空间 |
|---|---|---|
| `UiHorzAlign` | `left` / `center` / `right` | `between` / `around` / `evenly` |
| `UiVertAlign` | `top` / `middle` / `bottom` | `between` / `around` / `evenly` |

Toolbar 槽内只用 `left`/`center`/`right`。皮肤把 `between` 等映射成 CSS `space-between`。

`props` 用 **`UiProps`**。

## 接口

```ts
export interface UiLayout<TNode = any> {
  fieldLayout: UiFieldLayout
  fieldMessage?: boolean
  wrapManyGroup: boolean
  maxCols: number
  cell(child: TNode, nCol?: number): TNode
  row(children: TNode[], nCols: number[], props?: UiProps): TNode
  column(children: TNode[], props?: UiProps): TNode
  grid(children: TNode[], nCols: number[], props?: UiProps): TNode
  layoutField(options: UiFieldLayoutOptions<TNode>): TNode
  layoutFieldGroup(options: UiFieldGroupLayoutOptions<TNode>): TNode
  layoutPage(options: UiPageLayoutOptions<TNode>): TNode
  listTile(slots: UiListTileSlots<TNode>): TNode
}
```

`listTile` 替代旧自由函数 `defaultListTile`。默认算法在 `AbstractUiLayout.listTile`（用 `this.row` / `this.column`）；皮肤要改外观就 override。

选项：

| 类型 | 要点 |
|---|---|
| `UiFieldLayoutOptions` | `label` / `control` / `message`：`TNode`；`orientation?: UiOrientation` |
| `UiFieldGroupLayoutOptions` | `fields: TNode[]`；`orientation?: UiFieldGroupOrientation`；`cols?: 1\|2\|3` |
| `UiPageLayoutOptions` | `toolbar?`：`TNode`（有则永远 sticky）；`primary` / `summary?` / `tails?` / `footer?` |
| `UiListTileSlots` | `title` 必填；`leading` / `subtitle` / `trailing` 可选，均为 `() => TNode` |

## 抽象钩子

`layoutPage` 骨架：工具栏行（有则 sticky）+ `this.pageBody(options)`。没有公开 `regions` 袋。

| 钩子 | 谁实现 |
|---|---|
| `wrap(className, style, props, children, tag?)` | vui：`h(tag, …)` |
| `pageBody(options)` | core 缺省铺平 primary/tails/summary/footer；vui 返回 `[PageBody]` |
| `cell` / `row` / `column` / `grid` | `VueUiLayout` 默认实现；皮肤覆盖 class |

`layoutField` / `layoutFieldGroup` / `layoutPage` / `listTile` 的结构（class、orientation、label+control）在 `AbstractUiLayout`，无 `h()`。class 一律 `uiCssClass`。

## Vue

`class VueUiLayout extends AbstractUiLayout<VNode>`。覆写 `pageBody`：`h(PageBody, …)`。不要再覆盖 `layoutPage`。

`PageBody` 留在 vui `components/`。rui 覆写 `pageBody` 即可。

应用壳仍是 vui `AppLayout`（`sidebarLeft` / `topBarFull`），走 `builder.buildAppScaffold`，与 `layoutPage` 不是一回事。
