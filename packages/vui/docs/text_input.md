# TextInput

chrome 单行文本走 `factory.textInput`。[EJ2 Vue TextBox](https://ej2.syncfusion.com/vue/documentation/textbox/vue3-getting-started) / [API](https://ej2.syncfusion.com/vue/documentation/api/textbox/overview) 就是这个控件。vui 名是 **`textInput`**，跟 `fieldFactory.textInput` 同名。不要 `input` / `textBox` / `InputText` / `NInput` 当 vui 名。

程序员用法：[text_input_usage.md](./text_input_usage.md)。chrome 参数约定：[factory.md](./factory.md)。多行仍是 `factory.textArea`。

表单字段走 `fieldFactory.textInput`：翻译 `MetaUiField` 后调本控件。`fieldFactory.password` 仍单独实现。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/text_input.ts` | `UiTextInputProps`；`textInputValueOf` / `textInputTypeOf` / `textInputPropsFromField` |
| 皮肤 `factory/text_input.ts` | SF `TextBoxComponent`；Prime `InputText`；Naive `NInput` |
| 字段 `fieldFactory.textInput` | 译字段，调 `createTextInput` |

表单标签走 `labelFor` / `formField`。框内提示走 `placeholder`。不要 vui `label`。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | string。也认 `modelValue`。空是 `''` |
| `placeholder` | 具名。**不是** `htmlAttributes` |
| `disabled` / `readonly` | HTML / EJ2 TextBox 原词。不要 Rating 那套 `readOnly` |
| `type` | `Text` / `Password` / `Email` / `Number` / `Search` / `Tel` / `Url`，缺省 `Text`。入口仍认小写 HTML |
| `maxLength` | 对应 EJ2 `maxLength`。入口仍认 `maxlength` |
| `showClearButton` | 缺省 false |
| `autocomplete` | 如 `new-password` |
| `width` | 可选 |
| `htmlAttributes` | `name` / `id` / `aria-*`。不要塞 placeholder / disabled / readonly / type |
| `onChange` | `(value: string)`。也认 `onUpdate:modelValue` / `onUpdate` |
| `onFocus` / `onBlur` | 无参 |

钩子 class：`mmda-textinput`；非 Text 时 `--password` 等；clear 时 `--clear`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `TextBoxComponent` | `InputText` | `NInput` |
| `value` | `value` | `modelValue` | `value` |
| `placeholder` | `placeholder` | `placeholder` | `placeholder` |
| `type` | EJ2 `type` | HTML 小写 `type` | 仅 Password 时 `password` |
| `disabled` | `enabled: !disabled` | `disabled` | `disabled` |
| `readonly` | `readonly` | `readonly` | `readonly` |
| `maxLength` | `maxLength` | `maxlength` | `maxlength` |
| `showClearButton` | 原样 | 忽略（只 class） | `clearable` |
| `onChange` | `input` / `change` | `update:modelValue` | `update:value` |
| `onFocus` / `onBlur` | `focus` / `blur` | `onFocus` / `onBlur` | `onFocus` / `onBlur` |

## 源码

- vui：[`text_input.ts`](../src/ui/factory/text_input.ts)
- 皮肤：各包 `factory/text_input.ts`
