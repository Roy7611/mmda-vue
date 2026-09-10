import { h } from "vue";
import Message from "primevue/message";
import type { UiDialogSeverity, UiMessageProps } from "@mmda/vui";
import {
  messageSeverityOf,
  messageShowCloseIconOf,
  messageShowIconOf,
} from "@mmda/vui";

const SEVERITY: Record<UiDialogSeverity, string> = {
  success: "success",
  info: "info",
  warning: "warn",
  error: "error",
};

export function createMessage(props: UiMessageProps = {}) {
  const {
    content,
    severity,
    showCloseIcon,
    showIcon,
    variant: _variant,
    visible,
    cssClass,
    onClose,
    class: className,
    htmlAttributes,
    ...rest
  } = props;
  if (visible === false) return h("span", { hidden: true });
  return h(
    Message,
    {
      ...rest,
      ...htmlAttributes,
      severity: SEVERITY[messageSeverityOf(severity)],
      closable: messageShowCloseIconOf(showCloseIcon),
      icon: messageShowIconOf(showIcon) ? undefined : " ",
      class: ["mmda-message", cssClass, className],
      onClose: () => onClose?.(),
    },
    () => content ?? "",
  );
}
