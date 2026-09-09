# 条码设计

一维码走 `factory.barcode`。契约 `UiBarcodeProps` 在 `@mmda/core`。EJ2 见 [Barcode getting started](https://ej2.syncfusion.com/vue/documentation/barcode/getting-started-vue-3)。二维码走 [`factory.qrCode`](./qrcode.md)，不要 `format: 'qr'`。

程序员用法：[barcode_usage.md](./barcode_usage.md)。chrome 参数约定：[factory.md](./factory.md)（含 `htmlAttributes` 透传）。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/barcode.ts` | `UiBarcodeProps`：`value` / `format` / `width` / `height` / `showValue` / `displayText` |
| 皮肤 `factory/barcode.ts` | SF `h(BarcodeGeneratorComponent)`；Prime / Naive 用 jsbarcode 画 canvas（内部组件，不 export） |

Builder **不**开放 `buildBarcode`。字段单元格不是 `factory.barcode`。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 要编码的字符串 |
| `format` | 默认 `code128`。一维码制，不是 `shape`，也不是厂商 `type` |
| `width` / `height` | 默认 `200px` / `80px` |
| `showValue` | 默认 true；条下是否印 `value` |
| `displayText` | `string` 或 `(data: string) => string`（`data` 即 `value`）。有则印这段，优先于 `showValue` |

没有 `shape` / `size` / `colorRole` / `position`。填色保持黑白。`mode` 固定 SVG。调用方不要传 EJ2 `{ text, visibility }`。

## 皮肤映射

| vui | Syncfusion | Prime / Naive |
|---|---|---|
| `format` | `type`：`Code128` / `EAN13` / … | JsBarcode `CODE128` / `EAN13` / …；没有的码制：文本 + `mmda-barcode--unsupported` |
| 条下文字 | `displayText: { text, visibility }` | `displayValue` / `text` |

## 源码

- vui：[`barcode.ts`](../src/ui/factory/barcode.ts)
- SF：[`vui-syncfusion/src/factory/barcode.ts`](../../vui-syncfusion/src/factory/barcode.ts)
- Prime：[`vui-primevue/src/factory/barcode.ts`](../../vui-primevue/src/factory/barcode.ts)
- Naive：[`vui-agnaive/src/factory/barcode.ts`](../../vui-agnaive/src/factory/barcode.ts)
