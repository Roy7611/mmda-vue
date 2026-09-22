import { createElement, type ReactElement } from "react";
import { BarcodeGeneratorComponent } from "@syncfusion/ej2-react-barcode-generator";
import {
  barcodeFormatClass,
  codeSizeCss,
  resolveBarcodeCaption,
  type UiBarcodeFormat,
  type UiBarcodeProps,
} from "@mmda/core";
import { joinClass, sfHtmlAttributes } from "./utils";

const EJ2_TYPE: Record<UiBarcodeFormat, string> = {
  code128: "Code128",
  code128A: "Code128A",
  code128B: "Code128B",
  code128C: "Code128C",
  code39: "Code39",
  code39Extended: "Code39Extended",
  code93: "Code93",
  code32: "Code32",
  codabar: "Codabar",
  ean8: "Ean8",
  ean13: "Ean13",
  upcA: "UpcA",
  upcE: "UpcE",
};

export function createBarcode(props: UiBarcodeProps): ReactElement {
  const {
    value,
    format = "code128",
    width,
    height,
    showValue,
    displayText,
    class: className,
  } = props;
  const caption = resolveBarcodeCaption(value, displayText, showValue, true);
  return createElement(BarcodeGeneratorComponent as any, {
    htmlAttributes: sfHtmlAttributes(props),
    value,
    type: EJ2_TYPE[format],
    width: codeSizeCss(width, "200px"),
    height: codeSizeCss(height, "80px"),
    mode: "SVG",
    displayText: {
      text: caption.text,
      visibility: caption.visible,
    },
    cssClass: joinClass(
      "mmda-barcode",
      barcodeFormatClass(format),
      className,
    ),
  });
}
