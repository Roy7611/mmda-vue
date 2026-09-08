# DropDownList 设计

chrome 封闭下拉，走 `factory.dropDownList`（对齐 EJ2 DropDownList）。不要叫 `dropdown`（那是 `dropDownButton`、Prime `dropdown: true`、Grid `dropdownedit`）。

程序员用法：[drop_down_list_usage.md](./drop_down_list_usage.md)。chrome 参数：[factory.md](./factory.md)。

表单字段走 `fldFactory.dropDownList(field, context)`：翻译 `MetaUiField` 后调本控件。Pascal 别名 `DropDownList`。`select` 也指向本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/drop_down_list.ts` | `UiDropDownListProps`、`UiSelectOption`（`value` / `label` / `group` / `icon`）、`suggest`、`dropDownListPropsFromField` |
| 皮肤 `factory/drop_down_list.ts` | SF `DropDownListComponent`；Prime `Select`；Naive `NSelect` |
| 字段 `fldFactory.dropDownList` | 译字段，调 `createDropDownList` |

## 不要拿它当

| 场景 | 用 |
|---|---|
| 可键入、可自填 | `factory.comboBox` |
| 提交输入字符串 | `factory.autoComplete` |
| hasOne 挑整份实体 | `searchBox` |
| 多选 | `factory.multiSelect`（[设计](./multi_select.md)） |

enum / ref 用缓存 `refOptions`（`valueOf` / `labelOf`）。hasOne **不要**灌进 `refOptions`；走本控件时用 `suggest` → `searchRelative`。选项少的单选也可 [`radioButtonGroup`](./radio_button_group.md)。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 选项 value。也认 `modelValue` |
| `options` | `string[]` 或 `{ value, label, group?, icon? }[]` |
| `group` | 选项分组标题。字段来自 `MetaUiFieldRef.groupBy`（`GROUP BY`） |
| `icon` | 选项前置图标 class / 名。没有就不画 |
| `allowFiltering` | 本地或远程过滤。缺省 true |
| `suggest` | `(query) => Promise<选项[]>` 远程过滤。有则关本地滤。提交仍是 value |
| `minLength` / `debounceDelay` | 远程门槛，默认 1 / 300 |
| `placeholder` / `disabled` / `class` | 具名 |
| `onChange` | `(value)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-dropdown-list`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `options` | `dataSource` + `fields: { value, text: label }` | `options` + `optionLabel` / `optionValue` | `options` |
| `group` | `fields.groupBy: 'group'` | `optionGroupLabel` / `optionGroupChildren` | `{ type: 'group', children }` |
| `icon` | itemTemplate | option slot | `renderLabel` |
| `suggest` | `filtering` + `updateData` | `onFilter` | `onSearch` |

## 源码

- vui [`drop_down_list.ts`](../src/ui/factory/drop_down_list.ts)
- Syncfusion [`factory/drop_down_list.ts`](../../vui-syncfusion/src/factory/drop_down_list.ts)
- Prime [`factory/drop_down_list.ts`](../../vui-primevue/src/factory/drop_down_list.ts)
- Naive [`factory/drop_down_list.ts`](../../vui-agnaive/src/factory/drop_down_list.ts)
