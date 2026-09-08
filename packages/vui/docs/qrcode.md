# 二维码设计

二维码走 `factory.qrCode`。省略 `format` 就是 QR；只允许 `format: 'dataMatrix'`，**没有** `format: 'qr'`。EJ2 见 [QR](https://ej2.syncfusion.com/vue/documentation/barcode/getting-started-vue-3) / [Data Matrix](https://ej2.syncfusion.com/vue/documentation/barcode/datamatrixgenerator)。

程序员用法：[qrcode_usage.md](./qrcode_usage.md)。一维码：[barcode.md](./barcode.md)。chrome 参数约定：[factory.md](./factory.md)（含 `htmlAttributes` 透传）。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/qrcode.ts` | `UiQrCodeProps`：`value` / `format` / `width` / `height` / `showValue` / `displayText` |
| 皮肤 `factory/qrcode.ts` | SF 按 format `h(QRCodeGenerator)` 或 `h(DataMatrixGenerator)`；Prime / Naive 用 `qrcode` 画 QR canvas |

Builder **不**开放 `buildQrcode`。皮肤画不了 Data Matrix 时只出文本，**禁止改画 QR**。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 要编码的字符串 |
| `format` | 省略 = QR；`'dataMatrix'` 换码制 |
| `width` / `height` | 默认 `160px` |
| `showValue` | 默认 false（URL 太长） |
| `displayText` | 与条码同一套：字符串或 `(data) => string`，有则印、优先于 `showValue` |

## 皮肤映射

| vui | Syncfusion | Prime / Naive |
|---|---|---|
| 省略 format | `QRCodeGeneratorComponent` | `qrcode` canvas；有文案则底下 `span.mmda-qrcode__text` |
| `format: 'dataMatrix'` | `DataMatrixGeneratorComponent` | 文本 + `mmda-qrcode--unsupported`，不画 QR |

## 源码

- vui：[`qrcode.ts`](../src/ui/factory/qrcode.ts)
- SF：[`vui-syncfusion/src/factory/qrcode.ts`](../../vui-syncfusion/src/factory/qrcode.ts)
- Prime：[`vui-primevue/src/factory/qrcode.ts`](../../vui-primevue/src/factory/qrcode.ts)
- Naive：[`vui-agnaive/src/factory/qrcode.ts`](../../vui-agnaive/src/factory/qrcode.ts)
