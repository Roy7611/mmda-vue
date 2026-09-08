# Markdown 编辑器：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `ui.buildMarkdownEditor`。设计见 [markdown_editor.md](./markdown_editor.md)。

```ts
import { createMarkdownEditorPlugin } from '@mmda/vuix-vditor-markdown'

ui.setMarkdownEditorPlugin(createMarkdownEditorPlugin())

ui.buildMarkdownEditor({
  value: '# 标题',
  onChange: (text) => {
    model.body = text
  },
})
```

SF / Prime / Naive 都挂这一套。不要 `factory.markdownEditor`。
