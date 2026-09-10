# SpeechToText：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.speechToText`。设计见 [speech_to_text.md](./speech_to_text.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/speech-to-text/vue-3-getting-started)、[API](https://ej2.syncfusion.com/vue/documentation/api/speech-to-text/index-default)。

vui 名是 **`speechToText`**。不要写 `SpeechToTextComponent` / `ejs-speechtotext` / `webkitSpeechRecognition` 进 vui 或 Logic。不要用 `aiAssistant` 当麦克风。

chrome **只是麦**。要显示字，旁边自己拼 `factory.textInput` / `factory.textArea`，用 `onChange` 写回。需要 HTTPS（或 localhost）和麦克风权限。

```ts
factory.speechToText({
  lang: 'zh-CN',
  value: model.note,
  onChange: (value) => {
    model.note = value
  },
})
```

和输入并排：

```ts
factory.layout.row([
  factory.textInput({
    value: model.note,
    onChange: (value) => {
      model.note = value
    },
  }),
  factory.speechToText({
    lang: context.locale === 'zh' ? 'zh-CN' : 'en-US',
    onChange: (value) => (model.note = value),
  }),
])
```

`modelValue` 也认（与 `value` 同语义）。`interim` 缺省 `true`。不要在 Logic 里碰 `webkitSpeechRecognition`。

Controller：

```ts
factory.speechToText({
  onReady: (ctl) => {
    // ctl.start() / ctl.stop() / ctl.isListening()
  },
  onError: (code) => {
    // unsupported-browser / not-allowed / no-speech / …
  },
})
```

没有 `fieldFactory.speechToText`。字段仍用文本 editor。

## 不要

- 在 Builder 上再开 `buildSpeechToText`
- 把 EJ2 `transcript` / `allowInterimResults` / `startListening` 写进 vui 公开名
- 不支持时画空节点（必须 `onError`）
- 和 `factory.aiAssistant` 混用
