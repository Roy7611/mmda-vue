# TreeSelect 设计

chrome 树下拉，走 `factory.treeSelect`。契约 `UiTreeSelectProps` 在 `@mmda/core`。EJ2 控件名 DropDownTree 只作别名：`factory.dropDownTree === factory.treeSelect`。

不是 `factory.tree`（导航树），也不是扁平 `factory.dropDownList`。程序员用法：[tree_select_usage.md](./tree_select_usage.md)。

表单字段走 `fieldFactory.treeSelect(field, context)`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/tree_select.ts` | `UiTreeSelectProps`、`treeSelectPropsFromField` |
| 皮肤 `factory/tree_select.ts` | SF `DropDownTreeComponent`；Prime `TreeSelect`；Naive `NTreeSelect` |
| 字段 `fieldFactory.treeSelect` | 译字段，调 `createTreeSelect` |

## 字段怎么认出树

`MetaUiFieldRef.refOptionsShape === TREE`（枚举值 2）。父字段是 `groupBy`，与 `refFlds[2]` 同一位置（如 `parentCatID`）。

- **ref** 小表：用缓存 `refOptions`，按父字段收成嵌套，`loadMode: 'full'`
- **hasOne** 大树：不要灌 `refOptions`；`loadMode: 'lazy'`。根/子由**该树实体的 Logic** 提供 `getRoots` / `getChildren`（程序员写在分类 Logic 上，不是 `EntityLogic` 默认方法）

## 属性

| 属性 | 说明 |
|---|---|
| `data` / `fields` | 节点；`fields` 复用 `UiTreeFields`（`id` / `label` / `children` / `parentId`） |
| `value` | single 标量；checkbox 为 id 数组。也认 `modelValue` |
| `selectionMode` | `'single'` \| `'checkbox'` |
| `allowFiltering` | 厂商弹层 filter bar。缺省 true |
| `showClear` | 缺省 true |
| `selectedDisplay` | `'text'` \| `'chips'` \| `'delimiter'` \| `'custom'` |
| `delimiter` | 分隔符模式 |
| `popupHeight` / `popupWidth` | 弹层尺寸 |
| `showSelectAll` / `selectAllLabel` | 仅 checkbox |
| `header` / `item` / `selected` | 传入才替换；搜索不塞进默认 header |
| `loadMode` | `'full'` \| `'lazy'`。lazy 时 `loadRoots` / `onExpand` |
| `treeShape` / `shapeKey` | 扁平行组装；TREE 字段默认 `shapeKey` = 父字段 |

钩子 class：`mmda-tree-select`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `data` + `fields` | `fields.dataSource` / `value` / `text` / `child` | TreeNode `key`/`label`/`children` | `key`/`label`/`children` |
| `value` | `value`（数组） | `modelValue`（checkbox 内部 key-map） | `value` |
| checkbox | `showCheckBox` + `allowMultiSelection` | `selectionMode: checkbox` | `multiple` + `checkable` |
| `allowFiltering` | `allowFiltering` | `filter` | `filterable` |
| `showClear` | `showClearButton` | `showClear` | `clearable` |
| `loadMode: lazy` | `treeSettings.loadOnDemand` | `leaf` + expand | `onLoad` |

Prime checkbox 的 key-map 只留在 Prime 皮肤，vui 仍是 id 数组。

## 源码

- vui [`tree_select.ts`](../src/ui/factory/tree_select.ts)
- Syncfusion [`factory/tree_select.ts`](../../vui-syncfusion/src/factory/tree_select.ts)
- Prime [`factory/tree_select.ts`](../../vui-primevue/src/factory/tree_select.ts)
- Naive [`factory/tree_select.ts`](../../vui-agnaive/src/factory/tree_select.ts)
