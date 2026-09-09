import { h } from "vue";
import { type UiSpeechToTextProps } from '@mmda/core'
import { MmdaSpeechToTextHost, speechToTextInterimOf, speechToTextValueOf } from '@mmda/vui'
import { createButton } from "./button";

export function createSpeechToText(props: UiSpeechToTextProps = {}) {
  const {
    value: _value,
    modelValue: _modelValue,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  return h(MmdaSpeechToTextHost, {
    ...rest,
    value: speechToTextValueOf(props),
    lang: props.lang,
    interim: speechToTextInterimOf(props),
    disabled: props.disabled,
    listening: props.listening,
    class: props.class,
    htmlAttributes,
    renderButton: (ctx) =>
      createButton({
        type: "button",
        disabled: ctx.disabled,
        colorRole: ctx.listening ? "danger" : "primary",
        icon: ctx.listening ? "pi pi-stop" : "pi pi-microphone",
        class: ctx.class,
        onClick: ctx.toggle,
      }),
  });
}
