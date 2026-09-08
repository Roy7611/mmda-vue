/*
 * chrome 就地编辑走 factory.inplaceEditor。
 * https://ej2.syncfusion.com/vue/documentation/inplace-editor/vue3-getting-started
 * 不设 url / adaptor，showButtons: false，不要 EJ2 type Text 自带输入。
 */
import { defineComponent, h, ref, watch, type PropType } from "vue";
import { InPlaceEditorComponent } from "@syncfusion/ej2-vue-inplace-editor";
import type {
  UiInplaceEditorController,
  UiInplaceEditorProps,
  UiInplaceEditorSlots,
} from "@mmda/vui";
import {
  htmlAttributesOf,
  inplaceEditorDisabledOf,
  inplaceEditorModifierClasses,
  noopInplaceEditorController,
} from "@mmda/vui";

const SfInplaceEditorHost = defineComponent({
  name: "MmdaSfInplaceEditor",
  props: {
    disabled: Boolean,
    active: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  emits: ["open", "close", "ready"],
  setup(props, { slots, emit }) {
    const open = ref(props.active === true);
    watch(
      () => props.active,
      (value) => {
        if (value === true || value === false) open.value = value;
      },
    );
    const setOpen = (next: boolean) => {
      if (props.disabled) return;
      if (open.value === next) return;
      open.value = next;
      if (next) emit("open");
      else emit("close");
    };
    const controller: UiInplaceEditorController = {
      open: () => setOpen(true),
      close: () => setOpen(false),
    };
    emit("ready", controller);

    return () => {
      const className = inplaceEditorModifierClasses(props, {
        open: open.value && !props.disabled,
      });
      if (props.disabled || !open.value) {
        return h(
          "div",
          {
            class: className,
            onClick: props.disabled ? undefined : () => setOpen(true),
          },
          h(
            "div",
            { class: "mmda-inplace-editor__display" },
            slots.display?.(),
          ),
        );
      }
      return h(
        "div",
        { class: className },
        h(
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
          {
            default: () =>
              h(
                "div",
                { class: "mmda-inplace-editor__content" },
                slots.content?.(),
              ),
          },
        ),
      );
    };
  },
});

export function createInplaceEditor(
  props: UiInplaceEditorProps = {},
  slots?: UiInplaceEditorSlots,
) {
  if (inplaceEditorDisabledOf(props) && !slots?.display) {
    props.onReady?.(noopInplaceEditorController);
    return h("div", {
      class: inplaceEditorModifierClasses(props),
      ...htmlAttributesOf(props),
    });
  }
  return h(
    SfInplaceEditorHost,
    {
      disabled: inplaceEditorDisabledOf(props),
      active: props.active,
      class: props.class,
      ...htmlAttributesOf(props),
      onOpen: () => props.onOpen?.(),
      onClose: () => props.onClose?.(),
      onReady: (controller: UiInplaceEditorController) =>
        props.onReady?.(controller),
    },
    {
      display: () => slots?.display?.(),
      content: () => slots?.content?.(),
    },
  );
}
