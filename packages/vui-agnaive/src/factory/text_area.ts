import { h } from 'vue'
import { NInput } from 'naive-ui'
import type { UiTextAreaProps } from '@mmda/core'
import { textAreaAutoResizeOf, textAreaCssResizeOf, textAreaDisabledOf, textAreaMaxLengthOf, textAreaModifierClasses, textAreaReadOnlyOf, textAreaResizeModeOf, textAreaRowsOf, textAreaValueOf, uiRenderProps } from '@mmda/core'
import { emitTextAreaChange } from '@mmda/vui'
import type { VuiModelProps } from "@mmda/vui"

export function createTextArea(props: VuiModelProps<UiTextAreaProps>) {
  const {
    value: _value,
    modelValue: _modelValue,
    placeholder,
    disabled: _disabled,
    readOnly: _readOnly,
    rows: _rows,
    cols: _cols,
    maxLength: _maxLength,
    resizeMode: _resizeMode,
    autoResize: _autoResize,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const maxLength = textAreaMaxLengthOf(props)

  return h(NInput, {
    ...rest,
    ...uiRenderProps(props).attributes,
    type: 'textarea',
    value: textAreaValueOf(props),
    placeholder,
    disabled: textAreaDisabledOf(props),
    readonly: textAreaReadOnlyOf(props),
    rows: textAreaRowsOf(props),
    ...(maxLength != null ? { maxlength: maxLength } : {}),
    autosize: textAreaAutoResizeOf(props) ? true : undefined,
    class: textAreaModifierClasses(props).flat(),
    style: { resize: textAreaCssResizeOf(textAreaResizeModeOf(props)) },
    'onUpdate:value': (next: unknown) => emitTextAreaChange(props, next),
  })
}
