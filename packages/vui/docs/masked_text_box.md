# MaskedTextBox 设计

chrome 按掩码录入，走 `factory.maskedTextBox`。[EJ2 Vue MaskedTextBox](https://ej2.syncfusion.com/vue/documentation/maskedtextbox/vue3-getting-started)。

程序员用法：[masked_text_box_usage.md](./masked_text_box_usage.md)。chrome 参数约定：[factory.md](./factory.md)。普通无掩码文本仍是 `factory.textInput`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/masked_text_box.ts` | `UiMaskedTextBoxProps`：`mask` / `value` / `promptChar`；`primeMaskOf` |
| 皮肤 `factory/masked_text_box.ts` | SF `MaskedTextBoxComponent`；Prime `InputMask`；Naive `NInput` 降级 |
| 字段 `fldFactory.maskedTextBox` | 译字段后调 chrome。`mobileInput` / `zipCodeInput` 预置 mask |

vui **mask 用 EJ2 元素**（`0` 数字、`L` 字母、`A` 字母数字）。不要把 Prime 的 `9` 写进 vui。Prime 皮肤用 `primeMaskOf` 转换。

表单已有 `labelFor`，不要 EJ2 `floatLabelType`。

## 属性

| 属性 | 说明 |
|---|---|
| `mask` | 必填。EJ2 掩码。预置 `MOBILE_MASK` / `ZIP_MASK` |
| `value` | string。也认 `modelValue` |
| `placeholder` / `disabled` | 具名 |
| `promptChar` | 未填位提示符。对应 EJ2 `promptChar` |
| `onChange` | `(value: string)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-maskedtextbox`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `MaskedTextBoxComponent` | `InputMask` | `NInput`（无实时 mask） |
| `mask` | 原样 | `primeMaskOf` | 忽略；可作 placeholder |
| `promptChar` | `promptChar` | 不映射 | 不映射 |
| `value` | `value` | `modelValue` | `value` |

## 源码

- vui：[`masked_text_box.ts`](../src/ui/factory/masked_text_box.ts)
- 皮肤：各包 `factory/masked_text_box.ts`
