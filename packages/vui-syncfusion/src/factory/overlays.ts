import { h } from "vue";
import type { PropData, UiSlots } from "@mmda/vui";
import { DialogComponent } from "@syncfusion/ej2-vue-popups";
import { SidebarComponent } from "@syncfusion/ej2-vue-navigations";
import { dialogHeaderHtml } from "./utils";

export function attachOverlayRenderers(factory: any) {
  factory.dialog = (
    props: PropData & {
      visible: boolean;
      onUpdateVisible: (value: boolean) => void;
    },
    slots?: UiSlots,
  ) => {
    const {
      visible,
      onUpdateVisible,
      header,
      title,
      name,
      modal,
      width,
      allowDragging,
      enableResize,
      showCloseIcon,
      closeOnEscape,
      open,
      ...rest
    } = props;
    const headerText = String(header ?? title ?? name ?? "");
    const dialogBodySlots = slots?.default
      ? { default: slots.default }
      : undefined;
    return h(
      DialogComponent as any,
      {
        ...rest,
        isModal: modal ?? true,
        width: width ?? "min(90vw, 60rem)",
        allowDragging: allowDragging ?? true,
        enableResize: enableResize ?? true,
        showCloseIcon: showCloseIcon ?? true,
        closeOnEscape: closeOnEscape ?? true,
        close: () => onUpdateVisible(false),
        visible,
        header: dialogHeaderHtml(headerText),
        open: (args: { element?: HTMLElement }) => {
          const headerEl = args?.element?.querySelector?.(".e-dlg-header");
          if (headerEl && headerText && !headerEl.textContent?.trim()) {
            headerEl.textContent = headerText;
          }
          open?.(args);
        },
      },
      dialogBodySlots,
    );
  };
  factory.drawer = (props: any, slots: any) =>
    h(
      SidebarComponent as any,
      {
        isOpen: props.visible,
        position: props.position ?? "Left",
        close: () => props.onUpdateVisible?.(false),
        ...props,
      },
      slots,
    );
  factory.searchForRelative = (props: any, slots: any) =>
    factory.dialog(
      {
        visible: props.visible,
        header: props.title,
        onUpdateVisible: props.onUpdateVisible,
      },
      slots,
    );
}
