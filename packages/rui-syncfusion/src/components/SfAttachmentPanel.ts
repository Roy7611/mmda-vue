import { createElement, useState, type ReactNode } from "react";

export function SfAttachmentPanel(props: {
  files?: { fileName: string; size?: number }[];
  onChoose?: (files: File[]) => void;
  children?: ReactNode;
}): ReactNode {
  const [files, setFiles] = useState(props.files ?? []);
  return createElement(
    "div",
    { className: "mmda-attachment-panel" },
    files.map((file) =>
      createElement(
        "div",
        { className: "mmda-attachment-item", key: file.fileName },
        createElement("span", null, file.fileName),
        file.size ? createElement("small", null, `${file.size}`) : null,
      ),
    ),
    createElement("input", {
      type: "file",
      multiple: true,
      onChange: (event: any) => {
        const input = event.target as HTMLInputElement;
        const next = Array.from(input.files ?? []);
        props.onChoose?.(next);
        setFiles((current) => [
          ...current,
          ...next.map((file) => ({ fileName: file.name, size: file.size })),
        ]);
        input.value = "";
      },
    }),
    props.children,
  );
}
