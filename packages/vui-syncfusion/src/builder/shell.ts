import { h, ref, type VNode, type VNodeArrayChildren } from "vue";
import type { MetaUiGroup, Module } from "@mmda/core";
import {
  MmdaGroupCard,
  hasSystemModules,
  type AppScaffoldProps,
  type AppSideBarProps,
  type AppTopBarProps,
  type PropData,
  type UiViewContext,
} from "@mmda/vui";
import { SfAppMenu } from "../components/SfAppMenu";
import { SfPageLoading } from "../components/SfPageLoading";
import { invoke, type UiContext } from "./utils";

export function applyColorScheme(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("e-dark-mode", dark);
  document.body?.classList.remove("e-dark-mode");
}

export function renderContainer(
  content: VNode | VNodeArrayChildren,
  props?: PropData,
) {
  return h("div", { class: "mmda-sf-container", ...props }, content);
}

export function renderHeader(
  content: VNode | VNodeArrayChildren,
  props?: PropData,
) {
  return h("header", { class: "mmda-sf-header", ...props }, content);
}

export function renderAside(
  content: VNode | VNodeArrayChildren,
  props?: PropData,
) {
  return h("aside", { class: "mmda-sf-aside", ...props }, content);
}

export function renderMain(
  content: VNode | VNodeArrayChildren,
  props?: PropData,
) {
  return h("main", { class: "mmda-sf-main", ...props }, content);
}

export function renderFooter(
  content: VNode | VNodeArrayChildren,
  props?: PropData,
) {
  return h("footer", { class: "mmda-sf-footer", ...props }, content);
}

export function renderAppMenu(modules: Module[], props?: PropData) {
  return h(SfAppMenu, { modules, ...props });
}

export function renderLoading(props?: PropData) {
  return h(SfPageLoading, props);
}

export function renderError(context: UiContext, props?: PropData) {
  return h("div", { class: "mmda-sf-error e-error", ...props }, context.title);
}

export function renderAppScaffold(
  builder: { buildAppScaffold: Function },
  superScaffold: (props: AppScaffoldProps) => VNode,
  props: AppScaffoldProps = {},
) {
  const variant =
    props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
  if (variant !== "sidebarLeft") {
    return superScaffold(props);
  }
  return h("div", { id: "mmda-sf-shell", class: "mmda-sf-shell" }, [
    invoke(props.sideBar),
    h("div", { class: "mmda-sf-maincontent", role: "main" }, [
      invoke(props.body),
    ]),
  ]);
}
