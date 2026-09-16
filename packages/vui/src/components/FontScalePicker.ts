import { defineComponent, h, inject } from "vue";
import {
  MMDA_FONT_SCALES,
  writeStoredFontScale,
  type MmdaFontScale,
} from "../app/theme";
import { UI_APP_KEY, UI_BUILDER_KEY } from "../app/keys";
import type { MmdaApplication } from "../app/app";
import type { VueUiBuilder } from "../ui/builder";
import { translateMessage } from "../i18n/i18n";

const SCALE_ACTIONS = MMDA_FONT_SCALES.map((option) => ({
  name: `font-scale-${option.id}`,
  label: option.label,
  icon: ["mmda-font-scale-mark", `mmda-font-scale-mark--${option.id}`].join(" "),
  scale: option.id,
}));

export const FontScalePicker = defineComponent({
  name: "FontScalePicker",
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication;
    const builder = inject(UI_BUILDER_KEY)! as VueUiBuilder;

    const selectScale = (scale: MmdaFontScale) => {
      app.state.fontScale = scale;
      builder.setFontScale(scale);
      if (typeof localStorage !== "undefined") {
        writeStoredFontScale(scale);
      }
    };

    return () =>
      h(
        "span",
        {
          class: "mmda-font-scale-picker",
        },
        [
          builder.factory.dropDownButton(
            {
              icon: builder.factory.resolveIcon("fas fa-text-height"),
              class: "mmda-user-footer__button mmda-font-scale-picker__button",
              buttonType: "text",
              shape: "circle",
              hideCaret: true,
              popupPlacement: "top-end",
              tooltip: translateMessage("fontScale.choose"),
              "aria-label": translateMessage("fontScale.choose"),
            },
            SCALE_ACTIONS.map((action) => ({
              name: action.name,
              label: translateMessage(action.label),
              icon: action.icon,
              onAction: () => selectScale(action.scale),
            })),
          ),
        ],
      );
  },
});
