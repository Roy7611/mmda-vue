import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  aiAssistantHookClass,
  UiPluginName,
  type UiAiAssistantProps,
  type UiAiPromptRequest,
  type UiAiResponseMode,
  type UiPlugin,
} from '@mmda/core'
import { joinClass, reactDomProps } from './utils'

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

function MissingAiAssistant(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-ai-assistant-missing' },
    'AI assistant requires @syncfusion/ej2-react-interactive-chat',
  )
}

const AiAssistantImpl = lazy(async (): Promise<{
  default: ComponentType<any>
}> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingAiAssistant
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-interactive-chat')
    return { default: mod.InlineAIAssistComponent as ComponentType<any> }
  } catch {
    return { default: MissingAiAssistant }
  }
})

export function SfAiAssistantView(props: UiAiAssistantProps): ReactElement {
  return createElement(
    Suspense,
    { fallback: null },
    createElement(AiAssistantImpl as any, {
      ...props.options,
      ...reactDomProps(props),
      cssClass: joinClass(aiAssistantHookClass(props.class)),
      relateTo: props.relateTo,
      prompt: props.prompt,
      promptPlaceholder: props.promptPlaceholder,
      popupWidth: cssWidth(props.popupWidth),
      responseMode: ej2ResponseMode(props.responseMode),
      promptRequest: wrapAiPromptRequest(
        props.onPromptRequest,
        (_text) => undefined,
        props.prompt,
      ),
    }),
  )
}

export function createSfAiAssistantPlugin(): UiPlugin {
  return {
    name: UiPluginName.aiAssistant,
    buildUi(_context, props) {
      return SfAiAssistantView(props as UiAiAssistantProps)
    },
  }
}
