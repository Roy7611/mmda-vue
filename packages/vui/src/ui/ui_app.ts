import { isRef, reactive, ref, type App, type Ref, type VNode } from "vue";
import type { I18n } from "vue-i18n";
import {
  FetchApi,
  OAuth2ApiClient,
  createDependencyContainer,
  defaultMetaUiService,
  isString,
  type DependencyContainer,
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
import { UI_APP_KEY } from "./ui_keys";

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
  defaultFilter?: () => VNode;
  customFilters?: CustomFilter[];
}

export interface MmdaApplicationContext {
  user: OAuthUser;
  modules: Module[];
  authenticated?: boolean;
  expandSidebar?: boolean;
  expandUserMenu?: boolean;
  envMode?: string;
  isDark?: boolean;
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

  /** 将当前内存中的登录态写入 IndexedDB / Cookie，供 window.open 新标签恢复会话 */
  async syncAuthState(): Promise<void> {
    if (!this.canAccess) return;
    const user = this.user;
    const expiryOn = this.resolveAuthExpiry(null, user);
    if (expiryOn) user.expiryOn = expiryOn;
    await this.localDb.putMany([
      ["user", user],
      [
        "config",
        {
          ...this.api.config,
          expiryOn: user.expiryOn,
        },
      ],
    ]);
    this.writeAuthCookies(user);
  }

  /** 与旧版一致：供跨应用 SSO 的 cookie domain 配置参考 */
  get domain() {
    return this.authCookieDomain() ?? location?.hostname ?? "";
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
      this.signOut().then(() => {
        if (typeof window === "undefined") return;
        window.location.href = `/${this.name.toUpperCase()}/Signin?redirect=${window.location.pathname}`;
      });
    });
    this.meta = defaultMetaUiService(this.api);
    this.di = createDependencyContainer();
    this.loginLoading = ref(false);
    this.context = reactive({
      user: { username: "", userId: "", userType: 0, expiryOn: Date.now() },
      modules: [],
      authenticated: false,
      envMode: opts.envMode,
      expandSidebar: readFlag("expandSidebar", true),
      isDark: readFlag("isDark", false),
      expandUserMenu: false,
      todoCount: 0,
      theLatestTodoList: [],
      systemList: [],
    });
  }

  install(app: App): void {
    app.config.globalProperties.$app = this;
    app.config.globalProperties.$api = this.api;
    app.config.globalProperties.$di = this.di;
    app.config.globalProperties.$meta = this.meta;
    app.config.globalProperties.$ui = this.ui;
    app.provide(UI_APP_KEY, this);
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
    this.clearAuthCookies();
    await this.localDb.deleteMany(["user", "config", "meta/systems"]);
    return true;
  }

  afterSignOut?: () => Promise<boolean>;

  async signinAuto() {
    if (typeof document === "undefined") return this.canAccess;

    const cookies = document.cookie.split("; ").filter(Boolean);
    const signOutFlag =
      cookies
        .find((item) => item.startsWith("signOut="))
        ?.split("=")[1] === "true";

    await this.hydrateFromCookies(cookies);

    let [user, config] = await this.localDb.getMany(["user", "config"]);

    // localDb 有有效会话时优先本地；仅在没有本地会话时才认 signOut cookie
    if (signOutFlag && !user?.userId) {
      return this.signOut();
    }

    if (!user) {
      user = this.readUserFromCookies(cookies);
      if (user) await this.localDb.put("user", user);
    }

    if (!config) {
      const cookieConfig = this.readAuthConfigFromCookies(cookies);
      if (Object.keys(cookieConfig).length) {
        Object.assign(this.api.config, cookieConfig);
        config = { ...this.api.config, ...cookieConfig };
        await this.localDb.put("config", config);
      }
    }

    if (user) {
      user.username = decodeURIComponent(user.username);
      this.context.user = user;
    }

    const expiryOn = this.resolveAuthExpiry(config, user);
    if (user?.userId && expiryOn) {
      user.expiryOn = expiryOn;
      this.context.user = user;
    }

    this.context.authenticated = !!(
      this.user.userId && expiryOn > Date.now()
    );

    if (this.canAccess) {
      if (config) {
        Object.assign(this.api.config, {
          service: config.service ?? this.api.config.service,
          locale: config.locale ?? this.api.config.locale,
          accessToken: config.accessToken ?? this.api.config.accessToken,
          refreshToken: config.refreshToken ?? this.api.config.refreshToken,
          expiryInterval: config.expiryInterval ?? this.api.config.expiryInterval,
          expiresIn: config.expiresIn ?? this.api.config.expiresIn,
        });
      }
      this.writeAuthCookies(this.user);
      try {
        this.context.modules = await this.meta.getModules(false);
        await this.getSystems();
      } catch (error) {
        console.error(error);
        this.context.authenticated = false;
        return false;
      }
    } else {
      this.context.authenticated = false;
    }

    return this.canAccess;
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
      : systemInfo.moduleUrl;
    let url = `${http.baseUrl.replace("/api", "")}${address}`;
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
      localStorage.setItem("todoCount", JSON.stringify(this.context.todoCount));
    }
  }

  toast(context: UiContext, props: PropData) {
    return this.ui.toast(context as UiViewContext<any>, props);
  }

  confirm(context: UiContext, props: Parameters<UiBuilder["confirm"]>[1]) {
    return this.ui.confirm(context as UiViewContext<any>, props);
  }

  confirmDialog(
    content: Parameters<UiBuilder["confirmDialog"]>[0],
    context: UiContext,
    props: Parameters<UiBuilder["confirmDialog"]>[2],
  ) {
    return this.ui.confirmDialog(content, context as UiViewContext<any>, props);
  }

  private async persistAuthSession(user: OAuthUser) {
    await this.localDb.putMany([
      ["user", user],
      [
        "config",
        {
          ...this.api.config,
          expiryOn: user.expiryOn,
        },
      ],
    ]);
    this.writeAuthCookies(user);
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

  /**
   * Cookie domain：开发环境（localhost / IP）不写 domain；
   * 生产环境使用父域（如 `.mmda.cloud`）以支持子域 SSO。
   */
  private authCookieDomain(): string | undefined {
    if (typeof location === "undefined") return undefined;
    const host = location.hostname;
    if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return undefined;
    }
    const parts = host.split(".");
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join(".")}`;
    }
    return host;
  }

  private authCookieSuffix(): string {
    const domain = this.authCookieDomain();
    return domain ? `;domain=${domain}` : "";
  }

  private readUserFromCookies(cookies: string[]): OAuthUser | undefined {
    const entry = cookies.find((item) => item.startsWith("user="));
    if (!entry) return undefined;
    const value = entry.slice("user=".length);
    if (!value) return undefined;
    try {
      const parsedUser = JSON.parse(decodeURIComponent(value)) as OAuthUser;
      parsedUser.username = decodeURIComponent(parsedUser.username);
      return parsedUser;
    } catch {
      try {
        const parsedUser = JSON.parse(value) as OAuthUser;
        parsedUser.username = decodeURIComponent(parsedUser.username);
        return parsedUser;
      } catch {
        return undefined;
      }
    }
  }

  private readAuthConfigFromCookies(
    cookies: string[],
  ): Record<string, string> {
    const configKeys = ["accessToken", "refreshToken", "expiryOn"];
    const config: Record<string, string> = {};
    for (const item of cookies) {
      const [key, ...rest] = item.split("=");
      const value = rest.join("=");
      if (!value || !configKeys.includes(key)) continue;
      config[key] = value;
    }
    return config;
  }

  private writeAuthCookies(user: OAuthUser) {
    if (typeof document === "undefined") return;
    const suffix = this.authCookieSuffix();
    const userJson = encodeURIComponent(JSON.stringify(user));
    document.cookie = `accessToken=${this.api.config.accessToken};path=/${suffix};SameSite=Lax`;
    document.cookie = `refreshToken=${this.api.config.refreshToken ?? ""};path=/${suffix};SameSite=Lax`;
    document.cookie = `expiryOn=${user.expiryOn};path=/${suffix};SameSite=Lax`;
    document.cookie = `signOut=false;path=/${suffix};SameSite=Lax`;
    document.cookie = `user=${userJson};path=/${suffix};SameSite=Lax`;
  }

  private clearAuthCookies() {
    if (typeof document === "undefined") return;
    const suffix = this.authCookieSuffix();
    const expired = `;path=/${suffix};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `accessToken=${expired}`;
    document.cookie = `refreshToken=${expired}`;
    document.cookie = `expiryOn=${expired}`;
    document.cookie = `user=${expired}`;
    document.cookie = `signOut=true;path=/${suffix};SameSite=Lax`;
  }

  private async hydrateFromCookies(cookies: string[]) {
    const user = this.readUserFromCookies(cookies);
    if (user) {
      await this.localDb.put("user", user);
    }
    const config = this.readAuthConfigFromCookies(cookies);
    if (Object.keys(config).length) {
      await this.localDb.put("config", { ...this.api.config, ...config });
    }
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
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return fallback;
  }
}
