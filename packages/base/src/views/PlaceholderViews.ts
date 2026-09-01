import { defineComponent, h } from "vue";
import { useI18n } from "vue-i18n";

export const Custompages = defineComponent({
  name: "Custompages",
  setup() {
    const { t } = useI18n();
    return () =>
      h("div", { style: { padding: "32px" } }, [
        h("h1", t("placeholder.custom")),
        h("p", t("placeholder.customHint")),
      ]);
  },
});
