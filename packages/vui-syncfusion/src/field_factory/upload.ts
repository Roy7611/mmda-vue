import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { UiProps } from "@mmda/vui"
import { renderFileLinkField, renderFileUploaderField, renderFilesUploaderField, renderImageUploaderField, renderImagesUploaderField } from "@mmda/vui"
import type { SfVuiContext } from "./utils";

export const filePicker = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => renderFileUploaderField(field, context as any, props ?? {});

export const fileUpload = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => renderFilesUploaderField(field, context as any, props ?? {});

export const fileUploader = filePicker;
export const filesUploader = fileUpload;

export const imagePicker = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => renderImageUploaderField(field, context as any, props ?? {});

export const imageUploader = imagePicker;

export const imagesUploader = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => renderImagesUploaderField(field, context as any, props ?? {});

export const fileLinkField = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => renderFileLinkField(field, context as any, props ?? {});

export const image = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  h("img", {
    src: context.getFieldValue(field, props?.row),
    ...props,
  });
