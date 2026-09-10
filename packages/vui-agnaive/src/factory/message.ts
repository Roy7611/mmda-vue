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
      onClose: () => onClose?.(),
    },
    { default: () => content ?? '' },
  )
}
