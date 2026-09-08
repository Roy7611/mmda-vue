# MultiSelect 设计

chrome 封闭多选下拉，走 `factory.multiSelect`。对齐 [EJ2 Vue3 MultiSelect](https://ej2.syncfusion.com/vue/documentation/multi-select/vue3-getting-started)。**不加 `allowCustom`**；能打字加项走 [`tagAutoComplete`](./tag_auto_complete.md)。

程序员用法：[multi_select_usage.md](./multi_select_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/multi_select.ts` | `bindMode`、`multiSelectItemsOf` / `multiSelectBoundOf` / `applyMultiSelectSelection` |
| 皮肤 `factory/multi_select.ts` | 厂商 CheckBox 多选；内部用 key[]，写出前走 vui 翻译 |
| 字段 | `multiSelect` ≡ `multiItemSelect`；另有 `multiValueSelect` / `multiTextSelect` / `multiBitSelect` |

## bindMode

| `bindMode` | 字段值 | 快捷 editor |
|---|---|---|
| `item_array`（缺省） | 子表实体数组，`syncSelection` 管 `entityState` | `multiSelect` / `multiItemSelect` |
| `value_array` | 某一字段组成的数组 | `multiValueSelect` |
| `join_text` | 字段值 join 字符串（不能打字加项） | `multiTextSelect` |
| `or_bits` | int 位掩码 | `multiBitSelect` |

皮肤只维护勾选 item[]。`item_array` 禁止 `row.xxx = selected`。

## 不要拿它当

| 场景 | 用 |
|---|---|
| 单选封闭下拉 | `dropDownList` |
| 可输入 tags | `tagAutoComplete` |
| 横排值数组 | `checkBoxList` |
| 横排位掩码 | `bitCheckBoxList` |

## 属性

`options`、`valueField` / `labelField`、`separator`（仅 join_text，缺省 `,`）、`display`（`chips` 缺省 / `text`）、`allowFiltering`、`suggest`、`onChange`。

钩子：`mmda-multi-select`、`mmda-multi-select--{bindMode}`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 封闭多选 | `MultiSelectComponent` `mode: CheckBox` | `MultiSelect` `optionValue: value` | `NSelect` `multiple` |
| 选中 chips | 默认 | `display: chip` | 默认 tag |

SF 不暴露 `mode` 到 vui。
