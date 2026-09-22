import { createElement, type ReactElement } from "react";
import { SpeechToTextComponent } from "@syncfusion/ej2-react-inputs";
import {
  speechToTextErrorCode,
  speechToTextInterimOf,
  speechToTextModifierClasses,
  speechToTextValueOf,
  type UiSpeechToTextProps,
} from "@mmda/core";
import { joinClass, sfHtmlAttributes } from "./utils";

function ej2Of(el: unknown): unknown {
  return (el as { ej2Instances?: unknown })?.ej2Instances ?? el;
}

export function createSpeechToText(
  props: UiSpeechToTextProps = {},
): ReactElement {
  const bindController = (el: unknown) => {
    const inst = ej2Of(el) as {
      startListening?: () => void;
      stopListening?: () => void;
      listeningState?: string;
    };
    if (!inst || !props.onReady) return;
    props.onReady({
      start: () => inst.startListening?.(),
      stop: () => inst.stopListening?.(),
      isListening: () => inst.listeningState === "Listening",
    });
  };

  return createElement(SpeechToTextComponent as any, {
    transcript: speechToTextValueOf(props),
    lang: props.lang,
    allowInterimResults: speechToTextInterimOf(props),
    disabled: Boolean(props.disabled),
    listeningState: props.listening ? "Listening" : "Inactive",
    cssClass: joinClass(speechToTextModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    transcriptChanged: (args: { transcript?: string }) =>
      props.onChange?.(args?.transcript ?? ""),
    onStart: () => props.onListening?.(true),
    onStop: () => props.onListening?.(false),
    onError: (args: unknown) => props.onError?.(speechToTextErrorCode(args)),
    created: bindController,
    ref: bindController,
  });
}
