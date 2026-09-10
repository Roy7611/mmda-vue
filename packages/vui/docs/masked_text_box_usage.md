# MaskedTextBox：程序员怎么写

从当前皮肤的 `builder.factory.maskedTextBox` 取节点。设计见 [masked_text_box.md](./masked_text_box.md)。EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/maskedtextbox/vue3-getting-started)。

mask 用 **EJ2 元素**：`0` 数字，不要写 Prime `9`。

```ts
import { MOBILE_MASK } from '@mmda/vui'

factory.maskedTextBox({
  mask: MOBILE_MASK,
  placeholder: '手机号',
  onChange: (value) => {},
})
```

自定义：

```ts
factory.maskedTextBox({
  mask: '000000',
  promptChar: '#',
  value: model.zip,
  onChange: (value) => (model.zip = value),
})
```

## 表单字段

```ts
fieldFactory.mobileInput(field, context)
fieldFactory.zipCodeInput(field, context)
fieldFactory.maskedTextBox(field, context, { mask: 'LLL-000' })
```

内部 `maskedTextBoxPropsFromField`。手机 / 邮编预置 `MOBILE_MASK` / `ZIP_MASK`。

不要在字段层再 `control(MaskedTextBoxComponent)` / `InputMask`。

## 不要

- `floatLabelType` / `getMaskedValue` / 厂商 `cssClass` 写进 vui
- 在 Builder 上再开 `buildMaskedTextBox`
- 用 mask 代替校验器 `Phone` / `IdCard`（mask 只管录入形态）
