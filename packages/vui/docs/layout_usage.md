# 布局：怎么写

从当前皮肤的 `builder.layout`（即 `UiLayout<VNode>` 实例）调方法。设计见 [layout.md](./layout.md)。类型从 `@mmda/core` 进。

不要再 import 已删除的自由函数 `layoutField` / `layoutFieldGroup` / `layoutPage` / `defaultListTile`。

```ts
const layout = context.uiBuilder.layout
```

Logic 不要 `h()`。下面示例是 vui Builder / 测试里的写法。

## 字段

```ts
layout.layoutField({
  label: this.labelFor(field),
  control,
  message, // 可选校验文案（文本或节点）；layout 包成 mmda-field-message
  messageKind: 'error', // 或缺省；仅 'error' | 'warning'
})
```

横竖只改 `layout.fieldVertical`（默认 `false` = 横排）。根 class 是 `mmda-field mmda-field--horizontal`（或 `--vertical`）。控件在 `.mmda-field-control`，文案在 `.mmda-field-message.error` / `.warning`。

组间距可改 `layout.gap`（默认 `0.75rem`），作用于 `row` / `column` / `grid`。

## 分组

```ts
layout.fieldGroupLayout = {
  type: group.isSecondary() ? 'column' : 'grid',
  gridCols: group.isSecondary() ? 1 : 2,
}
layout.layoutFieldGroup({ fields })
```

子表 / 图库整块占满时用 `type: 'grid'`、`gridCols: 1`。`gridCols` 只表示组内字段密度（1/2/3），不是页级 12 栅格。分组 class：`mmda-field-group mmda-field-group--grid` / `--row` / `--column`。

## 详情 / 编辑页

```ts
layout.layoutPage({
  toolbar,
  primary,
  summary,
  tails,
  footer,
})
```

`primary` / `summary` / `tails` 是 **`TNode[]`**。vui 经 `pageBody` 收成 `PageBody`（可折叠概要）。有 `toolbar` 就永远 sticky（`mmda-page-toolbar--sticky`）。

结构：

```
mmda-page
  mmda-page-toolbar
  mmda-page-body
```

## 列表项

```ts
layout.listTile({
  leading: () => avatar,
  title: () => titleNode,
  subtitle: () => subNode,
  trailing: () => action,
})
```

不要调用 `defaultListTile`。皮肤若覆盖了 `listTile`，走皮肤外观。

## 栅格原语

```ts
layout.cell(child, 4)
layout.row(children, [4, 8])
layout.column(children)
layout.grid(children, [6, 6])
```

`props` 用 `UiProps`（`class` / `style` / 袋键）。

## 测试 / 无皮肤

```ts
import { VueUiLayout } from '@mmda/vui'

const layout = new VueUiLayout()
layout.fieldVertical = false
layout.layoutField({
  label: h('label', { class: 'mmda-field-label' }, '名称'),
  control: h('input'),
})
```

## 皮肤

```ts
export class SyncfusionLayout extends VueUiLayout {
  // 可选 listTile；栅格用基类 mmda-row 等，不要为换厂商前缀覆写 cell/row/column/grid
}
export const syncfusionLayout = new SyncfusionLayout()
```

改组间距设 `layout.gap`。不要复制 `layoutField` 算法。

## 应用壳

页区域用 `layoutPage`。整站脚手架用 `layout.scaffold`：

```ts
layout.scaffold({
  variant: 'sidebarLeft',
  topBar,
  nav,
  page,
  bottomBar,
})
```

变体：`sidebarLeft`（缺省）/ `topBarFull`。
