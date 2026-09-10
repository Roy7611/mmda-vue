import { uiCssClass } from "@mmda/core";
import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type VueUiBuilder,
} from "@mmda/vui";
import { defineComponent, h, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DEMO_PREFIX } from "../catalog";
import { installGuestSession } from "../host";

export const SigninView = defineComponent({
  name: "SigninView",
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as VueUiBuilder;
    const app = inject(UI_APP_KEY)! as MmdaApplication;
    const router = useRouter();
    const route = useRoute();
    const signinForm = builder.buildSigninForm(
      {
        context: app,
        onSignin: async (user: SigninUser) => {
          installGuestSession(app, user.username || "playground");
          await router.replace(
            String(route.query.redirect ?? `${DEMO_PREFIX}/`),
          );
        },
      },
      { title: () => [] },
    );

    return () =>
      builder.layout.layoutPage({
        primary: [
          builder.factory.card(
            {
              surface: "elevated",
            },
            {
              header: () => [
                h("p", { class: uiCssClass("signin-form", "brand") }, "MMDA"),
                h(
                  "h1",
                  { class: uiCssClass("signin-form", "heading") },
                  "vui-agnaive 把玩",
                ),
                h(
                  "p",
                  { class: uiCssClass("signin-form", "lead") },
                  "本地假会话，任意账号即可进入。",
                ),
              ],
              default: () => [signinForm],
            },
          ),
        ],
      });
  },
});
