# OTP Input 设计

chrome 一次性口令走 `factory.oneTimePasswordInput`。[EJ2 Vue OTP Input](https://ej2.syncfusion.com/vue/documentation/otp-input/vue-3-getting-started)。

程序员用法：[one_time_password_input_usage.md](./one_time_password_input_usage.md)。chrome 参数约定：[factory.md](./factory.md)。普通文本仍是 `factory.textInput`。

## 分层

- vui `ui/factory/one_time_password_input.ts`：`UiOneTimePasswordInputProps`：`length` / `type` / `separator` / `value`
- 皮肤 `factory/oneTimePasswordInput.ts`：SF `OtpInputComponent`；Prime `InputOtp`；Naive 分段 `NInput`
- 字段 `fldFactory.oneTimePasswordInput`：译字段后调 chrome

vui **type / length / separator 用 EJ2 词**。不要把 Prime 的 `mask` / `integerOnly` 写进 vui。Prime 皮肤在内部转换。

表单已有 `labelFor`，不要 EJ2 `stylingMode` / `floatLabelType`。

## 属性

- `length`：格数。默认 4。也认字段 `maxLength`（1–12）
- `type`：`number`（默认）/ `text` / `password`
- `value`：string。也认 `modelValue`
- `separator`：格间分隔符。对应 EJ2 `separator`
- `placeholder` / `disabled`：具名
- `onChange`：`(value: string)`。也认 `onUpdate:modelValue` / `onUpdate`

钩子 class：`mmda-otpinput`。

## 皮肤映射

- 控件：SF `OtpInputComponent`；Prime `InputOtp`；Naive 一排 `NInput`（每格 1 字）再拼接
- `length`：三家格数
- `type: number`：SF `type: 'number'`；Prime `integerOnly`；Naive `inputmode=numeric` 且只收数字
- `type: password`：SF `type: 'password'`；Prime `mask`；Naive 格 `type=password`
- `type: text`：明文
- `separator`：SF 原样；Prime 有值时走 default slot；Naive 格间画
- `value`：SF `value` + `valueChanged`；Prime `modelValue`；Naive 拼接

## 源码

- vui：[`one_time_password_input.ts`](../src/ui/factory/one_time_password_input.ts)
- 皮肤：各包 `factory/oneTimePasswordInput.ts`
