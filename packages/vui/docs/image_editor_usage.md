# 图片编辑器：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `ui.buildImageEditor`。设计见 [image_editor.md](./image_editor.md)。目前只有 SF：

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfImageEditorPlugin } from '@mmda/vui-syncfusion/image-editor'

const ui = new SyncfusionUiBuilder()
ui.setImageEditorPlugin(createSfImageEditorPlugin())

ui.buildImageEditor({
  src: '/photo.png',
  onSave: ({ blob, dataUrl }) => {
    void blob
    void dataUrl
  },
})
```

Prime / Naive 尚未实现引擎，不要 `setImageEditorPlugin`。不要 `factory.imageEditor`。
