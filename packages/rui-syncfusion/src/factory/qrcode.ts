import { createElement, type ReactElement } from "react";
import {
  DataMatrixGeneratorComponent,
  QRCodeGeneratorComponent,
} from "@syncfusion/ej2-react-barcode-generator";
import {
  codeSizeCss,
  qrCodeModifierClasses,
  resolveBarcodeCaption,
  type UiQrCodeProps,
} from "@mmda/core";
import { joinClass, sfHtmlAttributes } from "./utils";

export function createQrCode(props: UiQrCodeProps): ReactElement {
  const { value, format, width, height, showValue, displayText, class: className } =
    props;
  const caption = resolveBarcodeCaption(value, displayText, showValue, false);
  const size = {
    width: codeSizeCss(width, "160px"),
    height: codeSizeCss(height, "160px"),
  };
  const common = {
    htmlAttributes: sfHtmlAttributes(props),
    value,
    ...size,
    mode: "SVG",
    displayText: {
      text: caption.text,
      visibility: caption.visible,
    },
    cssClass: joinClass(
      "mmda-qrcode",
      qrCodeModifierClasses(format),
      className,
    ),
  };
  if (format === "dataMatrix") {
    return createElement(DataMatrixGeneratorComponent as any, common);
  }
  return createElement(QRCodeGeneratorComponent as any, common);
}
