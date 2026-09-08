# 图片编辑器插件

图片编辑不进 chrome `factory`。vui 只定 [`UiImageEditorPlugin`](../src/ui/factory/image_editor.ts)；应用 `setImageEditorPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

目前只有 Syncfusion EJ2 实现。Prime / Naive 不挂插件时，`buildImageEditor` 抛未安装。不要和 `factory.image` / `imageGallery` / `imageUploader` / `buildFilePreview` 混用。`ImagePicker` 以后是跟表单一起上传的选图预览，不是只读图。手写签名是 chrome `factory.signaturePad`，不是本插件。

程序员用法：[image_editor_usage.md](./image_editor_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/image_editor.ts` | `UiImageEditorProps`；未安装 stub |
| `VueUiBuilder.imageEditorPlugin` | 默认 `unimplementedImageEditorPlugin`；`setImageEditorPlugin`；`buildImageEditor` 转调插件 |
| `@mmda/vui-syncfusion/image-editor` | `createSfImageEditorPlugin`，EJ2 ImageEditor |

不要 `factory.imageEditor`。Logic 不画编辑器。core `UiBuilder` 不加方法。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setImageEditorPlugin` | `image editor plugin not installed` |

## 属性

| 属性 | 说明 |
|---|---|
| `src` | 图片 url |
| `onSave` | `{ blob, dataUrl }` |
| `tools` | `crop` / `rotate` / `flip`，缺省全开 |
| `readonly` | 只读 |
| `width` / `height` | 尺寸 |
| `class` / `htmlAttributes` | 根节点 |

不要把 EJ2 标注 / 滤镜 / 画笔写进 vui。

钩子 class：`mmda-image-editor`。
