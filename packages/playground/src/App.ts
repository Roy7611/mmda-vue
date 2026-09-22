import { defineComponent, h, inject } from "vue";
import { RouterView, useRoute } from "vue-router";
import {
  UI_APP_KEY,
  type MmdaVueApp,
} from "@mmda/vui";
import { AppLogo } from "./components/AppLogo";
import { AppUserFooter } from "./components/AppUserFooter";

export const AppShell = defineComponent({
  name: "AppShell",
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaVueApp;
    const builder = app.ui;
    const route = useRoute();
    return () => {
      if (route.meta.allowAnonymous) return h(RouterView);
      return builder.layout.scaffold({
        variant: "sidebarLeft",
        nav: builder.buildAppSideBar({
          modules: app.modules,
          header: () => h(AppLogo),
          footer: () => h(AppUserFooter),
        }),
        page: h(RouterView),
      });
    };
  },
});
