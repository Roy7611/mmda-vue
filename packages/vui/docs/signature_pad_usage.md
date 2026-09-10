# SignaturePad：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.signaturePad`。设计见 [signature_pad.md](./signature_pad.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/signature/vue-3-getting-started)。

值是 **PNG data URL**。vui 名是 **`signaturePad`**。不要写 `ejs-signature` / `SignatureComponent` / npm `signature_pad` 进 vui。不要用 `imageEditor` 当签名。

```ts
factory.signaturePad({
  value: model.sign,
  height: 160,
  onChange: (value) => {
    model.sign = value
  },
  onReady: (pad) => {
    // pad.clear() / pad.undo() / pad.getDataUrl()
  },
})
```

只读：

```ts
factory.signaturePad({
  value: model.sign,
  readOnly: true,
})
```

`modelValue` 也认（与 `value` 同语义）。笔画结束再 `onChange`，不要每点都抛。

## 表单字段

```ts
fieldFactory.signaturePad(field, context)
fieldFactory.signaturePad(field, context, { height: 180, strokeColor: '#111' })
```

内部 `signaturePadPropsFromField`：
- `value` ← `getFieldValue`（空 → `''`）
- `readOnly` ← `isFieldReadonly`
- `onChange` → `setFieldValue`

不要在字段层再 `h(SignatureComponent)` / 直接 `new SignaturePad`。

## 不要

- 在 Builder 上再开 `buildSignaturePad`（这是 chrome，不是插件）
- 把 Blob / EJ2 `SignatureFileType` 当字段值
- 把 `factory.imageEditor` 当成签名面板
- 指望 Prime / Naive 实现 `save` / `draw` / jpeg / svg / `velocity` / `persist` / `rtl` / `onBeforeSave`
