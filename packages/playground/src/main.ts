import { createApp } from "vue";
import { MmdaApplication, setupI18n } from "@mmda/vui";
import { AgNaiveUiBuilder, mmdaAgNaive } from "@mmda/vui-agnaive";
import { AppShell } from "./App";
import {
  installGuestSession,
  installPlaygroundMeta,
  registerPlaygroundLogic,
} from "./host";
import { createPlaygroundRouter } from "./router";
import "./style.css";

const i18n = setupI18n({}, "zh");
const builder = new AgNaiveUiBuilder();
const mmda = new MmdaApplication("/api", "demo", builder, i18n, {
  clientId: "mmda-playground",
  signinPath: "/Signin",
});

installPlaygroundMeta(mmda);
installGuestSession(mmda);

const router = createPlaygroundRouter();
registerPlaygroundLogic(mmda, router);

const vueApp = createApp(AppShell);
vueApp.use(i18n);
vueApp.use(mmdaAgNaive, {
  locale: "zh",
  licenseKey: import.meta.env.VITE_AG_GRID_LICENSE,
});
vueApp.use(mmda);
vueApp.use(router);
vueApp.mount("#app");
