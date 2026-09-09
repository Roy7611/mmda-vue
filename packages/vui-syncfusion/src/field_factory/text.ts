import type { MetaUiField } from "@mmda/core";
import type { UiProps } from "@mmda/vui"
import { textAreaPropsFromField, textInputPropsFromField } from "@mmda/core"
import { TextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import { createTextArea } from "../factory/text_area";
import { createTextInput } from "../factory/text_input";
import { control, invalidOf, type UiContext } from "./utils";
import { h } from "vue";

export const textInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createTextInput(textInputPropsFromField(field, context, props ?? {})),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const textArea = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createTextArea(
      textAreaPropsFromField(field, context, {
        rows: 3,
        resizeMode: "Vertical",
        ...props,
      }),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const password = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  control(TextBoxComponent as any, field, context, props, { type: "password" });
