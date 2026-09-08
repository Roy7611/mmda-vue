import { h } from "vue";
import { TextAreaComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiTextAreaProps } from "@mmda/vui";
import {
  emitTextAreaChange,
  htmlAttributesOf,
  textAreaColsOf,
  textAreaDisabledOf,
  textAreaMaxLengthOf,
  textAreaModifierClasses,
  textAreaReadOnlyOf,
  textAreaResizeModeOf,
  textAreaRowsOf,
  textAreaValueOf,
} from "@mmda/vui";

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
    class: _className,
    ...rest
  } = props;

  const cssClass = textAreaModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const cols = textAreaColsOf(props);
  const maxLength = textAreaMaxLengthOf(props);

  return h(TextAreaComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: textAreaValueOf(props),
    placeholder,
    enabled: !textAreaDisabledOf(props),
    readonly: textAreaReadOnlyOf(props),
    rows: textAreaRowsOf(props),
    ...(cols != null ? { cols } : {}),
    ...(maxLength != null ? { maxLength } : {}),
    resizeMode: textAreaResizeModeOf(props),
    cssClass,
    input: (args: { value?: unknown }) => emitTextAreaChange(props, args),
    change: (args: { value?: unknown }) => emitTextAreaChange(props, args),
  });
}
