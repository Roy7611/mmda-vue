# CheckBoxList 设计

横排勾选，chrome **自己拼** `factory.checkBox`，换行 + 全选（半选 indeterminate）。不要 `factory.checkBoxGroup`。

| chrome | 绑定 | editor |
|---|---|---|
| `factory.checkBoxList` | `value_array` | `CheckBoxList` / `checkBoxList` |
| `factory.bitCheckBoxList` | `or_bits` | `BitCheckBoxList` / `bitCheckBoxList` |

值翻译与 MultiSelect 同一套 `multiSelectBoundOf`。`or_bits` 跳过选项 `value === 0`。

下拉位掩码仍是 [`multiBitSelect`](./multi_select.md)，不是本控件。

程序员用法：[check_box_list_usage.md](./check_box_list_usage.md)。

钩子：`mmda-checkbox-list`、`mmda-checkbox-list--bits`、`mmda-checkbox-list__all`、`mmda-checkbox-list__items`。
