# TextArea

chrome 多行文本走 `factory.textArea`。[EJ2 Vue TextArea](https://ej2.syncfusion.com/vue/documentation/textarea/vue3-getting-started) / [API](https://ej2.syncfusion.com/vue/documentation/api/textarea/) 就是这个控件。

程序员用法：[text_area_usage.md](./text_area_usage.md)。chrome 参数约定：[factory.md](./factory.md)。普通单行仍是 `factory.textInput`。不要 `factory.textarea`。

表单字段走 `fieldFactory.textArea`：翻译 `MetaUiField` 后调本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/text_area.ts` | `UiTextAreaProps`；`textAreaValueOf` / `textAreaResizeModeOf` / `textAreaPropsFromField` |
| 皮肤 `factory/text_area.ts` | SF `TextAreaComponent`；Prime `Textarea`；Naive `NInput` `type: 'textarea'` |
| 字段 `fieldFactory.textArea` | 译字段，调 `createTextArea` |

vui 名是 **`textArea`**。不要 `textarea` / `Textarea` / `NInput` 当 vui 名。

表单已有 `labelFor`，不要 EJ2 `floatLabelType`。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | string。也认 `modelValue`。空是 `''` |
| `placeholder` / `disabled` | 具名 |
| `readOnly` | EJ2 拼写。不要 `readonly` 当 vui 主名 |
| `rows` | 缺省 3 |
| `cols` | 可选。Naive 忽略 |
| `maxLength` | 对应 EJ2 `maxLength` |
| `resizeMode` | `None` / `Both` / `Horizontal` / `Vertical`，缺省 Vertical |
| `autoResize` | 入口旧词，不是 vui 主名。`true` = 随内容长高。SF 无 auto-grow |
| `onChange` | `(value: string)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-textarea`；`--none` / `--both` / `--horizontal` / `--vertical`；旧词长高时 `--autoresize`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `TextAreaComponent` | `Textarea` | `NInput` `type: 'textarea'` |
| `value` | `value` | `modelValue` | `value` |
| `disabled` | `enabled: !disabled` | `disabled` | `disabled` |
| `readOnly` | `readonly` | `readonly` | `readonly` |
| `resizeMode` | 原样 | style `resize` | style `resize` |
| `autoResize` | 忽略长高 | `autoResize` | `autosize` |
| `onChange` | `input` / `change` | `update:modelValue` | `update:value` |

## 源码

- vui：[`text_area.ts`](../src/ui/factory/text_area.ts)
- 皮肤：各包 `factory/text_area.ts`
