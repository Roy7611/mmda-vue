# SelectButtonGroup 设计

分段选择（EJ2 壳里的 radio / checkbox 皮）。**不是** `buttonGroup` 的子节点，自己带壳。

程序员用法：[select_button_group_usage.md](./select_button_group_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `UiSelectButtonGroupProps` | `options` / `selectionMode` / `optionLabel` / `optionValue` |
| 皮肤 | SF：`createButtonGroup` + `input` + `label.e-btn`；Prime `SelectButton`；Naive `NButtonGroup` + 选中态 |

`selectionMode` 与表格同一术语：默认 `single`（radio）；`multiple`（checkbox 皮，value 为数组）。不要写厂商布尔 `multiple`。

没有 `factory.selectButton`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `single` | `input type="radio"` + `label.e-btn` | `SelectButton` | 按钮组单选 |
| `multiple` | `input type="checkbox"` + `label.e-btn` | `multiple: true` | 按钮组多选数组 |

钩子 class：`mmda-select-button-group`。
