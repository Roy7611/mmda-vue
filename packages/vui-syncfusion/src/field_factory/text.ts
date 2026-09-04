import type { MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import { TextAreaComponent, TextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import { control, type UiContext } from "./utils";

export const textInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => control(TextBoxComponent as any, field, context, props);

export const textArea = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(TextAreaComponent as any, field, context, props, {
    rows: 3,
    width: "100%",
    resizeMode: "Vertical",
  });

export const password = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(TextBoxComponent as any, field, context, props, { type: "password" });
