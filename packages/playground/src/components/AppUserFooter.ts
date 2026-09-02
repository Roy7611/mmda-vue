import { computed, defineComponent, h, inject, onMounted } from "vue";
import {
  ColorPalettePicker,
  UI_APP_KEY,
  UI_BUILDER_KEY,
  writeMmdaPref,
  type MmdaApplication,
  type UiBuilder,
} from "@mmda/vui";

export const AppUserFooter = defineComponent({
  name: "AppUserFooter",
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication;
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder;
    const username = computed(() => app.user?.username || "playground");
    const icon = (name: string) => builder.factory.resolveIcon(name);

    const setDark = (dark: boolean) => {
      app.context.isDark = dark;
      builder.setColorScheme(dark);
      writeMmdaPref("isDark", JSON.stringify(dark));
    };

    onMounted(() => {
      setDark(Boolean(app.context.isDark));
    });

    return () =>
      h("div", { class: "mmda-user-footer" }, [
        h("span", { class: "mmda-user-footer__avatar" }, [
          builder.factory.icon("fas fa-user"),
        ]),
        h(
          "span",
          { class: "mmda-user-footer__name", title: username.value },
          username.value,
        ),
        h("div", { class: "mmda-user-footer__actions" }, [
          builder.factory.button({
            icon: icon(app.context.isDark ? "fas fa-sun" : "fas fa-moon"),
            class: "mmda-user-footer__button",
            buttonType: "text",
            shape: "circle",
            tooltip: app.context.isDark ? "切换到明亮模式" : "切换到暗黑模式",
            onClick: () => setDark(!app.context.isDark),
          }),
          h(ColorPalettePicker),
        ]),
      ]);
  },
});
