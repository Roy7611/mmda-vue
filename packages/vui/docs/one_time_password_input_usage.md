# OTP Input：程序员怎么写

从当前皮肤的 `builder.factory.oneTimePasswordInput` 取节点。设计见 [one_time_password_input.md](./one_time_password_input.md)。EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/otp-input/vue-3-getting-started)。

```ts
factory.oneTimePasswordInput({
  length: 6,
  type: 'number',
  onChange: (value) => {},
})
```

自定义：

```ts
factory.oneTimePasswordInput({
  length: 4,
  type: 'password',
  separator: '-',
  value: model.code,
  onChange: (value) => (model.code = value),
})
```

## 表单字段

```ts
fldFactory.oneTimePasswordInput(field, context)
fldFactory.oneTimePasswordInput(field, context, { length: 6, type: 'number' })
```

内部 `oneTimePasswordPropsFromField`。未传 `length` 时，字段 `maxLength` 在 1–12 则用它，否则 4。

不要在字段层再 `control(OtpInputComponent)` / `InputOtp`。

## 不要

- `stylingMode` / 厂商 `cssClass` 写进 vui
- 在 Builder 上再开 `buildOneTimePasswordInput`
- 用 OTP 控件代替登录/MFA 业务流程
