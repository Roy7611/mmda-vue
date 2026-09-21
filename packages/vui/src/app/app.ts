import { isRef, reactive, h, render, type App, type VNode } from "vue";
import type { I18n } from "vue-i18n";
import {
  MmdaApplication,
  type MmdaApplicationOptions,
  type Module,
  type UiContext,
  type UiModuleBreadcrumbProps,
  type UiProps,
} from "@mmda/core";
import { setI18nLocale } from "../i18n/i18n";
import type { ChildSlot } from "../contexts/view";
import type { UiAppLayoutVariant } from "../ui/layout";
import type { VueUiBuilder } from "../ui/builder";
import type { UiAction } from "../ui/factory/action";
import type { CustomFilter } from "../ui/factory/filter";
import { UI_APP_KEY, UI_BUILDER_KEY } from "./keys";
import {
  readStoredColorPalette,
  readStoredFontScale,
} from "./theme";

export type {
  ClientProps,
  MmdaApplicationOptions,
  MmdaApplicationState,
} from "@mmda/core";
export { MmdaApplication } from "@mmda/core";

export interface AppTopBarProps {
  modules: Module[];
  logo: ChildSlot;
  actions?: ChildSlot;
}

export interface AppSideBarProps {
  modules: Module[];
  header: ChildSlot;
  footer?: ChildSlot;
}

export interface AppScaffoldProps {
  model?: "PC" | "Mobile" | "Pad";
  layout?: UiAppLayoutVariant;
  topBar?: ChildSlot | VNode;
  body?: ChildSlot | VNode;
  sideBar?: ChildSlot | VNode;
  bottomBar?: ChildSlot | VNode;
  floatingActionButton?: ChildSlot | VNode;
  floatingActionBar?: ChildSlot | VNode;
}

export type ModuleBreadcrumbProps = UiModuleBreadcrumbProps

export interface ImportAndExportActionProps {
  [index: string]: any;
  role?: "import" | "export";
  hasTepmlate?: boolean;
  actions?: UiAction[];
  handlerFn?: (context: UiContext, response: any) => void;
  importFn?: (context: UiContext, model: any) => void;
  exportFn?: (context: UiContext, model: any) => void;
}

export interface ModuleSearchbarProps extends UiProps {
  role?: string;
  onSearch?: (searchText: string) => void;
  /** 用当前 searchWord + 字段过滤 + 分页再查一次，不清条件。 */
  onRefresh?: () => void;
  defaultFilter?: () => VNode;
  customFilters?: CustomFilter[];
}

/**
 * Vue 应用壳：install / i18n / overlay / 需要追踪的 state 字段。
 */
export class MmdaVueApp extends MmdaApplication {
  declare readonly ui: VueUiBuilder;
  constructor(
    baseUrl: string,
    service: string,
    ui: VueUiBuilder,
    public readonly i18n: I18n,
    options?: string | MmdaApplicationOptions,
  ) {
    const opts: MmdaApplicationOptions =
      typeof options === "string" ? { envMode: options } : (options ?? {});
    const locale = (
      isRef(i18n.global.locale) ? i18n.global.locale.value : i18n.global.locale
    ) as string;
    super(baseUrl, service, ui, { ...opts, locale });
    this.state = reactive(this.state);
    this.state.colorPalette = readStoredColorPalette();
    this.state.fontScale = readStoredFontScale();
    ui.setColorScheme(Boolean(this.state.isDark));
    ui.setColorPalette(this.state.colorPalette as any);
    ui.setFontScale(this.state.fontScale as any);
  }

  install(app: App): void {
    app.config.globalProperties.$app = this;
    app.config.globalProperties.$api = this.api;
    app.config.globalProperties.$di = this.di;
    app.config.globalProperties.$meta = this.meta;
    app.config.globalProperties.$ui = this.ui;
    app.provide(UI_APP_KEY, this);
    app.provide(UI_BUILDER_KEY, this.ui as VueUiBuilder);

    const Host = (this.ui as VueUiBuilder).overlayHost;
    if (Host && typeof document !== "undefined") {
      const el = document.createElement("div");
      el.className = "mmda-overlay-root";
      document.body.append(el);
      const vnode = h(Host);
      vnode.appContext = app._context;
      render(vnode, el);
      const unmount = app.unmount.bind(app);
      app.unmount = () => {
        render(null, el);
        el.remove();
        unmount();
      };
    }
  }

  override changeLocale(locale: string) {
    setI18nLocale(this.i18n, locale);
    super.changeLocale(locale);
  }
}
