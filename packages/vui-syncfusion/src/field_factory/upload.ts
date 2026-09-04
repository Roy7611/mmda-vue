import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import { UploaderComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiContext } from "./utils";

export const filePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(UploaderComponent as any, {
    autoUpload: true,
    enabled: !context.isFieldReadonly(field),
    selected: (event: any) =>
      context.setFieldValue(field, event.filesData?.[0] ?? event.filesData),
    ...props,
  });

export const fileUpload = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(UploaderComponent as any, {
    multiple: true,
    enabled: !context.isFieldReadonly(field),
    selected: (event: any) => context.setFieldValue(field, event.filesData),
    ...props,
  });

export const imagePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h("img", {
    src: context.getFieldValue(field, props?.row),
    ...props,
  });
