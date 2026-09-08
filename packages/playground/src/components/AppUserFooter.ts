import { computed, defineComponent, h, inject, onMounted } from "vue";
import {
  ColorPalettePicker,
  UI_APP_KEY,
  UI_BUILDER_KEY,
  writeMmdaPref,
  type MmdaApplication,
  type VueUiBuilder,
} from "@mmda/vui";

export const AppUserFooter = defineComponent({
  name: "AppUserFooter",
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication;
    const builder = inject(UI_BUILDER_KEY)! as VueUiBuilder;
    const username = computed(() => app.user?.username || "playground");
    const icon = (name: string) => builder.factory.resolveIcon(name);

    const setDark = (dark: boolean) => {
      app.state.isDark = dark;
      builder.setColorScheme(dark);
      writeMmdaPref("isDark", JSON.stringify(dark));
    };

    onMounted(() => {
      setDark(Boolean(app.state.isDark));
    });

    return () =>
      h("div", { class: "mmda-user-footer" }, [
        builder.factory.avatar({
          src: app.user?.portrait,
          icon: "fas fa-user",
          shape: "circle",
          size: "small",
          class: "mmda-user-footer__avatar",
        }),
        h(
          "span",
          { class: "mmda-user-footer__name", title: username.value },
          username.value,
        ),
        h("div", { class: "mmda-user-footer__actions" }, [
          builder.factory.button({
            icon: icon(app.state.isDark ? "fas fa-sun" : "fas fa-moon"),
            class: "mmda-user-footer__button",
            buttonType: "text",
            shape: "circle",
            tooltip: app.state.isDark ? "切换到明亮模式" : "切换到暗黑模式",
            onClick: () => setDark(!app.state.isDark),
          }),
          h(ColorPalettePicker),
        ]),
      ]);
  },
});
