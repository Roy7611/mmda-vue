/*
 * chrome 签名面板走 factory.signaturePad。vui 名是 signaturePad。
 * https://ej2.syncfusion.com/vue/documentation/signature/vue-3-getting-started
 */
import {
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
} from "vue";
import { SignatureComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiSignaturePadAction, UiSignaturePadController, UiSignaturePadFileType, UiSignaturePadProps } from '@mmda/core';
import { emitSignaturePadChange, signaturePadActionOf, signaturePadFileTypeFromEj2, signaturePadFileTypeOf, signaturePadModifierClasses, signaturePadSizeCss, signaturePadValueOf } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

function ej2Of(el: any) {
  return el?.ej2Instances ?? el;
}

const SfSignaturePad = defineComponent({
  name: "MmdaSignaturePad",
  props: {
    value: { type: String, default: undefined },
    modelValue: { type: String, default: undefined },
    width: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    isReadOnly: { type: Boolean, default: undefined },
    strokeColor: { type: String, default: undefined },
    backgroundColor: { type: String, default: undefined },
    backgroundImage: { type: String, default: undefined },
    minStrokeWidth: { type: Number, default: undefined },
    maxStrokeWidth: { type: Number, default: undefined },
    velocity: { type: Number, default: undefined },
    saveWithBackground: { type: Boolean, default: undefined },
    persist: { type: Boolean, default: undefined },
    locale: { type: String, default: undefined },
    rtl: { type: Boolean, default: undefined },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onChange: Function as PropType<UiSignaturePadProps["onChange"]>,
    onUpdate: Function as PropType<UiSignaturePadProps["onUpdate"]>,
    "onUpdate:modelValue": Function as PropType<
      UiSignaturePadProps["onUpdate:modelValue"]
    >,
    onBeforeSave: Function as PropType<UiSignaturePadProps["onBeforeSave"]>,
    onReady: Function as PropType<UiSignaturePadProps["onReady"]>,
  },
  setup(props) {
    const host = ref<any>(null);
    let skipEmit = false;

    const vuiProps = () => props as unknown as UiSignaturePadProps;

    const dataUrlOf = (type?: UiSignaturePadFileType) => {
      const inst = ej2Of(host.value);
      if (!inst || inst.isEmpty?.()) return "";
      return String(inst.getSignature?.(signaturePadFileTypeOf(type)) ?? "");
    };

    const emitValue = (action?: UiSignaturePadAction) => {
      const inst = ej2Of(host.value);
      const value = inst?.isEmpty?.() ? "" : dataUrlOf("png");
      skipEmit = true;
      emitSignaturePadChange(vuiProps(), value, action);
    };

    const applyValue = (raw: string) => {
      const inst = ej2Of(host.value);
      if (!inst) return;
      skipEmit = true;
      if (!raw) inst.clear?.();
      else inst.load?.(raw);
    };

    const controller = (): UiSignaturePadController => {
      const inst = () => ej2Of(host.value);
      return {
        clear: () => inst()?.clear?.(),
        undo: () => inst()?.undo?.(),
        redo: () => inst()?.redo?.(),
        isEmpty: () => Boolean(inst()?.isEmpty?.()),
        canUndo: () => Boolean(inst()?.canUndo?.()),
        canRedo: () => Boolean(inst()?.canRedo?.()),
        refresh: () => inst()?.refresh?.(),
        getDataUrl: (type) => dataUrlOf(type),
        getBlob: () => {
          const current = inst();
          if (!current || current.isEmpty?.()) return null;
          return current.saveAsBlob?.() ?? null;
        },
        save: (type, fileName) => {
          inst()?.save?.(signaturePadFileTypeOf(type), fileName);
        },
        load: (dataUrl, width, height) => {
          inst()?.load?.(dataUrl, width, height);
        },
        draw: (text, fontFamily, fontSize, x, y) => {
          inst()?.draw?.(text, fontFamily, fontSize, x, y);
        },
      };
    };

    watch(
      () => [props.value, props.modelValue],
      () => {
        if (skipEmit) {
          skipEmit = false;
          return;
        }
        applyValue(signaturePadValueOf(vuiProps()));
      },
    );

    const cssClass = () =>
      signaturePadModifierClasses(vuiProps()).flat().filter(Boolean).join(" ");

    const sizeStyle = () => {
      const width = signaturePadSizeCss(props.width);
      const height = signaturePadSizeCss(props.height);
      const style: Record<string, string> = {};
      if (width) style.width = width;
      if (height) style.height = height;
      return Object.keys(style).length ? style : undefined;
    };

    return () =>
      h(SignatureComponent as any, {
        ref: host,
        disabled: props.disabled,
        isReadOnly: props.isReadOnly ?? props.readOnly,
        strokeColor: props.strokeColor,
        backgroundColor: props.backgroundColor,
        backgroundImage: props.backgroundImage,
        minStrokeWidth: props.minStrokeWidth,
        maxStrokeWidth: props.maxStrokeWidth,
        velocity: props.velocity,
        saveWithBackground: props.saveWithBackground !== false,
        enablePersistence: Boolean(props.persist),
        locale: props.locale,
        enableRtl: Boolean(props.rtl),
        cssClass: cssClass(),
        style: sizeStyle(),
        ...htmlAttributesOf(vuiProps()),
        created: () => {
          applyValue(signaturePadValueOf(vuiProps()));
          props.onReady?.(controller());
        },
        change: (args?: { actionName?: string }) => {
          if (skipEmit) {
            skipEmit = false;
            return;
          }
          emitValue(signaturePadActionOf(args?.actionName));
        },
        beforeSave: (args?: {
          fileName?: string;
          type?: unknown;
          cancel?: boolean;
        }) => {
          const mapped = {
            fileName: String(args?.fileName ?? "signature"),
            type: signaturePadFileTypeFromEj2(args?.type),
            cancel: Boolean(args?.cancel),
          };
          props.onBeforeSave?.(mapped);
          if (args) {
            args.fileName = mapped.fileName;
            args.type = signaturePadFileTypeOf(mapped.type);
            args.cancel = mapped.cancel;
          }
        },
      });
  },
});

export function createSignaturePad(props: UiSignaturePadProps) {
  const {
    value,
    modelValue,
    width,
    height,
    disabled,
    readOnly,
    strokeColor,
    backgroundColor,
    backgroundImage,
    minStrokeWidth,
    maxStrokeWidth,
    velocity,
    saveWithBackground,
    persist,
    locale,
    rtl,
    class: _className,
    htmlAttributes,
    onChange,
    onUpdate,
    onBeforeSave,
    onReady,
  } = props;

  return h(SfSignaturePad, {
    value,
    modelValue,
    width,
    height,
    disabled,
    readOnly,
    isReadOnly: readOnly,
    strokeColor,
    backgroundColor,
    backgroundImage,
    minStrokeWidth,
    maxStrokeWidth,
    velocity,
    saveWithBackground,
    persist,
    locale,
    rtl,
    class: signaturePadModifierClasses(props),
    htmlAttributes,
    onChange,
    onUpdate,
    "onUpdate:modelValue": props["onUpdate:modelValue"],
    onBeforeSave,
    onReady,
  });
}
