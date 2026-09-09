# core `src/ui/`（契约，无实现）

core **不是没有 UI**，是 **没有 UI 实现**。程序员对着这些接口写 Logic：方法名和参数类型都从 `@mmda/core` 来。

## 三层

```text
Logic 只认 @mmda/core
  UiFactory<TNode> / UiFieldFactory<TNode> / UiBuilder<TNode>
  UiLayout<TNode> / UiOverlay<TNode>
  + UiButtonProps / UiListProps / UiTableProps / UiGridProps / UiTreeProps / UiToastProps …

框架包（vui / 以后 rui）：把 TNode 钉成框架节点
  形态按是否真有实现来定（见下）
  type VueUiFactory = UiFactory<VNode>
  abstract class VueUiBuilder implements UiBuilder<VNode>

厂商皮肤
  SyncfusionUiFactory / SyncfusionUiBuilder / SyncfusionOverlay
  PrimeUiFactory / PrimeUiBuilder / PrimeOverlay
  AgNaiveUiFactory / AgNaiveUiBuilder / AgNaiveOverlay
```

| 层 | 包 | 命名 |
|---|---|---|
| 契约 | `@mmda/core` | `Ui*`（泛型 `TNode`） |
| 框架 | `@mmda/vui` | `VueUi*`；无扩展则 `type` 别名 |
| 厂商 | `@mmda/vui-syncfusion` 等 | `Syncfusion*` / `Prime*` / `AgNaive*` |

不要在 vui 再声明一份与 core 同名的 `interface UiFactory`。不要把 vui 实现 alias 成 `UiBuilder`。

## 主接口

| 文件 | 接口 |
|---|---|
| `builder.ts` | `UiBuilder<TNode>`：`toast` / `confirm` / `dialog` / `buildView` + 拼屏方法 |
| `factory.ts` | `UiFactory<TNode>`：chrome（`button` / `table` / `tree` / `card` …） |
| `tree.ts` | `UiTreeProps` / `UiTreeViewProps` / `UiTreeListViewProps` |
| `field_factory.ts` | `UiFieldFactory<TNode>`：字段 renderer（含 `quantityUnit`） |
| `layout.ts` | `UiLayout<TNode>` / `AbstractUiLayout<TNode>`：字段栅格（不是 `AppLayout` 脚手架）。设计 [layout.md](./ui/layout.md)，用法 [vui layout_usage.md](../../vui/docs/layout_usage.md) |
| `overlay.ts` | `UiOverlay<TNode>`：弹层宿主；**没有** `factory.dialog` |
| `context.ts` | `UiContext`（`searchRelative` / `select` …） |
| `button.ts` 等 | chrome / 列表 / 弹层的 `Ui*Props`（无 Vue） |
| `code.ts` / `file.ts` / `tree_select.ts` 等 | 条码、文件、树下拉、queryBuilder、stepper、timeline… |

chrome 控件方法都在 `UiFactory`。Gantt / Chart / Pivot / Scheduler / Diagram / Kanban / Markdown / Image editor / Ribbon / AI Assistant 等 plugin **不**进 `UiFactory`（契约留 vui/vuix）。选记录走 `context.select`。

## Props 进 core 的规则

- `VNode` / slots → `TNode` / `() => TNode[]`
- **不要** `import from 'vue'`（无 `Ref`、`LinkHTMLAttributes`、`VNode`）
- `UiListProps.loading`：`UiBoxed`（鸭子类型，兼容 Vue `ref`）
- `fieldCellRenderers[fieldName]`（仅 `UiTableProps` / `UiGridProps`）返回 `TNode`；签名 `(field, row)`
- `UiProps`：具名只有 `class` / `style`；`[key: string]: unknown` 袋键可有 `htmlAttributes`（`htmlAttributesOf` 透传），并暂供 `modelValue` 双轨；收掉双轨后再收紧，不要 `any` 袋。
- 列筛加载器、列布局、`onIndexTableHostReady` 是会话标准，由 Builder 注入皮肤 extras，**不进**程序员 `UiTableProps`
- plugin Props（Gantt / Scheduler / …）留 vui/vuix

## 怎么生产控件

```text
程序员    MetaUi（列/字段/校验） + UiTableProps（交互）
                ↓
皮肤      factory.table(rows, metaUi, props)
                ↓
          defineVendorProps(metaUi, props)   // 只在皮肤，core 不出现厂商类型
                ↓
          h(VendorTable, vendorProps)
```

- **MetaUi**：结构（列出哪些列、类型、引用、filterTypes）。程序员因此少写列数组。
- **Ui\*Props**：标准化交互（开关、事件、选择、loading）。事件用 MMDA 名（`onSort` / `onPage`），不要厂商 `actionComplete`。所有 `Ui*Props` **extends `UiProps`**（`class` / `style`；袋键可有 `htmlAttributes`，皮肤各自透传）。
- **框架脏活**：Builder 接查询/分页/i18n/列筛默认/`tableSettings`；皮肤把 MetaUi 列映射成厂商列。
- **皮肤**：显式映射，不要 `...props` 泼到厂商组件上。`defineVendorProps` 只在皮肤。
- 三份输入分清：数据 `rows` / 结构 `metaUi` / 交互 `props`。皮肤组件不持有 `UiContext`。

表格只是特例：`factory.table(rows, metaUi, props)`。输入、下拉同样：`fldFactory.*` / `factory.textInput`。

## vui 的 VueUi* 形态（按实现选型）

| 情况 | 用 |
|---|---|
| 只钉 `TNode`→`VNode`，无新成员、无共用代码 | `type VueUiX = UiX<VNode>` |
| 比 core 多方法，或收窄 Vue 专用成员 | `interface VueUiX extends UiX<VNode>` |
| 有模板方法 / mixin / 共用实现 | `abstract class VueUiX implements UiX<VNode>` |

现状约定：`VueUiBuilder` = abstract class；`VueUiFactory` / `VueUiFieldFactory` / `VueUiLayout` / `VueUiOverlay` 无额外成员则 = type 别名。

vui 侧可 `export type { UiButtonProps, … } from '@mmda/core'`，皮肤少改 import。

## 程序员怎么拿

```ts
const ui = context.uiBuilder
const factory = ui.factory
const fld = ui.fldFactory

factory.button({ buttonType: 'outlined', label: '保存' })  // UiButtonProps
fld.quantityUnit?.(field, context)                        // 显示 + suffix
await ui.confirm(context, { title: '删除', message: '确定？' })
```

细则：[ui_builder_usage.md](./ui/ui_builder_usage.md)。命名：[docs/naming.md](../../../docs/naming.md)。继承图：[ARCHITECTURE.md](../../../ARCHITECTURE.md)。
