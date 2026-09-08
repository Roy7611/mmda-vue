# AI 助手插件

AI 助手不进 chrome `factory`。vui 只定 [`UiAiAssistantPlugin`](../src/ui/factory/ai_assistant.ts)；应用 `setAiAssistantPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[ai_assistant_usage.md](./ai_assistant_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/ai_assistant.ts` | props / controller / 未安装 stub |
| `VueUiBuilder.aiAssistantPlugin` | 默认 `unimplementedAiAssistantPlugin`；`setAiAssistantPlugin`；`buildAiAssistant` 转调插件 |
| `@mmda/vui-syncfusion/ai-assistant` | `createSfAiAssistantPlugin`，EJ2 Inline AI Assist |

不要 `factory.aiAssistant`。Logic 不调厂商 API。core `UiBuilder` 不加 AI 方法。Prime / Naive 本轮不实现。

本轮是 **Inline AI Assist**（锚定控件旁弹出），不是 AI AssistView 整页聊天。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setAiAssistantPlugin` | `ai assistant plugin not installed` |

不要静默空节点。

## 属性

| 属性 | 说明 |
|---|---|
| `relateTo` | 锚点 CSS 选择器 |
| `prompt` | 初始提示词 |
| `promptPlaceholder` | 输入占位 |
| `popupWidth` | 弹出宽度 |
| `responseMode` | `inline` / `popup` |
| `onPromptRequest` | `{ prompt, respond }`；`respond(text)` 写回回复 |
| `onReady` | 拿到 `UiAiAssistantController`（`showPopup` / `hidePopup` / `addResponse`） |
| `options` | 引擎逃逸 |

钩子 class：`mmda-ai-assistant`。皮肤 `style.css` 不默认引入 interactive-chat 主题。
