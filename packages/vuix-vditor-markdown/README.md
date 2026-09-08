# @mmda/vuix-vditor-markdown

三家皮肤共用的 `UiMarkdownEditorPlugin`（Vditor）。不依赖皮肤包。契约见 [vui Markdown 编辑器](../vui/docs/markdown_editor.md)。

```ts
import { createMarkdownEditorPlugin } from '@mmda/vuix-vditor-markdown'

ui.setMarkdownEditorPlugin(createMarkdownEditorPlugin())
```

内部用即时渲染（Typora 式）。不要把 Vditor 的 `wysiwyg` / `ir` / `sv` 写进 vui props。
