import { h } from "vue";
import { SpeechToTextComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiSpeechToTextProps } from '@mmda/core';
import { emitSpeechToTextChange, htmlAttributesOf, speechToTextErrorCode, speechToTextInterimOf, speechToTextModifierClasses, speechToTextValueOf } from "@mmda/vui"

function ej2Of(el: any) {
  return el?.ej2Instances ?? el;
}

export function createSpeechToText(props: UiSpeechToTextProps = {}) {
  const {
    value: _value,
    modelValue: _modelValue,
    lang,
    interim: _interim,
    disabled,
    listening,
    onChange: _onChange,
    onListening,
    onError,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const cssClass = speechToTextModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  const bindController = (el: unknown) => {
    const inst = ej2Of(el);
    if (!inst || !onReady) return;
    onReady({
      start: () => inst.startListening?.(),
      stop: () => inst.stopListening?.(),
      isListening: () => inst.listeningState === "Listening",
    });
  };

  return h(SpeechToTextComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    transcript: speechToTextValueOf(props),
    lang,
    allowInterimResults: speechToTextInterimOf(props),
    disabled: Boolean(disabled),
    listeningState: listening ? "Listening" : "Inactive",
    cssClass,
    htmlAttributes,
    transcriptChanged: (args: { transcript?: string }) => {
      emitSpeechToTextChange(props, args?.transcript ?? "");
    },
    onStart: () => onListening?.(true),
    onStop: () => onListening?.(false),
    onError: (args: unknown) => onError?.(speechToTextErrorCode(args)),
    created: bindController,
    ref: bindController,
  });
}
