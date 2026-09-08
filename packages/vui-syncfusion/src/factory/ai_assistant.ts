/*
 * AI 助手是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setAiAssistantPlugin(createSfAiAssistantPlugin())
 */
import {
  defineAsyncComponent,
  defineComponent,
  h,
  onMounted,
  ref,
  type PropType,
} from 'vue'
import type {
  UiAiAssistantController,
  UiAiAssistantPlugin,
  UiAiAssistantProps,
  UiAiPromptRequest,
  UiAiResponseMode,
} from '@mmda/vui'
import { aiAssistantHookClass, htmlAttributesOf } from '@mmda/vui'

function ej2ResponseMode(mode?: UiAiResponseMode): string | undefined {
  if (mode === 'inline') return 'Inline'
  if (mode === 'popup') return 'Popup'
  return undefined
}

function cssWidth(value: string | number | undefined) {
  if (value == null) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

export function wrapAiPromptRequest(
  onPromptRequest: UiAiAssistantProps['onPromptRequest'],
  addResponse: (text: string) => void,
  fallbackPrompt?: string,
) {
  return (args?: { prompt?: string }) => {
    const prompt = args?.prompt ?? fallbackPrompt ?? ''
    const request: UiAiPromptRequest = {
      prompt,
      respond: addResponse,
    }
    void onPromptRequest?.(request)
  }
}

const InlineAiAssistImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-interactive-chat')
    return { default: (mod as any).InlineAIAssistComponent }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-sf-ai-assistant-missing' },
            'AI assistant requires @syncfusion/ej2-vue-interactive-chat',
          ),
      }),
    }
  }
})

export const SfAiAssistantView = defineComponent({
  name: 'SfAiAssistantView',
  props: {
    relateTo: { type: String, default: undefined },
    prompt: { type: String, default: undefined },
    promptPlaceholder: { type: String, default: undefined },
    popupWidth: { type: [String, Number], default: undefined },
    responseMode: {
      type: String as PropType<UiAiResponseMode>,
      default: undefined,
    },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    options: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    onPromptRequest: Function as PropType<UiAiAssistantProps['onPromptRequest']>,
    onReady: Function as PropType<UiAiAssistantProps['onReady']>,
  },
  setup(props) {
    const host = ref<{ ej2Instances?: any; addResponse?: Function; showPopup?: Function; hidePopup?: Function } | null>(
      null,
    )

    function inst() {
      return host.value?.ej2Instances ?? host.value
    }

    function addResponse(text: string) {
      const target = inst()
      target?.addResponse?.(text)
      host.value?.addResponse?.(text)
    }

    function showPopup() {
      const target = inst()
      target?.showPopup?.()
      host.value?.showPopup?.()
    }

    function hidePopup() {
      const target = inst()
      target?.hidePopup?.()
      host.value?.hidePopup?.()
    }

    const controller: UiAiAssistantController = {
      showPopup,
      hidePopup,
      addResponse,
    }

    onMounted(() => {
      props.onReady?.(controller)
    })

    function onPromptRequest(args: { prompt?: string } | undefined) {
      wrapAiPromptRequest(
        props.onPromptRequest,
        addResponse,
        props.prompt,
      )(args)
    }

    return () =>
      h(InlineAiAssistImpl as any, {
        ref: host,
        ...props.options,
        ...htmlAttributesOf(props),
        class: aiAssistantHookClass(props.class),
        relateTo: props.relateTo,
        prompt: props.prompt,
        promptPlaceholder: props.promptPlaceholder,
        popupWidth: cssWidth(props.popupWidth),
        responseMode: ej2ResponseMode(props.responseMode),
        promptRequest: onPromptRequest,
      })
  },
})

export function createSfAiAssistantPlugin(): UiAiAssistantPlugin {
  return {
    aiAssistant: (props: UiAiAssistantProps) =>
      h(SfAiAssistantView, props as any),
  }
}
