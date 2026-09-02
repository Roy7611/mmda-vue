import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type UiBuilder,
} from "@mmda/vui";
import { defineComponent, h, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DEMO_PREFIX } from "../catalog";
import { installGuestSession } from "../host";

export const SigninView = defineComponent({
  name: "SigninView",
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder;
    const app = inject(UI_APP_KEY)! as MmdaApplication;
    const router = useRouter();
    const route = useRoute();
    const signinForm = builder.buildSigninForm(
      {
        context: app,
        onSubmit: async (user: SigninUser) => {
          installGuestSession(app, user.username || "playground");
          await router.replace(
            String(route.query.redirect ?? `${DEMO_PREFIX}/`),
          );
        },
      },
      { title: () => [] },
    );

    return () =>
      h("div", { class: "mmda-signin-page" }, [
        h("div", { class: "mmda-signin-card" }, [
          h("header", { class: "mmda-signin-card__header" }, [
            h("p", { class: "mmda-signin-card__eyebrow" }, "MMDA"),
            h("h1", { class: "mmda-signin-card__title" }, "vui-agnaive 把玩"),
            h(
              "p",
              { class: "mmda-signin-card__subtitle" },
              "本地假会话，任意账号即可进入。",
            ),
          ]),
          h("div", { class: "mmda-signin-card__body" }, [signinForm]),
        ]),
      ]);
  },
});
