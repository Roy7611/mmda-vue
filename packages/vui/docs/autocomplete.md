# AutoComplete 设计

chrome 联想文本框，走 `factory.autoComplete`。提交的是**输入字符串**，不是实体。多枚可输入 tag 走 [`tagAutoComplete`](./tag_auto_complete.md)，不要把本控件改成 multiple。

程序员用法：[autocomplete_usage.md](./autocomplete_usage.md)。chrome 参数：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| `@mmda/core` `ui/autocomplete.ts` | `UiAutoCompleteProps`：字符串值、`options` / `suggest` / `reference` |
| vui `ui/factory/autocomplete.ts` | 皮肤辅助：modifier / 建议归一 / 字段翻译 |
| 皮肤 `factory/autocomplete.ts` | SF `AutoCompleteComponent`；Prime `AutoComplete`；Naive `NAutoComplete` |
| field factory `autoComplete` | 从 `MetaUiField` 翻译 props；enum / hasOne 改道 |

## 不要拿它当

| 场景 | 用 |
|---|---|
| enum 固定成员 | `dropDownList` |
| hasOne 挑整份实体 | `searchBox` |

REF 小表（如 `CurrencyUnit(unit, symbol)`）可以当建议源：`refOptions`，显示和选中填入都是 `labelOf`。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 输入字符串。与 `textInput` 同名 |
| `options` | 自定义 `string[]` 或 `{ value, label }[]` |
| `suggest` | `(query) => Promise<...>` 远程建议 |
| `reference` | 仅 **ref**。`isEnum` / `hasOne` 不要传 |
| `placeholder` / `disabled` / `size` / `class` | 具名，不进 `htmlAttributes` |
| `htmlAttributes` | 原生余量，默认透传 |
| `minLength` | 打满几个字才联想，默认 1 |
| `debounceDelay` | 远程防抖毫秒，默认 300 |
| `highlight` | 建议里高亮匹配字；厂商没有则只挂 `mmda-autocomplete--highlight` |
| `suggestionCount` | 弹出最多几条，默认 20 |

`allowCustom` 恒为 true，不另开开关。三源同时有时：`suggest` 优先，否则 `options`，再否则 `reference.refOptions`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 值 | `value` | `modelValue` | `value` |
| 本地列表 | `dataSource` | `suggestions` + `completeMethod` | `options` |
| `suggest` | `filtering` + `updateData` | `completeMethod` | 输入时更新 `options` |
| `debounceDelay` | `debounceDelay` | `delay` | 皮肤内防抖 |
| `htmlAttributes` | 组件 `htmlAttributes` | 合并到 vnode / `inputProps` | 合并到 vnode |

## 源码

- 契约：[`@mmda/core` `ui/autocomplete.ts`](../../core/src/ui/autocomplete.ts)
- vui 辅助：[`autocomplete.ts`](../src/ui/factory/autocomplete.ts)
- SF：[`vui-syncfusion/src/factory/autocomplete.ts`](../../vui-syncfusion/src/factory/autocomplete.ts)
- Prime：[`vui-primevue/src/factory/autocomplete.ts`](../../vui-primevue/src/factory/autocomplete.ts)
- Naive：[`vui-agnaive/src/factory/autocomplete.ts`](../../vui-agnaive/src/factory/autocomplete.ts)
