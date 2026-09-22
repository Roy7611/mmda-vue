/*
 * chrome 就地编辑走 factory.inplaceEditor。
 * 不设 url / adaptor，showButtons: false，不要 EJ2 type Text 自带输入。
 */
import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { InPlaceEditorComponent } from "@syncfusion/ej2-react-inplace-editor";
import {
  inplaceEditorDisabledOf,
  inplaceEditorModifierClasses,
  noopInplaceEditorController,
  type UiInplaceEditorController,
  type UiInplaceEditorProps,
  type UiInplaceEditorSlots,
} from "@mmda/core";
import { el, joinClass, sfHtmlAttributes } from "./utils";

interface SfInplaceEditorHostProps {
  props: UiInplaceEditorProps;
  slots?: UiInplaceEditorSlots<ReactNode>;
}

function SfInplaceEditorHost({
  props,
  slots,
}: SfInplaceEditorHostProps): ReactElement {
  const [open, setOpen] = useState(props.active === true);
  const propsRef = useRef(props);
  propsRef.current = props;
  const openRef = useRef(props.active === true);
  const controllerRef = useRef<UiInplaceEditorController | undefined>(
    undefined,
  );

  if (!controllerRef.current) {
    const setOpenState = (next: boolean) => {
      const current = propsRef.current;
      if (current.disabled) return;
      if (openRef.current === next) return;
      openRef.current = next;
      setOpen(next);
      if (next) current.onOpen?.();
      else current.onClose?.();
    };
    controllerRef.current = {
      open: () => setOpenState(true),
      close: () => setOpenState(false),
    };
  }
  const controller = controllerRef.current!;
  useEffect(() => {
    propsRef.current.onReady?.(controller);
  }, [controller]);

  useEffect(() => {
    if (props.active === true || props.active === false) {
      openRef.current = props.active;
      setOpen(props.active);
    }
  }, [props.active]);

  const className = joinClass(
    inplaceEditorModifierClasses(props, { open: open && !props.disabled }),
  );
  if (props.disabled || !open) {
    return el(
      "div",
      {
        className,
        onClick: props.disabled ? undefined : () => controller.open(),
      },
      el("div", { className: "mmda-inplace-editor__display" }, slots?.display?.()),
    );
  }
  return el(
    "div",
    { className },
    createElement(
      InPlaceEditorComponent as any,
      {
        mode: "Inline",
        type: "Template",
        showButtons: false,
        disabled: false,
        enableEditMode: true,
        actionOnBlur: "Ignore",
        cssClass: "mmda-inplace-editor__ej2",
        created: (event: any) => {
          event?.ej2Instances?.enableEditor?.();
        },
      },
      el("div", { className: "mmda-inplace-editor__content" }, slots?.content?.()),
    ),
  );
}

export function createInplaceEditor(
  props: UiInplaceEditorProps = {},
  slots?: UiInplaceEditorSlots<ReactNode>,
): ReactElement {
  if (inplaceEditorDisabledOf(props) && !slots?.display) {
    props.onReady?.(noopInplaceEditorController);
    return el("div", {
      className: joinClass(inplaceEditorModifierClasses(props)),
      ...sfHtmlAttributes(props),
    });
  }
  return createElement(SfInplaceEditorHost, {
    props,
    slots,
    ...sfHtmlAttributes(props),
  });
}
