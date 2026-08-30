import { defineComponent, h, inject } from "vue";
import {
  MMDA_COLOR_PALETTES,
  writeMmdaPref,
  type MmdaColorPalette,
} from "../ui_theme";
import { UI_APP_KEY, UI_BUILDER_KEY } from "../ui_keys";
import type { MmdaApplication } from "../ui_app";
import type { UiBuilder } from "../ui_builder";

/** Stable menu items — selection state is shown via CSS on [data-mmda-palette]. */
const PALETTE_ACTIONS = MMDA_COLOR_PALETTES.map((option) => ({
  name: `color-palette-${option.id}`,
  label: option.label,
  icon: [
    "mmda-palette-swatch",
    `mmda-palette-swatch--${option.id}`,
  ].join(" "),
  palette: option.id,
}));

export const ColorPalettePicker = defineComponent({
  name: "ColorPalettePicker",
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication;
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder;

    const selectPalette = (palette: MmdaColorPalette) => {
      app.context.colorPalette = palette;
      builder.setColorPalette(palette);
      if (typeof localStorage !== "undefined") {
        writeMmdaPref("colorPalette", palette);
      }
    };

    return () =>
      h(
        "span",
        {
          class: "mmda-color-palette-picker",
        },
        [
          builder.factory.menuButton(
            {
              icon: builder.factory.resolveIcon("fas fa-palette"),
              class:
                "mmda-user-footer__button mmda-color-palette-picker__button",
              buttonType: "text",
              shape: "circle",
              hideCaret: true,
              popupPlacement: "top-end",
              tooltip: "选择主题色",
              "aria-label": "选择主题色",
            },
            PALETTE_ACTIONS.map((action) => ({
              name: action.name,
              label: action.label,
              icon: action.icon,
              onAction: () => selectPalette(action.palette),
            })),
          ),
        ],
      );
  },
});
