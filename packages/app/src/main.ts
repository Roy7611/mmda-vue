import { createApp } from "vue";
import { MmdaApplication, setupI18n } from "@mmda/vui";
import { mmdaSyncfusion, SyncfusionUiBuilder } from "@mmda/vui-syncfusion";
import baseZh from "@mmda/base/src/locales/zh";
import baseEn from "@mmda/base/src/locales/en";
import baseZhHant from "@mmda/base/src/locales/zh-Hant";
import mesZh from "@mmda/mes/src/locales/zh";
import mesEn from "@mmda/mes/src/locales/en";
import mesZhHant from "@mmda/mes/src/locales/zh-Hant";
import { AppShell } from "./App";
import { APP_PLUGIN_REGISTRY_KEY, registerPluginLogic } from "./host";
import { mergeLocaleMessages } from "./i18n";
import { appPluginRegistry } from "./registry";
import { createAppRouter } from "./router";
import "./style.css";

const i18n = setupI18n(
  {
    zh: mergeLocaleMessages(baseZh, mesZh),
    en: mergeLocaleMessages(baseEn, mesEn),
    "zh-Hant": mergeLocaleMessages(baseZhHant, mesZhHant),
  },
  "zh",
);
const builder = new SyncfusionUiBuilder();
const mmda = new MmdaApplication(
  import.meta.env.VITE_BASE_API || "/api",
  "base",
  builder,
  i18n,
  {
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || "mmda-base",
    clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || "",
    signinPath: "/Signin",
  },
);
mmda.context.localAppPrefixes = appPluginRegistry
  .all()
  .map((plugin) => plugin.routePrefix);

const router = createAppRouter(mmda);
void registerPluginLogic(mmda, appPluginRegistry, router);

const vueApp = createApp(AppShell);
vueApp.use(i18n);
vueApp.use(mmdaSyncfusion, {
  licenseKey: import.meta.env.VITE_SYNCFUSION_LICENSE,
  locale: "zh",
});
vueApp.use(mmda);
vueApp.use(router);
vueApp.provide(APP_PLUGIN_REGISTRY_KEY, appPluginRegistry);

void mmda.signinAuto().finally(() => {
  vueApp.mount("#app");
});
