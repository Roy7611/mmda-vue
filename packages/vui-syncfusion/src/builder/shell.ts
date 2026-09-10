import { h, type VNode, type VNodeArrayChildren } from "vue";
import { uiCssClass, type Module } from "@mmda/core";
import { type AppScaffoldProps, type UiProps } from "@mmda/vui"
import { SfAppSideMenu } from "../components/SfAppMenu";
import { createLoading } from "../factory/loading";
import { invoke, type UiContext } from "./utils";
import { syncfusionLayout } from "../syncfusion_layout";

export function applyColorScheme(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("e-dark-mode", dark);
  document.body?.classList.remove("e-dark-mode");
}

export function renderContainer(
  content: VNode | VNodeArrayChildren,
  props?: UiProps,
) {
  return h("div", { class: "mmda-container", ...props }, content);
}

export function renderHeader(
  content: VNode | VNodeArrayChildren,
  props?: UiProps,
) {
  return h("header", { class: uiCssClass("page-header"), ...props }, content);
}

export function renderAside(
  content: VNode | VNodeArrayChildren,
  props?: UiProps,
) {
  return h("aside", { class: "mmda-aside", ...props }, content);
}

export function renderMain(
  content: VNode | VNodeArrayChildren,
  props?: UiProps,
) {
  return h("main", { class: "mmda-main", ...props }, content);
}

export function renderFooter(
  content: VNode | VNodeArrayChildren,
  props?: UiProps,
) {
  return h("footer", { class: "mmda-footer", ...props }, content);
}

export function renderAppMenu(modules: Module[], props?: UiProps) {
  return h(SfAppSideMenu, { modules, ...props });
}

export function renderLoading(props?: UiProps) {
  return createLoading(props);
}

export function renderError(context: UiContext, props?: UiProps) {
  return h("div", { class: "mmda-error e-error", ...props }, context.title);
}

export function renderAppScaffold(props: AppScaffoldProps = {}) {
  const variant =
    props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
  return syncfusionLayout.scaffold({
    variant,
    topBar: invoke(props.topBar) as VNode | undefined,
    nav: invoke(props.sideBar) as VNode | undefined,
    page: invoke(props.body) as VNode | undefined,
    bottomBar: invoke(props.bottomBar) as VNode | undefined,
  });
}
