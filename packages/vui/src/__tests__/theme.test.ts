import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { setupI18n } from "../i18n/i18n";
import { MmdaApplication } from "../ui/ui_app";
import { createStubUiBuilder } from "../ui/ui_builder";
import { HtmlUiBuilder } from "../ui/ui_html";
import { ColorPalettePicker } from "../ui/components/ColorPalettePicker";
import {
  DEFAULT_COLOR_PALETTE,
  MMDA_COLOR_PALETTES,
  readStoredColorPalette,
  resolveColorPalette,
} from "../ui/ui_theme";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.mmdaPalette;
});

describe("MMDA color palettes", () => {
  it("provides ten Theme Studio palettes and falls back to purple", () => {
    expect(MMDA_COLOR_PALETTES.map((item) => item.id)).toEqual([
      "indigo",
      "purple",
      "blue",
      "violet",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "cyan",
    ]);
    expect(resolveColorPalette("blue")).toBe("blue");
    expect(resolveColorPalette("indigo")).toBe("indigo");
    expect(resolveColorPalette("cyan")).toBe("cyan");
    expect(resolveColorPalette("unknown")).toBe(DEFAULT_COLOR_PALETTE);
  });

  it("restores a valid stored palette and rejects an invalid value", () => {
    localStorage.setItem("mmda/colorPalette", "teal");
    expect(readStoredColorPalette()).toBe("teal");
    localStorage.setItem("mmda/colorPalette", "brand-x");
    expect(readStoredColorPalette()).toBe("purple");
  });

  it("switches the document palette attribute", () => {
    const ui = new HtmlUiBuilder();
    ui.setColorPalette("green");
    expect(document.documentElement.dataset.mmdaPalette).toBe("green");
  });

  it("restores theme state before the application mounts", () => {
    localStorage.setItem("mmda/isDark", "true");
    localStorage.setItem("mmda/colorPalette", "orange");
    const ui = createStubUiBuilder();
    const setColorScheme = vi.spyOn(ui, "setColorScheme");
    const setColorPalette = vi.spyOn(ui, "setColorPalette");

    const app = new MmdaApplication(
      "/api",
      "test",
      ui,
      setupI18n({}, "zh"),
    );

    expect(app.context.isDark).toBe(true);
    expect(app.context.colorPalette).toBe("orange");
    expect(setColorScheme).toHaveBeenCalledWith(true);
    expect(setColorPalette).toHaveBeenCalledWith("orange");
  });

  it("renders ten choices and persists the selected palette", async () => {
    const ui = createStubUiBuilder();
    ui.factory.resolveIcon = (icon: string) => icon;
    ui.factory.menuButton = (_props, actions) =>
      h(
        "div",
        actions.map((action) =>
          h(
            "button",
            {
              class: action.icon,
              "data-palette-action": action.name,
              onClick: action.onAction,
            },
            action.label,
          ),
        ),
      );
    const setColorPalette = vi.spyOn(ui, "setColorPalette");
    const mmda = new MmdaApplication(
      "/api",
      "test",
      ui,
      setupI18n({}, "zh"),
    );
    const host = document.createElement("div");
    document.body.append(host);
    const root = defineComponent(() => () => h(ColorPalettePicker));
    const vueApp = createApp(root);
    vueApp.use(mmda);
    vueApp.mount(host);

    const choices = host.querySelectorAll("[data-palette-action]");
    expect(choices).toHaveLength(10);
    (host.querySelector(
      '[data-palette-action="color-palette-blue"]',
    ) as HTMLButtonElement).click();
    await Promise.resolve();

    expect(mmda.context.colorPalette).toBe("blue");
    expect(localStorage.getItem("mmda/colorPalette")).toBe("blue");
    expect(localStorage.getItem("colorPalette")).toBeNull();
    expect(setColorPalette).toHaveBeenLastCalledWith("blue");

    vueApp.unmount();
    host.remove();
  });
});
