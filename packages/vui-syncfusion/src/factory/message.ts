import { h } from "vue";
import { MessageComponent } from "@syncfusion/ej2-vue-notifications";
import type { UiDialogSeverity, UiMessageProps, UiMessageVariant } from "@mmda/vui";
import {
  messageSeverityOf,
  messageShowCloseIconOf,
  messageShowIconOf,
  messageVariantOf,
} from "@mmda/vui";

const SEVERITY: Record<UiDialogSeverity, string> = {
  success: "Success",
  info: "Info",
  warning: "Warning",
  error: "Error",
};

const VARIANT: Record<UiMessageVariant, string> = {
  text: "Text",
  outlined: "Outlined",
  filled: "Filled",
};

export function createMessage(props: UiMessageProps = {}) {
  const {
    content,
    severity,
    showCloseIcon,
    showIcon,
    variant,
    visible,
    cssClass,
    onClose,
    class: className,
    htmlAttributes,
    ...rest
  } = props;
  return h(MessageComponent as any, {
    ...rest,
    ...htmlAttributes,
    content: content ?? "",
    severity: SEVERITY[messageSeverityOf(severity)],
    showCloseIcon: messageShowCloseIconOf(showCloseIcon),
    showIcon: messageShowIconOf(showIcon),
    variant: VARIANT[messageVariantOf(variant)],
    visible: visible !== false,
    cssClass: ["mmda-message", cssClass, className].filter(Boolean).join(" "),
    closed: () => onClose?.(),
  });
}
