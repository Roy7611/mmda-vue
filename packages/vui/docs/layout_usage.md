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
})
```

全局横竖改 `layout.fieldVertical`（默认 `false` = 横排）。单次字段也可 `builder.buildField(field, ctx, { fieldVertical: true })`（或 `orientation: 'vertical'`）走 Vert，不碰全局开关。`cards` / `tabs` 详情页默认横排。根 class 是 `mmda-field mmda-field--horizontal`（或 `--vertical`）。控件在 `.mmda-field-control`。校验文案由皮肤控件自绘，不要再传 message。

组间距可改 `layout.gap`（默认 `0.75rem`），作用于 `row` / `column` / `grid` / `listTile`。

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
// cards（缺省）：左右卡，摘要可折叠
layout.layoutPage({
  pageLayout: 'cards',
  toolbar,
  banner,
  primary,
  summary,
  tails,
  footer,
})

// tabs：emphasized 只读顶栏 + 每 ui group 一页签（FormBuilder 在 pageLayout:'tabs' 时自动拼）
layout.layoutPage({
  pageLayout: 'tabs',
  toolbar,
  banner,
  emphasis, // layout.row(displayFor…, colSpan 权重)；与 tabs 内字段可重复；编辑只在 tabs
  primary: [tabsNode],
  footer,
})
```

`primary` / `summary` / `tails` 是 **`TNode[]`**。`UiViewProps.pageLayout` 透传给 `layoutPage`。有 `toolbar` 就永远 sticky（`mmda-page__header--sticky`）。footer 与 body 平级，不塞进 body。

- `cards` / `tabs`：组内字段默认横排
- `tabs` 强调条：`emphasizedFields.map(f => Math.max(1, f.colSpan ?? 1))` 作 flex 权重；`.mmda-page__emphasis` 固定标签列宽
- `cards`：组壳 `GroupCard`（可折叠标题）；secondary 仍 1 列侧栏
- `tabs`：组壳 `GroupTab`（无标题镜像、无折叠）；每组 `container:'tab'`，含 secondary 一律 `primaryCols` 横排；`factory.tabs` 默认 `loadOn:'Demand'`、`headerStyle:'fill'`、`scrollable`；页签 `name` = `groupName`（附件页 `'attachments'`）

模块 CRUD 工作区叠层与完整 class 树见 [layout.md 页面 CSS](./layout.md#页面-cssbem)。详情页骨架：

```
.mmda-page
  .mmda-page__header
  .mmda-page__banner?
  .mmda-page__body
    .mmda-section--main
    .mmda-section--summary?
  .mmda-page__footer?
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

nowrap 三槽，不是加权 `row`。不要调用 `defaultListTile`。皮肤若覆盖了 `listTile`，走皮肤外观。

## 栅格原语

```ts
layout.cell(child, 4)           // flex 权重 4
layout.row(children, [4, 8])    // flex 行，可 wrap；权重 4:8
layout.column(children)
layout.grid(children, [6, 6])   // CSS grid；列 fr，给字段组装箱
```

`props` 用 `UiProps`（`class` / `style` / 袋键）。列表图标行用 `listTile`，不要 `row([icon, title], [1, 11])`。

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
