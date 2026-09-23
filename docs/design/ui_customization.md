# UI 自定义（字段 / 组 / 屏）

> **给程序员看的**：怎么自己写一个 UI 组件、自定义界面视图，用 `customRenderer` / `customEditor`
> 替换框架默认控件——不改皮肤包、不 import 任何框架库。
>
> 契约真源全在 `@mmda/core`；命名口径见 [docs/naming.md](../naming.md) §渲染器三层。

## 0. 一张表：三层自定义 + 各自入口

| 层 | 你要给的东西 | 契约（core） | 挂载入口 |
| --- | --- | --- | --- |
| **字段**（最常见） | 一个渲染函数 | `UiFieldRenderer<TNode> = (field, context, props?) => TNode` | `this.field('x').setCustomEditor(fn)` / `setCustomRenderer(fn)` |
| **表格单元格** | 同上（第三参带当前行） | `UiCellRenderer<TNode>`（第三参**必需**） | `this.field('x').setCustomCellEditor(fn)` / `setCustomCellRenderer(fn)` |
| **组 / 子表**（一整块区域） | 一个渲染函数 | `MetaUiGroupLogic.customRenderer / customEditor` | `this.group('items').setCustomRenderer(fn)` / `setCustomEditor(fn)` |
| **整屏**（列表 / 详情 / 编辑整页） | 一个视图函数 | `UiEntityViewFn = (context, deps) => TNode` | 宿主注册表，如 `mesPlugin.resolveEntityView(repository)` |
| **页级插槽**（页顶栏 / 页头 / 主内容 / 页脚） | 四个惰性插槽函数 | `UiViewSlots<TNode>`（`UiViewProps` 与 `UiListViewProps` 都 extends 它，Vue / React **同一份**） | 拼屏 props：`buildDetailsView(ctx, { toolbar: () => node, content: () => node })` |

页级插槽（`toolbar` / `header` / `content` / `footer`）住在 core 的 `ui/slots.ts`，**不是**每个运行时各扩一份：
`content` 给了就整块接管主区（不再按组拼），`toolbar` 给了就顶掉默认顶栏。各页专有的插槽留在自己的运行时包里
（vui 的 `qrCode`、列表的 `subMainFooter` / `defaultFilter` / `customFilters`）。

三层是**同一个形状**：`(…, context, …) => TNode`。`context` 就是运行时入口——`context.uiBuilder`（拼屏 / 弹层）、`context.uiBuilder.factory`（原子控件）、`context.getFieldValue` / `setFieldValue`、`context.t` 都在它身上。**不需要 hook、不需要全局单例、不需要往下转型**。

---

## 1. 字段级：替换默认控件

### 1.1 选中顺序（记住这个就够了）

```
编辑态：customEditor ?? field.editor ?? fieldFactory.fallbackInput
只读态：customRenderer ?? field.renderer ?? fieldFactory.fallbackDisplay
单元格：customCellEditor ?? customEditor ?? fieldFactory[field.editor] ?? fallbackInput
        customCellRenderer ?? fieldFactory[fieldDisplayName(field)] ?? fallbackDisplay
```

- 真源在 core：`packages/core/src/ui/builder_base.ts`（表单字段行）。
- 表格单元格在 vui：`packages/vui/src/ui/builder/list_view.ts` `tableCell`。
- 只写 `customEditor` 就能同时接管表单与表格（表格没有 `customCellEditor` 时回退到它）。
- `field.editor` / `field.renderer` 是**元数据里的控件名**，属于皮肤能力；业务自己写的控件走 `customEditor` / `customRenderer`，不要去元数据里编控件名。

### 1.2 最小样例（Vue）

```ts
// BomLogic.ts —— 在实体 Logic 里挂
import { createElement } from 'vue'   // Vue 用 h
import type { MetaUiField, UiContext } from '@mmda/core'

function MaterialPic(props: { field: MetaUiField; context: UiContext }) {
  const url = String(props.context.getFieldValue(props.field) ?? '')
  return h('img', { class: 'material-pic', src: url })
}

this.field('materialPic').setCustomEditor((field, context) =>
  h(MaterialPic, { field, context }),
)
```

### 1.3 最小样例（React）

```tsx
import { createElement } from 'react'
import type { MetaUiField, UiContext } from '@mmda/core'

function MaterialPic({ field, context }: { field: MetaUiField; context: UiContext }) {
  const url = String(context.getFieldValue(field) ?? '')
  return <img className="material-pic" src={url} />
}

this.field('materialPic').setCustomEditor((field, context) =>
  createElement(MaterialPic, { field, context }),
)
```

**必须包一层 `createElement` / `h`**：`customEditor` 是被**直接调用**的函数，不是被当作组件渲染的；直接把组件函数本体交给它，组件里再用 `useState` 这类 hook 会在调用点炸。

### 1.4 表格单元格：第三参带当前行

表格渲染时 `context` 是**整表会话**（`context.model` 是行数组），分不出在画哪一行，所以当前行由第三参显式给：

```ts
this.field('amount').setCustomCellRenderer((field, context, props) => {
  // props: UiFieldCellProps —— props.row 是当前渲染的行实体（类型上必需，直接用）
  const value = context.displayField(field, props.row)
  return h('span', { class: value > 1000 ? 'amount amount--big' : 'amount' }, value)
})
```

**字段级与单元格级是两个类型，按用途选**：

| 挂载 API | 类型 | 第三参 | 什么时候用 |
| --- | --- | --- | --- |
| `setCustomRenderer` / `setCustomEditor` | `UiFieldRenderer<TNode>` | 可选 | 详情 / 编辑表单的字段（可以画得丰富）；表格缺 cell 版时会**回退**到它，回退时也传当前行 |
| `setCustomCellRenderer` / `setCustomCellEditor` | `UiCellRenderer<TNode>` | **必需** | 只在表格里跑（可能上千行，写更轻的实现）；表格优先用它 |

`UiFieldCellProps`（`packages/core/src/ui/field_factory.ts`）：`row`（必需）+ `isSearch` / `linkable` / `title`，另继承 `UiProps`（`class` / `style` / `htmlAttributes`）。用字段级 API 时第三参可能不传（表单路径），所以要 `props?.row`；用单元格级 API 时 `props.row` 直接可用。

---

## 2. 组级：整块替换 + 前后插片（三个位置正交）

```ts
// ① 换中间那块：自造表格 / 看板（编辑态走 setCustomEditor，只读态走 setCustomRenderer）
this.group('items').setCustomEditor((group, context, props) => myEditableTable(group, context))

// ② 正上方加一段：例如扫码输入
this.group('items').setCustomEditPrepend((group, context, props) =>
  factory.textInput({ value: '', onChange: (v) => context.setFieldValue('scanCode', v) }))

// ③ 尾部加一段：例如显示编辑动态
this.group('items').setCustomEditAppend((group, context, props) =>
  factory.textSpan({ text: `${logs.length} 条改动` }))
```

- 三个位置**正交**：`prepend + (customEditor ?? 标准子表) + append` —— 只写插片也生效，不必写 customEditor。
- 编辑态用 `setCustomEditPrepend` / `setCustomEditAppend`，详情态用 `setCustomPrepend` / `setCustomAppend`。
- 类型都是 core 的 `UiGroupRenderer<TNode> = (group, context, props?) => TNode`（`packages/core/src/ui/group_factory.ts`）；接线在 vui `packages/vui/src/ui/builder/form.ts` 的 `wrapGroupSlots`（`wrapGroup` 的三个出口都过它，所以替换与插片都不会互相吃掉）。
- `customAggregator`（子表合计）已接线，但它**不是渲染器** —— 只算不渲染：

```ts
this.group('items')
  .onChange((ctx, model, items) => { /* 行集合变化回调 */ })
  .aggregateWith((ctx, model, items) => {
    // 子表变化后、onChange 之后调用：在这里改主表合计字段
    model.amount = items.reduce((sum, row) => sum + (row.amount ?? 0), 0)
  })
```

触发时机：**任何改子表数据的地方都会重算**，但前提是走会话 API（`context.addSubGroupItem` / `addSubGroupItems` / `removeSubGroupItem` / `removeSubGroupItems`）；`newSubGroupItem` 内部已含增删。直接 `model.items.push(...)` 绕过 API **不会触发**；`createSubGroupItems` 只造实体不追加，追加要调 `addSubGroupItem`。`beforeItemRemove` 拦截（返回 `false`）时数据没变，所以也不重算。这条约定同时写在仓库根 `AGENTS.md`。

---

## 3. 屏级：整页自定义视图

```ts
// packages/mes/src/views/ProductionScheduleView.ts
import type { UiContext, UiViewDeps } from '@mmda/core'

export function productionScheduleView<TNode>(
  context: UiContext,
  deps: UiViewDeps<TNode>,
): TNode {
  const ui = context.uiBuilder            // UiBuilder
  const { factory } = ui                  // UiFactory（原子控件）
  return deps.render('div', { class: 'schedule' }, [
    factory.button({ label: context.t('action.refresh'), onAction: () => context.search() }),
    ui.buildGantt(context, { tasks: [] }),
  ])
}
```

- 注册：模块贡献里 `resolveEntityView(repository)` 返回视图函数（样板 `packages/mes/src/plugin.ts`）。
- 宿主把它包成框架组件：Vue 用 `hostedView` / `hostedEntityView`（`packages/vui/src/components/hosted_view.ts`）。
- `deps` 给的是：`app`（应用壳）、`render`（最底层渲染）、`router`（跳转）、`invalidate`（告诉宿主「数据变了，重跑视图」）。业务包因此不 import vue / react / 路由库。
- 普通页面级视图是 `UiViewFn = (deps) => TNode`（少一个 `context`），用于模块首页这类非实体屏。

---

## 4. 三个坑

1. **组件要包一层**：`customEditor` / `customRenderer` 是渲染函数（直接被调用），不是组件。React 用 `createElement(Comp, { field, context })`，Vue 用 `h(Comp, { field, context })`。
2. **不要往下转型**：拿到的 `context` 是 `UiContext` 接口。不要 `as RuiContext` / `as VuiContext` 去摸运行时类的私有状态（`AGENTS.md` 的面向接口原则）。
3. **刷新由宿主驱动**：宿主重渲染时会重新执行你的渲染函数，你会拿到新的 `props` / 新的 `context` 读值。所以别把瞬时值钉在 `useState(...)` 初值里（React 不自动追踪）；要「主动刷新」就调 `deps.invalidate()`（屏级）。

---

## 5. 什么时候不该用 customEditor

| 需求 | 用哪个 |
| --- | --- |
| 这个字段在我这个实体里要特殊画 | `setCustomRenderer` / `setCustomEditor` |
| 整块子表 / 区域要自造 | `group.setCustomRenderer` |
| 整页要自造 | `UiEntityViewFn` + `resolveEntityView` |
| 全项目所有实体的某个控件都要换 | **皮肤**：`extends` 皮肤工厂，覆盖那一个方法 |

前四条是业务层，第五条是皮肤层。判断标准：**只影响你这一个屏 → customXxx；影响所有屏 → 皮肤。**

---

## 6. 现状（各层能用了吗）

| 层 | Vue（vui） | React（rui） |
| --- | --- | --- |
| 字段级（表单） | ✅ 已通 | 部分：`RuiBuilder.editFor` / `displayFor` 已实装，整屏拼屏（`buildIndexView` / `buildEditView`）未实装 |
| 字段级（表格单元格） | ✅ 已通 | ✗ 待实装（`buildIndexView`） |
| 组级 | ✅ 已通 | ✅ 已通（`buildFieldGroup` / `buildSubGroup`，含插片与 `customRenderer` 换中间） |
| 屏级（详情 / 编辑） | ✅ 已通（`hostedView` / `hostedEntityView`） | ✅ 已通（`buildDetailsView` / `buildEditView`：primary / secondary / tails 分区） |
| 屏级（列表） | ✅ 已通 | ✗ 待实装（`buildIndexView`） |
| 页级插槽 | ✅ 已通 | ✅ 已通（`toolbar` / `header` / `content`，契约在 core） |

React 侧的补齐清单见 `packages/rui/docs/rui_plan.md` 与仓库待办；本文件描述的是 **core 契约**，两边实现齐了写法一致。
