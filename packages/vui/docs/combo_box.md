# ComboBox 设计

chrome 可编下拉，走 `factory.comboBox`（对齐 EJ2 ComboBox）。默认可自填；提交选项 **value**，自填则为输入字符串。

程序员用法：[combo_box_usage.md](./combo_box_usage.md)。封闭列表见 [drop_down_list.md](./drop_down_list.md)。

表单字段走 `fldFactory.comboBox(field, context)`。Pascal 别名 `Combobox`。

## 常用几种

| 形态 | 输入框 | 取值 | EJ2 | Prime | Naive | vui |
|---|---|---|---|---|---|---|
| 封闭列表 | 不可键入 | 选项 value | DropDownList | Select | NSelect | `factory.dropDownList` |
| 可编下拉 | 可键入；默认可自填 | 选项 value（自填则字符串） | ComboBox | AutoComplete + `dropdown: true` | NAutoComplete / NSelect | `factory.comboBox` |
| 联想文本 | 可键入 | **输入字符串** | AutoComplete | AutoComplete | NAutoComplete | `factory.autoComplete` |
| 多选 | — | value[] | MultiSelect | MultiSelect | NSelect multiple | `fldFactory.multiSelect` |

表里 Prime 的 `dropdown: true` 是厂商属性，不是 vui 方法名。hasOne 挑整份实体走 `searchBox`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/combo_box.ts` | `UiComboBoxProps` 继承下拉契约，加 `allowCustom` |
| 皮肤 `factory/combo_box.ts` | SF `ComboBoxComponent`；Prime AutoComplete + dropdown；Naive 可自填 `NAutoComplete`，否则 `NSelect` |
| 字段 `fldFactory.comboBox` | 译字段，调 `createComboBox` |

选项、分组、`icon`、`suggest` 与 dropDownList 相同。

## 属性

dropDownList 那些，外加：

| 属性 | 说明 |
|---|---|
| `allowCustom` | 允许不在 options 里的值。缺省 true |

钩子 class：`mmda-combobox`；默认可自填时 `mmda-combobox--custom`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `ComboBoxComponent` | AutoComplete `dropdown: true` | `allowCustom !== false` → `NAutoComplete`；否则 `NSelect` + `filterable` |
| `allowCustom: false` | `allowCustom: false` | `forceSelection: true` | 改用 `NSelect` |

## 源码

- vui [`combo_box.ts`](../src/ui/factory/combo_box.ts)
- Syncfusion [`factory/combo_box.ts`](../../vui-syncfusion/src/factory/combo_box.ts)
- Prime [`factory/combo_box.ts`](../../vui-primevue/src/factory/combo_box.ts)
- Naive [`factory/combo_box.ts`](../../vui-agnaive/src/factory/combo_box.ts)
