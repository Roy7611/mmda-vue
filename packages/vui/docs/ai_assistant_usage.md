# AI 助手：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `ui.buildAiAssistant`。设计见 [ai_assistant.md](./ai_assistant.md)。

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfAiAssistantPlugin } from '@mmda/vui-syncfusion/ai-assistant'

const ui = new SyncfusionUiBuilder()
ui.setAiAssistantPlugin(createSfAiAssistantPlugin())

ui.buildAiAssistant({
  relateTo: '#summarizeBtn',
  prompt: '请总结选中文本',
  popupWidth: 500,
  responseMode: 'popup',
  onReady: (ctrl) => {
    // 按钮点击：ctrl.showPopup()
  },
  onPromptRequest: async ({ prompt, respond }) => {
    // 接 OpenAI / Azure / 自家 API
    respond(`echo: ${prompt}`)
  },
})
```

不要 `factory.aiAssistant`。不要把 EJ2 `addResponse` / `InlineAIAssistComponent` 写进调用方；回写走 `respond`，弹层走 `onReady` 的 controller。
