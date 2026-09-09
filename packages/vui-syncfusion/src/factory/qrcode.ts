import { h } from "vue";
import {
  DataMatrixGeneratorComponent,
  QRCodeGeneratorComponent,
} from "@syncfusion/ej2-vue-barcode-generator";
import type { UiQrCodeProps } from '@mmda/core';
import { codeSizeCss, qrCodeModifierClasses, resolveBarcodeCaption } from "@mmda/vui"

export function createQrCode(props: UiQrCodeProps) {
  const {
    value,
    format,
    width,
    height,
    showValue,
    displayText,
    class: className,
    htmlAttributes,
    ...rest
  } = props;
  const caption = resolveBarcodeCaption(value, displayText, showValue, false);
  const size = {
    width: codeSizeCss(width, "160px"),
    height: codeSizeCss(height, "160px"),
  };
  const display = {
    text: caption.text,
    visibility: caption.visible,
  };
  const cssClass = ["mmda-qrcode", qrCodeModifierClasses(format), className]
    .flat()
    .filter(Boolean)
    .join(" ");
  const common = {
    ...rest,
    htmlAttributes,
    value,
    ...size,
    mode: "SVG",
    displayText: display,
    cssClass,
  };
  if (format === "dataMatrix") {
    return h(DataMatrixGeneratorComponent as any, common);
  }
  return h(QRCodeGeneratorComponent as any, common);
}
