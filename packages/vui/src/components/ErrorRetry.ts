import {
  errorDisplayOf,
  errorModifierClasses,
  uiCssClass,
  type UiErrorProps,
  type UiErrorStatus,
  uiRenderProps
} from '@mmda/core'
import { defineComponent, h, inject } from 'vue'
import { createIconVNode, MATERIAL_SYMBOL_PREFIX } from '../app/icon'
import { UI_APP_KEY } from '../app/keys'
import type { MmdaVueApp } from '../app/app'
import { translateMessage } from '../i18n/i18n'

const STATUS_ICON: Record<UiErrorStatus, string> = {
  error: 'error',
  unavailable: 'cloud_off',
  network: 'wifi_off',
}

function isGenericNetworkDescription(text?: string): boolean {
  if (!text) return true
  return /failed to fetch|networkerror|network error|load failed|econnrefused|err_connection/i.test(
    text,
  )
}

export const ErrorRetry = defineComponent({
  name: 'ErrorRetry',
  inheritAttrs: false,
  props: {
    error: { default: undefined },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    retryLabel: { type: String, default: undefined },
    status: { type: String, default: undefined },
    onRetry: { type: Function, default: undefined },
  },
  setup(props, { attrs }) {
    const app = inject(UI_APP_KEY, null) as MmdaVueApp | null

    return () => {
      const uiProps = { ...attrs, ...props } as UiErrorProps
      const display = errorDisplayOf(uiProps)
      const title =
        display.title ?? translateMessage('failure.pageLoadFailed')
      const description =
        display.status === 'network' &&
        isGenericNetworkDescription(display.description)
          ? translateMessage('failure.networkUnavailable')
          : display.description
      const retryLabel =
        uiProps.retryLabel?.trim() || translateMessage('action.retry')
      const onRetry = props.onRetry as UiErrorProps['onRetry']
      const button =
        app?.ui.factory.button?.({
          label: retryLabel,
          colorRole: 'primary',
          type: 'button',
          class: uiCssClass('error-retry', 'retry'),
          onClick: () => onRetry?.(),
        }) ??
        h(
          'button',
          {
            type: 'button',
            class: uiCssClass('error-retry', 'retry'),
            onClick: () => onRetry?.(),
          },
          retryLabel,
        )

      return h(
        'div',
        {
          ...uiRenderProps(uiProps).attributes,
          class: errorModifierClasses(uiProps).flat(),
          role: 'alert',
        },
        [
          h('div', { class: uiCssClass('error-retry', 'panel') }, [
            createIconVNode(
              `${MATERIAL_SYMBOL_PREFIX}${STATUS_ICON[display.status]}`,
              { class: uiCssClass('error-retry', 'icon') },
            ),
            h('h2', { class: uiCssClass('error-retry', 'title') }, title),
            description
              ? h(
                  'p',
                  { class: uiCssClass('error-retry', 'description') },
                  description,
                )
              : null,
            h('div', { class: uiCssClass('error-retry', 'actions') }, [button]),
          ]),
        ],
      )
    }
  },
})

export function createErrorRetry(props: UiErrorProps = {}) {
  return h(ErrorRetry, props as Record<string, unknown>)
}
