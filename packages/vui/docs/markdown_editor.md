# Markdown 编辑器插件

Markdown 不进 chrome `factory`。vui 只定 [`UiMarkdownEditorPlugin`](../src/ui/factory/markdown_editor.ts)；应用 `setMarkdownEditorPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[markdown_editor_usage.md](./markdown_editor_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/markdown_editor.ts` | `UiMarkdownEditorProps`；未安装 stub |
| `VueUiBuilder.markdownEditorPlugin` | 默认 `unimplementedMarkdownEditorPlugin`；`setMarkdownEditorPlugin`；`buildMarkdownEditor` 转调插件 |
| `@mmda/vuix-vditor-markdown` | `createMarkdownEditorPlugin`，Vditor；三家皮肤共用 |

不要 `factory.markdownEditor`。Logic 不画编辑器。core `UiBuilder` 不加方法。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setMarkdownEditorPlugin` | `markdown editor plugin not installed` |

## 属性

| 属性 | 说明 |
|---|---|
| `value` | Markdown 字符串 |
| `onChange` | 文本变化 |
| `readonly` | 只读 |
| `width` / `height` | 尺寸 |
| `class` / `htmlAttributes` | 根节点 |

不要把 Vditor 的 `wysiwyg` / `ir` / `sv` 或主题名写进 vui。

钩子 class：`mmda-markdown-editor`。
