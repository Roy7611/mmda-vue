import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import {
  renderFileLinkField,
  renderFileUploaderField,
  renderFilesUploaderField,
  renderImageUploaderField,
  renderImagesUploaderField,
} from "@mmda/vui";
import type { UiContext } from "./utils";

export const filePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => renderFileUploaderField(field, context as any, props ?? {});

export const fileUpload = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => renderFilesUploaderField(field, context as any, props ?? {});

export const fileUploader = filePicker;
export const filesUploader = fileUpload;

export const imagePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => renderImageUploaderField(field, context as any, props ?? {});

export const imageUploader = imagePicker;

export const imagesUploader = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => renderImagesUploaderField(field, context as any, props ?? {});

export const fileLinkField = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => renderFileLinkField(field, context as any, props ?? {});

export const image = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h("img", {
    src: context.getFieldValue(field, props?.row),
    ...props,
  });
