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
  message, // 可选校验文案节点
  orientation: this.layout.fieldLayout, // 'horizontal' | 'vertical'
  props: { key: field.fieldName },
})
```

横排 class 是 `mmda-field-layout mmda-field-layout--horizontal`（`uiCssClass`），根上 `data-orientation`。

## 分组

```ts
layout.layoutFieldGroup({
  fields,
  orientation: group.isSecondary() ? 'column' : 'row',
  cols: group.isSecondary() ? 1 : 2,
})
```

子表 / 图库整块占满时用 `orientation: 'table'`、`cols: 1`。`cols` 只表示组内字段密度（1/2/3），不是页级 12 栅格。分组 class：`mmda-field-group-layout--row` / `--column` / `--table`。

## 详情 / 编辑页

```ts
layout.layoutPage({
  toolbar,
  primary,
  summary,
  tails,
  footer,
  props: { class: 'mmda-view', role: context.view },
})
```

`primary` / `summary` / `tails` 是 **`TNode[]`**。vui 经 `pageBody` 收成 `PageBody`（可折叠概要）。有 `toolbar` 就永远 sticky（`mmda-page-toolbar--sticky`）。不要自己拼 `mmda-page-body`。

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
layout.layoutField({
  label: h('label', '名称'),
  control: h('input'),
  orientation: 'horizontal',
})
```

## 皮肤

```ts
export class SyncfusionLayout extends VueUiLayout {
  cell(child: VNode, nCol = 1): VNode {
    return h('div', { class: 'mmda-sf-cell', style: { gridColumn: `span ${nCol}` } }, child)
  }
  // row / column / grid / 可选 listTile
}
export const syncfusionLayout = new SyncfusionLayout()
```

只覆盖造盒子的 class；不要复制 `layoutField` 算法。

## 应用壳

页区域用 `layoutPage`。整站脚手架用 `AppLayout` / `builder.buildAppScaffold`：

```ts
new AppLayout('sidebarLeft').render({
  topBar,
  nav,
  page,
  bottomBar,
})
```

变体：`sidebarLeft`（缺省）/ `topBarFull`。
