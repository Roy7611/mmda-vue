import { h } from "vue";
import Textarea from "primevue/textarea";
import type { UiTextAreaProps } from "@mmda/core"
import { textAreaAutoResizeOf, textAreaColsOf, textAreaCssResizeOf, textAreaDisabledOf, textAreaMaxLengthOf, textAreaModifierClasses, textAreaReadOnlyOf, textAreaResizeModeOf, textAreaRowsOf, textAreaValueOf } from "@mmda/core"
import { emitTextAreaChange } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

export function createTextArea(props: UiTextAreaProps) {
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
    ...rest
  } = props;

  const cols = textAreaColsOf(props);
  const maxLength = textAreaMaxLengthOf(props);

  return h(Textarea as any, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: textAreaValueOf(props),
    placeholder,
    disabled: textAreaDisabledOf(props),
    readonly: textAreaReadOnlyOf(props),
    rows: textAreaRowsOf(props),
    ...(cols != null ? { cols } : {}),
    ...(maxLength != null ? { maxlength: maxLength } : {}),
    autoResize: textAreaAutoResizeOf(props),
    class: textAreaModifierClasses(props).flat(),
    style: { resize: textAreaCssResizeOf(textAreaResizeModeOf(props)) },
    "onUpdate:modelValue": (next: unknown) => emitTextAreaChange(props, next),
  });
}
