import { h } from "vue";
import { type UiSpeechToTextProps } from '@mmda/core'
import { MmdaSpeechToTextHost, speechToTextInterimOf, speechToTextValueOf, type VuiSpeechToTextButtonContext } from '@mmda/vui'
import { createButton } from "./button";
import type { UiClassValue } from "@mmda/core"
import type { VuiModelProps } from "@mmda/vui"

export function createSpeechToText(props: VuiModelProps<UiSpeechToTextProps> = {}) {
  const {
    value: _value,
    modelValue: _modelValue,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  return h(MmdaSpeechToTextHost as any, {
    ...rest,
    value: speechToTextValueOf(props),
    lang: props.lang,
    interim: speechToTextInterimOf(props),
    disabled: props.disabled,
    listening: props.listening,
    class: props.class,
    htmlAttributes,
    renderButton: (ctx: VuiSpeechToTextButtonContext) =>
      createButton({
        type: "button",
        disabled: ctx.disabled,
        colorRole: ctx.listening ? "danger" : "primary",
        icon: ctx.listening ? "pi pi-stop" : "pi pi-microphone",
        class: ctx.class as UiClassValue[],
        onClick: ctx.toggle,
      }),
  });
}
