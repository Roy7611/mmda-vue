import { createElement, type ReactNode } from "react";

export interface SfFileUploaderProps {
  accept?: string;
  multiple?: boolean;
  label?: string;
  onChange?: (files: File[]) => void;
  children?: ReactNode;
}

export function SfFileUploader(props: SfFileUploaderProps): ReactNode {
  return createElement(
    "label",
    { className: "mmda-file-uploader" },
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
