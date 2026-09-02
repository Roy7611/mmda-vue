import { defineComponent, h } from "vue";
import { useRouter } from "vue-router";
import { DEMO_PREFIX } from "../catalog";

export const AppLogo = defineComponent({
  name: "AppLogo",
  setup() {
    const router = useRouter();
    return () =>
      h(
        "div",
        {
          class: "mmda-app-logo",
          role: "app-logo",
          onClick: () => void router.push(`${DEMO_PREFIX}/`),
        },
        [
          h("strong", { class: "mmda-app-logo__text" }, "VUI"),
          h("span", { class: "mmda-app-logo__sub" }, "agnaive"),
        ],
      );
  },
});
