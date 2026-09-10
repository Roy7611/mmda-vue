# NumberInput 设计

chrome 数值输入，走 `factory.numberInput`。[EJ2 Vue NumericTextBox](https://ej2.syncfusion.com/vue/documentation/numerictextbox/vue3-getting-started)。format 对齐 [EJ2 formats](https://ej2.syncfusion.com/vue/documentation/numerictextbox/formats)。

程序员用法：[number_input_usage.md](./number_input_usage.md)。chrome 参数约定：[factory.md](./factory.md)。普通文本仍是 `factory.textInput`。

表单字段走 `fieldFactory.numberInput` / `percentInput` / `positiveNumberInput` / `negativenumberInput`：翻译 `MetaUiField` 后调本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/number_input.ts` | `UiNumberInputProps`；`numberInputStepOf` / `numberInputFormatOf` / `numberInputPropsFromField` |
| 皮肤 `factory/number_input.ts` | SF `NumericTextBoxComponent`；Prime `InputNumber`；Naive `NInputNumber` |
| 字段 `fieldFactory.numberInput` | 译字段，调 `createNumberInput`。percent / ± 预置 |

vui 名是 **`numberInput`**。不要 `NumericTextBox` / `InputNumber` / `NInputNumber` 当 vui 名。

`format` 用 **EJ2 语法**（`n` / `n2` / `p` / `c` / 自定义如 `###.##`）。不要把字段展示 `formatter`（单位文本）当成 format。Prime 只映射标准 `n*`/`p*`/`c*`；Naive 只认 `p*`。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | `number \| null`。也认 `modelValue`。空输入是 `null`，不要当成 `0` |
| `min` / `max` | 范围 |
| `step` | 步进。调用方给了才用；否则 number → `1`，percent → `0.01`。不要按 `decimals` 推 `10^-decimals` |
| `decimals` | 小数位。对应 EJ2 `decimals`。也认误传的 `maxFractionDigits`（MES 兼容） |
| `format` | EJ2 展示格式。缺省：`kind: 'percent'` → `p`，否则 `n` |
| `kind` | `number`（默认）或 `percent` |
| `placeholder` / `disabled` | 具名 |
| `showSpinButton` | 缺省 `true`。对应 EJ2 `showSpinButton` |
| `suffix` | 单位纯文本（KG、%）。不是 `htmlAttributes` |
| `htmlAttributes` | 透传。字段翻译会写 `name` / `id` |
| `onChange` | `(value: number \| null)`。也认 `onUpdate:modelValue` / `onUpdate` |

percent 的 min/max 缺省：SF **0–1**（分数）；Prime / Naive **0–100**。本轮不统一跨皮肤存储模型。

钩子 class：`mmda-numberinput`；percent 时 `mmda-numberinput--percent`；有 `suffix` 时 `mmda-numeric-with-unit`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `NumericTextBoxComponent` | `InputNumber` | `NInputNumber` |
| `value` | `value` | `modelValue` | `value` |
| `decimals` | `decimals` | `minFractionDigits` / `maxFractionDigits` | `precision` |
| `format` | 原样 | `n*` → decimal；`p*` → `%`；`c*` → `mode: 'currency'`；自定义忽略 | 只认 `p*` |
| `showSpinButton` | `showSpinButton` | `showButtons` | `showButton` |
| `suffix` | `appendTemplate` + `mmda-numeric-suffix` | `suffix`（与 `p*` 的 `%` 并存时以 props.suffix 为准） | 忽略 |
| `disabled` | `enabled: !disabled` | `disabled` | `disabled` |

## 源码

- vui [`number_input.ts`](../src/ui/factory/number_input.ts)
- Syncfusion [`factory/number_input.ts`](../../vui-syncfusion/src/factory/number_input.ts)
- Prime [`factory/number_input.ts`](../../vui-primevue/src/factory/number_input.ts)
- Naive [`factory/number_input.ts`](../../vui-agnaive/src/factory/number_input.ts)
