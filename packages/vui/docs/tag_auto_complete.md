# tagAutoComplete 设计

多枚 tag 联想输入，走 `factory.tagAutoComplete`。建议源与 [`autoComplete`](./autocomplete.md) 相同（`options` / `suggest` / ref），**值是 join 字符串**（缺省逗号）。`allowCustom` 恒 true。

**不要**把 `factory.autoComplete` 改成 multiple。

程序员用法：[tag_auto_complete_usage.md](./tag_auto_complete_usage.md)。

封闭选项勾选再 join（不能打字）走 [`multiTextSelect`](./multi_select.md)。展示芯片走 `factory.chips` / `fieldFactory.tags`。

## 皮肤映射

| 皮肤 | 实现 |
|---|---|
| Prime | AutoComplete `multiple` |
| Naive | `NSelect` `tag` + `filterable` |
| Syncfusion | EJ2 AutoComplete 不能多值；`MultiSelectComponent` `mode: Box` + `allowCustomValue`（**不是** `factory.multiSelect`） |

钩子：`mmda-tag-autocomplete`。
