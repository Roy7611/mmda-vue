import {
  defineComponent,
  h,
  ref,
  unref,
  watch,
} from "vue";
import { RouterLink } from "vue-router";
import type { Module, ModuleAuth } from "@mmda/core";
import { isActionVisible, type UiAction, type UiViewContext } from "@mmda/vui";
import { TextBoxComponent } from "@syncfusion/ej2-vue-inputs";

const SfSearchTextInput = defineComponent({
  name: "SfSearchTextInput",
  props: {
    runtime: { type: Object, required: true },
    placeholder: { type: String, default: "" },
    cssClass: { type: String, default: "" },
    onEnter: { type: Function, default: undefined },
  },
  setup(props, { slots }) {
    const runtime = props.runtime as {
      searchParam?: { searchWord?: string };
    };
    const word = ref(String(runtime.searchParam?.searchWord ?? ""));
    watch(
      () => runtime.searchParam?.searchWord,
      (next) => {
        const text = String(next ?? "");
        if (text !== word.value) word.value = text;
      },
    );
    return () =>
      h(
        TextBoxComponent as any,
        {
          value: word.value,
          placeholder: props.placeholder,
          cssClass: props.cssClass,
          floatLabelType: "Never",
          showClearButton: true,
          appendTemplate: "appendTemplate",
          input: (args: any) => {
            word.value = args.value ?? "";
            if (runtime.searchParam) runtime.searchParam.searchWord = word.value;
          },
          keydown: (args: any) => {
            const key = args?.event?.key ?? args?.key;
            if (key === "Enter") {
              args?.event?.preventDefault?.();
              props.onEnter?.();
            }
          },
        },
        { appendTemplate: slots.appendTemplate },
      );
  },
});

const UI_NAME = "mmda";

const invoke = (value: unknown): any =>
  typeof value === "function" ? (value as () => unknown)() : value;

const moduleChain = (module: Module): Module[] => {
  const chain: Module[] = [module];
  let parent = (module as Module & { parent?: Module }).parent;
  while (parent) {
    chain.unshift(parent);
    parent = (parent as Module & { parent?: Module }).parent;
  }
  // 一级 SYSTEM 已在侧栏显示，面包屑从二级模块起
  const withoutSystem = chain.filter((item) => item.moduleType !== "SYSTEM");
  return withoutSystem.length ? withoutSystem : chain;
};

const breadcrumbItem = (item: {
  label?: string;
  icon?: string;
  route?: string;
  leaf?: boolean;
}) =>
  h(
    item.leaf || !item.route ? "span" : (RouterLink as any),
    item.leaf || !item.route
      ? { class: "mmda-breadcrumb__item" }
      : { to: item.route!, class: "mmda-breadcrumb__link" },
    () => [
      item.icon
        ? h("i", {
            class: [item.icon, "mmda-breadcrumb__icon"],
            "aria-hidden": "true",
          })
        : null,
      h("span", item.label),
    ],
  );

export type UiContext = UiViewContext<any>;

const moduleOf = (context: UiContext): Module | undefined => {
  const runtime = context as any;
  return (runtime.module ?? runtime.logic?.module) as Module | undefined;
};

const moduleAuth = (context: UiContext): ModuleAuth | undefined =>
  moduleOf(context)?.authority;

const visibleActions = (actions: UiAction[]) =>
  actions.filter((action) => isActionVisible(action));


export {
  SfSearchTextInput,
  UI_NAME,
  invoke,
  moduleChain,
  breadcrumbItem,
  moduleOf,
  moduleAuth,
  visibleActions,
};
