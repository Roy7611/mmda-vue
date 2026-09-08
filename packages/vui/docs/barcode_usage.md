# 条码：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.barcode`。设计见 [barcode.md](./barcode.md)。参数名约定见 [factory.md](./factory.md)。

```ts
builder.factory.barcode({ value: '123456789' })

builder.factory.barcode({
  value: '123456789',
  format: 'ean13',
  displayText: (data) => `SN-${data}`,
})
```

不要 `ui.buildBarcode`，不要写 EJ2 `type` / JsBarcode `barcodeFormat`。

原生 HTML 用 `htmlAttributes`（`title` / `data-*`）。Syncfusion 进组件的 `htmlAttributes` 对象，不要把 `class` 塞进去。

```ts
builder.factory.barcode({
  value: '123456789',
  htmlAttributes: { title: '物料码' },
})
```

## 不要

- 把 QR 写进 `factory.barcode`；二维码走 `factory.qrCode`
- 把列渲染做成 `factory.barcode`
- 在皮肤 `style.css` 里补条码宽高或颜色
