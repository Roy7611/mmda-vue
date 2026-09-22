import { createElement, type ReactNode } from "react";

export type FilesUploadHandler = (files: File[]) => void;

export interface FilesUploadControl {
  choose: () => void;
}

export function SfFilesUploader(props: {
  accept?: string;
  multiple?: boolean;
  label?: string;
  onChange?: FilesUploadHandler;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "label",
    { className: "mmda-files-uploader" },
    createElement("input", {
      type: "file",
      accept: props.accept,
      multiple: props.multiple,
      onChange: (event: any) => {
        const input = event.target as HTMLInputElement;
        props.onChange?.(Array.from(input.files ?? []));
        input.value = "";
      },
    }),
    createElement("span", null, props.label ?? props.children),
  );
}
