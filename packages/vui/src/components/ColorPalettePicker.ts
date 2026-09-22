import { defineComponent, h, inject } from "vue";
import {
  MMDA_COLOR_PALETTES,
  writeMmdaPref,
  type MmdaColorPalette,
} from "../app/theme";
import { UI_APP_KEY } from "../app/keys";
import type { MmdaVueApp } from "../app/app";
import { translateMessage } from "../i18n/i18n";

/** Stable menu items — selection state is shown via CSS on [data-mmda-palette]. */
const PALETTE_ACTIONS = MMDA_COLOR_PALETTES.map((option) => ({
  name: `color-palette-${option.id}`,
  label: option.label,
  icon: ["mmda-palette-swatch", `mmda-palette-swatch--${option.id}`].join(" "),
  palette: option.id,
}));

export const ColorPalettePicker = defineComponent({
  name: "ColorPalettePicker",
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaVueApp;
    const builder = app.ui;

    const selectPalette = (palette: MmdaColorPalette) => {
      app.state.colorPalette = palette;
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
          builder.factory.dropDownButton(
            {
              icon: builder.factory.resolveIcon("fas fa-palette"),
              class:
                "mmda-user-footer__button mmda-color-palette-picker__button",
              buttonType: "text",
              shape: "circle",
              hideCaret: true,
              popupPlacement: "top-end",
              tooltip: translateMessage("palette.choose"),
              "aria-label": translateMessage("palette.choose"),
              actions: PALETTE_ACTIONS.map((action) => ({
                name: action.name,
                label: translateMessage(action.label),
                icon: action.icon,
                onAction: () => selectPalette(action.palette),
              })),
            },
          ),
        ],
      );
  },
});
