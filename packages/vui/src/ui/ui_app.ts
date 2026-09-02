import { isRef, reactive, ref, h, render, type App, type Ref, type VNode } from "vue";
import type { I18n } from "vue-i18n";
import {
  FetchApi,
  OAuth2ApiClient,
  createDependencyContainer,
  defaultMetaUiService,
  isString,
  useMmdaSsoDb,
  type DependencyContainer,
  type LocalAsyncDb,
  type MetaUiService,
  type Module,
  type OAuthUser,
  type UiContext,
} from "@mmda/core";
import { setI18nLocale } from "../i18n/i18n";
import type { ChildSlot } from "./ui_view";
import type { AppLayoutVariant, PropData } from "./ui_layout";
import type { UiBuilder } from "./ui_builder";
import type { UiViewContext } from "./ui_context";
import type { UiAction } from "./ui_action";
import type { CustomFilter } from "./ui_filter";
import { UI_APP_KEY, UI_BUILDER_KEY } from "./ui_keys";
import {
  readMmdaPref,
  readStoredColorPalette,
  writeMmdaPref,
  type MmdaColorPalette,
} from "./ui_theme";

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
  layout?: AppLayoutVariant;
  topBar?: ChildSlot | VNode;
  body?: ChildSlot | VNode;
  sideBar?: ChildSlot | VNode;
  bottomBar?: ChildSlot | VNode;
  floatingActionButton?: ChildSlot | VNode;
  floatingActionBar?: ChildSlot | VNode;
}

export interface ModuleBreadcrumbProps {
  module: Module;
  label: string;
  item?: ChildSlot;
  role?: string;
}

export interface ModuleToolbarProps {
  role?: string;
  showBreadcrumb?: boolean;
  showActions?: boolean;
  showSearchBox?: boolean;
  /** 模块链后再加一级，例如选中的分类名。 */
  breadcrumbLeaf?: string;
  actions?: Record<string, (...args: any[]) => any>;
}

export interface ImportAndExportActionProps {
  [index: string]: any;
  role?: "import" | "export";
  hasTepmlate?: boolean;
  actions?: UiAction[];
  handlerFn?: (context: UiContext, response: any) => void;
  importFn?: (context: UiContext, model: any) => void;
  exportFn?: (context: UiContext, model: any) => void;
}

export interface ModuleSearchbarProps {
  role?: string;
  onSearch?: (searchText: string) => void;
  /** 用当前 searchWord + 字段过滤 + 分页再查一次，不清条件。 */
  onRefresh?: () => void;
  defaultFilter?: () => VNode;
  customFilters?: CustomFilter[];
}

export interface MmdaApplicationContext {
  user: OAuthUser;
  modules: Module[];
  /** Route prefixes handled by the current Vue Router (for example BASE/MES). */
  localAppPrefixes?: string[];
  authenticated?: boolean;
  expandSidebar?: boolean;
  expandUserMenu?: boolean;
  envMode?: string;
  isDark?: boolean;
  colorPalette: MmdaColorPalette;
  systemList?: any[];
  todoCount?: number;
  theLatestTodoList?: any[];
}

export interface ClientProps {
  clientId?: string;
  clientSecret?: string;
  redirectUris?: string;
}

/** 应用壳构造选项；第 5 参也可继续传 `envMode` 字符串。 */
export interface MmdaApplicationOptions {
  envMode?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUris?: string;
  /** 未登录 / 401 跳转路径。默认 `/${service}/Signin`。 */
  signinPath?: string;
}

/**
 * Vue 应用壳：DI、鉴权、元数据服务、公共弹层（转发 UiBuilder）。
 */
export class MmdaApplication {
  readonly name: string;
  readonly api: OAuth2ApiClient;
  readonly meta: MetaUiService;
  readonly di: DependencyContainer;
  readonly context: MmdaApplicationContext;
  loginLoading: Ref<boolean>;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUris?: string;
  readonly signinPath: string;
  /** 启动恢复会话期间抑制 401→强制跳登录，交给 signinAuto 自行 refresh */
  private restoringAuth = false;
  /** 公共 SSO 库：仅 user / config，与模块 localDb 分离 */
  private readonly ssoDb: LocalAsyncDb;

  get user() {
    return this.context.user;
  }

  get modules() {
    return this.context.modules;
  }

  get authenticated() {
    return this.context.authenticated;
  }

  get canAccess() {
    const expiry = this.resolveAuthExpiry();
    return !!this.authenticated && !!this.user?.userId && expiry > Date.now();
  }

  /** 将当前内存中的登录态写入公共 SSO 库（mmda），供同域各应用恢复会话 */
  async syncAuthState(): Promise<void> {
    if (!this.canAccess) return;
    const user = this.user;
    const expiryOn = this.resolveAuthExpiry(null, user);
    if (expiryOn) user.expiryOn = expiryOn;
    await this.persistAuthSession(user);
  }

  get locale() {
    return this.meta.locale;
  }

  get localDb() {
    return this.meta.localDb;
  }

  constructor(
    baseUrl: string,
    service: string,
    public readonly ui: UiBuilder,
    public readonly i18n: I18n,
    options?: string | MmdaApplicationOptions,
  ) {
    const opts: MmdaApplicationOptions =
      typeof options === "string" ? { envMode: options } : (options ?? {});
    this.clientId = opts.clientId ?? "";
    this.clientSecret = opts.clientSecret ?? "";
    this.redirectUris = opts.redirectUris;
    this.name = service;
    this.signinPath = opts.signinPath ?? `/${service.toUpperCase()}/Signin`;
    const locale = (
      isRef(i18n.global.locale) ? i18n.global.locale.value : i18n.global.locale
    ) as string;
    this.api = new OAuth2ApiClient(
      new FetchApi({
        baseUrl: resolveFetchBaseUrl(baseUrl),
        credentials: "include",
      }),
      {
        service,
        locale,
      },
    );
    this.api.setUnauthorizedErrorHandler(() => {
      if (this.restoringAuth) return;
      this.signOut().then(() => {
        if (typeof window === "undefined") return;
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `${this.signinPath}?redirect=${redirect}`;
      });
    });
    this.meta = defaultMetaUiService(this.api);
    this.ssoDb = useMmdaSsoDb();
    this.di = createDependencyContainer();
    this.loginLoading = ref(false);
    this.context = reactive({
      user: { username: "", userId: "", userType: 0, expiryOn: Date.now() },
      modules: [],
      authenticated: false,
      envMode: opts.envMode,
      expandSidebar: readFlag("expandSidebar", true),
      isDark: readFlag("isDark", false),
      colorPalette: readStoredColorPalette(),
      expandUserMenu: false,
      todoCount: 0,
      theLatestTodoList: [],
      systemList: [],
    });
    this.ui.setColorScheme(Boolean(this.context.isDark));
    this.ui.setColorPalette(this.context.colorPalette);
  }

  install(app: App): void {
    app.config.globalProperties.$app = this;
    app.config.globalProperties.$api = this.api;
    app.config.globalProperties.$di = this.di;
    app.config.globalProperties.$meta = this.meta;
    app.config.globalProperties.$ui = this.ui;
    app.provide(UI_APP_KEY, this);
    app.provide(UI_BUILDER_KEY, this.ui);

    const Host = this.ui.overlayHost;
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

  findModule(nameOrUrl: string) {
    return this.meta.findModule(nameOrUrl);
  }

  async signin(
    username: string,
    password: string,
    keepLogin = true,
    clientProps: ClientProps = {},
  ) {
    const clientId = clientProps.clientId ?? this.clientId;
    const clientSecret = clientProps.clientSecret ?? this.clientSecret;
    const redirectUris = clientProps.redirectUris ?? this.redirectUris;
    this.loginLoading.value = true;
    try {
      const user = await this.api.authenticate(
        username,
        password,
        clientId,
        clientSecret,
        redirectUris,
      );
      user.username = decodeURIComponent(user.username);
      const modules = await this.meta.getModules(true);
      if (keepLogin) {
        await this.persistAuthSession(user);
      }
      await this.getSystems(true);
      this.context.user = user;
      this.context.modules = modules;
      this.context.authenticated = true;
      return this.user;
    } finally {
      this.loginLoading.value = false;
    }
  }

  async signOut() {
    this.context.user.userId = "";
    this.context.modules = [];
    this.context.authenticated = false;
    await Promise.allSettled([
      this.ssoDb.deleteMany(["user", "config"]),
      this.localDb.deleteMany(["user", "config", "meta/systems"]),
    ]);
    return true;
  }

  afterSignOut?: () => Promise<boolean>;

  /** 从公共 SSO 库恢复登录态（不读写 Cookie） */
  async signinAuto() {
    if (typeof document === "undefined") return this.canAccess;
    this.restoringAuth = true;
    try {
      let user: any;
      let config: any;
      try {
        ;[user, config] = await this.ssoDb.getMany(["user", "config"]);
      } catch (error) {
        console.error(error);
      }
      if (!user?.userId || !config?.accessToken) {
        try {
          const fromApp = await this.localDb.getMany(["user", "config"]);
          user = fromApp[0];
          config = fromApp[1];
          if (user?.userId && config?.accessToken) {
            await this.ssoDb.putMany([
              ["user", user],
              ["config", config],
            ]);
            await this.localDb.deleteMany(["user", "config"]);
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (!user?.userId || !config?.accessToken) {
        this.context.authenticated = false;
        return false;
      }

      user.username = decodeURIComponent(user.username);
      this.context.user = user;

      const expiryOn = this.resolveAuthExpiry(config, user);
      if (expiryOn) {
        user.expiryOn = expiryOn;
        this.context.user = user;
      }

      this.context.authenticated = !!(user.userId && expiryOn > Date.now());
      if (!this.canAccess) {
        this.context.authenticated = false;
        return false;
      }

      Object.assign(this.api.config, {
        locale: config.locale ?? this.api.config.locale,
        accessToken: config.accessToken,
        refreshToken: config.refreshToken ?? this.api.config.refreshToken,
        expiryInterval:
          config.expiryInterval ?? this.api.config.expiryInterval,
        expiresIn: config.expiresIn ?? this.api.config.expiresIn,
      });
      if (expiryOn) this.api.config.expiresIn = expiryOn;

      try {
        this.context.modules = await this.meta.getModules(false);
        await this.getSystems();
      } catch (error) {
        console.error(error);
        const refreshed = await this.api.refreshToken();
        if (!refreshed) {
          this.context.authenticated = false;
          return false;
        }
        try {
          this.context.modules = await this.meta.getModules(true);
          await this.getSystems(true);
          await this.persistAuthSession(this.user);
        } catch (retryError) {
          console.error(retryError);
          this.context.authenticated = false;
          return false;
        }
      }
      return this.canAccess;
    } catch (error) {
      console.error(error);
      this.context.authenticated = false;
      return false;
    } finally {
      this.restoringAuth = false;
    }
  }

  changeLocale(locale: string) {
    setI18nLocale(this.i18n, locale);
    this.meta.changeLocale(locale);
  }

  repository(name: string) {
    return this.api.repository(name);
  }

  getRefSystemAddress(
    systemInfo: string | Record<string, any>,
    props?: PropData,
  ) {
    const { http } = this.api;
    const address = isString(systemInfo)
      ? `/${systemInfo.toUpperCase()}`
      : systemInfo.moduleUrl ||
        `/${String(systemInfo.shortLabel ?? systemInfo.service ?? "").toUpperCase()}`;
    // Prefer same-origin path links (`/MES`) so a relative `/api` or an absolute
    // API host does not send system switches to the gateway machine.
    const apiBase = String(http.baseUrl || "");
    let origin = "";
    if (apiBase.startsWith("/")) {
      origin = "";
    } else {
      try {
        const parsed = new URL(apiBase);
        origin =
          typeof window !== "undefined" &&
          parsed.origin !== window.location.origin
            ? ""
            : parsed.origin;
      } catch {
        origin = apiBase.replace(/\/api\/?$/, "");
      }
    }
    let url = `${origin}${address}`;
    if (props?.repository) url += `/${props.repository}`;
    if (props?.action) url += `/${props.action}`;
    return url;
  }

  async getSystems(reload = false) {
    try {
      const res = await this.meta.getSystems(
        "getSystemModules",
        "base",
        reload,
      );
      this.context.systemList = (res ?? []).map((item: any) => ({
        ...item,
        label: item.moduleLabel,
        service: String(item.shortLabel ?? "").toLowerCase(),
        href: this.getRefSystemAddress(item),
      }));
    } catch (err) {
      console.error(err);
    }
  }

  getSystem(moduleCode: string, systemList: any[]) {
    return systemList.find((item: any) => item.moduleCode === moduleCode) ?? {};
  }

  async getTodoCount() {
    this.context.todoCount = await this.meta.getTodoCount({
      service: "base",
      repository: "Notifications",
      action: "getTodoCount",
      queryParams: { userID: this.user.userId },
    });
    if (typeof localStorage !== "undefined") {
      writeMmdaPref("todoCount", JSON.stringify(this.context.todoCount));
    }
  }

  toast(context: UiContext, props: PropData) {
    return this.ui.toast(context as UiViewContext<any>, props);
  }

  confirm(context: UiContext, props: Parameters<UiBuilder["confirm"]>[1]) {
    return this.ui.confirm(context as UiViewContext<any>, props);
  }

  dialog(
    content: Parameters<UiBuilder["dialog"]>[0],
    context: UiContext,
    props: Parameters<UiBuilder["dialog"]>[2],
  ) {
    return this.ui.dialog(content, context as UiViewContext<any>, props);
  }

  confirmDialog(
    content: Parameters<UiBuilder["confirmDialog"]>[0],
    context: UiContext,
    props: Parameters<UiBuilder["confirmDialog"]>[2],
  ) {
    return this.dialog(content, context, props);
  }

  private async persistAuthSession(user: OAuthUser) {
    try {
      await this.ssoDb.putMany([
        ["user", user],
        [
          "config",
          {
            accessToken: this.api.config.accessToken,
            refreshToken: this.api.config.refreshToken,
            expiryInterval: this.api.config.expiryInterval,
            expiresIn: this.api.config.expiresIn,
            locale: this.api.config.locale,
            expiryOn: user.expiryOn,
          },
        ],
      ]);
      await this.localDb.deleteMany(["user", "config"]);
    } catch (error) {
      console.error(error);
    }
  }

  private resolveAuthExpiry(
    config?: Record<string, any> | null,
    user?: OAuthUser | null,
  ): number {
    const targetUser = user ?? this.user;
    const targetConfig = config ?? null;
    const raw =
      targetConfig?.expiryOn ??
      targetConfig?.expiresIn ??
      targetUser?.expiryOn ??
      this.api.config.expiresIn ??
      0;
    return Number(raw) || 0;
  }
}

function resolveFetchBaseUrl(baseUrl: string): string | URL {
  if (/^[a-z][a-z\d+\-.]*:/i.test(baseUrl) || baseUrl.startsWith("//")) {
    return baseUrl;
  }
  if (typeof globalThis.location !== "undefined") {
    return new URL(baseUrl, globalThis.location.origin);
  }
  return baseUrl;
}

function readFlag(key: string, fallback: boolean) {
  if (typeof localStorage === "undefined") return fallback;
  const raw =
    key === "isDark" ? readMmdaPref(key) : localStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return fallback;
  }
}
