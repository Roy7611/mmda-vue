# 二维码：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.qrCode`。设计见 [qrcode.md](./qrcode.md)。

```ts
builder.factory.qrCode({ value: url })

builder.factory.qrCode({
  value: url,
  displayText: '工单 WO-123',
})

builder.factory.qrCode({
  value: serial,
  format: 'dataMatrix',
})
```

不要 `format: 'qr'`，不要 `ui.buildQrcode`。

原生 HTML 用 `htmlAttributes`。Syncfusion 进组件的 `htmlAttributes` 对象。

```ts
builder.factory.qrCode({
  value: url,
  htmlAttributes: { title: '工单二维码' },
})
```

## 不要

- 把一维码写进 `factory.qrCode`
- Data Matrix 画不了时改成 QR
