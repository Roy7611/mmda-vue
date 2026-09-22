import { createElement, useRef, useState, type ReactElement } from "react";
import {
  IMAGE_UPLOADER_EXTENSIONS,
  fileLinkUrlOf,
  fileUploaderAcceptOf,
  type UiFileLinkProps,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
  type UiImageGalleryProps,
  type UiImageUploaderProps,
  type UiImagesUploaderProps,
} from "@mmda/core";
import { el, joinClass, nativeDomProps } from "./utils";

export function createFileLink(props: UiFileLinkProps): ReactElement {
  return el(
    "a",
    {
      ...nativeDomProps(props),
      href: fileLinkUrlOf(props),
      className: joinClass("mmda-file-link", props.class),
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (event: Event) => {
        if (props.preview) {
          event.preventDefault();
          props.onPreview?.(fileLinkUrlOf(props));
        }
      },
    },
    props.fileName ?? fileLinkUrlOf(props),
  );
}

function FileInputElement(props: {
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  chooseText?: string;
  onPick: (files: File[]) => void;
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  return el(
    "div",
    { className: "mmda-file-uploader" },
    el("input", {
      ref: inputRef,
      type: "file",
      multiple: props.multiple,
      accept: props.accept,
      disabled: props.disabled,
      style: { display: "none" },
      onChange: (event: any) => {
        const files = Array.from<File>(event.target.files ?? []);
        if (files.length) props.onPick(files);
        event.target.value = "";
      },
    }),
    el(
      "button",
      {
        className: "e-btn",
        type: "button",
        disabled: props.disabled,
        onClick: () => inputRef.current?.click(),
      },
      props.chooseText ?? "Choose",
    ),
  );
}

export function createFileUploader(props: UiFileUploaderProps): ReactElement {
  return createElement(FileInputElement, {
    multiple: false,
    accept: fileUploaderAcceptOf(props.allowedExtensions),
    disabled: props.disabled === true || props.readOnly === true,
    chooseText: props.chooseText,
    onPick: async (files) => {
      const file = files[0];
      if (!file) return;
      props.onSelected?.(file);
      if (props.onUpload) {
        const controller = new AbortController();
        await props.onUpload(file, {
          signal: controller.signal,
          onProgress: () => {},
        });
      }
    },
  });
}

export function createFilesUploader(props: UiFilesUploaderProps): ReactElement {
  return createElement(FileInputElement, {
    multiple: true,
    accept: fileUploaderAcceptOf(props.allowedExtensions),
    disabled: props.disabled === true || props.readOnly === true,
    chooseText: props.dropText,
    onPick: async (files) => {
      props.onSelected?.(files);
      if (props.onUpload) {
        for (const file of files) {
          const controller = new AbortController();
          await props.onUpload(file, {
            signal: controller.signal,
            onProgress: () => {},
          });
        }
      }
    },
  });
}

export function createImageUploader(props: UiImageUploaderProps): ReactElement {
  return createFileUploader({
    ...props,
    allowedExtensions: props.allowedExtensions ?? IMAGE_UPLOADER_EXTENSIONS,
  });
}

export function createImagesUploader(
  props: UiImagesUploaderProps,
): ReactElement {
  return createFilesUploader({
    ...props,
    allowedExtensions: props.allowedExtensions ?? IMAGE_UPLOADER_EXTENSIONS,
  });
}

export function createImageGallery(props: UiImageGalleryProps): ReactElement {
  const columns = props.columns ?? 3;
  const style =
    typeof props.style === "object" && props.style ? props.style : {};
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-image-gallery", props.class),
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "0.5rem",
        ...style,
      },
    },
    ...props.items.map((item, index) =>
      el(
        "figure",
        {
          key: item.src,
          className: "mmda-image-gallery__item",
          onClick: () => props.onItemClick?.(item, index),
          onDoubleClick: () => props.onItemDblclick?.(item, index),
        },
        el("img", {
          src: item.thumbnail ?? item.src,
          alt: item.alt,
          title: item.title,
        }),
      ),
    ),
  );
}
