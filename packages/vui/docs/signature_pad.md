# SignaturePad 设计

chrome 签名面板，走 `factory.signaturePad`。[EJ2 Vue Signature](https://ej2.syncfusion.com/vue/documentation/signature/vue-3-getting-started)。

程序员用法：[signature_pad_usage.md](./signature_pad_usage.md)。chrome 参数约定：[factory.md](./factory.md)。图片编辑仍是 `imageEditor` 插件，不要当成签名。

字段走 `fieldFactory.signaturePad`：翻译 `MetaUiField` 后调本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/signature_pad.ts` | `UiSignaturePadProps` / `UiSignaturePadController`；取值、emit、字段翻译 |
| 皮肤 `factory/signature_pad.ts` | SF `SignatureComponent` 全量映射；Prime / Naive 用 `signature_pad` |
| 字段 `fieldFactory.signaturePad` | 译字段，调 `createSignaturePad` |

vui 名是 **`signaturePad`**。不要 `ejs-signature` / `SignatureComponent` / npm `signature_pad` 当 vui 名。

值字段 **`value` 是 PNG data URL**。清空为 `''`。不要把 EJ2 `SignatureFileType` / `SignatureChangeEventArgs` 交给 Logic。`getDataUrl` 可要 jpeg/svg（仅 SF）。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | PNG data URL。也认 `modelValue` |
| `width` / `height` | 画布尺寸。数字当 px |
| `disabled` / `readOnly` | `readOnly` 对应 EJ2 `isReadOnly` |
| `strokeColor` | 缺省 `#000000` |
| `backgroundColor` / `backgroundImage` | 底色 / 衬底图 |
| `minStrokeWidth` / `maxStrokeWidth` | 缺省 0.5 / 2 |
| `velocity` | EJ2 压感。缺省 0.7。非 SF 忽略 |
| `saveWithBackground` | 缺省 true |
| `persist` | EJ2 `enablePersistence`。非 SF 忽略 |
| `locale` / `rtl` | `rtl` 对应 `enableRtl`。非 SF 忽略 |
| `onChange(value, action?)` | 笔画结束、undo/redo/clear。`action` 对应 EJ2 `actionName` |
| `onBeforeSave` | EJ2 Ctrl+S。可改 `fileName` / `type` 或 `cancel`。非 SF 忽略 |
| `onReady` | 拿到 `UiSignaturePadController` |

Controller：`clear` / `undo` / `redo` / `isEmpty` / `canUndo` / `canRedo` / `refresh` / `getDataUrl(type?)` / `getBlob` / `save` / `load` / `draw`。

钩子 class：`mmda-signature-pad`；`mmda-signature-pad--readonly` / `--disabled`。

## 皮肤映射

SF **全做**。Prime / Naive 对不上的 **忽略 props / controller no-op**，不 throw。

| vui | Syncfusion | PrimeVue / Naive |
|---|---|---|
| 控件 | `SignatureComponent` | szimek `signature_pad` canvas host |
| `readOnly` | `isReadOnly` | 禁指针 |
| `persist` | `enablePersistence` | 忽略 |
| `rtl` | `enableRtl` | 忽略 |
| `getDataUrl` | `getSignature` | 仅 png |
| `getBlob` | `saveAsBlob` | 从 png data URL 转 Blob |
| `save` / `draw` / `onBeforeSave` / `velocity` | 全量 | no-op / 忽略 |
| `redo` | 原方法 | host 用笔画栈补 |

## 源码

- vui [`signature_pad.ts`](../src/ui/factory/signature_pad.ts)
- Syncfusion [`factory/signature_pad.ts`](../../vui-syncfusion/src/factory/signature_pad.ts)
- Prime [`factory/signature_pad.ts`](../../vui-primevue/src/factory/signature_pad.ts)
- Naive [`factory/signature_pad.ts`](../../vui-agnaive/src/factory/signature_pad.ts)
