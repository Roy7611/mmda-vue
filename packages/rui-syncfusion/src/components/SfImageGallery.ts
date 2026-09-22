import { createElement, type ReactNode } from "react";

export interface SfImageGalleryItem {
  src: string;
  alt?: string;
  title?: string;
}

export function SfImageGallery(props: {
  items?: SfImageGalleryItem[];
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "div",
    { className: "mmda-image-gallery" },
    (props.items ?? []).map((item, index) =>
      createElement("img", {
        key: item.src ?? index,
        src: item.src,
        alt: item.alt ?? item.title ?? "",
        title: item.title,
        className: "mmda-image-gallery-item",
      }),
    ),
    props.children,
  );
}
