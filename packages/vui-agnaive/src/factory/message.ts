import { h } from 'vue'
import { NAlert } from 'naive-ui'
import type { UiDialogSeverity, UiMessageProps } from '@mmda/vui'
import {
  messageSeverityOf,
  messageShowCloseIconOf,
  messageShowIconOf,
} from '@mmda/vui'

const TYPE: Record<UiDialogSeverity, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
}

export function createMessage(props: UiMessageProps = {}) {
  const {
    content,
    severity,
    showCloseIcon,
    showIcon,
    variant: _variant,
    visible,
    cssClass,
    onClose,
    class: className,
    htmlAttributes,
    ...rest
  } = props
  if (visible === false) return h('span', { hidden: true })
  return h(
    NAlert,
    {
      ...rest,
      ...htmlAttributes,
      type: TYPE[messageSeverityOf(severity)],
      closable: messageShowCloseIconOf(showCloseIcon),
      showIcon: messageShowIconOf(showIcon),
      class: ['mmda-message', cssClass, className],
      // 详情页 banner 要整行；避免 NAlert 按文案缩成一条窄条
      style: {
        ...((rest as { style?: Record<string, unknown> }).style ?? {}),
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        margin: 0,
      },
      onClose: () => onClose?.(),
    },
    { default: () => content ?? '' },
  )
}
