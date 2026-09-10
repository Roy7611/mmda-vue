# SpeechToText 设计

chrome 麦克风转写，走 `factory.speechToText`。[EJ2 Vue SpeechToText](https://ej2.syncfusion.com/vue/documentation/speech-to-text/vue-3-getting-started)。API：[index-default](https://ej2.syncfusion.com/vue/documentation/api/speech-to-text/index-default)。

程序员用法：[speech_to_text_usage.md](./speech_to_text_usage.md)。chrome 参数约定：[factory.md](./factory.md)。普通文本仍是 `factory.textInput`。**没有** `fieldFactory.speechToText`。不要和 `aiAssistant` 插件混。

依赖浏览器 [Web Speech API](https://ej2.syncfusion.com/vue/documentation/speech-to-text/speech-recognition)。不支持时 `onError('unsupported-browser')`，不要静默空节点。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/speech_to_text.ts` | `UiSpeechToTextProps` / `UiSpeechToTextController`；取值、emit、class |
| vui `speech_to_text_host.ts` | Prime / Naive 共用 Web Speech host |
| 皮肤 `factory/speech_to_text.ts` | SF `SpeechToTextComponent`；Prime / Naive host + `factory.button` |

vui 名是 **`speechToText`** / **`value`** / **`interim`** / **`listening`**。不要 `SpeechToTextComponent` / `ejs-speechtotext` / `transcript` / `allowInterimResults` / `listeningState` 当 vui 名。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 转写字符串。也认 `modelValue` |
| `lang` | BCP 47。如 `zh-CN` / `en-US` |
| `interim` | 是否中间结果。缺省 `true`。对应 EJ2 `allowInterimResults` |
| `disabled` | 禁用 |
| `listening` | 受控：是否在听。对应 `listeningState === Listening` |
| `onChange` | `(value: string)`。也认 `onUpdate:modelValue` / `onUpdate` |
| `onListening` | `(listening: boolean)`。对应 EJ2 `onStart` / `onStop` |
| `onError` | `(code: string)`。`no-speech` / `not-allowed` / `unsupported-browser` / … |
| `onReady` | 拿到 `UiSpeechToTextController`：`start` / `stop` / `isListening`（映射 EJ2 `startListening` / `stopListening`） |

钩子 class：`mmda-speech-to-text`；`--listening` / `--disabled`。

## 皮肤映射

| vui | Syncfusion | PrimeVue / Naive |
|---|---|---|
| 控件 | `SpeechToTextComponent` | `MmdaSpeechToTextHost` + 皮肤 `button` |
| `value` | `transcript` | host `value` |
| `interim` | `allowInterimResults` | `interimResults` |
| `listening` | `listeningState: 'Listening'` | host `listening` |
| `onChange` | `transcriptChanged` → `args.transcript` | `onresult` 拼 transcript |
| `onListening` | `onStart` / `onStop` | `onstart` / `onend` |
| `onError` | EJ2 error 码 | `SpeechRecognitionError` / `unsupported-browser` |

皮肤 `style.css` 不写长相。本轮不做 `buttonSettings`、tooltip 细项。

## 源码

- vui [`speech_to_text.ts`](../src/ui/factory/speech_to_text.ts)
- vui host [`speech_to_text_host.ts`](../src/ui/factory/speech_to_text_host.ts)
- Syncfusion [`factory/speech_to_text.ts`](../../vui-syncfusion/src/factory/speech_to_text.ts)
- Prime [`factory/speech_to_text.ts`](../../vui-primevue/src/factory/speech_to_text.ts)
- Naive [`factory/speech_to_text.ts`](../../vui-agnaive/src/factory/speech_to_text.ts)
